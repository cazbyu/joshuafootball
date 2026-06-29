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

// Heuristic: does the question challenge a play's accuracy (vs. just ask about
// it)? Used to auto-add a flag to the review queue when there's a focus play.
function challengesAccuracy(q: string): boolean {
  return /\b(isn'?t|aren'?t|shouldn'?t|should(n'?t)? be|should it be|supposed to|not a |not the |looks? like|looks wrong|seems? wrong|is wrong|incorrect|mistake|error|doesn'?t look|that('?s| is) (right|correct)|are you sure|pretty sure|i think (it'?s|the)|wrong route|deeper|deepest)\b/i
    .test(q)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  let question: string
  let focusPlayName: string | null
  try {
    const body = await req.json()
    question = String(body?.question ?? '').trim()
    // Optional: when the player opened the bot from a specific play, the
    // play's name comes in so we can answer in that exact play's context.
    focusPlayName = body?.playContext ? String(body.playContext).trim() : null
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

  // If the player is asking about a specific play, pull its FULL detail
  // (including pre_snap, mistakes, coach_notes) so the coach can go deep.
  let focusBlock = ''
  if (focusPlayName) {
    const { data: focus } = await supabase
      .from('plays')
      .select(
        'name, formation, concept, description, wr_route, lb_key, key_read, situations, pre_snap, mistakes, coach_notes, tags',
      )
      .ilike('name', focusPlayName)
      .maybeSingle()
    if (focus) {
      focusBlock =
        `\n\nThe player is specifically asking about the play "${focus.name}". ` +
        `Answer in the context of THIS play unless he clearly changes the ` +
        `subject. Here is its full detail (JSON): ${JSON.stringify(focus)}`
    }
  }

  const systemPrompt =
    `You are an encouraging, knowledgeable high school football coach helping ` +
    `a 15-year-old sophomore (wide receiver / linebacker) learn the game.\n\n` +
    `IMPORTANT HONESTY RULES:\n` +
    `- The play DIAGRAM is the source of truth, not the text description. The ` +
    `text descriptions are AI-generated and may contain errors.\n` +
    `- If the player questions or challenges a route or detail, take it ` +
    `seriously and re-examine it genuinely. Do NOT just reassure him that he's ` +
    `right or that the text is right. It is completely fine — and good — to say ` +
    `"you may be right, the description might be off here."\n` +
    `- If you are not sure, say so plainly, and tell him to check the diagram ` +
    `and confirm with his real coach. Never invent certainty.\n` +
    `- When a play's description seems to conflict with what the player ` +
    `describes seeing in the diagram, trust the player's reading of the diagram ` +
    `and suggest he flag the play for coach review using the flag button.\n` +
    `- Be encouraging and positive, age-appropriate, no profanity. Teach the ` +
    `"why."\n` +
    `- When his playbook is relevant, reference specific plays by name.\n\n` +
    `Write in plain, conversational text — no Markdown formatting. Do not use ` +
    `headers (#), bold/asterisks (**), or tables. Use short paragraphs, and if ` +
    `you list things, use simple dashes. Emojis are fine, used sparingly.\n\n` +
    `Here is Joshua's playbook for reference (JSON): ${playbookContext}` +
    focusBlock

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

  // Prefer the explicit focus play; otherwise detect which plays (if any)
  // the coach referenced by name in the answer.
  const referenced = playbook
    .map((p: { name: string }) => p.name)
    .filter((name: string) => name && answer.toLowerCase().includes(name.toLowerCase()))
  const playContext = focusPlayName
    ? focusPlayName
    : referenced.length
      ? referenced.join(', ')
      : null

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

  // If the player is focused on a specific play AND clearly challenges its
  // accuracy, add it to the review queue automatically.
  if (focusPlayName && challengesAccuracy(question)) {
    const { error: flagError } = await supabase.from('play_flags').insert({
      play_name: focusPlayName,
      raised_by: 'Joshua',
      question,
      status: 'open',
    })
    if (flagError) {
      console.error('Failed to auto-flag play:', flagError)
    }
  }

  return json({ answer })
})
