import { useMemo, useState } from 'react'
import { QUIZ_MODES } from '../lib/quiz'
import { FORMATIONS, familyClasses } from '../lib/formations'

const COUNTS = [5, 10, 'all']

export default function QuizSetupScreen({ plays, loading, error, onStart, onBack }) {
  const [mode, setMode] = useState('name_to_desc')
  const [formation, setFormation] = useState('ALL')
  const [count, setCount] = useState(5)

  const filteredCount = useMemo(() => {
    if (formation === 'ALL') return plays.length
    return plays.filter((p) => p.formation === formation).length
  }, [plays, formation])

  const sortedNames = useMemo(
    () =>
      [...plays].sort((a, b) =>
        (a.formation + a.name).localeCompare(b.formation + b.name),
      ),
    [plays],
  )

  function handleStart() {
    onStart({ mode, formation, count })
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-12 pt-6">
      <header className="mb-6">
        <button
          onClick={onBack}
          className="mb-3 text-sm text-slate-400 hover:text-slate-200"
        >
          ← Home
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Quiz Mode <span aria-hidden>🏈</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {loading ? (
            'Loading plays…'
          ) : error ? (
            <span className="text-red-400">Couldn&apos;t load plays</span>
          ) : (
            <>
              <span className="font-semibold text-gold">{plays.length}</span> plays
              loaded · live from Supabase
            </>
          )}
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-semibold">Can&apos;t reach the playbook.</p>
          <p className="mt-1 text-red-300/90">{error.message}</p>
          <p className="mt-2 text-xs text-red-300/70">
            If this says the schema is invalid, the{' '}
            <code>p0015_football_playbook</code> schema needs to be added to the
            Supabase API&apos;s exposed schemas.
          </p>
        </div>
      )}

      {/* Quiz modes */}
      <section className="mb-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Quiz mode
        </h2>
        <div className="grid grid-cols-1 gap-2">
          {QUIZ_MODES.map((m) => {
            const active = m.id === mode
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={[
                  'flex items-center gap-3 rounded-xl border p-3 text-left transition',
                  active
                    ? 'border-gold bg-gold/15 ring-1 ring-gold'
                    : 'border-slate-700 bg-surface hover:border-slate-500',
                ].join(' ')}
              >
                <span className="text-2xl" aria-hidden>
                  {m.emoji}
                </span>
                <span>
                  <span className="block font-semibold">{m.label}</span>
                  <span className="block text-xs text-slate-400">{m.blurb}</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Filters */}
      <section className="mb-6 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Formation
          </span>
          <select
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-surface p-2.5 text-sm focus:border-gold focus:outline-none"
          >
            <option value="ALL">All formations</option>
            {FORMATIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <div className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Questions
          </span>
          <div className="flex gap-1.5">
            {COUNTS.map((c) => {
              const active = c === count
              return (
                <button
                  key={String(c)}
                  onClick={() => setCount(c)}
                  className={[
                    'flex-1 rounded-lg border p-2.5 text-sm font-semibold capitalize transition',
                    active
                      ? 'border-gold bg-gold/15 text-gold'
                      : 'border-slate-700 bg-surface text-slate-300 hover:border-slate-500',
                  ].join(' ')}
                >
                  {c === 'all' ? 'All' : c}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <button
        onClick={handleStart}
        disabled={loading || filteredCount === 0}
        className="w-full rounded-xl bg-gold py-4 text-lg font-bold text-navy shadow-lg transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Start Quiz
        <span className="ml-2 font-medium text-navy/70">
          ({formation === 'ALL' ? 'all' : formation} · {filteredCount} plays)
        </span>
      </button>

      {/* Tag cloud of play names, color-coded by formation family */}
      {!loading && plays.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            All plays
          </h2>
          <div className="flex max-h-64 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-slate-800 bg-surface/50 p-3">
            {sortedNames.map((p) => (
              <span
                key={p.id}
                title={`${p.formation} · ${p.concept ?? ''}`}
                className={[
                  'rounded-full border px-2.5 py-1 text-xs font-medium',
                  familyClasses(p.formation),
                ].join(' ')}
              >
                {p.name}
              </span>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-400">
            <Legend family="GOLD" label="GOLD" />
            <Legend family="RED" label="RED" />
            <Legend family="TITE" label="TITE" />
          </div>
        </section>
      )}
    </div>
  )
}

function Legend({ family, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={['h-2.5 w-2.5 rounded-full border', familyClasses(family)].join(
          ' ',
        )}
        style={{ aspectRatio: '1' }}
      />
      {label}
    </span>
  )
}
