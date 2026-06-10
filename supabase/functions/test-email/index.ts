import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore — Deno npm specifier
import nodemailer from 'npm:nodemailer@6.9.7'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { host, port, user, pass, fromName, fromEmail, encryption, recipient } = await req.json()

    if (!host || !user || !fromEmail || !recipient) {
      return new Response(JSON.stringify({ error: 'Missing required fields: host, user, fromEmail, recipient' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const secure = encryption === 'ssl'
    const ignoreTLS = encryption === 'none'

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure,
      ignoreTLS,
      auth: { user, pass: pass || '' },
    })

    await transporter.sendMail({
      from: `"${fromName || 'FECT'}" <${fromEmail}>`,
      to: recipient,
      subject: 'FECT Website — SMTP Test Email ✓',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px">
          <div style="background:#c0392b;padding:24px;border-radius:10px;text-align:center;margin-bottom:24px">
            <h2 style="color:#fff;margin:0;font-size:20px">SMTP Test Successful ✓</h2>
          </div>
          <p style="color:#374151;font-size:15px;line-height:1.6">
            Your SMTP configuration is working correctly.<br>
            This test email was sent from the FECT admin settings panel.
          </p>
          <table style="width:100%;border-collapse:collapse;margin-top:20px;font-size:13px">
            <tr style="background:#f3f4f6">
              <td style="padding:8px 12px;font-weight:600;color:#6b7280;width:120px">Host</td>
              <td style="padding:8px 12px;color:#111827">${host}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;font-weight:600;color:#6b7280">Port</td>
              <td style="padding:8px 12px;color:#111827">${port}</td>
            </tr>
            <tr style="background:#f3f4f6">
              <td style="padding:8px 12px;font-weight:600;color:#6b7280">Encryption</td>
              <td style="padding:8px 12px;color:#111827">${encryption || 'starttls'}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;font-weight:600;color:#6b7280">From</td>
              <td style="padding:8px 12px;color:#111827">${fromEmail}</td>
            </tr>
          </table>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center">
            FECT — Friends Educational &amp; Charitable Trust
          </p>
        </div>
      `,
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
