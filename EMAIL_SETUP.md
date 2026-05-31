# Email Notifications Setup (FECT)

This sends an email to the admin whenever:
- someone submits the **Contact form**, or
- someone makes a **Donation**.

The recipient address and on/off toggles are managed in **Admin → Site Settings → Mail & Payments**.
Email delivery is handled by a **Supabase Edge Function** + **Resend** (free tier: 3,000 emails/month).

---

## One-time setup

### 1. Create a Resend account
1. Sign up at https://resend.com
2. (Recommended) Verify your domain `fect.in` so emails send from `noreply@fect.in`.
   Without a verified domain you can still test using `onboarding@resend.dev`.
3. Copy your **API key** (starts with `re_`).

### 2. Install the Supabase CLI
```bash
npm install -g supabase
supabase login
supabase link --project-ref grfmsmyailjdqnakvokn
```

### 3. Set the function secrets
```bash
supabase secrets set RESEND_API_KEY=re_your_key_here
supabase secrets set FROM_EMAIL="FECT <noreply@fect.in>"
```
(`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.)

### 4. Deploy the function
```bash
supabase functions deploy notify --no-verify-jwt
```

### 5. Create the Database Webhooks
In the Supabase Dashboard → **Database → Webhooks → Create a new hook**, create **two** hooks:

**Hook 1 — Contact form**
- Table: `contact_messages`
- Events: `Insert`
- Type: `Supabase Edge Functions` → select `notify`

**Hook 2 — Donations**
- Table: `donations`
- Events: `Insert`
- Type: `Supabase Edge Functions` → select `notify`

> Alternatively run `migration_v7_webhooks.sql` in the SQL Editor (uses `pg_net`).

### 6. Done
Submit a test contact form on the live site — the admin email set in
**Mail & Payments** should receive a notification within seconds.

---

## Notes
- The recipient email and toggles are read live from `site_settings`, so the admin can
  change them anytime without redeploying.
- If `RESEND_API_KEY` is not set, the function exits quietly (no emails, no errors).
- Cost: free for typical NGO volumes.
