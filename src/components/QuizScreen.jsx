import { useMemo, useState } from 'react'
import { familyClasses } from '../lib/formations'

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuizScreen({ questions, onComplete, onQuit }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [missed, setMissed] = useState([])

  const q = questions[index]
  const total = questions.length
  const answered = selected !== null
  const isLast = index === total - 1
  const progress = useMemo(
    () => Math.round(((index + (answered ? 1 : 0)) / total) * 100),
    [index, answered, total],
  )

  function choose(option) {
    if (answered) return
    setSelected(option)
    if (option === q.correct) {
      setScore((s) => s + 1)
    } else {
      setMissed((m) => [...m, { play: q.play, picked: option }])
    }
  }

  function next() {
    if (isLast) {
      onComplete({ score, total, missed })
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
  }

  function buttonClasses(option) {
    const base =
      'w-full rounded-xl border p-3.5 text-left text-base transition flex items-start gap-3'
    if (!answered) {
      return `${base} border-slate-700 bg-surface hover:border-slate-500 active:scale-[0.99]`
    }
    if (option === q.correct) {
      return `${base} border-emerald-500 bg-emerald-500/20 text-emerald-100`
    }
    if (option === selected) {
      return `${base} border-red-500 bg-red-500/20 text-red-100`
    }
    return `${base} border-slate-800 bg-surface/40 text-slate-500 opacity-60`
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-8 pt-6">
      {/* Top bar: progress + score */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <button
            onClick={onQuit}
            className="text-slate-400 hover:text-slate-200"
            aria-label="Quit quiz"
          >
            ← Quit
          </button>
          <span className="font-medium text-slate-300">
            {index + 1} of {total}
          </span>
          <span className="font-semibold text-gold">Score: {score}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gold transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Play diagram if present */}
      {q.play.image_url && (
        <img
          src={q.play.image_url}
          alt={`${q.play.name} diagram`}
          className="mb-4 w-full rounded-xl border border-slate-700 bg-white object-contain"
          loading="lazy"
        />
      )}

      {/* Question card */}
      <div className="mb-4 rounded-2xl border border-slate-700 bg-surface p-4">
        <span
          className={[
            'mb-3 inline-block rounded-full border px-2.5 py-1 text-xs font-semibold',
            familyClasses(q.play.formation),
          ].join(' ')}
        >
          {q.play.formation}
        </span>
        <h2 className="text-xl font-bold leading-snug">{q.prompt}</h2>
        {q.hint && <p className="mt-2 text-sm text-slate-400">{q.hint}</p>}
      </div>

      {/* Answers */}
      <div className="flex flex-col gap-2.5">
        {q.options.map((option, i) => (
          <button
            key={i}
            onClick={() => choose(option)}
            disabled={answered}
            className={buttonClasses(option)}
          >
            <span className="mt-0.5 font-bold text-slate-400">{LETTERS[i]}</span>
            <span className="flex-1">{option}</span>
            {answered && option === q.correct && <span aria-hidden>✅</span>}
            {answered && option === selected && option !== q.correct && (
              <span aria-hidden>❌</span>
            )}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {answered && q.explanation && (
        <div className="mt-4 animate-[fadeIn_0.2s_ease-out] rounded-xl border border-gold/40 bg-gold/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">
            {selected === q.correct ? 'Nice — key concept' : 'Key concept'}
          </p>
          <p className="mt-1 text-sm text-slate-200">{q.explanation}</p>
        </div>
      )}

      <div className="mt-auto pt-5">
        {answered && (
          <button
            onClick={next}
            className="w-full rounded-xl bg-gold py-4 text-lg font-bold text-navy shadow-lg transition active:scale-[0.99]"
          >
            {isLast ? 'See results' : 'Next'}
          </button>
        )}
      </div>
    </div>
  )
}
