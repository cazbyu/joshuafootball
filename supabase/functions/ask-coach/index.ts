// "Ask the Coach" — server-side AI strategy bot.
//
// Keeps the Anthropic API key secret: the browser only ever talks to this
// Edge Function, which uses the SERVICE_ROLE key to read plays and log
// conversations regardless of RLS, then calls the Anthropic Messages API.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  let question: string
  try {
    const body = await req.json()
    question = String(body?.question ?? '').trim()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }
  if (!question) {
    return json({ error: 'Missing question' }, 400)
  }

  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!anthropicKey) {
    return json({ error: 'Coach is not configured (missing API key).' }, 500)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { db: { schema: 'p0015_football_playbook' } },
  )

  // Load the playbook as optional context for the coach.
  const { data: plays, error: playsError } = await supabase
    .from('plays')
    .select(
      'name, formation, concept, description, wr_route, lb_key, key_read, situations',
    )
  if (playsError) {
    console.error('Failed to load plays:', playsError)
  }
  const playbook = plays ?? []
  const playbookContext = JSON.stringify(playbook)

  const systemPrompt =
    `You are an encouraging, knowledgeable high school football coach helping ` +
    `a 15-year-old sophomore named Joshua learn the game. He plays wide ` +
    `receiver and linebacker. Answer general football strategy questions ` +
    `clearly and positively for someone learning the game. When his own ` +
    `playbook is relevant, reference specific plays by name from the context ` +
    `below. Keep answers concise, positive, and age-appropriate. Never use ` +
    `profanity. Always focus on teaching the "why" behind the strategy.\n\n` +
    `Write in plain, conversational text — no Markdown formatting. Do not use ` +
    `headers (#), bold/asterisks (**), or tables. Use short paragraphs, and if ` +
    `you list things, use simple dashes. Emojis are fine, used sparingly.\n\n` +
    `Here is Joshua's playbook for reference (JSON): ${playbookContext}`

  let answer: string
  try {
    const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }],
      }),
    })

    if (!aiResp.ok) {
      const detail = await aiResp.text()
      console.error('Anthropic API error:', aiResp.status, detail)
      return json({ error: 'The coach is catching his breath — try again.' }, 502)
    }

    const aiData = await aiResp.json()
    answer = (aiData.content ?? [])
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('\n')
      .trim()
  } catch (err) {
    console.error('Anthropic request failed:', err)
    return json({ error: 'Could not reach the coach. Try again.' }, 502)
  }

  if (!answer) {
    answer = "I didn't quite catch that — can you ask it a different way?"
  }

  // Which plays (if any) did the coach reference by name?
  const referenced = playbook
    .map((p: { name: string }) => p.name)
    .filter((name: string) => name && answer.toLowerCase().includes(name.toLowerCase()))
  const playContext = referenced.length ? referenced.join(', ') : null

  // Log the conversation. Don't fail the request if logging fails.
  const { error: insertError } = await supabase
    .from('bot_conversations')
    .insert({
      player_name: 'Joshua',
      question,
      response: answer,
      play_context: playContext,
    })
  if (insertError) {
    console.error('Failed to log conversation:', insertError)
  }

  return json({ answer })
})
