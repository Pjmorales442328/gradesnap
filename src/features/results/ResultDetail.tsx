// One scanned paper: reassign the student, correct misread bubbles, step to the previous/next paper, delete.
import type { AppData, Quiz } from '../../types'
import type { Update } from '../../hooks/useAppData'
import { go } from '../../hooks/useHashRoute'
import { isCorrect } from '../../lib/grade'
import { choiceLetter } from '../../lib/sheetLayout'
import { patchResult, quizResults, studentName } from './resultsModel'

interface Props { quiz: Quiz; data: AppData; update: Update; resultId: string }

export function ResultDetail({ quiz, data, update, resultId }: Props) {
  const rs = quizResults(data, quiz)
  const idx = rs.findIndex((r) => r.id === resultId)
  const r = rs[idx]
  if (!r) return <p className="empty">Paper not found. <a href={`#/quiz/${quiz.id}/results`}>Back to results</a></p>

  const roster = data.classes.find((c) => c.id === quiz.classId)?.students ?? []
  const patch = (p: Parameters<typeof patchResult>[3]) => update((d) => patchResult(d, quiz, r.id, p))
  const toggle = (i: number, c: number) => patch({ answers: quiz.key.map((_, j) => (j === i ? (r.answers[j] ?? 0) ^ (1 << c) : r.answers[j] ?? 0)) })
  const remove = () => {
    if (!confirm('Delete this paper?')) return
    update((d) => ({ ...d, results: d.results.filter((x) => x.id !== r.id) }))
    go('quiz', quiz.id, 'results')
  }
  const link = (j: number) => rs[j] && `#/quiz/${quiz.id}/results/${rs[j].id}`

  return (
    <div>
      <div className="row">
        <a href={`#/quiz/${quiz.id}/results`}>← All papers</a>
        <span className="spacer" />
        {link(idx - 1) ? <a href={link(idx - 1)}>‹ Prev</a> : <span className="muted">‹ Prev</span>}
        <span className="muted">{idx + 1} / {rs.length}</span>
        {link(idx + 1) ? <a href={link(idx + 1)}>Next ›</a> : <span className="muted">Next ›</span>}
      </div>
      <div className="card">
        <h3>{studentName(data, quiz, r.studentId) || (r.studentId ? `ID ${r.studentId} (not in roster)` : 'No ID read')}</h3>
        <p className="score">{r.score} / {quiz.form.items} · {Math.round((r.score / quiz.form.items) * 100)}%</p>
        <div className="row">
          <label className="inline">Student ID <input value={r.studentId} inputMode="numeric" onChange={(e) => patch({ studentId: e.target.value.trim() })} /></label>
          {roster.length > 0 && (
            <select value={roster.some((s) => s.id === r.studentId) ? r.studentId : ''} onChange={(e) => e.target.value && patch({ studentId: e.target.value })}>
              <option value="">Assign from roster…</option>
              {roster.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
            </select>
          )}
        </div>
      </div>
      <p className="muted small">Tap a bubble to fix a misread mark. Green = correct, red = wrong, outlined = the key.</p>
      <div className="key-grid">
        {quiz.key.map((k, i) => {
          const a = r.answers[i] ?? 0
          const ok = isCorrect(a, k)
          return (
            <div key={i} className="key-row">
              <span className="num">{i + 1}</span>
              {Array.from({ length: quiz.form.choices }, (_, c) => {
                const marked = a & (1 << c)
                const cls = marked ? (ok ? 'on right' : 'on wrong') : k & (1 << c) ? 'keyed' : ''
                return <button key={c} className={`bubble ${cls}`} aria-pressed={!!marked} onClick={() => toggle(i, c)}>{choiceLetter(c)}</button>
              })}
            </div>
          )
        })}
      </div>
      <button className="danger" onClick={remove}>Delete paper</button>
    </div>
  )
}
