// Frequency of errors per item, ranked most-missed first; flags least-learned items (below 75% correct).
import type { Result } from '../types'
import { isCorrect, maskLabel } from './grade'

export interface ItemErrors {
  item: number
  wrong: number // incorrect + blank + multiple
  blank: number
  pctWrong: number
  commonWrong: string // most chosen wrong answer, '-' when none
  leastLearned: boolean
  rank: number
}

export function errorFrequency(results: Result[], key: number[]): ItemErrors[] {
  const n = results.length
  const rows = key.map((k, i) => {
    const wrongAnswers = results.map((r) => r.answers[i] ?? 0).filter((a) => !isCorrect(a, k))
    const tally = new Map<number, number>()
    for (const a of wrongAnswers) if (a) tally.set(a, (tally.get(a) ?? 0) + 1)
    const top = [...tally].sort((a, b) => b[1] - a[1])[0]
    const pctWrong = n ? (wrongAnswers.length / n) * 100 : 0
    return {
      item: i + 1,
      wrong: wrongAnswers.length,
      blank: wrongAnswers.filter((a) => a === 0).length,
      pctWrong,
      commonWrong: top ? maskLabel(top[0]) : '-',
      leastLearned: n > 0 && 100 - pctWrong < 75,
      rank: 0,
    }
  })
  // Competition ranking: ties share a rank
  const sorted = [...rows].sort((a, b) => b.wrong - a.wrong || a.item - b.item)
  sorted.forEach((r, i) => (r.rank = i && r.wrong === sorted[i - 1].wrong ? sorted[i - 1].rank : i + 1))
  return sorted
}
