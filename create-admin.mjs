// Run: node create-admin.mjs
// Requires SUPABASE_SERVICE_KEY from: Supabase Dashboard → Settings → API → service_role key

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://grfmsmyailjdqnakvokn.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '' // set via env

if (!SERVICE_KEY) {
  console.error('Set SUPABASE_SERVICE_KEY env var first:')
  console.error('  SUPABASE_SERVICE_KEY=your_service_key node create-admin.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const { data, error } = await supabase.auth.admin.createUser({
  email: 'vorynto.india@gmail.com',
  password: 'Fect@Admin2024!',
  email_confirm: true,
})

if (error) {
  console.error('Error:', error.message)
} else {
  console.log('✅ Admin user created:', data.user.email, '(ID:', data.user.id + ')')
  console.log('Login at: /admin/login')
  console.log('Password: Fect@Admin2024!  (change after first login)')
}
