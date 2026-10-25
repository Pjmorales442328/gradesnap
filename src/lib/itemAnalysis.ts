// Classical item analysis: difficulty index, upper/lower 27% discrimination, choice distribution.
import type { Result } from '../types'
import { isCorrect } from './grade'

export interface ItemStat {
  item: number
  difficulty: number // proportion correct
  discrimination: number // p(upper) - p(lower)
  counts: number[] // per choice, then blank, then multi
  remark: 'Retain' | 'Revise' | 'Reject'
}

export function difficultyLabel(p: number) {
  if (p <= 0.2) return 'Very difficult'
  if (p <= 0.4) return 'Difficult'
  if (p <= 0.6) return 'Average'
  if (p <= 0.8) return 'Easy'
  return 'Very easy'
}

export function itemAnalysis(results: Result[], key: number[], choices: number): ItemStat[] {
  const sorted = [...results].sort((a, b) => b.score - a.score)
  const g = Math.max(1, Math.round(sorted.length * 0.27))
  const upper = sorted.slice(0, g)
  const lower = sorted.slice(-g)
  const p = (group: Result[], i: number) =>
    group.length ? group.filter((r) => isCorrect(r.answers[i] ?? 0, key[i])).length / group.length : 0

  return key.map((k, i) => {
    const counts = Array(choices + 2).fill(0)
    for (const r of results) {
      const a = r.answers[i] ?? 0
      if (a === 0) counts[choices]++
      else if (a & (a - 1)) counts[choices + 1]++
      else counts[Math.log2(a)]++
    }
    const difficulty = p(results, i)
    const discrimination = p(upper, i) - p(lower, i)
    const goodP = difficulty > 0.2 && difficulty <= 0.8
    const remark = discrimination >= 0.3 && goodP ? 'Retain' : discrimination >= 0.2 || !k ? 'Revise' : 'Reject'
    return { item: i + 1, difficulty, discrimination, counts, remark }
  })
}
