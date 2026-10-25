// Score table for a quiz with summary stats, ID correction, delete and CSV export.
import type { AppData, Quiz } from '../../types'
import type { Update } from '../../hooks/useAppData'
import { download, toCsv } from '../../lib/csv'
import { quizResults, scoresCsv, studentName, summary } from './resultsModel'

export function Results({ quiz, data, update }: { quiz: Quiz; data: AppData; update: Update }) {
  const rs = quizResults(data, quiz)
  const s = summary(rs, quiz.form.items)
  const editId = (id: string) => {
    const v = prompt('Correct student ID:')
    if (v) update((d) => ({ ...d, results: d.results.map((r) => (r.id === id ? { ...r, studentId: v.trim() } : r)) }))
  }
  const del = (id: string) => confirm('Delete this result?') && update((d) => ({ ...d, results: d.results.filter((r) => r.id !== id) }))

  return (
    <div>
      <p className="stats">
        {s.n} papers · Mean {s.mean.toFixed(1)} · MPS {s.mps.toFixed(1)}% · High {s.high} · Low {s.low}
      </p>
      <button onClick={() => download(`${quiz.form.title}-scores.csv`, toCsv(scoresCsv(data, quiz)))} disabled={!rs.length}>Export CSV</button>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Score</th><th>%</th><th /></tr></thead>
        <tbody>
          {rs.map((r) => (
            <tr key={r.id}>
              <td><button className="link" onClick={() => editId(r.id)}>{r.studentId || '—'}</button></td>
              <td>{studentName(data, quiz, r.studentId)}</td>
              <td>{r.score}</td>
              <td>{Math.round((r.score / quiz.form.items) * 100)}</td>
              <td><button className="link danger" onClick={() => del(r.id)}>✕</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
