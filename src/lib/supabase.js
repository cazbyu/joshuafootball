import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loud in dev so a missing .env.local is obvious.
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

// The playbook lives in its own Postgres schema, not `public`.
// This must be set here (not as a table-name prefix in queries).
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'p0015_football_playbook' },
  auth: { persistSession: false },
})
