/**
 * breathEN order backend — Google Apps Script
 * =============================================================================
 * Bound to the orders spreadsheet, deployed as a Web App ("Execute as: me",
 * "Who has access: Anyone").
 *
 * The browser can no longer decide what was paid or whether it was paid. It can
 * only ask for an order and then report a payment; everything that matters is
 * decided here:
 *
 *   1. createOrder    — the SERVER computes the price from qty + coupon and
 *                       creates a Razorpay order for exactly that amount.
 *                       The client never supplies an amount.
 *   2. verifyAndSave  — verifies razorpay_signature = HMAC-SHA256(
 *                       order_id + "|" + payment_id, key_secret), then asks the
 *                       Razorpay API whether the payment is really captured for
 *                       the amount we asked for. Only then is a row written and
 *                       a confirmation email sent.
 *
 * Anything that fails a check is logged to the RejectedAttempts sheet and
 * returns { ok: false }. No row, no email.
 *
 * SETUP: see README.md next to this file. The key secret lives in Script
 * Properties and must never be sent to the browser.
 * =============================================================================
 */

// ---------------------------------------------------------------------------
// Configuration. BASE_PRICE / BULK_TIERS must stay in step with the storefront
// in src/components/CheckoutClient.tsx — this copy is the authoritative one.
// ---------------------------------------------------------------------------

var SHEET_ORDERS   = 'Orders';
var SHEET_PENDING  = 'PendingOrders';
var SHEET_COUPONS  = 'Coupons';
var SHEET_REJECTED = 'RejectedAttempts';

var BASE_PRICE = 495;
var MAX_QTY    = 50;
var BULK_TIERS = [
  { min: 1, max: 3,   discountPct: 0  },
  { min: 4, max: 999, discountPct: 33 }
];

var RZP_API   = 'https://api.razorpay.com/v1';
var NOTIFY_TO = '';  // optional: an address to alert on rejected attempts

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

function doGet(e)  { return route_(e); }
function doPost(e) { return route_(e); }

function route_(e) {
  var p = (e && e.parameter) || {};
  var action = String(p.action || '');
  try {
    switch (action) {
      case 'validateCoupon':
        return json_(validateCoupon_(p));
      case 'createOrder':
        return json_(createOrder_(p));
      case 'verifyAndSave':
        return json_(verifyAndSave_(p));

      // The pre-verification endpoint. A stale cached build could still call
      // it; it must never write anything again.
      case 'saveOrder':
        logRejected_('legacy_saveOrder_called', p.orderId || '', p.paymentId || '', JSON.stringify(p).slice(0, 500));
        return json_({ ok: false, error: 'endpoint_retired',
                       message: 'This checkout is out of date. Please refresh the page and try again.' });

      default:
        return json_({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    var msg = (err && err.message) ? err.message : String(err);
    logRejected_('server_error:' + action, p.orderId || '', p.paymentId || '', msg.slice(0, 500));
    return json_({ ok: false, error: 'server_error' });
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------
// 1. Order creation — the server decides the price
// ---------------------------------------------------------------------------

function createOrder_(p) {
  var qty    = toQty_(p.qty);
  var coupon = lookupCoupon_(p.coupon);
  var price  = priceFor_(qty, coupon.valid ? coupon.discountPct : 0);
  var cust   = customerFrom_(p);

  var order = rzp_('post', '/orders', {
    amount:   price.total * 100,          // paise, server-computed
    currency: 'INR',
    receipt:  'bre_' + Date.now(),
    notes: {
      name:  cust.name,
      phone: cust.phone,
      qty:   String(qty),
      coupon: coupon.valid ? coupon.code : 'none'
    }
  });

  if (!order || !order.id) throw new Error('order_create_failed');

  savePending_(order.id, qty, price, coupon, cust);

  // keyId is public (it is the checkout key). The secret never leaves here.
  return {
    ok: true,
    orderId:  order.id,
    amount:   price.total,
    currency: 'INR',
    keyId:    keyId_(),
    breakdown: {
      base: price.base, bulkPct: price.bulkPct, bulkAmt: price.bulkAmt,
      couponPct: price.couponPct, couponAmt: price.couponAmt, total: price.total
    },
    coupon: { applied: coupon.valid, code: coupon.valid ? coupon.code : '', pct: price.couponPct }
  };
}

function priceFor_(qty, couponPct) {
  var tier      = tierFor_(qty);
  var base      = BASE_PRICE * qty;
  var bulkAmt   = Math.round(base * tier.discountPct / 100);
  var afterBulk = base - bulkAmt;
  var pct       = Number(couponPct) || 0;
  if (pct < 0 || pct > 100) pct = 0;
  var couponAmt = pct > 0 ? Math.round(afterBulk * pct / 100) : 0;
  var total     = afterBulk - couponAmt;
  if (!(total >= 1)) throw new Error('invalid_total');
  return { base: base, bulkPct: tier.discountPct, bulkAmt: bulkAmt,
           couponPct: pct, couponAmt: couponAmt, total: total };
}

function tierFor_(qty) {
  for (var i = 0; i < BULK_TIERS.length; i++) {
    if (qty >= BULK_TIERS[i].min && qty <= BULK_TIERS[i].max) return BULK_TIERS[i];
  }
  return BULK_TIERS[0];
}

function toQty_(v) {
  var n = Math.floor(Number(v));
  if (!(n >= 1 && n <= MAX_QTY)) throw new Error('invalid_qty');
  return n;
}

// ---------------------------------------------------------------------------
// 2. Verification — the only path that writes an order or sends an email
// ---------------------------------------------------------------------------

function verifyAndSave_(p) {
  var orderId   = String(p.orderId   || '');
  var paymentId = String(p.paymentId || '');
  var signature = String(p.signature || '').toLowerCase();

  if (!/^order_[A-Za-z0-9]+$/.test(orderId))  return reject_('bad_order_id',        orderId, paymentId);
  if (!/^pay_[A-Za-z0-9]+$/.test(paymentId))  return reject_('bad_payment_id',      orderId, paymentId);
  if (!/^[a-f0-9]{64}$/.test(signature))      return reject_('bad_signature_format', orderId, paymentId);

  // (a) Signature proves Razorpay — and only Razorpay, which is the only other
  //     holder of the key secret — produced this order_id|payment_id pair.
  var expected = hmacSha256Hex_(orderId + '|' + paymentId, keySecret_());
  if (!timingSafeEqual_(expected, signature)) {
    return reject_('signature_mismatch', orderId, paymentId);
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    // (b) Idempotency: a retry or a double-fired handler must not write twice.
    if (findOrderRow_(paymentId) > 0) {
      return { ok: true, duplicate: true, paymentId: paymentId };
    }

    // (c) The order must be one we created, so we know the amount we asked for.
    var pending = findPending_(orderId);
    if (!pending) return reject_('unknown_order', orderId, paymentId);

    // (d) Signature proves authenticity, not that money moved. Ask Razorpay.
    var pay = rzp_('get', '/payments/' + paymentId, null);

    if (String(pay.order_id) !== orderId)   return reject_('order_mismatch:' + pay.order_id, orderId, paymentId);
    if (String(pay.currency) !== 'INR')     return reject_('currency_mismatch:' + pay.currency, orderId, paymentId);
    if (Number(pay.amount) !== pending.amountPaise) {
      return reject_('amount_mismatch: got ' + pay.amount + ' expected ' + pending.amountPaise, orderId, paymentId);
    }

    // Authorised but not yet captured: capture it, for exactly our amount.
    if (pay.status === 'authorized') {
      pay = rzp_('post', '/payments/' + paymentId + '/capture',
                 { amount: pending.amountPaise, currency: 'INR' });
    }
    if (pay.status !== 'captured') {
      return reject_('not_captured:' + pay.status, orderId, paymentId);
    }

    // Every check passed. Now — and only now — record and confirm.
    saveOrderRow_(pending, orderId, paymentId, pay);
    markPendingDone_(orderId, paymentId);
    var emailed = sendConfirmationEmail_(pending, orderId, paymentId);

    return { ok: true, paymentId: paymentId, amount: pending.amount, emailed: emailed };
  } finally {
    lock.releaseLock();
  }
}

function reject_(reason, orderId, paymentId) {
  logRejected_(reason, orderId, paymentId, '');
  return { ok: false, error: 'verification_failed', reason: reason };
}

// ---------------------------------------------------------------------------
// Crypto
// ---------------------------------------------------------------------------

/**
 * HMAC-SHA256 as lowercase hex. Utilities.computeHmacSha256Signature returns
 * SIGNED bytes (-128..127), so each one is brought back into 0..255 before
 * being written as two hex digits.
 */
function hmacSha256Hex_(message, secret) {
  var raw = Utilities.computeHmacSha256Signature(message, secret);
  var out = '';
  for (var i = 0; i < raw.length; i++) {
    var b = raw[i];
    if (b < 0) b += 256;
    var h = b.toString(16);
    out += (h.length === 1 ? '0' : '') + h;
  }
  return out;
}

function timingSafeEqual_(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  return diff === 0;
}

// ---------------------------------------------------------------------------
// Razorpay API
// ---------------------------------------------------------------------------

function rzp_(method, path, payload) {
  var opts = {
    method: method,
    muteHttpExceptions: true,
    headers: { Authorization: 'Basic ' + Utilities.base64Encode(keyId_() + ':' + keySecret_()) }
  };
  if (payload) {
    opts.contentType = 'application/json';
    opts.payload = JSON.stringify(payload);
  }

  var res  = UrlFetchApp.fetch(RZP_API + path, opts);
  var code = res.getResponseCode();
  var text = res.getContentText();
  var body;
  try { body = JSON.parse(text); }
  catch (e) { throw new Error('razorpay_bad_response ' + code); }

  if (code < 200 || code >= 300) {
    var desc = (body && body.error && body.error.description) ? body.error.description : text;
    throw new Error('razorpay_error ' + code + ': ' + String(desc).substring(0, 200));
  }
  return body;
}

function keyId_()     { return scriptProp_('RAZORPAY_KEY_ID'); }
function keySecret_() { return scriptProp_('RAZORPAY_KEY_SECRET'); }

function scriptProp_(name) {
  var v = PropertiesService.getScriptProperties().getProperty(name);
  if (!v) throw new Error('missing_script_property:' + name);
  return v;
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

function validateCoupon_(p) {
  var c = lookupCoupon_(p.code);
  // Response shape kept as-is so the storefront's coupon box keeps working.
  return { valid: c.valid, discountPct: c.discountPct, message: c.message };
}

/** Coupons sheet columns: Code | DiscountPct | Active | Expiry */
function lookupCoupon_(code) {
  var miss = { valid: false, code: '', discountPct: 0, message: 'Invalid or expired coupon code.' };
  code = String(code || '').trim().toUpperCase();
  if (!code) return { valid: false, code: '', discountPct: 0, message: 'Please enter a coupon code.' };

  var sh = sheet_(SHEET_COUPONS, ['Code', 'DiscountPct', 'Active', 'Expiry']);
  var rows = sh.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim().toUpperCase() !== code) continue;

    var pct    = Number(rows[i][1]) || 0;
    var active = String(rows[i][2]).trim().toLowerCase();
    var expiry = rows[i][3];

    if (active === 'false' || active === 'no' || active === '0') {
      return { valid: false, code: code, discountPct: 0, message: 'This code is no longer active.' };
    }
    if (expiry instanceof Date && expiry.getTime() < Date.now()) {
      return { valid: false, code: code, discountPct: 0, message: 'This code has expired.' };
    }
    if (!(pct > 0 && pct <= 100)) return miss;

    return { valid: true, code: code, discountPct: pct, message: '' };
  }
  return miss;
}

// ---------------------------------------------------------------------------
// Customer details
// ---------------------------------------------------------------------------

function customerFrom_(p) {
  var c = {
    name:    String(p.name    || '').trim(),
    phone:   String(p.phone   || '').replace(/[\s-]/g, ''),
    email:   String(p.email   || '').trim(),
    address: String(p.address || '').trim(),
    city:    String(p.city    || '').trim(),
    pin:     String(p.pin     || '').trim(),
    state:   String(p.state   || '').trim()
  };
  if (c.name.length < 2)                    throw new Error('invalid_name');
  if (!/^[6-9]\d{9}$/.test(c.phone))        throw new Error('invalid_phone');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) throw new Error('invalid_email');
  if (c.address.length < 10)                throw new Error('invalid_address');
  if (c.city.length < 2)                    throw new Error('invalid_city');
  if (!/^\d{6}$/.test(c.pin))               throw new Error('invalid_pin');
  if (!c.state)                             throw new Error('invalid_state');
  return c;
}

// ---------------------------------------------------------------------------
// Sheets
// ---------------------------------------------------------------------------

function sheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

var PENDING_HEADERS = ['OrderId', 'CreatedAt', 'Qty', 'AmountINR', 'AmountPaise', 'BulkPct',
                       'CouponCode', 'CouponPct', 'Name', 'Phone', 'Email', 'Address', 'City',
                       'Pin', 'State', 'Status', 'PaymentId'];

function savePending_(orderId, qty, price, coupon, cust) {
  sheet_(SHEET_PENDING, PENDING_HEADERS).appendRow([
    orderId, istTimestamp_(), qty, price.total, price.total * 100, price.bulkPct,
    coupon.valid ? coupon.code : '', price.couponPct,
    cust.name, "'" + cust.phone, cust.email, cust.address, cust.city, "'" + cust.pin, cust.state,
    'pending', ''
  ]);
}

function findPending_(orderId) {
  var sh = sheet_(SHEET_PENDING, PENDING_HEADERS);
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) !== orderId) continue;
    return {
      row: i + 1,
      orderId: orderId,
      qty: Number(rows[i][2]),
      amount: Number(rows[i][3]),
      amountPaise: Number(rows[i][4]),
      bulkPct: Number(rows[i][5]),
      couponCode: String(rows[i][6] || ''),
      couponPct: Number(rows[i][7]) || 0,
      name: String(rows[i][8]), phone: String(rows[i][9]).replace(/^'/, ''),
      email: String(rows[i][10]), address: String(rows[i][11]), city: String(rows[i][12]),
      pin: String(rows[i][13]).replace(/^'/, ''), state: String(rows[i][14]),
      status: String(rows[i][15])
    };
  }
  return null;
}

function markPendingDone_(orderId, paymentId) {
  var p = findPending_(orderId);
  if (!p) return;
  var sh = sheet_(SHEET_PENDING, PENDING_HEADERS);
  sh.getRange(p.row, 16).setValue('paid');
  sh.getRange(p.row, 17).setValue(paymentId);
}

var ORDER_HEADERS = ['Date', 'Name', 'Phone', 'Email', 'Address', 'Qty', 'AmountINR',
                     'BulkPct', 'CouponUsed', 'CouponPct', 'PaymentId', 'OrderId',
                     'Method', 'Verified'];

function saveOrderRow_(pending, orderId, paymentId, pay) {
  sheet_(SHEET_ORDERS, ORDER_HEADERS).appendRow([
    istTimestamp_(),
    pending.name,
    "'" + pending.phone,
    pending.email,
    pending.address + ', ' + pending.city + ', ' + pending.state + ' — ' + pending.pin,
    pending.qty,
    pending.amount,
    pending.bulkPct,
    pending.couponCode,
    pending.couponPct,
    paymentId,
    orderId,
    String((pay && pay.method) || ''),
    'signature+api'
  ]);
}

function findOrderRow_(paymentId) {
  var sh = sheet_(SHEET_ORDERS, ORDER_HEADERS);
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][10]) === paymentId) return i + 1;
  }
  return 0;
}

var REJECTED_HEADERS = ['Date', 'Reason', 'OrderId', 'PaymentId', 'Detail'];

function logRejected_(reason, orderId, paymentId, detail) {
  try {
    sheet_(SHEET_REJECTED, REJECTED_HEADERS)
      .appendRow([istTimestamp_(), reason, orderId || '', paymentId || '', detail || '']);
    if (NOTIFY_TO && String(reason).indexOf('signature_mismatch') === 0) {
      MailApp.sendEmail(NOTIFY_TO, 'breathEN: rejected payment attempt',
                        reason + '\norder: ' + orderId + '\npayment: ' + paymentId);
    }
  } catch (e) { /* logging must never break the response */ }
}

// ---------------------------------------------------------------------------
// Confirmation email  <-- adapt this to your existing template
// ---------------------------------------------------------------------------

function sendConfirmationEmail_(pending, orderId, paymentId) {
  try {
    var body =
      'Hi ' + pending.name + ',\n\n' +
      'Your breathEN order is confirmed and your payment has been verified.\n\n' +
      'Quantity   : ' + pending.qty + ' can' + (pending.qty > 1 ? 's' : '') + '\n' +
      'Amount paid: Rs ' + pending.amount + '\n' +
      'Payment ID : ' + paymentId + '\n' +
      'Order ID   : ' + orderId + '\n\n' +
      'Delivery address:\n' +
      pending.address + '\n' + pending.city + ', ' + pending.state + ' - ' + pending.pin + '\n\n' +
      'We will be in touch as soon as it ships.\n\n' +
      'Team breathEN\nWhatsApp: +91 98192 50202';

    MailApp.sendEmail({
      to: pending.email,
      subject: 'Your breathEN order is confirmed (' + paymentId + ')',
      body: body
    });
    return true;
  } catch (e) {
    // The payment is verified and the row is written; a failed email must not
    // undo that. It is logged so it can be sent by hand.
    logRejected_('email_failed', orderId, paymentId, String(e && e.message));
    return false;
  }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** IST is a fixed UTC+5:30 with no DST. */
function istTimestamp_() {
  var d = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  function p(n) { return (n < 10 ? '0' : '') + n; }
  return p(d.getUTCDate()) + '/' + p(d.getUTCMonth() + 1) + '/' + d.getUTCFullYear() + ', ' +
         p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds());
}

// ---------------------------------------------------------------------------
// Self-test. Run once from the Apps Script editor after setting the properties.
// ---------------------------------------------------------------------------

function selfTest() {
  var pass = true;
  function check(label, got, want) {
    var ok = (String(got) === String(want));
    if (!ok) pass = false;
    Logger.log((ok ? 'PASS  ' : 'FAIL  ') + label + '  got=' + got + (ok ? '' : '  want=' + want));
  }

  // Known-answer test for the signature. This exact pair was cross-checked
  // against Node's crypto.createHmac('sha256', ...) — if this line passes, the
  // signature check will agree with Razorpay.
  check('hmac known-answer',
        hmacSha256Hex_('order_ABC123|pay_XYZ789', 'testsecret'),
        '8ab882b69975648bd036bb84b853484100f7addce5cead23e8a2d9ffe5ba21c8');

  check('hmac is 64 hex chars', /^[a-f0-9]{64}$/.test(hmacSha256Hex_('a', 'b')), true);

  check('timingSafeEqual same',  timingSafeEqual_('abc', 'abc'), true);
  check('timingSafeEqual diff',  timingSafeEqual_('abc', 'abd'), false);
  check('timingSafeEqual len',   timingSafeEqual_('abc', 'abcd'), false);

  // Pricing must match src/components/CheckoutClient.tsx exactly.
  check('price qty=1  total', priceFor_(1, 0).total, 495);
  check('price qty=3  total', priceFor_(3, 0).total, 1485);
  check('price qty=4  total', priceFor_(4, 0).total, 1327);   // 1980 less 33%
  check('price qty=6  total', priceFor_(6, 0).total, 1990);   // 2970 less 33%
  check('price qty=1 +10%',   priceFor_(1, 10).total, 445);
  check('coupon pct clamped',  priceFor_(1, 999).total, 495);

  var badQty = false;
  try { toQty_(0); } catch (e) { badQty = true; }
  check('qty 0 rejected', badQty, true);
  badQty = false;
  try { toQty_(MAX_QTY + 1); } catch (e) { badQty = true; }
  check('qty over max rejected', badQty, true);

  check('RAZORPAY_KEY_ID set',
        !!PropertiesService.getScriptProperties().getProperty('RAZORPAY_KEY_ID'), true);
  check('RAZORPAY_KEY_SECRET set',
        !!PropertiesService.getScriptProperties().getProperty('RAZORPAY_KEY_SECRET'), true);

  Logger.log(pass ? '=== selfTest PASSED ===' : '=== selfTest FAILED — do not deploy ===');
  return pass;
}
