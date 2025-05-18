import { useEffect, useState } from 'react'
import * as useModel from '@tensorflow-models/universal-sentence-encoder'
import '@tensorflow/tfjs'

export default function SemanticGame() {
  const TARGET = 'apple'
  const [model, setModel] = useState(null)
  const [targetEmbedding, setTargetEmbedding] = useState(null)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    useModel.load().then((m) => {
      if (cancelled) return
      setModel(m)
      m.embed([TARGET]).then((emb) => {
        if (!cancelled) setTargetEmbedding(emb)
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

  const cosineSimilarity = (a, b) => {
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0)
    return dot / (normA * normB)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!model || !targetEmbedding) return
    if (!input.trim()) return
    const guess = input.trim()
    if (guess.toLowerCase() === TARGET.toLowerCase()) {
      setMessage('You found it!')
      setScore(1)
      return
    }
    const embeddings = await model.embed([guess])
    const guessEmb = await embeddings.array()
    const targetEmb = await targetEmbedding.array()
    const sim = cosineSimilarity(guessEmb[0], targetEmb[0])
    setScore(sim)
    setMessage('')
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <form onSubmit={onSubmit} className="flex gap-2">
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
      {score !== null && (
        <div className="text-center">Similarity: {score.toFixed(3)}</div>
      )}
      {message && <div className="text-green-600 text-center font-bold">{message}</div>}
    </div>
  )
}
