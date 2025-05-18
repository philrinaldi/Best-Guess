import { useState, useEffect } from 'react'
import { words } from './words'

const DAY_MS = 24 * 60 * 60 * 1000
const START_DATE = new Date('2024-01-01')

function distance(a, b) {
  const dp = Array(a.length + 1)
    .fill(0)
    .map(() => Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
    }
  }
  return dp[a.length][b.length]
}

function getTodayIndex() {
  const now = Date.now()
  return Math.floor((now - START_DATE.getTime()) / DAY_MS)
}

function prepareGame() {
  const index = getTodayIndex()
  const secret = words[index % words.length]
  const withScore = words.map((w) => ({ word: w, score: distance(w, secret) }))
  const sorted = [...withScore].sort((a, b) => a.score - b.score)
  const ranks = new Map(sorted.map((w, i) => [w.word, i + 1]))
  return { secret, ranks, sorted }
}

export default function App() {
  const [state, setState] = useState(() => {
    const key = 'game-' + getTodayIndex()
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : { guesses: [], status: 'playing', hints: 0 }
  })
  const { secret, ranks, sorted } = prepareGame()
  const gameKey = 'game-' + getTodayIndex()

  useEffect(() => {
    localStorage.setItem(gameKey, JSON.stringify(state))
  }, [state, gameKey])

  const [input, setInput] = useState('')

  const onGuess = (e) => {
    e.preventDefault()
    if (!input.trim() || state.status !== 'playing') return
    const word = input.trim().toLowerCase()
    if (!ranks.has(word)) {
      alert('Word not recognized. Please try again.')
      return
    }
    const rank = ranks.get(word)
    const newGuesses = [...state.guesses, { word, rank }]
    const newStatus = word === secret ? 'won' : state.status
    setState({ ...state, guesses: newGuesses, status: newStatus })
    setInput('')
  }

  const showHint = () => {
    if (state.hints < sorted.length - 1) {
      setState({ ...state, hints: state.hints + 1 })
    }
  }

  const giveUp = () => {
    setState({ ...state, status: 'gaveUp' })
  }

  const hintWords = sorted.slice(1, state.hints + 1).map((h) => h.word)

  const summaryText =
    state.status === 'won'
      ? `I solved today's Best Guess in ${state.guesses.length} guesses!`
      : `I gave up on today's Best Guess. The word was "${secret}".`

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Best Guess</h1>
      {state.status === 'playing' && (
        <form onSubmit={onGuess} className="flex gap-2 mb-4">
          <input
            className="border rounded p-2 flex-1"
            placeholder="Enter your guess"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">
            Guess
          </button>
        </form>
      )}

      <ul className="mb-4 space-y-1">
        {state.guesses.map((g, i) => (
          <li key={i} className="flex justify-between bg-white p-2 rounded shadow">
            <span>{g.word}</span>
            <span>#{g.rank}</span>
          </li>
        ))}
      </ul>

      {hintWords.length > 0 && (
        <div className="mb-4">
          <h2 className="font-semibold">Hints</h2>
          <ul className="list-disc list-inside">
            {hintWords.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      {state.status === 'playing' && (
        <div className="flex gap-2">
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={showHint}>
            Get Hint
          </button>
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={giveUp}>
            Give Up
          </button>
        </div>
      )}

      {state.status !== 'playing' && (
        <div className="mt-4 bg-yellow-100 p-4 rounded">
          <p className="mb-2">Secret word: {secret}</p>
          <p>{summaryText}</p>
        </div>
      )}
    </div>
  )
}
