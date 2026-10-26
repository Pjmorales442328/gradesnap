import { expect, test } from 'vitest'
import { copyQuiz } from './quizModel'

test('copyQuiz copies form/key/competencies with a new id, without sharing arrays', () => {
  const q = { id: 'a', form: { title: 'Q1' } as never, key: [1, 2], competencies: [{ name: 'c', items: '1' }], updatedAt: 0 }
  const c = copyQuiz(q)
  expect(c.id).not.toBe('a')
  expect(c.form.title).toBe('Q1 (copy)')
  c.key[0] = 4
  expect(q.key[0]).toBe(1)
})

test('every preset fits on its page', async () => {
  const { PRESETS, DEFAULT_FORM } = await import('./quizModel')
  const { layoutForm } = await import('../../lib/sheetLayout')
  for (const p of PRESETS) expect(layoutForm({ ...DEFAULT_FORM, ...p.form }).capacity, p.name).toBeGreaterThanOrEqual(p.form.items)
})

test('quizProgress points to the next unfinished step', async () => {
  const { quizProgress, DEFAULT_FORM } = await import('./quizModel')
  const q = { id: 'q', form: { ...DEFAULT_FORM, items: 2 }, key: [1, 0], updatedAt: 0 }
  const d = { classes: [], quizzes: [q], results: [] }
  expect(quizProgress(d, q)).toMatchObject({ keyed: 1, next: 'key', mps: null })
  const keyed = { ...q, key: [1, 2] }
  expect(quizProgress(d, keyed).next).toBe('scan')
  const r = { id: 'r', quizId: 'q', studentId: '1', answers: [1, 1], score: 1, scannedAt: 0 }
  expect(quizProgress({ ...d, results: [r] }, keyed)).toMatchObject({ papers: 1, mps: 50, next: 'results' })
})
