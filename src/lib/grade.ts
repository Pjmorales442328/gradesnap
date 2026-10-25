// Scoring rules: an item is correct when exactly one bubble is marked and the key accepts it.
import { choiceLetter } from './sheetLayout'

const single = (m: number) => m !== 0 && (m & (m - 1)) === 0

export const isCorrect = (answer: number, key: number) => single(answer) && (answer & key) !== 0

export const scoreOf = (answers: number[], key: number[]) =>
  key.reduce((s, k, i) => s + (isCorrect(answers[i] ?? 0, k) ? 1 : 0), 0)

export const maskLabel = (m: number) =>
  m === 0 ? '-' : [...Array(6).keys()].filter((c) => m & (1 << c)).map(choiceLetter).join('')
