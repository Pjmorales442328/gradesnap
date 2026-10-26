// Quiz creation and form-change rules (key length follows item count).
import type { AppData, Quiz, SheetForm } from '../../types'
import { scoreOf } from '../../lib/grade'
import { layoutForm } from '../../lib/sheetLayout'

export const DEFAULT_FORM: SheetForm = { title: 'Quiz', items: 20, choices: 4, idDigits: 4, fields: ['Name', 'Section', 'Date'], instructions: '', perPage: 2 }

// Ready-made sheet layouts; header text is kept when one is applied.
export const PRESETS: { name: string; form: Pick<SheetForm, 'items' | 'choices' | 'idDigits' | 'perPage'> }[] = [
  { name: 'Short quiz — 10 items, 6 per page', form: { items: 10, choices: 4, idDigits: 4, perPage: 6 } },
  { name: 'Quiz — 20 items, 4 per page', form: { items: 20, choices: 4, idDigits: 4, perPage: 4 } },
  { name: 'Long test — 50 items, 2 per page', form: { items: 50, choices: 4, idDigits: 6, perPage: 2 } },
  { name: 'Periodical exam — 100 items, 1 per page', form: { items: 100, choices: 4, idDigits: 6, perPage: 1 } },
  { name: 'True / False — 30 items, 4 per page', form: { items: 30, choices: 2, idDigits: 4, perPage: 4 } },
]

export const newQuiz = (): Quiz => ({
  id: crypto.randomUUID(),
  form: { ...DEFAULT_FORM, title: `Quiz ${new Date().toLocaleDateString()}` },
  key: Array(DEFAULT_FORM.items).fill(0),
  updatedAt: Date.now(),
})

// Copy for reuse with another section: same form, key and competencies, no results.
export const copyQuiz = (q: Quiz): Quiz => ({
  ...structuredClone(q),
  id: crypto.randomUUID(),
  form: { ...q.form, title: `${q.form.title} (copy)` },
  updatedAt: Date.now(),
})

export function withForm(q: Quiz, form: SheetForm): Quiz {
  const allowed = (1 << form.choices) - 1
  const key = Array.from({ length: form.items }, (_, i) => (q.key[i] ?? 0) & allowed)
  return { ...q, form, key }
}

// Saving a quiz re-scores its results, so key or item-count edits apply to papers already scanned.
export const saveQuiz = (d: AppData, q: Quiz): AppData => ({
  ...d,
  quizzes: d.quizzes.map((x) => (x.id === q.id ? { ...q, updatedAt: Date.now() } : x)),
  results: d.results.map((r) => (r.quizId === q.id ? { ...r, score: scoreOf(r.answers, q.key) } : r)),
})

// Where a quiz stands in the print → key → scan workflow, for the home list and the step bar.
export function quizProgress(d: AppData, q: Quiz) {
  const scores = d.results.filter((r) => r.quizId === q.id).map((r) => r.score)
  const keyed = q.key.filter(Boolean).length
  const papers = scores.length
  const mps = papers ? (scores.reduce((a, b) => a + b, 0) / papers / q.form.items) * 100 : null
  const done = { form: layoutForm(q.form).capacity >= q.form.items, key: keyed === q.form.items, scan: papers > 0 }
  const next = !done.form ? 'form' : !done.key ? 'key' : !done.scan ? 'scan' : 'results'
  return { keyed, papers, mps, done, next }
}
