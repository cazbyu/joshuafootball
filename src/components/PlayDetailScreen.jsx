import { familyClasses } from '../lib/formations'

// One play, shown as a digital playbook page. The diagram is the centerpiece;
// each coaching field gets its own clearly-headed section (skipped if empty).
const SECTIONS = [
  { key: 'description', icon: '🏈', title: 'What it does' },
  { key: 'wr_route', icon: '🏃', title: 'WR routes' },
  { key: 'lb_key', icon: '🛡️', title: 'Linebacker key' },
  { key: 'key_read', icon: '👀', title: 'Key read' },
  { key: 'situations', icon: '📍', title: 'When to use it' },
  { key: 'pre_snap', icon: '🔎', title: 'Watch pre-snap' },
  { key: 'mistakes', icon: '⚠️', title: 'Common mistakes' },
  { key: 'coach_notes', icon: '📝', title: "Coach's notes" },
]

export default function PlayDetailScreen({ play, onBack }) {
  if (!play) return null

  return (
    <div className="mx-auto max-w-md px-4 pb-12 pt-6">
      <button
        onClick={onBack}
        className="mb-4 text-sm text-slate-400 hover:text-slate-200"
      >
        ← Back to playbook
      </button>

      {/* Header */}
      <header className="mb-4">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
          {play.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={[
              'rounded-full border px-2.5 py-1 text-xs font-semibold',
              familyClasses(play.formation),
            ].join(' ')}
          >
            {play.formation}
          </span>
          {play.concept && (
            <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold">
              {play.concept}
            </span>
          )}
        </div>
      </header>

      {/* Diagram — the centerpiece */}
      {play.image_url && (
        <img
          src={play.image_url}
          alt={`${play.name} diagram`}
          className="mb-6 w-full rounded-2xl border border-slate-700 bg-white object-contain"
          loading="lazy"
        />
      )}

      {/* Coaching sections */}
      <div className="flex flex-col gap-4">
        {SECTIONS.map(({ key, icon, title }) => {
          const value = play[key]
          if (!value || !String(value).trim()) return null
          return (
            <section
              key={key}
              className="rounded-xl border border-slate-700 bg-surface p-4"
            >
              <h2 className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold">
                <span aria-hidden>{icon}</span>
                {title}
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200">
                {value}
              </p>
            </section>
          )
        })}
      </div>

      {/* Tags */}
      {play.tags?.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Tags
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {play.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-700 bg-surface px-2.5 py-1 text-xs text-slate-300"
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
