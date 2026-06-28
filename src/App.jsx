import { useState } from 'react'
import { usePlays } from './hooks/usePlays'
import { supabase } from './lib/supabase'
import { generateQuiz } from './lib/quiz'
import HomeScreen from './components/HomeScreen'
import QuizScreen from './components/QuizScreen'
import ResultsScreen from './components/ResultsScreen'

export default function App() {
  const { plays, loading, error } = usePlays()

  const [screen, setScreen] = useState('home') // 'home' | 'quiz' | 'results'
  const [questions, setQuestions] = useState([])
  const [config, setConfig] = useState(null) // { mode, formation, count }
  const [result, setResult] = useState(null)
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error

  function startQuiz({ mode, formation, count }) {
    const pool =
      formation === 'ALL'
        ? plays
        : plays.filter((p) => p.formation === formation)

    const qs = generateQuiz(pool, plays, mode, count)
    if (qs.length === 0) return

    setConfig({ mode, formation, count })
    setQuestions(qs)
    setResult(null)
    setSaveState('idle')
    setScreen('quiz')
  }

  async function completeQuiz(finalResult) {
    setResult(finalResult)
    setScreen('results')
    await saveScore(finalResult)
  }

  async function saveScore({ score, total }) {
    setSaveState('saving')
    const { error: insertError } = await supabase.from('quiz_scores').insert({
      player_name: 'Joshua',
      score,
      total,
      mode: config?.mode ?? null,
      formation: config?.formation ?? null,
    })
    setSaveState(insertError ? 'error' : 'saved')
    if (insertError) console.error('Score save failed:', insertError)
  }

  function goHome() {
    setScreen('home')
    setQuestions([])
    setResult(null)
  }

  if (screen === 'quiz') {
    return (
      <QuizScreen
        questions={questions}
        onComplete={completeQuiz}
        onQuit={goHome}
      />
    )
  }

  if (screen === 'results' && result) {
    return (
      <ResultsScreen result={result} saveState={saveState} onAgain={goHome} />
    )
  }

  return (
    <HomeScreen
      plays={plays}
      loading={loading}
      error={error}
      onStart={startQuiz}
    />
  )
}
