// Learning competencies mapped to item ranges ("1-5, 9"), with mastery per competency.
import type { Competency, Result } from '../types'
import { isCorrect } from './grade'
import { masteryLevel } from './stats'

// "1-5, 9, 12-13" -> [1,2,3,4,5,9,12,13], limited to 1..max, duplicates dropped
export function parseItems(text: string, max: number): number[] {
  const out = new Set<number>()
  for (const part of text.split(/[,;\s]+/).filter(Boolean)) {
    const m = part.match(/^(\d+)(?:-(\d+))?$/)
    if (!m) continue
    const a = +m[1], b = m[2] ? +m[2] : a
    for (let i = Math.min(a, b); i <= Math.max(a, b) && i <= max; i++) if (i >= 1) out.add(i)
  }
  return [...out].sort((x, y) => x - y)
}

export function competencyMastery(results: Result[], key: number[], comps: Competency[]) {
  return comps.map((c) => {
    const items = parseItems(c.items, key.length)
    const possible = items.length * results.length
    const correct = results.reduce((s, r) => s + items.filter((i) => isCorrect(r.answers[i - 1] ?? 0, key[i - 1])).length, 0)
    const mps = possible ? (correct / possible) * 100 : 0
    return { name: c.name, items, mps, level: masteryLevel(mps) }
  })
}
