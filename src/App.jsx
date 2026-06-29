import { useState } from 'react'
import { usePlays } from './hooks/usePlays'
import { supabase } from './lib/supabase'
import { generateQuiz } from './lib/quiz'
import HomeScreen from './components/HomeScreen'
import QuizSetupScreen from './components/QuizSetupScreen'
import QuizScreen from './components/QuizScreen'
import ResultsScreen from './components/ResultsScreen'
import TeachingScreen from './components/TeachingScreen'
import PlayDetailScreen from './components/PlayDetailScreen'
import AskCoachScreen from './components/AskCoachScreen'

export default function App() {
  const { plays, loading, error } = usePlays()

  // 'home' | 'quizSetup' | 'quiz' | 'results' | 'teaching' | 'playDetail' | 'ask'
  const [screen, setScreen] = useState('home')
  const [questions, setQuestions] = useState([])
  const [config, setConfig] = useState(null) // { mode, formation, count }
  const [result, setResult] = useState(null)
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [selectedPlay, setSelectedPlay] = useState(null)

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
    setSelectedPlay(null)
  }

  function openPlay(play) {
    setSelectedPlay(play)
    setScreen('playDetail')
  }

  if (screen === 'quizSetup') {
    return (
      <QuizSetupScreen
        plays={plays}
        loading={loading}
        error={error}
        onStart={startQuiz}
        onBack={goHome}
      />
    )
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
    // "Quiz again" returns to setup so they can pick a new mode/formation.
    return (
      <ResultsScreen
        result={result}
        saveState={saveState}
        onAgain={() => setScreen('quizSetup')}
      />
    )
  }

  if (screen === 'teaching') {
    return (
      <TeachingScreen
        plays={plays}
        loading={loading}
        onOpen={openPlay}
        onBack={goHome}
      />
    )
  }

  if (screen === 'playDetail' && selectedPlay) {
    return (
      <PlayDetailScreen
        play={selectedPlay}
        onBack={() => setScreen('teaching')}
      />
    )
  }

  if (screen === 'ask') {
    return <AskCoachScreen onBack={goHome} />
  }

  return (
    <HomeScreen
      plays={plays}
      loading={loading}
      error={error}
      onPick={(mode) =>
        setScreen(mode === 'quiz' ? 'quizSetup' : mode)
      }
    />
  )
}
