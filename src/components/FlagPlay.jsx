import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Lightweight "this looks wrong" feedback capture. Logs a row in play_flags
// for coach review. Not a big form — one question, one submit.
export default function FlagPlay({ playName }) {
  const [phase, setPhase] = useState('idle') // idle | form | submitting | done | error
  const [text, setText] = useState('')

  async function submit(e) {
    e.preventDefault()
    const question = text.trim()
    if (!question) return

    setPhase('submitting')
    const { error } = await supabase.from('play_flags').insert({
      play_name: playName,
      raised_by: 'Joshua',
      question,
      status: 'open',
    })
    if (error) {
      console.error('Flag submit failed:', error)
      setPhase('error')
    } else {
      setPhase('done')
    }
  }

  if (phase === 'done') {
    return (
      <p className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-200">
        Thanks — flagged for coach review. Keep studying! 🏈
      </p>
    )
  }

  if (phase === 'idle') {
    return (
      <button
        onClick={() => setPhase('form')}
        className="mt-3 w-full rounded-xl border border-slate-700 bg-surface/60 py-3 text-sm font-medium text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
      >
        🚩 This looks wrong / I have a question
      </button>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="mt-3 rounded-xl border border-slate-700 bg-surface p-4"
    >
      <label className="mb-2 block text-sm font-medium text-slate-200">
        What looks off about this play?
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        autoFocus
        placeholder="e.g. WR2 looks like the deep route, not WR1…"
        className="w-full rounded-lg border border-slate-700 bg-navy/40 p-2.5 text-sm placeholder:text-slate-500 focus:border-gold focus:outline-none"
      />
      {phase === 'error' && (
        <p className="mt-2 text-xs text-red-300">
          Couldn&apos;t send that — try again.
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
          {phase === 'submitting' ? 'Sending…' : 'Submit'}
        </button>
      </div>
    </form>
  )
}
