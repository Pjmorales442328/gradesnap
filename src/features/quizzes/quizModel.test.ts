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
