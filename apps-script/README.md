# Server-side Razorpay verification — setup

The browser can no longer decide what was paid, or whether it was paid at all.
Both decisions moved into Apps Script (`Code.gs`), which is the only place the
Razorpay **key secret** exists.

```
  browser                     Apps Script                      Razorpay
  ───────                     ───────────                      ────────
  qty + coupon + address  ──►  computes the price itself
                               creates an order for it    ──►  POST /v1/orders
                          ◄──  { orderId, amount }        ◄──  order_XXX

  opens checkout with order_id ─────────────────────────────►  customer pays
  order_id, payment_id, signature ◄────────────────────────── 

  reports them            ──►  1. HMAC-SHA256(order_id|payment_id, secret)
                                  must equal signature
                               2. GET /v1/payments/:id must show
                                  captured, INR, and OUR amount
                               3. only then: write row + send email
                          ◄──  { ok: true }
  redirect to /thankyou
```

The client never sends an amount. A forged or replayed signature writes nothing
and sends nothing.

---

## ⚠️ Deploy order matters

The new checkout calls `action=createOrder`, which the current script does not
implement. **Deploy this script before the new frontend goes live**, or checkout
will break for everyone.

The frontend change is on the `verified-payments` branch and is deliberately
*not* on `main` for that reason. Merge it once step 5 below passes.

---

## 1. Open the script

From the orders spreadsheet: **Extensions → Apps Script**.

Keep a copy of your current `Code.gs` somewhere first — see "Merging with your
existing script" below.

## 2. Add the key secret

**Project Settings (⚙) → Script Properties → Add script property:**

| Property               | Value                                    |
| ---------------------- | ---------------------------------------- |
| `RAZORPAY_KEY_ID`      | `rzp_live_…` (the same public key id)    |
| `RAZORPAY_KEY_SECRET`  | the secret from Razorpay Dashboard → Account & Settings → API Keys |

The secret must never appear in the repo, in `CheckoutClient.tsx`, or in any
response the browser can read. `Code.gs` only ever returns the key *id*.

If you do not have the secret saved, generate a new key pair in the Razorpay
dashboard — you will then also need to update `RAZORPAY_KEY_ID` here and
`CONFIG.RAZORPAY_KEY_ID` in `src/components/CheckoutClient.tsx`.

## 3. Paste in `Code.gs`

Replace the file contents with `apps-script/Code.gs` from this repo.

## 4. Sheets

Created automatically on first use:

| Sheet              | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| `Orders`           | verified orders only                                            |
| `PendingOrders`    | orders created but not yet paid — holds the amount we asked for |
| `Coupons`          | `Code \| DiscountPct \| Active \| Expiry`                       |
| `RejectedAttempts` | every failed verification, with a reason                        |

`RejectedAttempts` is worth watching. A `signature_mismatch` there means someone
tried to confirm an order they had not paid for.

If you already have an `Orders` sheet, check its column order against
`ORDER_HEADERS` in `Code.gs` and adjust one to match the other.

## 5. Run the self-test

In the editor, choose `selfTest` and **Run**, then open **Execution log**.

Every line must say `PASS`, ending with `=== selfTest PASSED ===`. It checks the
HMAC against a known answer, the timing-safe compare, the pricing table, and
that both script properties are set.

The HMAC known-answer was cross-checked against Node's `crypto`:

```
HMAC-SHA256("order_ABC123|pay_XYZ789", "testsecret")
  = 8ab882b69975648bd036bb84b853484100f7addce5cead23e8a2d9ffe5ba21c8
```

If that line passes, this script's signature check agrees with Razorpay's.

## 6. Deploy

**Deploy → New deployment → Web app**

- Execute as: **Me**
- Who has access: **Anyone**

Copy the `/exec` URL. If it differs from `CONFIG.APPS_SCRIPT_URL` in
`src/components/CheckoutClient.tsx`, update it there.

> Every time you edit the script you must deploy a **new version**
> (Deploy → Manage deployments → ✏️ → Version: New version), otherwise the live
> URL keeps serving the old code.

## 7. Test with test keys before going live

Put your `rzp_test_…` key id and secret in the script properties and in
`CONFIG.RAZORPAY_KEY_ID`, then run one order through with a
[Razorpay test card](https://razorpay.com/docs/payments/payments/test-card-details/).

Confirm: a row appears in `Orders`, the confirmation email arrives, and
`PendingOrders` shows `paid`. Then swap both back to the live keys and deploy a
new version.

---

## Merging with your existing script

**I have not seen your current `Code.gs`**, so this is a complete replacement
rather than a patch. Two things almost certainly need reconciling:

1. **`sendConfirmationEmail_()`** — a plain-text placeholder. Paste your existing
   email body in. It is called only after verification succeeds.
2. **`lookupCoupon_()`** — assumes `Code | DiscountPct | Active | Expiry`. If your
   Coupons sheet is laid out differently, adjust the column indexes.

Also check `saveOrderRow_()` against your current sheet columns.

If you paste your existing `Code.gs` into the chat I will merge them properly
instead of leaving these seams.

## What changed for the client

| Before                                     | After                                              |
| ------------------------------------------ | -------------------------------------------------- |
| Browser computed the amount                 | Server computes it; browser sends only qty + coupon |
| `action=saveOrder`, fire-and-forget         | `action=createOrder` then `action=verifyAndSave`    |
| `mode:'no-cors'` — response unreadable      | Response is read; a rejection blocks the redirect   |
| Nothing verified the payment                | Signature + Razorpay API confirm capture and amount |

The old `saveOrder` endpoint now refuses and logs to `RejectedAttempts`, so a
stale cached build cannot write an unverified order.
