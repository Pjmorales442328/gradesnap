// Quiz results: lookup, manual corrections, score export.
import type { AppData, Quiz, Result } from '../../types'
import { maskLabel, scoreOf } from '../../lib/grade'

export const quizResults = (d: AppData, q: Quiz) =>
  d.results.filter((r) => r.quizId === q.id).sort((a, b) => a.studentId.localeCompare(b.studentId))

export const studentName = (d: AppData, q: Quiz, id: string) =>
  d.classes.find((c) => c.id === q.classId)?.students.find((s) => s.id === id)?.name ?? ''

// Applies a manual correction to one paper and re-scores it.
export function patchResult(d: AppData, q: Quiz, id: string, patch: Partial<Pick<Result, 'studentId' | 'answers'>>): AppData {
  return {
    ...d,
    results: d.results.map((r) => {
      if (r.id !== id) return r
      const next = { ...r, ...patch }
      return { ...next, score: scoreOf(next.answers, q.key) }
    }),
  }
}

export function scoresCsv(d: AppData, q: Quiz) {
  const rs = quizResults(d, q)
  return [
    ['Student ID', 'Name', 'Score', 'Percent', ...q.key.map((_, i) => `Q${i + 1}`)],
    ['KEY', '', q.form.items, 100, ...q.key.map(maskLabel)],
    ...rs.map((r) => [r.studentId, studentName(d, q, r.studentId), r.score, Math.round((r.score / q.form.items) * 100), ...r.answers.slice(0, q.form.items).map(maskLabel)]),
  ]
}
