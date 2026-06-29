import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Save a real question for Joshua's human coach. Reused on play pages, after
// wrong quiz answers, and inside the Development Director chat. One box, submit.
// `source` is 'teaching' | 'quiz' | 'ai_coach'. `playName` is stored when known.
// `initialText` pre-fills the box with helpful context (e.g. the last question).
export default function SaveCoachNote({
  playName = null,
  source,
  label = '📝 Save a note to ask your Coach',
  initialText = null,
  buttonClassName = 'mt-3 w-full rounded-xl border border-slate-700 bg-surface/60 py-3 text-sm font-medium text-slate-300 transition hover:border-gold hover:text-slate-100',
  disabled = false,
}) {
  const [phase, setPhase] = useState('idle') // idle | form | submitting | done | error
  const [text, setText] = useState('')

  function openForm() {
    setText(initialText ?? (playName ? `${playName}: ` : ''))
    setPhase('form')
  }

  async function submit(e) {
    e.preventDefault()
    const note = text.trim()
    if (!note) return

    setPhase('submitting')
    const { error } = await supabase.from('coach_notes').insert({
      player_name: 'Joshua',
      play_name: playName || null,
      note,
      source,
      resolved: false,
    })
    if (error) {
      console.error('Save coach note failed:', error)
      setPhase('error')
    } else {
      setPhase('done')
    }
  }

  if (phase === 'done') {
    return (
      <p className="mt-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-center text-sm text-gold">
        Saved! You can ask your coach next practice. 💪
      </p>
    )
  }

  if (phase === 'idle') {
    return (
      <button onClick={openForm} disabled={disabled} className={buttonClassName}>
        {label}
      </button>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="mt-3 rounded-xl border border-slate-700 bg-surface p-4"
    >
      <label className="mb-2 block text-sm font-medium text-slate-200">
        What do you want to ask your coach?
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        autoFocus
        placeholder="Type your question for practice day…"
        className="w-full rounded-lg border border-slate-700 bg-navy/40 p-2.5 text-sm placeholder:text-slate-500 focus:border-gold focus:outline-none"
      />
      {phase === 'error' && (
        <p className="mt-2 text-xs text-red-300">
          Couldn&apos;t save that — try again.
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setPhase('idle')}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={phase === 'submitting' || !text.trim()}
          className="flex-1 rounded-lg bg-gold py-2 text-sm font-bold text-navy transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {phase === 'submitting' ? 'Saving…' : 'Save note'}
        </button>
      </div>
    </form>
  )
}
