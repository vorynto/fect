// Supabase Edge Function: billdesk-initiate
// Builds the BillDesk PGI request message + checksum and records a pending donation.
// The browser then auto-POSTs the returned `msg` to BillDesk's hosted payment page.
//
// Secrets (supabase secrets set ...):
//   BILLDESK_MERCHANT_ID   e.g. FRIENDSECT
//   BILLDESK_SECURITY_ID   e.g. friendsect
//   BILLDESK_CHECKSUM_KEY  (secret — provided by BillDesk)
//   BILLDESK_URL           https://pgi.billdesk.com/pgidsk/PGIMerchantPayment   (UAT & live share host)
//   BILLDESK_RETURN_URL    https://<ref>.functions.supabase.co/billdesk-response
//   CHECKSUM_MODE          'hmac' (default) | 'sha256'   ← switch if UAT rejects
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (auto-injected)
//
// Deploy: supabase functions deploy billdesk-initiate --no-verify-jwt

import { createClient } from 'jsr:@supabase/supabase-js@2'

const MERCHANT_ID  = Deno.env.get('BILLDESK_MERCHANT_ID')  ?? 'FRIENDSECT'
const SECURITY_ID  = Deno.env.get('BILLDESK_SECURITY_ID')  ?? 'friendsect'
const CHECKSUM_KEY = Deno.env.get('BILLDESK_CHECKSUM_KEY') ?? ''
const BILLDESK_URL = Deno.env.get('BILLDESK_URL')          ?? 'https://pgi.billdesk.com/pgidsk/PGIMerchantPayment'
const RETURN_URL   = Deno.env.get('BILLDESK_RETURN_URL')   ?? ''
const CHECKSUM_MODE = (Deno.env.get('CHECKSUM_MODE') ?? 'hmac').toLowerCase()

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ── Checksum helpers ────────────────────────────────────────────────────────────
function toHexUpper(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

async function checksum(message: string): Promise<string> {
  const enc = new TextEncoder()
  if (CHECKSUM_MODE === 'sha256') {
    // SHA-256 of (message + key)
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(message + CHECKSUM_KEY))
    return toHexUpper(buf)
  }
  // Default: HMAC-SHA256(message, key)
  const key = await crypto.subtle.importKey('raw', enc.encode(CHECKSUM_KEY), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return toHexUpper(sig)
}

// Strip BillDesk-disallowed characters: < > % ; ' " ^ ` & ? = \
const sanitize = (s: string) => (s || '').replace(/[<>%;'"^`&?=\\|]/g, '').trim()

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors })

  try {
    const { name, email, phone, amount } = await req.json()

    const amt = Number(amount)
    if (!name || !email || !amt || amt < 1) {
      return new Response(JSON.stringify({ error: 'Invalid donation details' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }
    if (!CHECKSUM_KEY) {
      return new Response(JSON.stringify({ error: 'Payment gateway not configured' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Unique, alphanumeric order number (<=120 chars, no special chars)
    const orderNo = `FECT${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`
    const txnAmount = amt.toFixed(2) // Rs.Ps format, no leading zero

    // Build the 22-field pipe message (checksum appended after)
    // MerchantID|OrderNo|NA|Amount|NA|NA|NA|INR|NA|R|SecurityID|NA|NA|F|NA|NA|NA|NA|NA|NA|NA|RU
    const fields = [
      MERCHANT_ID, orderNo, 'NA', txnAmount, 'NA', 'NA', 'NA', 'INR', 'NA', 'R',
      SECURITY_ID, 'NA', 'NA', 'F', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA',
      RETURN_URL,
    ]
    const message = fields.join('|')
    const cs = await checksum(message)
    const msg = `${message}|${cs}`

    // Record a pending donation
    const { error } = await supabase.from('donations').insert([{
      name: sanitize(String(name)),
      email: String(email).trim(),
      phone: sanitize(String(phone ?? '')),
      amount: Math.round(amt),
      order_no: orderNo,
      status: 'pending',
      gateway: 'billdesk',
    }])
    if (error) console.error('insert error:', error.message)

    return new Response(JSON.stringify({ bdUrl: BILLDESK_URL, msg, orderNo }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
