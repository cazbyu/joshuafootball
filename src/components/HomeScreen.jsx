// Launcher screen: pick one of the three modes.
const MODES = [
  {
    id: 'quiz',
    emoji: '🏈',
    label: 'Quiz Mode',
    blurb: 'Test yourself on the playbook',
  },
  {
    id: 'teaching',
    emoji: '📖',
    label: 'Teaching Mode',
    blurb: 'Browse plays with full coaching detail',
  },
  {
    id: 'ask',
    emoji: '🤖',
    label: 'AI Coach',
    blurb: 'Ask the AI anything — confirm with your real coach',
  },
]

export default function HomeScreen({ plays, loading, error, onPick }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-12 pt-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Joshua&apos;s Playbook <span aria-hidden>🏈</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
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
        </div>
      )}

      <div className="flex flex-col gap-4">
        {MODES.map((m) => {
          // Quiz & Teaching need plays loaded; the coach works regardless.
          const needsPlays = m.id !== 'ask'
          const disabled = needsPlays && (loading || plays.length === 0)
          return (
            <button
              key={m.id}
              onClick={() => onPick(m.id)}
              disabled={disabled}
              className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-surface p-5 text-left shadow-lg transition hover:border-gold active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="text-4xl" aria-hidden>
                {m.emoji}
              </span>
              <span className="flex-1">
                <span className="block text-lg font-bold">{m.label}</span>
                <span className="block text-sm text-slate-400">{m.blurb}</span>
              </span>
              <span className="text-2xl text-slate-500" aria-hidden>
                ›
              </span>
            </button>
          )
        })}
      </div>

      {/* Joshua's running list of questions for his human coach. */}
      <button
        onClick={() => onPick('coachNotes')}
        className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-surface/50 py-3 text-sm font-medium text-slate-300 transition hover:border-gold hover:text-slate-100"
      >
        📋 My Coach Notes
      </button>
    </div>
  )
}
