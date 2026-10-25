// Result summaries and CSV rows for a quiz.
import type { AppData, Quiz, Result } from '../../types'
import { maskLabel } from '../../lib/grade'
import { itemAnalysis } from '../../lib/itemAnalysis'

export const quizResults = (d: AppData, q: Quiz) =>
  d.results.filter((r) => r.quizId === q.id).sort((a, b) => a.studentId.localeCompare(b.studentId))

export const studentName = (d: AppData, q: Quiz, id: string) =>
  d.classes.find((c) => c.id === q.classId)?.students.find((s) => s.id === id)?.name ?? ''

export function summary(rs: Result[], items: number) {
  const scores = rs.map((r) => r.score)
  const mean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  return { n: rs.length, mean, mps: items ? (mean / items) * 100 : 0, high: Math.max(0, ...scores), low: scores.length ? Math.min(...scores) : 0 }
}

export function scoresCsv(d: AppData, q: Quiz) {
  const rs = quizResults(d, q)
  return [
    ['Student ID', 'Name', 'Score', 'Percent', ...q.key.map((_, i) => `Q${i + 1}`)],
    ['KEY', '', q.form.items, 100, ...q.key.map(maskLabel)],
    ...rs.map((r) => [r.studentId, studentName(d, q, r.studentId), r.score, Math.round((r.score / q.form.items) * 100), ...r.answers.slice(0, q.form.items).map(maskLabel)]),
  ]
}

export function analysisCsv(rs: Result[], q: Quiz) {
  const letters = Array.from({ length: q.form.choices }, (_, c) => String.fromCharCode(65 + c))
  return [
    ['Item', 'Key', 'Difficulty', 'Discrimination', 'Remark', ...letters, 'Blank', 'Multiple'],
    ...itemAnalysis(rs, q.key, q.form.choices).map((s) => [
      s.item, maskLabel(q.key[s.item - 1]), s.difficulty.toFixed(2), s.discrimination.toFixed(2), s.remark, ...s.counts,
    ]),
  ]
}
