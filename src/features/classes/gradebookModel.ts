// Class gradebook: every roster student's percentage on every quiz assigned to the class.
import type { AppData, ClassRoom } from '../../types'
import { mean } from '../../lib/stats'

export function gradebook(d: AppData, cls: ClassRoom) {
  const quizzes = d.quizzes.filter((q) => q.classId === cls.id).sort((a, b) => a.updatedAt - b.updatedAt)
  const rows = cls.students.map((s) => {
    const pcts = quizzes.map((q) => {
      const r = d.results.find((x) => x.quizId === q.id && x.studentId === s.id)
      return r ? (r.score / q.form.items) * 100 : null
    })
    const taken = pcts.filter((p): p is number => p !== null)
    return { student: s, pcts, average: taken.length ? mean(taken) : null }
  })
  const quizAverages = quizzes.map((_, i) => {
    const taken = rows.map((r) => r.pcts[i]).filter((p): p is number => p !== null)
    return taken.length ? mean(taken) : null
  })
  return { quizzes, rows, quizAverages }
}

export function gradebookCsv(d: AppData, cls: ClassRoom) {
  const g = gradebook(d, cls)
  const f = (p: number | null) => (p === null ? '' : p.toFixed(1))
  return [
    ['Student ID', 'Name', ...g.quizzes.map((q) => `${q.form.title} (%)`), 'Average (%)'],
    ...g.rows.map((r) => [r.student.id, r.student.name, ...r.pcts.map(f), f(r.average)]),
    ['', 'Class average', ...g.quizAverages.map(f), ''],
  ]
}
