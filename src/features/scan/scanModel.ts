// Turns a sheet read into a stored result; re-scanning a student replaces their previous result.
import type { AppData, Quiz, Result } from '../../types'
import type { SheetRead } from '../../lib/omr/readSheet'
import { scoreOf } from '../../lib/grade'

export const normalizeId = (id: string) => id.replace(/^0+(?=.)/, '')

export const makeResult = (quiz: Quiz, read: SheetRead): Result => ({
  id: crypto.randomUUID(),
  quizId: quiz.id,
  studentId: normalizeId(read.studentId),
  answers: read.answers,
  score: scoreOf(read.answers, quiz.key),
  scannedAt: Date.now(),
})

export function upsertResult(d: AppData, r: Result): AppData {
  const known = !r.studentId.includes('?') && r.studentId !== ''
  const others = d.results.filter((x) => !(known && x.quizId === r.quizId && x.studentId === r.studentId))
  return { ...d, results: [...others, r] }
}

export const sameRead = (a: SheetRead, b: SheetRead) =>
  a.studentId === b.studentId && a.answers.every((v, i) => v === b.answers[i])
