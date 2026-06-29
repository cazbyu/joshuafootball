// Client-side caller for the `ask-coach` Edge Function.
// The Anthropic key never touches the browser — we just POST the question to
// our own function with the public anon key for auth.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const FUNCTION_URL = `${supabaseUrl}/functions/v1/ask-coach`

export async function askCoach(question, playContext = null) {
  const resp = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify(playContext ? { question, playContext } : { question }),
  })

  let data = null
  try {
    data = await resp.json()
  } catch {
    // fall through to generic error below
  }

  if (!resp.ok || !data?.answer) {
    const msg = data?.error || `Coach unavailable (${resp.status})`
    throw new Error(msg)
  }

  return data.answer
}
