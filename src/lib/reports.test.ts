// Checks report maths against hand-computed values.
import { expect, test } from 'vitest'
import type { Result } from '../types'
import { distribution, kr20, masteryLevel, median, stdev, summarize } from './stats'
import { errorFrequency } from './errorFrequency'
import { competencyMastery, parseItems } from './competency'
import { itemAnalysis } from './itemAnalysis'

const A = 1, B = 2, C = 4
const key = [A, B, C, A]
const res = (answers: number[], i: number): Result => ({
  id: String(i), quizId: 'q', studentId: String(i), answers, scannedAt: 0,
  score: answers.filter((a, j) => a === key[j]).length,
})
const results = [
  [A, B, C, A], // 4
  [A, B, C, B], // 3
  [A, B, A, B], // 2
  [A, C, A, 0], // 1
  [B, C, A, A | B], // 0 (blank, multi count as wrong)
].map(res)

test('basic stats', () => {
  expect(median([3, 1, 2])).toBe(2)
  expect(median([4, 1, 2, 3])).toBe(2.5)
  expect(stdev([2, 4, 4, 4, 5, 5, 7, 9])).toBe(2)
  const s = summarize(results, key)
  expect(s.mean).toBe(2)
  expect(s.mps).toBe(50)
  expect(s.passed).toBe(2) // 4/4 and 3/4
  expect(distribution(results, 4)).toEqual([1, 0, 1, 0, 0, 1, 0, 1, 0, 1])
})

test('KR-20 matches hand calculation', () => {
  // p = [.8,.6,.4,.2], sum pq = .16+.24+.24+.16 = .8, variance of [4,3,2,1,0] = 2 -> 4/3*(1-.4) = .8
  expect(kr20(results, key)).toBeCloseTo(0.8)
  expect(kr20(results.slice(0, 1), key)).toBeNull()
})

test('DepEd mastery bands', () => {
  expect(masteryLevel(96)).toBe('Mastered')
  expect(masteryLevel(75)).toBe('Moving towards mastery')
  expect(masteryLevel(4.9)).toBe('Absolutely no mastery')
})

test('frequency of errors ranks most-missed first with ties', () => {
  const e = errorFrequency(results, key)
  expect(e.map((r) => [r.item, r.wrong, r.rank])).toEqual([[4, 4, 1], [3, 3, 2], [2, 2, 3], [1, 1, 4]])
  expect(e[0].blank).toBe(1)
  expect(e[0].commonWrong).toBe('B')
  expect(e.find((r) => r.item === 1)!.leastLearned).toBe(false) // 80% correct
  expect(e.find((r) => r.item === 2)!.leastLearned).toBe(true) // 60% correct
})

test('competency ranges and mastery', () => {
  expect(parseItems('1-3, 9, 2, x, 5-4', 6)).toEqual([1, 2, 3, 4, 5])
  const [c] = competencyMastery(results, key, [{ name: 'First half', items: '1-2' }])
  expect(c.mps).toBe(70) // (4 + 3) correct of 10
})

test('item analysis counts blank and multiple separately', () => {
  const s = itemAnalysis(results, key, 3)
  expect(s[3].counts).toEqual([1, 2, 0, 1, 1]) // A, B, C, blank, multi
})
