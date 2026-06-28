import { gradeEmoji } from '../lib/quiz'
import { familyClasses } from '../lib/formations'

export default function ResultsScreen({ result, saveState, onAgain }) {
  const { score, total, missed } = result
  const pct = total > 0 ? score / total : 0
  const pctLabel = Math.round(pct * 100)

  return (
    <div className="mx-auto max-w-md px-4 pb-12 pt-10">
      <div className="rounded-2xl border border-slate-700 bg-surface p-6 text-center">
        <div className="text-6xl" aria-hidden>
          {gradeEmoji(pct)}
        </div>
        <h1 className="mt-3 text-4xl font-extrabold text-gold">
          {score}/{total}
        </h1>
        <p className="mt-1 text-lg text-slate-300">{pctLabel}%</p>
        <p className="mt-2 text-sm text-slate-400">
          {pct >= 0.9
            ? 'Locked in. You know this playbook.'
            : pct >= 0.75
              ? 'Strong. A couple more reps.'
              : pct >= 0.6
                ? 'Getting there — review the misses.'
                : 'Keep grinding. Study the misses below.'}
        </p>
      </div>

      <p className="mt-3 text-center text-xs text-slate-500">
        {saveState === 'saving' && 'Saving score…'}
        {saveState === 'saved' && 'Score saved ✓'}
        {saveState === 'error' && 'Score not saved (offline?)'}
      </p>

      <button
        onClick={onAgain}
        className="mt-5 w-full rounded-xl bg-gold py-4 text-lg font-bold text-navy shadow-lg transition active:scale-[0.99]"
      >
        Quiz again
      </button>

      {missed.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Missed plays ({missed.length})
          </h2>
          <div className="flex flex-col gap-3">
            {missed.map(({ play }, i) => (
              <div
                key={`${play.id}-${i}`}
                className="rounded-xl border border-slate-700 bg-surface p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold">{play.name}</h3>
                  <span
                    className={[
                      'shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold',
                      familyClasses(play.formation),
                    ].join(' ')}
                  >
                    {play.formation}
                  </span>
                </div>
                {play.key_read && (
                  <p className="mt-2 text-sm text-slate-300">
                    <span className="font-semibold text-gold">Key read: </span>
                    {play.key_read}
                  </p>
                )}
                {play.wr_route && (
                  <p className="mt-1 text-xs text-slate-400">
                    WR: {play.wr_route}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {missed.length === 0 && (
        <p className="mt-8 text-center text-sm text-emerald-300">
          Perfect run — no missed plays. 🏈
        </p>
      )}
    </div>
  )
}
