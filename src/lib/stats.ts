// Test-level statistics: central tendency, spread, KR-20 reliability, DepEd mastery level, score distribution.
import type { Result } from '../types'
import { isCorrect } from './grade'

export const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

export function median(xs: number[]) {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

// Population SD: describes this class, not an estimate of a wider population.
export const stdev = (xs: number[]) => Math.sqrt(mean(xs.map((x) => (x - mean(xs)) ** 2)))

// Kuder-Richardson 20 internal-consistency reliability for right/wrong items.
export function kr20(results: Result[], key: number[]) {
  const k = key.length
  const totals = results.map((r) => r.score)
  const variance = stdev(totals) ** 2
  if (k < 2 || results.length < 2 || variance === 0) return null
  const pq = key.reduce((s, kk, i) => {
    const p = results.filter((r) => isCorrect(r.answers[i] ?? 0, kk)).length / results.length
    return s + p * (1 - p)
  }, 0)
  return (k / (k - 1)) * (1 - pq / variance)
}

export function reliabilityLabel(r: number | null) {
  if (r === null) return 'Not enough data'
  if (r >= 0.9) return 'Excellent'
  if (r >= 0.8) return 'Good'
  if (r >= 0.7) return 'Acceptable'
  if (r >= 0.6) return 'Questionable'
  return 'Poor'
}

// DepEd mastery levels by mean percentage score (DepEd Memo No. 160, s. 2012)
export function masteryLevel(mps: number) {
  if (mps >= 96) return 'Mastered'
  if (mps >= 86) return 'Closely approximating mastery'
  if (mps >= 66) return 'Moving towards mastery'
  if (mps >= 35) return 'Average mastery'
  if (mps >= 15) return 'Low mastery'
  if (mps >= 5) return 'Very low mastery'
  return 'Absolutely no mastery'
}

// Counts of papers per 10-point percentage band: [0-9, 10-19, ..., 90-100]
export function distribution(results: Result[], items: number) {
  const bins = Array(10).fill(0)
  for (const r of results) bins[Math.min(9, Math.floor(((r.score / items) * 100) / 10))]++
  return bins
}

export function summarize(results: Result[], key: number[]) {
  const items = key.length
  const scores = results.map((r) => r.score)
  const avg = mean(scores)
  const mps = items ? (avg / items) * 100 : 0
  return {
    n: results.length,
    items,
    mean: avg,
    median: median(scores),
    sd: stdev(scores),
    high: scores.length ? Math.max(...scores) : 0,
    low: scores.length ? Math.min(...scores) : 0,
    mps,
    mastery: masteryLevel(mps),
    passed: scores.filter((s) => s / items >= 0.75).length, // DepEd 75% passing mark
    kr20: kr20(results, key),
  }
}
