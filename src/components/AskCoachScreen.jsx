import { useEffect, useRef, useState } from 'react'
import { askCoach } from '../lib/askCoach'

const STARTERS = [
  'When should I use a shallow cross?',
  "What's the difference between man and zone coverage?",
  'As a linebacker, what should I read first?',
  'Explain what a double move is',
]

export default function AskCoachScreen({ onBack }) {
  // messages: { role: 'user' | 'coach' | 'error', text: string }
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  // Keep the latest message in view.
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(question) {
    const q = question.trim()
    if (!q || loading) return

    setInput('')
    setMessages((m) => [...m, { role: 'user', text: q }])
    setLoading(true)

    try {
      const answer = await askCoach(q)
      setMessages((m) => [...m, { role: 'coach', text: answer }])
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'error', text: err.message || 'Something went wrong.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    send(input)
  }

  const empty = messages.length === 0

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-4 pt-6">
      <header className="mb-4">
        <button
          onClick={onBack}
          className="mb-3 text-sm text-slate-400 hover:text-slate-200"
        >
          ← Home
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Ask the Coach <span aria-hidden>💬</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Ask anything about football strategy or your playbook.
        </p>
      </header>

      {/* Conversation */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {empty && (
          <div className="rounded-xl border border-slate-800 bg-surface/50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Try asking
            </p>
            <div className="flex flex-col gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-slate-700 bg-surface px-3 py-2 text-left text-sm text-slate-200 transition hover:border-gold active:scale-[0.99]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} text={m.text} />
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-slate-700 bg-surface px-4 py-3">
              <span className="flex gap-1" aria-label="Coach is thinking">
                <Dot delay="0ms" />
                <Dot delay="150ms" />
                <Dot delay="300ms" />
              </span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the coach…"
          disabled={loading}
          className="flex-1 rounded-xl border border-slate-700 bg-surface p-3 text-sm placeholder:text-slate-500 focus:border-gold focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-gold px-5 font-bold text-navy transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  )
}

function Bubble({ role, text }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-gold px-4 py-2.5 text-sm font-medium text-navy">
          {text}
        </div>
      </div>
    )
  }

  if (role === 'error') {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
          {text}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-sm border border-slate-700 bg-surface px-4 py-2.5 text-sm leading-relaxed text-slate-100">
        {text}
      </div>
    </div>
  )
}

function Dot({ delay }) {
  return (
    <span
      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
      style={{ animationDelay: delay }}
    />
  )
}
