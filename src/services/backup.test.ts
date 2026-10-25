import { expect, test } from 'vitest'
import { parseBackup, toBackup } from './backup'
import { EMPTY } from './storage'

test('backup round-trips', () => {
  const d = { ...EMPTY, quizzes: [{ id: 'q', form: {} as never, key: [1], updatedAt: 1 }] }
  expect(parseBackup(toBackup(d))).toEqual(d)
})

test('backup rejects non-backups', () => {
  expect(() => parseBackup('nope')).toThrow(/not JSON/)
  expect(() => parseBackup('{"data":{}}')).toThrow(/Not a GradeSnap/)
  expect(() => parseBackup(JSON.stringify({ app: 'gradesnap', data: { ...EMPTY, results: [{}] } }))).toThrow(/damaged/)
})
