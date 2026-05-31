// Supabase Edge Function: notify
// Sends an email to the admin when a contact form is submitted or a donation is made.
//
// Triggered by a Supabase Database Webhook on INSERT to:
//   - contact_messages
//   - donations
//
// Required secrets (set with `supabase secrets set ...`):
//   RESEND_API_KEY   — your Resend API key (https://resend.com)
//   FROM_EMAIL       — a verified sender, e.g. "FECT <noreply@fect.in>"
//   SUPABASE_URL     — auto-injected
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected
//
// Deploy:  supabase functions deploy notify --no-verify-jwt

import { createClient } from 'jsr:@supabase/supabase-js@2'

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: Record<string, unknown>
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'FECT <onboarding@resend.dev>'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  })
  if (!res.ok) {
    console.error('Resend error:', await res.text())
  }
  return res.ok
}

Deno.serve(async (req) => {
  try {
    const payload = (await req.json()) as WebhookPayload
    if (payload.type !== 'INSERT') return new Response('ignored', { status: 200 })

    // Read notification settings
    const { data: settings } = await supabase
      .from('site_settings')
      .select('notification_email, notify_on_contact, notify_on_donation')
      .single()

    const recipient = settings?.notification_email
    if (!recipient) return new Response('no recipient configured', { status: 200 })

    const r = payload.record

    if (payload.table === 'contact_messages' && settings?.notify_on_contact) {
      const html = `
        <h2 style="color:#c0392b">New Contact Enquiry — FECT</h2>
        <p><strong>Name:</strong> ${r.name ?? ''}</p>
        <p><strong>Email:</strong> ${r.email ?? ''}</p>
        <p><strong>Phone:</strong> ${r.phone ?? '—'}</p>
        <p><strong>Subject:</strong> ${r.subject ?? '—'}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left:3px solid #c0392b;padding-left:12px;color:#444">${r.message ?? ''}</blockquote>
        <hr/><p style="color:#888;font-size:12px">View all enquiries in your FECT admin panel → Enquiries.</p>
      `
      await sendEmail(recipient, `New enquiry from ${r.name ?? 'website'}`, html)
    }

    if (payload.table === 'donations' && settings?.notify_on_donation) {
      const html = `
        <h2 style="color:#c0392b">New Donation Received — FECT 🎉</h2>
        <p><strong>Donor:</strong> ${r.name ?? ''}</p>
        <p><strong>Email:</strong> ${r.email ?? ''}</p>
        <p><strong>Phone:</strong> ${r.phone ?? '—'}</p>
        <p><strong>Amount:</strong> ₹${Number(r.amount ?? 0).toLocaleString('en-IN')}</p>
        <p><strong>Status:</strong> ${r.status ?? ''}</p>
        <p><strong>Payment ID:</strong> ${r.razorpay_payment_id ?? '—'}</p>
        <hr/><p style="color:#888;font-size:12px">View all donations in your FECT admin panel → Donations.</p>
      `
      await sendEmail(recipient, `New donation: ₹${Number(r.amount ?? 0).toLocaleString('en-IN')} from ${r.name ?? ''}`, html)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('error', { status: 500 })
  }
})
