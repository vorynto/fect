// Supabase Edge Function: billdesk-create-order
// Creates a BillDesk SmartGateway order and returns { bdOrderId, authToken }
// for the frontend SDK to launch the payment UI.
//
// Required secrets (set via Supabase Dashboard → Settings → Edge Functions → Secrets):
//   BILLDESK_CLIENT_ID   — your BillDesk Client ID (from BillDesk portal)
//   BILLDESK_SECRET      — your BillDesk secret key (plain string, not base64)
//   BILLDESK_KEY_ID      — key version, e.g. "0001" (from BillDesk portal, default "0001")
//
// Deploy:
//   supabase functions deploy billdesk-create-order --no-verify-jwt
//
// API reference: BillDesk SmartGateway v1.2 — Orders Create

// ─── CORS ─────────────────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function corsOk() {
  return new Response('ok', { headers: CORS })
}

function jsonRes(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

// ─── Base64url helpers ────────────────────────────────────────────────────────

function b64urlEncode(bytes: Uint8Array): string {
  let bin = ''
  bytes.forEach(b => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function b64urlEncodeStr(str: string): string {
  return b64urlEncode(new TextEncoder().encode(str))
}

function b64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') +
    '=='.slice(0, (4 - (str.length % 4)) % 4)
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0))
}

// ─── JWS / JWT helpers ────────────────────────────────────────────────────────

async function signHS256(input: string, secretBytes: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(input))
  return b64urlEncode(new Uint8Array(sig))
}

async function createJWS(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  secret: string,
): Promise<string> {
  // BillDesk uses the raw UTF-8 bytes of the secret string
  const secretBytes = new TextEncoder().encode(secret)
  const h = b64urlEncodeStr(JSON.stringify(header))
  const p = b64urlEncodeStr(JSON.stringify(payload))
  const sig = await signHS256(`${h}.${p}`, secretBytes)
  return `${h}.${p}.${sig}`
}

function decodeJWSPayload(jws: string): Record<string, unknown> {
  const parts = jws.trim().split('.')
  if (parts.length < 2) throw new Error(`Invalid JWS — got ${parts.length} parts`)
  return JSON.parse(new TextDecoder().decode(b64urlDecode(parts[1])))
}

// ─── IST timestamp ────────────────────────────────────────────────────────────

function istNow(): string {
  const now = new Date()
  // Shift to IST (UTC+5:30)
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)
  const p = (n: number) => n.toString().padStart(2, '0')
  return (
    `${ist.getUTCFullYear()}-${p(ist.getUTCMonth() + 1)}-${p(ist.getUTCDate())}` +
    `T${p(ist.getUTCHours())}:${p(ist.getUTCMinutes())}:${p(ist.getUTCSeconds())}+05:30`
  )
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return corsOk()

  try {
    // ── Read request body ──
    const { amount, name, email, phone, merchantId, env } = await req.json()

    // ── Read secrets ──
    const CLIENT_ID = Deno.env.get('BILLDESK_CLIENT_ID')
    const SECRET    = Deno.env.get('BILLDESK_SECRET')
    const KEY_ID    = Deno.env.get('BILLDESK_KEY_ID') || '0001'

    if (!CLIENT_ID || !SECRET) {
      return jsonRes(
        { error: 'BILLDESK_CLIENT_ID and BILLDESK_SECRET must be set as Edge Function secrets.' },
        500,
      )
    }

    const mid    = (merchantId as string) || ''
    const isUAT  = (env as string) === 'uat'
    const apiUrl = isUAT
      ? 'https://uat1.billdesk.com/u2/payments/ve1_2/orders/create'
      : 'https://pay.billdesk.com/u2/payments/ve1_2/orders/create'

    // Unique order id: FECT + timestamp + 4 random chars
    const orderId = `FECT${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    // Return URL — BillDesk redirects here in non-JS fallback scenarios.
    // For the SmartGateway JS SDK the responseHandler callback is used instead.
    const origin    = req.headers.get('origin') || 'https://fect.in'
    const returnUrl = `${origin}/donate`

    // ── Build order payload ──
    const payload = {
      mercid:     mid,
      orderid:    orderId,
      amount:     Number(amount).toFixed(2),   // rupees, 2 decimal places
      order_date: istNow(),
      currency:   '356',                        // INR
      ru:         returnUrl,
      additional_info: {
        additional_info1: String(name  || 'Donor').slice(0, 50),
        additional_info2: String(email || '').slice(0, 100),
        additional_info3: String(phone || '').slice(0, 20),
        additional_info4: 'Donation - FECT',
      },
      itemcode: 'DIRECT',
      device: {
        init_channel:   'internet',
        ip:             (req.headers.get('x-forwarded-for') || '0.0.0.0').split(',')[0].trim(),
        user_agent:     (req.headers.get('user-agent') || 'Mozilla/5.0').slice(0, 200),
        accept_header:  'text/html',
        fingerprintid:  orderId,
      },
    }

    const header = {
      alg:      'HS256',
      clientid: CLIENT_ID,
      kid:      `${CLIENT_ID}:${KEY_ID}`,
      typ:      'JWT',
    }

    // ── Sign and POST to BillDesk ──
    const jws = await createJWS(header, payload, SECRET)

    const bdRes = await fetch(apiUrl, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/jose',
        'Accept':        'application/jose',
        'BD-Timestamp':  String(Math.floor(Date.now() / 1000)),
        'BD-Traceid':    orderId,
      },
      body: jws,
    })

    if (!bdRes.ok) {
      const body = await bdRes.text()
      throw new Error(`BillDesk API ${bdRes.status}: ${body.slice(0, 400)}`)
    }

    // ── Decode response JWS ──
    const responseText = await bdRes.text()
    let decoded: Record<string, unknown>
    try {
      decoded = decodeJWSPayload(responseText)
    } catch {
      throw new Error(`Could not decode BillDesk response: ${responseText.slice(0, 200)}`)
    }

    if (!decoded.bdorderid) {
      throw new Error(`BillDesk did not return bdorderid: ${JSON.stringify(decoded).slice(0, 300)}`)
    }

    // ── Return to frontend ──
    return jsonRes({
      bdOrderId:  decoded.bdorderid,
      authToken:  decoded.authtoken,
      orderId,  // our internal order id (for logging)
    })

  } catch (err) {
    console.error('[billdesk-create-order]', err)
    return jsonRes(
      { error: err instanceof Error ? err.message : String(err) },
      500,
    )
  }
})
