// Quiz question generation. Each mode turns a play into a question object:
// { id, mode, play, prompt, hint, options: string[], correct, explanation }

export const QUIZ_MODES = [
  {
    id: 'name_to_desc',
    label: 'Name → What it does',
    emoji: '📖',
    blurb: 'See a play name, pick what it does',
  },
  {
    id: 'desc_to_name',
    label: 'Routes → Name',
    emoji: '🧭',
    blurb: 'See the WR routes, name the play',
  },
  {
    id: 'formation',
    label: 'Formations',
    emoji: '🏟️',
    blurb: 'Which formation is this play in?',
  },
  {
    id: 'wr_routes',
    label: 'WR routes',
    emoji: '🏃',
    blurb: 'Your routes on each play',
  },
  {
    id: 'lb_keys',
    label: 'LB keys',
    emoji: '🛡️',
    blurb: 'Your read at linebacker',
  },
]

// Per-mode definition: which field is the answer, plus prompt / hint / explanation.
const MODE_CONFIG = {
  name_to_desc: {
    field: 'description',
    prompt: (p) => `What does "${p.name}" do?`,
    hint: (p) => `Formation: ${p.formation}`,
    explanation: (p) => p.key_read,
  },
  desc_to_name: {
    field: 'name',
    prompt: (p) => `WR routes: ${p.wr_route} — which play is it?`,
    hint: (p) => `Formation: ${p.formation}`,
    explanation: (p) => p.key_read,
  },
  formation: {
    field: 'formation',
    prompt: (p) => `"${p.name}" — what formation?`,
    hint: (p) =>
      p.tags?.length ? `Tags: ${p.tags.join(', ')}` : 'Think family: GOLD / RED / TITE',
    explanation: (p) => p.description,
  },
  wr_routes: {
    field: 'wr_route',
    prompt: (p) => `On "${p.name}", what are the WR routes?`,
    hint: (p) => `Formation: ${p.formation}`,
    explanation: (p) => p.key_read,
  },
  lb_keys: {
    field: 'lb_key',
    prompt: (p) => `As a linebacker on "${p.name}", what's your key?`,
    hint: (p) =>
      p.tags?.length ? `Tags: ${p.tags.join(', ')}` : `Formation: ${p.formation}`,
    explanation: (p) => `Your read: ${p.lb_key}`,
  },
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const norm = (v) => String(v ?? '').trim().toLowerCase()

// Pull up to `n` distinct distractor values for `field` from the full play set,
// skipping blanks and anything equal to the correct answer.
function sampleDistractors(allPlays, field, correctValue, n) {
  const seen = new Set([norm(correctValue)])
  const out = []
  for (const p of shuffle(allPlays)) {
    const v = p[field]
    if (!v) continue
    const key = norm(v)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(v)
    if (out.length >= n) break
  }
  return out
}

function buildQuestion(play, mode, allPlays) {
  const cfg = MODE_CONFIG[mode]
  const correct = play[cfg.field]
  const distractors = sampleDistractors(allPlays, cfg.field, correct, 3)
  const options = shuffle([correct, ...distractors])

  return {
    id: `${play.id}-${mode}`,
    mode,
    play,
    prompt: cfg.prompt(play),
    hint: cfg.hint(play),
    options,
    correct,
    explanation: cfg.explanation(play) || '',
  }
}

// True when a play has everything a given mode needs to make a fair question.
function playablInMode(play, mode) {
  const cfg = MODE_CONFIG[mode]
  if (!play[cfg.field] || !norm(play[cfg.field])) return false
  if (mode === 'desc_to_name' && !norm(play.wr_route)) return false
  return true
}

/**
 * Build a quiz.
 * @param plays      plays in the selected formation filter (question pool)
 * @param allPlays   every play (used to source varied distractors)
 * @param mode       one of QUIZ_MODES ids
 * @param count      number of questions, or 'all'
 */
export function generateQuiz(plays, allPlays, mode, count) {
  const pool = plays.filter((p) => playablInMode(p, mode))
  const picked = shuffle(pool)
  const limited = count === 'all' ? picked : picked.slice(0, Number(count))
  return limited.map((p) => buildQuestion(p, mode, allPlays))
}

export function gradeEmoji(pct) {
  if (pct >= 0.9) return '🏆'
  if (pct >= 0.75) return '⭐'
  if (pct >= 0.6) return '📈'
  return '💪'
}
