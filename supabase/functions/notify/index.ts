// Supabase Edge Function: notify
// Sends emails via SMTP (nodemailer) — credentials stored in site_settings.
// Triggered by Supabase Database Webhooks on INSERT to:
//   - contact_messages
//   - donations
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected)
// Deploy: supabase functions deploy notify --no-verify-jwt

import { createClient } from 'jsr:@supabase/supabase-js@2'
// @ts-ignore — Deno npm specifier
import nodemailer from 'npm:nodemailer@6.9.7'

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: Record<string, unknown>
}

interface SmtpSettings {
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_pass: string
  smtp_from_name: string
  smtp_from_email: string
  smtp_encryption: string
  notification_email: string
  notify_on_contact: boolean
  notify_on_donation: boolean
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')   ?? ''
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ─── Email sender ──────────────────────────────────────────────────────────────

async function buildTransporter(s: SmtpSettings) {
  const secure   = s.smtp_encryption === 'ssl'
  const ignoreTLS = s.smtp_encryption === 'none'
  return nodemailer.createTransport({
    host:    s.smtp_host,
    port:    Number(s.smtp_port) || 587,
    secure,
    ignoreTLS,
    auth: { user: s.smtp_user, pass: s.smtp_pass || '' },
  })
}

async function sendEmail(
  s: SmtpSettings,
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const transporter = await buildTransporter(s)
  const fromAddr = `"${s.smtp_from_name || 'FECT'}" <${s.smtp_from_email}>`
  await transporter.sendMail({ from: fromAddr, to, subject, html })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount: unknown): string {
  return `₹${Number(amount ?? 0).toLocaleString('en-IN')}`
}

function formatDate(dateStr: unknown): string {
  if (!dateStr) return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  return new Date(String(dateStr)).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── Thank-you email to donor ─────────────────────────────────────────────────

function donorThankYouHtml(r: Record<string, unknown>): string {
  const isQR      = r.status === 'qr_pending'
  const name      = String(r.name ?? 'Friend')
  const amount    = formatAmount(r.amount)
  const date      = formatDate(r.created_at)
  const refId     = String(r.razorpay_payment_id ?? '—')
  const statusTag = isQR
    ? `<span style="background:#f39c12;color:#fff;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">Pending Verification</span>`
    : `<span style="background:#27ae60;color:#fff;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">Payment Confirmed</span>`

  const statusNote = isQR
    ? `<p style="margin:0 0 12px;color:#555;font-size:15px;line-height:1.7;">
        We have received your payment reference. Our team will verify it within <strong>24 hours</strong>
        and send you a confirmation. If you have any questions, reply to this email or call us at
        <strong>+91-99529 71384</strong>.
       </p>`
    : `<p style="margin:0 0 12px;color:#555;font-size:15px;line-height:1.7;">
        Your payment has been successfully received and recorded. Thank you for your generous heart.
        A detailed receipt and 80G certificate will be shared with you on request.
       </p>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank You for Your Donation — FECT</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#c0392b;padding:36px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:2px;text-transform:uppercase;font-weight:600;">Friends Educational &amp; Charitable Trust</p>
            <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Thank You! 🙏</h1>
            <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.85);">Your generosity is changing lives</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:36px 40px 0;">
            <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1a1a2e;">Dear ${name},</p>
            <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.8;">
              On behalf of the entire FECT family, we extend our heartfelt gratitude for your kind donation.
              Your contribution — however small it may seem to you — makes a <strong>real, tangible difference</strong>
              in the lives of students, elders, and families across Tamil Nadu.
            </p>
            ${statusNote}
          </td>
        </tr>

        <!-- Donation summary card -->
        <tr>
          <td style="padding:24px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#fef9f9;border:2px solid #f5c6c6;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:20px 24px 16px;border-bottom:1px solid #f5c6c6;">
                  <p style="margin:0;font-size:13px;font-weight:700;color:#c0392b;text-transform:uppercase;letter-spacing:1.5px;">Donation Summary</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:7px 0;color:#888;font-size:14px;width:44%;">Donor Name</td>
                      <td style="padding:7px 0;font-weight:700;color:#1a1a2e;font-size:14px;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding:7px 0;color:#888;font-size:14px;border-top:1px solid #f0e8e8;">Amount Donated</td>
                      <td style="padding:7px 0;font-weight:800;color:#c0392b;font-size:22px;border-top:1px solid #f0e8e8;">${amount}</td>
                    </tr>
                    <tr>
                      <td style="padding:7px 0;color:#888;font-size:14px;border-top:1px solid #f0e8e8;">Date</td>
                      <td style="padding:7px 0;font-weight:700;color:#1a1a2e;font-size:14px;border-top:1px solid #f0e8e8;">${date}</td>
                    </tr>
                    <tr>
                      <td style="padding:7px 0;color:#888;font-size:14px;border-top:1px solid #f0e8e8;">Reference</td>
                      <td style="padding:7px 0;font-weight:600;color:#555;font-size:13px;font-family:monospace;border-top:1px solid #f0e8e8;">${refId}</td>
                    </tr>
                    <tr>
                      <td style="padding:7px 0;color:#888;font-size:14px;border-top:1px solid #f0e8e8;">Status</td>
                      <td style="padding:7px 0;border-top:1px solid #f0e8e8;">${statusTag}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Impact section -->
        <tr>
          <td style="padding:8px 40px 28px;">
            <p style="margin:0 0 14px;font-size:15px;font-weight:700;color:#1a1a2e;">Your donation helps us:</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;width:28px;vertical-align:top;font-size:17px;">📚</td>
                <td style="padding:6px 0 6px 10px;color:#555;font-size:14px;line-height:1.6;">Pay school fees, books &amp; uniforms for deserving students</td>
              </tr>
              <tr>
                <td style="padding:6px 0;width:28px;vertical-align:top;font-size:17px;">🏥</td>
                <td style="padding:6px 0 6px 10px;color:#555;font-size:14px;line-height:1.6;">Fund emergency medical treatment for critical patients</td>
              </tr>
              <tr>
                <td style="padding:6px 0;width:28px;vertical-align:top;font-size:17px;">🍛</td>
                <td style="padding:6px 0 6px 10px;color:#555;font-size:14px;line-height:1.6;">Cook and serve daily meals to 100+ elders &amp; children</td>
              </tr>
              <tr>
                <td style="padding:6px 0;width:28px;vertical-align:top;font-size:17px;">🏠</td>
                <td style="padding:6px 0 6px 10px;color:#555;font-size:14px;line-height:1.6;">Support orphanages, elderly homes &amp; special children</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 80G banner -->
        <tr>
          <td style="padding:0 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#1a1a2e;border-radius:12px;">
              <tr>
                <td style="padding:18px 24px;">
                  <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#c0392b;text-transform:uppercase;letter-spacing:1.5px;">80G Tax Exemption</p>
                  <p style="margin:0;color:#ccc;font-size:14px;line-height:1.7;">
                    FECT is registered under <strong style="color:#fff;">Section 80G</strong> of the Income Tax Act.
                    Your donation qualifies for tax deduction. Reply to this email to request your 80G certificate.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Contact -->
        <tr>
          <td style="padding:0 40px 32px;">
            <p style="margin:0 0 10px;font-size:14px;color:#888;line-height:1.7;">
              Have questions? We're always here for you.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:20px;">
                  <a href="mailto:contactus@fect.in" style="color:#c0392b;font-size:14px;font-weight:600;text-decoration:none;">✉ contactus@fect.in</a>
                </td>
                <td>
                  <a href="tel:+919952971384" style="color:#c0392b;font-size:14px;font-weight:600;text-decoration:none;">📞 +91-99529 71384</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f8f8;padding:24px 40px;border-top:1px solid #eee;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#1a1a2e;">Friends Educational &amp; Charitable Trust</p>
            <p style="margin:0 0 6px;font-size:12px;color:#aaa;">No.11A Ganeshan Street, 1st Floor, Esa Pallavaram, Chennai 600 043</p>
            <p style="margin:0;font-size:11px;color:#ccc;">Reg No: TN-09/184, dt 06.02.2009 &nbsp;·&nbsp; www.fect.in</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`
}

// ─── Admin alert emails ────────────────────────────────────────────────────────

function adminDonationHtml(r: Record<string, unknown>): string {
  return `
    <h2 style="color:#c0392b;font-family:sans-serif;">New Donation Received — FECT 🎉</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;">
      <tr><td style="padding:6px 16px 6px 0;color:#888;">Donor</td><td style="font-weight:700;">${r.name ?? ''}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888;">Email</td><td>${r.email ?? ''}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888;">Phone</td><td>${r.phone ?? '—'}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888;">Amount</td><td style="font-weight:800;color:#c0392b;font-size:18px;">${formatAmount(r.amount)}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888;">Status</td><td>${r.status ?? ''}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888;">Payment Ref</td><td style="font-family:monospace;">${r.razorpay_payment_id ?? '—'}</td></tr>
    </table>
    <p style="margin-top:20px;font-size:12px;color:#aaa;font-family:sans-serif;">View all donations in your FECT admin panel → Donations.</p>
  `
}

function adminContactHtml(r: Record<string, unknown>): string {
  return `
    <h2 style="color:#c0392b;font-family:sans-serif;">New Contact Enquiry — FECT</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;">
      <tr><td style="padding:6px 16px 6px 0;color:#888;">Name</td><td style="font-weight:700;">${r.name ?? ''}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888;">Email</td><td>${r.email ?? ''}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888;">Phone</td><td>${r.phone ?? '—'}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888;">Subject</td><td>${r.subject ?? '—'}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888;vertical-align:top;">Message</td>
          <td style="max-width:400px;line-height:1.6;">${r.message ?? ''}</td></tr>
    </table>
    <p style="margin-top:20px;font-size:12px;color:#aaa;font-family:sans-serif;">View all enquiries in your FECT admin panel → Enquiries.</p>
  `
}

// ─── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const payload = (await req.json()) as WebhookPayload
    if (payload.type !== 'INSERT') return new Response('ignored', { status: 200 })

    const { data: settings } = await supabase
      .from('site_settings')
      .select('smtp_host,smtp_port,smtp_user,smtp_pass,smtp_from_name,smtp_from_email,smtp_encryption,notification_email,notify_on_contact,notify_on_donation')
      .single()

    if (!settings?.smtp_host || !settings?.smtp_from_email) {
      console.warn('[notify] SMTP not configured — skipping email send')
      return new Response('smtp_not_configured', { status: 200 })
    }

    const s = settings as SmtpSettings
    const adminEmail = s.notification_email
    const r = payload.record

    // ── Contact form ──────────────────────────────────────────────────────────
    if (payload.table === 'contact_messages' && s.notify_on_contact && adminEmail) {
      await sendEmail(
        s,
        adminEmail,
        `New enquiry from ${r.name ?? 'website'} — FECT`,
        adminContactHtml(r),
      )
    }

    // ── Donation ──────────────────────────────────────────────────────────────
    if (payload.table === 'donations') {
      // Admin alert
      if (s.notify_on_donation && adminEmail) {
        await sendEmail(
          s,
          adminEmail,
          `New donation: ${formatAmount(r.amount)} from ${r.name ?? 'donor'} — FECT`,
          adminDonationHtml(r),
        )
      }

      // Donor thank-you (always send when we have a valid email)
      const donorEmail = String(r.email ?? '').trim()
      if (donorEmail && donorEmail.includes('@')) {
        await sendEmail(
          s,
          donorEmail,
          `Thank you for your donation, ${r.name ?? 'Friend'}! 🙏 — FECT`,
          donorThankYouHtml(r),
        )
      }
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('[notify]', err)
    return new Response('error', { status: 500 })
  }
})
