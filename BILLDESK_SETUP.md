# BillDesk Payment Gateway Setup (Legacy PGI)

This uses BillDesk's **PGI hosted-checkout** flow that matches your credentials:
**Merchant ID**, **Security ID**, and **Checksum Key**.

Flow: donor clicks Donate → `billdesk-initiate` signs the request → browser is
redirected to BillDesk's hosted page → after payment BillDesk redirects back to
`billdesk-response`, which verifies the checksum and updates the donation.

> Note: `supabase/functions/billdesk-create-order` was an earlier attempt at the
> *newer* BillDesk SDK (needs different credentials) and is **no longer used**.
> The active functions are `billdesk-initiate` and `billdesk-response`.

---

## 1. Run the DB migration
In Supabase SQL Editor, run **`migration_v8_billdesk.sql`** (adds `order_no`,
`txn_ref_no`, `gateway` columns to `donations`).

## 2. Set the Edge Function secrets
```bash
supabase login
supabase link --project-ref grfmsmyailjdqnakvokn

supabase secrets set BILLDESK_MERCHANT_ID=FRIENDSECT
supabase secrets set BILLDESK_SECURITY_ID=friendsect
supabase secrets set BILLDESK_CHECKSUM_KEY=<the secret key BillDesk gave you>
supabase secrets set BILLDESK_URL=https://pgi.billdesk.com/pgidsk/PGIMerchantPayment
supabase secrets set SITE_URL=https://fect.catchytechnologies.com
# The return URL is this function's own public URL:
supabase secrets set BILLDESK_RETURN_URL=https://grfmsmyailjdqnakvokn.functions.supabase.co/billdesk-response
# Checksum algorithm — try 'hmac' first; if UAT rejects, switch to 'sha256'
supabase secrets set CHECKSUM_MODE=hmac
```

## 3. Deploy the two functions
```bash
supabase functions deploy billdesk-initiate --no-verify-jwt
supabase functions deploy billdesk-response --no-verify-jwt
```

## 4. Give BillDesk your URLs (UAT signoff step)
BillDesk must whitelist these before UAT works:
- **Return URL (RU):** `https://grfmsmyailjdqnakvokn.functions.supabase.co/billdesk-response`
- **Referral URL:** `https://fect.catchytechnologies.com`

## 5. Enable BillDesk in the website
Admin → Site Settings → Mail & Payments → set the payment gateway to include
`billdesk`. (The donor sees "BillDesk" as a payment option.)

## 6. Test in UAT
- Per the BillDesk doc, the **test amount must be ₹2**.
- Make a donation, complete payment on BillDesk's page, confirm you're redirected
  back to `…/donate?status=success` and the donation shows **success** in
  Admin → Donations.
- If you get a checksum error in UAT, flip `CHECKSUM_MODE` to `sha256` and redeploy:
  ```bash
  supabase secrets set CHECKSUM_MODE=sha256
  ```

---

## Going live
1. BillDesk confirms go-live and provides the production endpoint (often the same
   host) and production Merchant/Security/Checksum credentials.
2. Update the secrets with the production values (`BILLDESK_*`).
3. Give BillDesk the production Return URL + Referral URL.
4. Remove the ₹2 test restriction (real amounts).

## How it maps to the BillDesk doc
- **Request msg (23 fields):**
  `MerchantID|OrderNo|NA|Amount|NA|NA|NA|INR|NA|R|SecurityID|NA|NA|F|NA|NA|NA|NA|NA|NA|NA|RU|CHECKSUM`
- **Response:** AuthStatus is field 15; `0300` = success. The function verifies the
  checksum over all fields except the trailing checksum before trusting it, then
  updates only the matching `pending` record once (idempotent), exactly as the
  doc's "Payment Updation process" requires.
- Amount is sent in `Rs.Ps` format with no leading zero.
