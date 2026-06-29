import { familyClasses } from '../lib/formations'
import Collapsible from './Collapsible'
import FlagPlay from './FlagPlay'

// One play, shown as a digital playbook page. The diagram and description stay
// open; the rest collapse so the player can focus on one thing at a time.
const COLLAPSIBLE_SECTIONS = [
  { key: 'wr_route', icon: '🏃', title: 'WR routes' },
  { key: 'lb_key', icon: '🛡️', title: 'Linebacker key' },
  { key: 'key_read', icon: '👀', title: 'Key read' },
  { key: 'situations', icon: '📍', title: 'When to use it' },
  { key: 'pre_snap', icon: '🔎', title: 'Watch pre-snap' },
  { key: 'mistakes', icon: '⚠️', title: 'Common mistakes' },
  { key: 'coach_notes', icon: '📝', title: "Coach's notes" },
]

function SectionHeader({ icon, title }) {
  return (
    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold">
      <span aria-hidden>{icon}</span>
      {title}
    </span>
  )
}

export default function PlayDetailScreen({ play, onBack, onAskCoach }) {
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
          {/* Verified against the diagram by a coach, vs. AI-generated text. */}
          {play.verified ? (
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
              ✓ Verified
            </span>
          ) : (
            <span className="rounded-full border border-slate-600 bg-slate-500/10 px-2.5 py-1 text-xs font-medium text-slate-400">
              Unverified
            </span>
          )}
        </div>
      </header>

      {/* Diagram — the centerpiece, always visible */}
      {play.image_url && (
        <img
          src={play.image_url}
          alt={`${play.name} diagram`}
          className="mb-6 w-full rounded-2xl border border-slate-700 bg-white object-contain"
          loading="lazy"
        />
      )}

      {/* Description — always visible */}
      {play.description && String(play.description).trim() && (
        <section className="mb-4 rounded-xl border border-slate-700 bg-surface p-4">
          <h2 className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold">
            <span aria-hidden>🏈</span>
            What it does
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200">
            {play.description}
          </p>
        </section>
      )}

      {/* Collapsible coaching sections */}
      <div className="flex flex-col gap-3">
        {COLLAPSIBLE_SECTIONS.map(({ key, icon, title }) => {
          const value = play[key]
          if (!value || !String(value).trim()) return null
          return (
            <Collapsible
              key={key}
              header={<SectionHeader icon={icon} title={title} />}
            >
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200">
                {value}
              </p>
            </Collapsible>
          )
        })}
      </div>

      {/* Tags — always visible */}
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

      {/* Jump straight into the bot with this play pre-loaded as context. */}
      {onAskCoach && (
        <button
          onClick={() => onAskCoach(play)}
          className="mt-8 w-full rounded-xl bg-gold py-4 text-base font-bold text-navy shadow-lg transition active:scale-[0.99]"
        >
          💬 Ask the Coach about this play
        </button>
      )}

      {/* Low-key feedback: flag the play for coach review. */}
      <FlagPlay playName={play.name} />
    </div>
  )
}
