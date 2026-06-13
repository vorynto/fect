// Supabase Edge Function: billdesk-response  (the BillDesk Return URL / RU)
// Receives BillDesk's payment response (browser POST + server-to-server POST),
// verifies the checksum, updates the donation, and redirects the donor.
//
// Secrets (supabase secrets set ...):
//   BILLDESK_CHECKSUM_KEY  (secret)
//   CHECKSUM_MODE          'hmac' (default) | 'sha256'   (must match billdesk-initiate)
//   SITE_URL               https://fect.catchytechnologies.com  (where to send the donor back)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (auto-injected)
//
// Deploy: supabase functions deploy billdesk-response --no-verify-jwt
// IMPORTANT: give BillDesk this function's public URL as your Return URL (RU).

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CHECKSUM_KEY  = Deno.env.get('BILLDESK_CHECKSUM_KEY') ?? ''
const CHECKSUM_MODE = (Deno.env.get('CHECKSUM_MODE') ?? 'hmac').toLowerCase()
const SITE_URL      = Deno.env.get('SITE_URL') ?? 'https://fect.catchytechnologies.com'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

function toHexUpper(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

async function checksum(message: string): Promise<string> {
  const enc = new TextEncoder()
  if (CHECKSUM_MODE === 'sha256') {
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(message + CHECKSUM_KEY))
    return toHexUpper(buf)
  }
  const key = await crypto.subtle.importKey('raw', enc.encode(CHECKSUM_KEY), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return toHexUpper(sig)
}

// Redirect the donor's browser back to the donate page with a status flag
function redirect(status: string, ref = '') {
  const url = `${SITE_URL}/donate?status=${status}${ref ? `&ref=${encodeURIComponent(ref)}` : ''}`
  return new Response(null, { status: 303, headers: { Location: url } })
}

Deno.serve(async (req) => {
  try {
    // BillDesk posts application/x-www-form-urlencoded with a `msg` field
    let msg = ''
    const ct = req.headers.get('content-type') ?? ''
    if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const form = await req.formData()
      msg = String(form.get('msg') ?? '')
    } else {
      const url = new URL(req.url)
      msg = url.searchParams.get('msg') ?? ''
    }

    if (!msg) return redirect('error')

    // Split — last field is the received checksum, the rest is the signed body
    const parts = msg.split('|')
    const receivedChecksum = parts.pop() ?? ''
    const body = parts.join('|')

    const expected = await checksum(body)
    if (expected.toUpperCase() !== receivedChecksum.toUpperCase()) {
      console.error('Checksum mismatch')
      return redirect('error')
    }

    // Response field positions (0-based):
    // 1 = OrderNo (CustomerID), 2 = TxnReferenceNo, 4 = TxnAmount, 14 = AuthStatus
    const orderNo    = parts[1] ?? ''
    const txnRefNo   = parts[2] ?? ''
    const authStatus = parts[14] ?? ''
    const newStatus  = authStatus === '0300' ? 'success' : 'failed'

    // Idempotent update: only the matching pending record, once
    if (orderNo) {
      await supabase
        .from('donations')
        .update({ status: newStatus, txn_ref_no: txnRefNo })
        .eq('order_no', orderNo)
        .eq('status', 'pending')
    }

    return redirect(newStatus === 'success' ? 'success' : 'failed', txnRefNo)
  } catch (err) {
    console.error(err)
    return redirect('error')
  }
})
