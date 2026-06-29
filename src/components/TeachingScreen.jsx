import { useMemo, useState } from 'react'
import { FORMATIONS, formationFamily, familyClasses } from '../lib/formations'
import Formations101 from './Formations101'
import Collapsible from './Collapsible'

// Browse the whole playbook. Search by name/concept/tags, filter by formation,
// grouped and color-coded by family (GOLD = blue, RED = orange, TITE = green).
export default function TeachingScreen({ plays, loading, onOpen, onBack }) {
  const [query, setQuery] = useState('')
  const [formation, setFormation] = useState('ALL')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return plays
      .filter((p) => formation === 'ALL' || p.formation === formation)
      .filter((p) => {
        if (!q) return true
        const haystack = [
          p.name,
          p.formation,
          p.concept,
          p.description,
          ...(p.tags ?? []),
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
      .sort((a, b) => (a.formation + a.name).localeCompare(b.formation + b.name))
  }, [plays, query, formation])

  // Group filtered plays by formation family for section headers.
  const groups = useMemo(() => {
    const byFamily = {}
    for (const p of filtered) {
      const fam = formationFamily(p.formation)
      ;(byFamily[fam] ??= []).push(p)
    }
    const order = ['GOLD', 'RED', 'TITE', 'OTHER']
    return order
      .filter((fam) => byFamily[fam]?.length)
      .map((fam) => ({ family: fam, plays: byFamily[fam] }))
  }, [filtered])

  return (
    <div className="mx-auto max-w-md px-4 pb-12 pt-6">
      <header className="mb-4">
        <button
          onClick={onBack}
          className="mb-3 text-sm text-slate-400 hover:text-slate-200"
        >
          ← Home
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Teaching Mode <span aria-hidden>📖</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Tap a play to open its full coaching page.
        </p>
      </header>

      {/* Formations 101 primer (collapsible, above the play list) */}
      <Formations101 />

      {/* Search + formation filter */}
      <div className="mb-4 flex flex-col gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search plays, concepts, tags…"
          className="w-full rounded-lg border border-slate-700 bg-surface p-2.5 text-sm placeholder:text-slate-500 focus:border-gold focus:outline-none"
        />
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
      </div>

      {loading && <p className="text-sm text-slate-400">Loading plays…</p>}

      {!loading && filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-slate-400">
          No plays match “{query}”.
        </p>
      )}

      {/* Formation groups — each header collapses/expands its plays. */}
      <div className="flex flex-col gap-3">
        {groups.map(({ family, plays: famPlays }) => (
          <Collapsible
            key={family}
            defaultOpen
            className={familyClasses(family)}
            header={
              <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <span
                  className={[
                    'h-2.5 w-2.5 rounded-full border',
                    familyClasses(family),
                  ].join(' ')}
                />
                {family} · {famPlays.length}
              </span>
            }
          >
            <div className="flex flex-col gap-2">
              {famPlays.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onOpen(p)}
                  className="flex items-center gap-3 rounded-xl border border-slate-700 bg-surface p-3.5 text-left transition hover:border-gold active:scale-[0.99]"
                >
                  <span className="flex-1">
                    <span className="block font-semibold text-slate-100">
                      {p.name}
                    </span>
                    {p.concept && (
                      <span className="block text-xs text-slate-400">
                        {p.concept}
                      </span>
                    )}
                  </span>
                  <span
                    className={[
                      'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                      familyClasses(p.formation),
                    ].join(' ')}
                  >
                    {p.formation}
                  </span>
                  <span className="text-xl text-slate-500" aria-hidden>
                    ›
                  </span>
                </button>
              ))}
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}
