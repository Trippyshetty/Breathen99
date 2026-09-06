'use client';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const RAZORPAY_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

// A real Razorpay payment id looks like `pay_ABC123xyz`. Nothing is written to
// Sheets (which is what fires the confirmation email) and the customer is never
// sent to /thankyou unless the id Razorpay handed us matches this exactly.
// There is deliberately no fallback and no generated id.
const RAZORPAY_PAYMENT_ID_RE = /^pay_[A-Za-z0-9]+$/;
const isValidRazorpayPaymentId = (id: unknown): id is string =>
  typeof id === 'string' && RAZORPAY_PAYMENT_ID_RE.test(id);

const UNVERIFIED_PAYMENT_MSG = 'Payment could not be verified. Please try again.';

// Indian digit grouping done by hand. Number.prototype.toLocaleString('en-IN')
// depends on the browser's ICU data, and plenty of older Android WebViews ship
// it trimmed — so the server and the device produced different text for the same
// number, which breaks hydration. This is identical everywhere.
function inr(n: number): string {
  if (!Number.isFinite(n)) return '0';
  const s = Math.round(Math.abs(n)).toString();
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const grouped = rest ? `${rest.replace(/B(?=(d{2})+(?!d))/g, ',')},${last3}` : last3;
  return `${n < 0 ? '-' : ''}${grouped}`;
}

// IST is a fixed UTC+5:30 with no DST, so this needs no timezone database.
// toLocaleString(..., { timeZone: 'Asia/Kolkata' }) throws RangeError on
// browsers built without full ICU, which would have failed the order write.
function istTimestamp(): string {
  const d = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}, ` +
         `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}

const CONFIG = {
  RAZORPAY_KEY_ID: 'rzp_live_SeBOlcvnSd74TA',
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzsee0P6vdSDeZ_n9O9wOW5uv3h5_vWe86CufA_PwkjuZo1XVAwoAw7iNAr5uxfSt24-Q/exec',
  BASE_PRICE: 495,
  MRP_PRICE: 900,
  BULK_TIERS: [
    { min: 1,  max: 3,   discountPct: 0,  label: '1–3 cans',        note: 'Standard price' },
    { min: 4,  max: 999, discountPct: 33, label: 'Buy 4 Get 2 Free', note: 'Pay ₹1,980 · Get 6 cans' },
  ],
  BUSINESS_NAME: 'breathEN',
  BUSINESS_LOGO: '/assets/logo-white.jpg',
};

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Chandigarh','Jammu & Kashmir','Ladakh','Puducherry','Other',
];

function getActiveTier(qty: number) {
  return CONFIG.BULK_TIERS.find(t => qty >= t.min && qty <= t.max) || CONFIG.BULK_TIERS[0];
}

function calcPrices(qty: number, couponApplied: boolean, couponPct: number) {
  const base = CONFIG.BASE_PRICE * qty;
  const tier = getActiveTier(qty);
  const bulkAmt = Math.round(base * tier.discountPct / 100);
  const afterBulk = base - bulkAmt;
  const couponAmt = couponApplied ? Math.round(afterBulk * couponPct / 100) : 0;
  const total = afterBulk - couponAmt;
  return { base, bulkAmt, couponAmt, total, tier };
}

export default function CheckoutClient() {
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ name:'', phone:'', email:'', address:'', city:'', pin:'', state:'' });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState({ applied:false, code:'', pct:0 });
  const [couponStatus, setCouponStatus] = useState<{ type:'success'|'error'|'', msg:string }>({ type:'', msg:'' });
  const [couponLoading, setCouponLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  // Inject the Razorpay checkout script on the client only.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.querySelector(`script[src="${RAZORPAY_SRC}"]`)) return;
    const s = document.createElement('script');
    s.src = RAZORPAY_SRC;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const { base, bulkAmt, couponAmt, total, tier } = calcPrices(qty, coupon.applied, coupon.pct);

  const validateForm = useCallback(() => {
    const e: Record<string,string> = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your full name';
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/[\s-]/g,''))) e.phone = 'Enter a valid 10-digit number';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Please enter a valid email address';
    if (form.address.trim().length < 10) e.address = 'Please enter your delivery address';
    if (form.city.trim().length < 2) e.city = 'Please enter your city';
    if (!/^\d{6}$/.test(form.pin.trim())) e.pin = 'Enter a valid 6-digit PIN';
    if (!form.state) e.state = 'Please select your state';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponStatus({ type:'error', msg:'Please enter a coupon code.' }); return; }
    setCouponLoading(true);
    try {
      const res = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=validateCoupon&code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.valid) {
        setCoupon({ applied:true, code, pct:data.discountPct });
        setCouponStatus({ type:'success', msg:`✓ Code applied! ${data.discountPct}% off your order.` });
      } else {
        setCoupon({ applied:false, code:'', pct:0 });
        setCouponStatus({ type:'error', msg: data.message || 'Invalid or expired coupon code.' });
      }
    } catch {
      setCouponStatus({ type:'error', msg:'Could not verify code. Please try again.' });
    } finally {
      setCouponLoading(false);
    }
  };

  // Only ever called from the Razorpay success handler, and only with the id that
  // came back on that response. Re-validates so no future caller can bypass it.
  const saveToSheets = async (orderData: Record<string,unknown>, paymentId: string) => {
    if (!isValidRazorpayPaymentId(paymentId)) {
      throw new Error(`Refusing to save order: invalid Razorpay payment id (${String(paymentId)})`);
    }
    const params = new URLSearchParams({
      action:'saveOrder',
      date: istTimestamp(),
      name: String(orderData.name),
      phone: String(orderData.phone),
      email: String(orderData.email),
      address: `${orderData.address}, ${orderData.city}, ${orderData.state} — ${orderData.pin}`,
      qty: String(orderData.qty),
      amount: String(orderData.amount),
      bulkPct: String(orderData.bulkPct),
      couponUsed: String(orderData.couponCode),
      couponPct: String(orderData.couponPct),
      paymentId,
    });
    await fetch(`${CONFIG.APPS_SCRIPT_URL}?${params.toString()}`, { method:'GET', mode:'no-cors' });
  };

  const handlePay = async () => {
    if (paying) return;
    if (!validateForm()) {
      document.querySelector('.form-col')?.scrollIntoView({ behavior:'smooth', block:'start' });
      return;
    }
    setPayError('');
    setPaying(true);

    const orderData = {
      name: form.name.trim(), phone: form.phone.replace(/\s/g,''), email: form.email.trim(),
      address: form.address.trim(), city: form.city.trim(), pin: form.pin.trim(), state: form.state,
      qty, amount: total, bulkPct: tier.discountPct,
      couponCode: coupon.applied ? coupon.code : '', couponPct: coupon.applied ? coupon.pct : 0,
    };

    // Guard every Razorpay/window access — only ever runs in the browser.
    if (typeof window === 'undefined' || !(window as { Razorpay?: unknown }).Razorpay) {
      setPaying(false);
      setPayError('Payment system is still loading. Please wait a moment and try again.');
      return;
    }

    // @ts-ignore — Razorpay is injected at runtime via the script above
    const rzp = new window.Razorpay({
      key: CONFIG.RAZORPAY_KEY_ID,
      amount: total * 100,
      currency: 'INR',
      name: CONFIG.BUSINESS_NAME,
      description: `breathEN × ${qty} can${qty > 1 ? 's' : ''}`,
      image: CONFIG.BUSINESS_LOGO,
      prefill: { name: form.name, contact: form.phone, email: form.email },
      notes: {
        address: `${form.address}, ${form.city}, ${form.state} — ${form.pin}`,
        quantity: qty, coupon: coupon.code || 'none',
      },
      theme: { color: '#e8260a' },
      modal: { ondismiss: () => setPaying(false) },
      // The ONLY place an order is saved or the customer is redirected. Razorpay
      // invokes this solely after a payment it has itself confirmed as captured.
      handler: async (response: { razorpay_payment_id?: string }) => {
        const paymentId = response?.razorpay_payment_id;

        // No id, malformed id, or anything that isn't `pay_<alphanumeric>`:
        // save nothing, send no confirmation, do not redirect.
        if (!isValidRazorpayPaymentId(paymentId)) {
          setPaying(false);
          setPayError(UNVERIFIED_PAYMENT_MSG);
          return;
        }

        try {
          await saveToSheets(orderData, paymentId);
        } catch {
          // Payment is real but we could not record it — never silently drop it.
          setPaying(false);
          setPayError(
            `Your payment went through (ref ${paymentId}) but we could not save your order. ` +
            'Please contact us with this reference and we will confirm it manually.'
          );
          return;
        }

        const p = new URLSearchParams({
          name: form.name, qty: String(qty), amount: String(total), paymentId,
        });
        window.location.href = `/thankyou/?${p.toString()}`;
      },
    });
    // Failed payment: no save, no redirect.
    rzp.on('payment.failed', (r: { error?: { description?: string } }) => {
      setPaying(false);
      setPayError(`Payment failed: ${r?.error?.description || 'the payment was not completed'}. Please try again.`);
    });
    rzp.open();
  };

  const totalFmt = inr(total);

  return (
    <>
      {/* Checkout-specific styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--red:#e8260a;--red-dark:#b81d07;--red-light:#fef2f0;--black:#0a0a0a;--white:#ffffff;--gray-50:#fafafa;--gray-100:#f4f4f4;--gray-200:#e8e8e8;--gray-400:#999;--gray-600:#555;--gray-800:#222;--font-sans:'DM Sans',sans-serif;--font-serif:'Playfair Display',serif;--font-display:'Bebas Neue',sans-serif}
        html{font-size:16px;scroll-behavior:smooth}
        body{font-family:var(--font-sans);background:var(--gray-50);color:var(--black);min-height:100vh}
        .topbar{background:#fff;border-bottom:1px solid var(--gray-200);padding:14px 24px;display:flex;align-items:center;justify-content:space-between}
        .topbar-back{color:var(--gray-600);text-decoration:none;font-size:13px;display:flex;align-items:center;gap:6px}
        .topbar-back:hover{color:var(--black)}
        .trust-bar{background:var(--red);color:#fff;text-align:center;font-size:12px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;padding:9px 16px}
        .trust-bar span{opacity:.65;margin:0 12px}
        .checkout-wrap{max-width:980px;margin:0 auto;padding:40px 20px 80px;display:grid;grid-template-columns:1fr 400px;gap:32px;align-items:start}
        @media(max-width:760px){.checkout-wrap{grid-template-columns:1fr;padding:24px 16px 80px;gap:24px}}
        .card{background:#fff;border:1px solid var(--gray-200);border-radius:4px;padding:28px}
        .card-title{font-family:var(--font-serif);font-size:1.1rem;margin-bottom:20px;color:var(--black)}
        .section-step{display:flex;align-items:center;gap:12px;margin-bottom:20px}
        .step-num{width:28px;height:28px;background:var(--red);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:600;flex-shrink:0}
        .step-title{font-weight:500;font-size:.95rem}
        .field{margin-bottom:16px}
        .field label{display:block;font-size:.78rem;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--gray-600);margin-bottom:6px}
        .field input,.field select,.field textarea{width:100%;border:1px solid var(--gray-200);border-radius:3px;padding:11px 14px;font-size:.9rem;font-family:var(--font-sans);background:#fff;color:var(--black);outline:none;transition:border .2s}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:var(--red)}
        .field input.error,.field select.error,.field textarea.error{border-color:#e8260a}
        .field textarea{min-height:80px;resize:vertical}
        .field-error{font-size:.75rem;color:var(--red);margin-top:4px;display:none}
        .field-error.show{display:block}
        .field-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        @media(max-width:480px){.field-row{grid-template-columns:1fr}}
        .qty-wrap{display:flex;align-items:center;gap:0;width:fit-content;border:1px solid var(--gray-200);border-radius:3px;overflow:hidden}
        .qty-btn{width:44px;height:44px;background:#fff;border:none;cursor:pointer;font-size:1.3rem;font-weight:300;color:var(--black);transition:background .15s}
        .qty-btn:hover{background:var(--gray-100)}
        .qty-display{width:56px;height:44px;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:500;border-left:1px solid var(--gray-200);border-right:1px solid var(--gray-200)}
        .bulk-tiers{margin-top:12px;display:flex;flex-direction:column;gap:8px}
        .bulk-tier{display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid var(--gray-200);border-radius:3px;font-size:.82rem;transition:border .2s,background .2s}
        .bulk-tier.active{border-color:var(--red);background:var(--red-light)}
        .bulk-tier-badge{font-weight:600;color:var(--red);font-size:.75rem;letter-spacing:.04em;min-width:110px}
        .bulk-tier-label{color:var(--gray-600)}
        .coupon-row{display:flex;gap:10px}
        .coupon-row input{flex:1;border:1px solid var(--gray-200);border-radius:3px;padding:11px 14px;font-size:.9rem;font-family:var(--font-sans);outline:none}
        .coupon-row input:focus{border-color:var(--red)}
        .coupon-apply{background:var(--black);color:#fff;border:none;border-radius:3px;padding:11px 20px;font-size:.82rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;white-space:nowrap;transition:background .2s}
        .coupon-apply:hover{background:#333}
        .coupon-apply:disabled{opacity:.5;cursor:not-allowed}
        .coupon-feedback{margin-top:8px;font-size:.82rem}
        .coupon-feedback.success{color:#1a8a3a}
        .coupon-feedback.error{color:var(--red)}
        .summary-product{display:flex;gap:16px;align-items:flex-start;margin-bottom:20px}
        .summary-product-img{width:70px;height:90px;object-fit:contain;flex-shrink:0;border-radius:3px;border:1px solid var(--gray-200)}
        .summary-product-info{flex:1}
        .summary-product-name{font-weight:500;font-size:.9rem;margin-bottom:3px}
        .summary-product-sub{font-size:.78rem;color:var(--gray-400)}
        .summary-mrp-line{display:flex;gap:8px;align-items:center;margin-top:4px}
        .summary-mrp{text-decoration:line-through;color:var(--gray-400);font-size:.8rem}
        .summary-sale{font-size:.75rem;background:var(--red-light);color:var(--red);padding:1px 6px;border-radius:2px;font-weight:500}
        .summary-product-qty{font-size:.9rem;color:var(--gray-600)}
        .summary-line{display:flex;justify-content:space-between;font-size:.88rem;color:var(--gray-600);padding:8px 0;border-bottom:1px solid var(--gray-100)}
        .summary-line.discount span:last-child,.summary-line.coupon span:last-child{color:#1a8a3a;font-weight:500}
        .summary-divider{border:none;border-top:2px solid var(--gray-200);margin:12px 0}
        .summary-total{display:flex;justify-content:space-between;font-size:1.05rem;font-weight:600;padding:4px 0}
        .summary-total-sub{font-size:.74rem;color:var(--gray-400);text-align:right;margin-bottom:20px}
        .pay-btn{width:100%;background:var(--red);color:#fff;border:none;border-radius:3px;padding:16px;font-size:.95rem;font-weight:500;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:background .2s;min-height:52px}
        .pay-btn:hover{background:var(--red-dark)}
        .pay-btn:disabled{opacity:.6;cursor:not-allowed}
        .spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .pay-error{margin:10px 0 0;padding:10px 12px;border:1px solid var(--red);background:var(--red-light);color:var(--red-dark);border-radius:3px;font-size:.8rem;line-height:1.45}
        .pay-secure{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:12px;font-size:.74rem;color:var(--gray-400)}
        .mobile-summary-bar{display:none;background:#fff;border-bottom:1px solid var(--gray-200);padding:10px 16px}
        @media(max-width:760px){.mobile-summary-bar{display:block}}
        .msb-row{display:flex;justify-content:space-between;align-items:center;font-size:.86rem}
        .msb-total{font-weight:600}
        .mobile-pay-bar{display:none;position:fixed;bottom:0;left:0;right:0;padding:12px 16px;background:#fff;border-top:1px solid #e8e8e8;z-index:200}
        @media(max-width:760px){.mobile-pay-bar{display:block}}
      ` }} />

      <div className="topbar">
        <Link href="/" className="topbar-logo" style={{ display:'flex' }}>
          <Image src="/assets/logo-white.jpg" alt="breathEN" width={120} height={36} style={{ objectFit:'contain' }} />
        </Link>
        <Link href="/" className="topbar-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to site
        </Link>
      </div>

      <div className="trust-bar">
        Free Shipping Across India <span>·</span> Secure Razorpay Checkout <span>·</span> 99% Pure O₂
      </div>

      <div className="mobile-summary-bar">
        <div className="msb-row">
          <span>breathEN × {qty}</span>
          <span className="msb-total">₹{totalFmt}</span>
        </div>
        {(tier.discountPct > 0 || couponAmt > 0) && (
          <div className="msb-row" style={{ fontSize:11, color:'#1a8a3a', marginTop:2 }}>
            <span>{tier.discountPct === 33 ? `Buy 4 Get 2 Free · Save ₹${inr(bulkAmt+couponAmt)}` : `You save ₹${inr(bulkAmt+couponAmt)}`}</span>
          </div>
        )}
      </div>

      <div className="checkout-wrap">

        {/* LEFT: FORM */}
        <div className="form-col">
          {/* Step 1 */}
          <div className="card" style={{ marginBottom:20 }}>
            <div className="section-step"><div className="step-num">1</div><div className="step-title">Your Details</div></div>
            <div className="field">
              <label>Full Name *</label>
              <input type="text" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Rahul Sharma" className={errors.name?'error':''} />
              {errors.name && <div className="field-error show">{errors.name}</div>}
            </div>
            <div className="field-row">
              <div className="field">
                <label>Phone Number *</label>
                <input type="tel" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="98765 43210" maxLength={11} className={errors.phone?'error':''} />
                {errors.phone && <div className="field-error show">{errors.phone}</div>}
              </div>
              <div className="field">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="you@email.com" className={errors.email?'error':''} />
                {errors.email && <div className="field-error show">{errors.email}</div>}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="card" style={{ marginBottom:20 }}>
            <div className="section-step"><div className="step-num">2</div><div className="step-title">Delivery Address</div></div>
            <div className="field">
              <label>Full Address *</label>
              <textarea value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} placeholder="Flat / House no., Street, Area, Landmark…" className={errors.address?'error':''} />
              {errors.address && <div className="field-error show">{errors.address}</div>}
            </div>
            <div className="field-row">
              <div className="field">
                <label>City *</label>
                <input type="text" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} placeholder="Mumbai" className={errors.city?'error':''} />
                {errors.city && <div className="field-error show">{errors.city}</div>}
              </div>
              <div className="field">
                <label>PIN Code *</label>
                <input type="text" value={form.pin} onChange={e=>setForm(f=>({...f,pin:e.target.value}))} placeholder="400001" maxLength={6} className={errors.pin?'error':''} />
                {errors.pin && <div className="field-error show">{errors.pin}</div>}
              </div>
            </div>
            <div className="field">
              <label>State *</label>
              <select value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))} className={errors.state?'error':''}>
                <option value="">— Select State —</option>
                {INDIAN_STATES.map(s=><option key={s}>{s}</option>)}
              </select>
              {errors.state && <div className="field-error show">{errors.state}</div>}
            </div>
          </div>

          {/* Step 3: Quantity */}
          <div className="card" style={{ marginBottom:20 }}>
            <div className="section-step"><div className="step-num">3</div><div className="step-title">Quantity</div></div>
            <div className="field" style={{ marginBottom:4 }}>
              <label>Number of Cans</label>
              <div className="qty-wrap">
                <button className="qty-btn" onClick={()=>qty>1&&setQty(q=>q-1)} aria-label="Decrease">−</button>
                <div className="qty-display">{qty}</div>
                <button className="qty-btn" onClick={()=>qty<50&&setQty(q=>q+1)} aria-label="Increase">+</button>
              </div>
            </div>
            <div className="bulk-tiers">
              {CONFIG.BULK_TIERS.map((t,i)=>{
                const active = qty >= t.min && qty <= t.max;
                const badge = t.discountPct===33 ? '🎁 BUY 4 GET 2 FREE' : t.discountPct>0 ? `${t.discountPct}% OFF` : 'BASE PRICE';
                return <div key={i} className={`bulk-tier${active?' active':''}`}><span className="bulk-tier-badge">{badge}</span><span className="bulk-tier-label">{t.label} — {t.note}</span></div>;
              })}
            </div>
          </div>

          {/* Step 4: Coupon */}
          <div className="card">
            <div className="section-step"><div className="step-num">4</div><div className="step-title">Coupon Code</div></div>
            <div className="coupon-row">
              <input type="text" value={couponInput} onChange={e=>setCouponInput(e.target.value)} placeholder="Enter code (e.g. FIRST10)" maxLength={30} onKeyDown={e=>e.key==='Enter'&&applyCoupon()} />
              <button className="coupon-apply" onClick={applyCoupon} disabled={couponLoading}>{couponLoading?'Checking…':'Apply'}</button>
            </div>
            {couponStatus.msg && <div className={`coupon-feedback ${couponStatus.type}`}>{couponStatus.msg}</div>}
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="desktop-summary">
          <div className="card" style={{ position:'sticky', top:20 }}>
            <div className="card-title">Order Summary</div>
            <div className="summary-product">
              <Image src="/assets/product.png" alt="breathEN canister" width={70} height={90} className="summary-product-img" style={{ objectFit:'contain' }} />
              <div className="summary-product-info">
                <div className="summary-product-name">breathEN Oxygen Canister</div>
                <div className="summary-product-sub">99% Pure · Up to 200 shots</div>
                <div className="summary-mrp-line"><span className="summary-mrp">MRP ₹{CONFIG.MRP_PRICE}</span><span className="summary-sale">45% OFF</span></div>
              </div>
              <div className="summary-product-qty">×{qty}</div>
            </div>

            <div className="summary-line"><span>Subtotal ({qty} can{qty>1?'s':''})</span><span>₹{inr(base)}</span></div>
            {tier.discountPct>0 && <div className="summary-line discount"><span>{tier.discountPct===33?'Buy 4 Get 2 Free':`Bulk discount (${tier.discountPct}%)`}</span><span>−₹{inr(bulkAmt)}</span></div>}
            {coupon.applied && couponAmt>0 && <div className="summary-line coupon"><span>Coupon ({coupon.code})</span><span>−₹{inr(couponAmt)}</span></div>}
            <div className="summary-line"><span>Shipping</span><span style={{ color:'#1a8a3a', fontWeight:500 }}>FREE</span></div>
            <hr className="summary-divider" />
            <div className="summary-total"><span>Total</span><span>₹{totalFmt}</span></div>
            <div className="summary-total-sub">Inclusive of all taxes</div>

            <button className="pay-btn" onClick={handlePay} disabled={paying}>
              {paying ? <span className="spinner" /> : `Pay ₹${totalFmt} Securely`}
            </button>
            {payError && <div className="pay-error" role="alert">{payError}</div>}
            <div className="pay-secure">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Secured by Razorpay · 256-bit SSL
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fixed pay bar */}
      <div className="mobile-pay-bar">
        {payError && <div className="pay-error" style={{ marginTop:0, marginBottom:10 }} role="alert">{payError}</div>}
        <button className="pay-btn" onClick={handlePay} disabled={paying}>
          {paying ? <span className="spinner" /> : `Pay ₹${totalFmt} Securely`}
        </button>
      </div>
    </>
  );
}
