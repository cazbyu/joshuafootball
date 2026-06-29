import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const SOURCE_LABEL = {
  teaching: '📖 Teaching',
  quiz: '🏈 Quiz',
  ai_coach: '🤖 Development Director',
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Joshua's running list of real questions to bring to his human coach.
export default function CoachNotesScreen({ onBack }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('coach_notes')
        .select('*')
        .order('created_at', { ascending: false })
      if (!active) return
      if (error) setError(error)
      else setNotes(data ?? [])
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [])

  async function toggleResolved(note) {
    const next = !note.resolved
    // Optimistic update.
    setNotes((ns) =>
      ns.map((n) => (n.id === note.id ? { ...n, resolved: next } : n)),
    )
    const { error } = await supabase
      .from('coach_notes')
      .update({ resolved: next })
      .eq('id', note.id)
    if (error) {
      console.error('Update note failed:', error)
      // Revert on failure.
      setNotes((ns) =>
        ns.map((n) => (n.id === note.id ? { ...n, resolved: !next } : n)),
      )
    }
  }

  const open = notes.filter((n) => !n.resolved)
  const done = notes.filter((n) => n.resolved)

  return (
    <div className="mx-auto max-w-md px-4 pb-12 pt-6">
      <header className="mb-5">
        <button
          onClick={onBack}
          className="mb-3 text-sm text-slate-400 hover:text-slate-200"
        >
          ← Home
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight">
          My Coach Notes <span aria-hidden>📋</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Questions to bring to your coach next practice.
        </p>
      </header>

      {loading && <p className="text-sm text-slate-400">Loading notes…</p>}
      {error && (
        <p className="text-sm text-red-300">Couldn&apos;t load your notes.</p>
      )}

      {!loading && notes.length === 0 && (
        <div className="mt-10 rounded-xl border border-slate-800 bg-surface/50 p-6 text-center">
          <p className="text-4xl" aria-hidden>
            📝
          </p>
          <p className="mt-3 text-sm text-slate-300">
            No notes yet. When something isn&apos;t clear, tap{' '}
            <span className="font-semibold text-gold">
              &ldquo;Save a note to ask your Coach&rdquo;
            </span>{' '}
            and it&apos;ll show up here.
          </p>
        </div>
      )}

      {open.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            To ask ({open.length})
          </h2>
          <div className="flex flex-col gap-2">
            {open.map((n) => (
              <NoteCard key={n.id} note={n} onToggle={toggleResolved} />
            ))}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Done ({done.length})
          </h2>
          <div className="flex flex-col gap-2">
            {done.map((n) => (
              <NoteCard key={n.id} note={n} onToggle={toggleResolved} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function NoteCard({ note, onToggle }) {
  return (
    <div
      className={[
        'rounded-xl border p-3.5 transition',
        note.resolved
          ? 'border-slate-800 bg-surface/40 opacity-60'
          : 'border-slate-700 bg-surface',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(note)}
          aria-pressed={note.resolved}
          aria-label={note.resolved ? 'Mark as not answered' : 'Mark answered'}
          className={[
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs',
            note.resolved
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
              : 'border-slate-600 text-transparent hover:border-gold',
          ].join(' ')}
        >
          ✓
        </button>
        <div className="flex-1">
          <p
            className={[
              'text-sm leading-relaxed',
              note.resolved ? 'text-slate-400 line-through' : 'text-slate-100',
            ].join(' ')}
          >
            {note.note}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            {note.play_name && (
              <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-400">
                {note.play_name}
              </span>
            )}
            {note.source && SOURCE_LABEL[note.source] && (
              <span>{SOURCE_LABEL[note.source]}</span>
            )}
            <span>{formatDate(note.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
