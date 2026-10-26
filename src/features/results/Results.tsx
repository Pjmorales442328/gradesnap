// Papers for a quiz: filterable list with headline stats; opens a paper for review.
import { useState } from 'react'
import type { AppData, Quiz } from '../../types'
import { download, toCsv } from '../../lib/csv'
import { summarize } from '../../lib/stats'
import { quizResults, scoresCsv, studentName } from './resultsModel'

// DepEd passing mark is 75%.
const PctChip = ({ pct }: { pct: number }) => <span className={`chip ${pct >= 75 ? 'pass' : 'fail'}`}>{Math.round(pct)}%</span>

export function Results({ quiz, data }: { quiz: Quiz; data: AppData }) {
  const [filter, setFilter] = useState('')
  const rs = quizResults(data, quiz)
  const s = summarize(rs, quiz.key)
  const q = filter.trim().toLowerCase()
  const shown = rs.filter((r) => !q || r.studentId.includes(q) || studentName(data, quiz, r.studentId).toLowerCase().includes(q))
  const unmatched = rs.filter((r) => !studentName(data, quiz, r.studentId)).length

  if (!rs.length) return <p className="empty">No papers yet. Scan sheets in the Scan tab.</p>

  return (
    <div>
      <div className="stat-strip">
        {([['Papers', s.n], ['MPS', `${s.mps.toFixed(1)}%`], ['Mean', s.mean.toFixed(1)], ['Highest', s.high], ['Lowest', s.low], ['Passed', `${s.passed} of ${s.n}`]] as const).map(([k, v]) => (
          <div key={k}><span>{k}</span><strong>{v}</strong></div>
        ))}
      </div>
      {quiz.classId && unmatched > 0 && <p className="warn">⚠ {unmatched} paper(s) don't match anyone in the roster. Open them to assign a student.</p>}
      <div className="row">
        <input type="search" placeholder="Search name or ID" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <button onClick={() => download(`${quiz.form.title}-scores.csv`, toCsv(scoresCsv(data, quiz)))}>Export CSV</button>
      </div>
      <table className="data clickable">
        <thead><tr><th>ID</th><th>Name</th><th className="num">Score</th><th className="num">%</th><th className="hide-sm">Scanned</th></tr></thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.id} onClick={() => { location.hash = `/quiz/${quiz.id}/results/${r.id}` }}>
              <td>{r.studentId || '—'}</td>
              <td>{studentName(data, quiz, r.studentId) || <span className="muted">Not in roster</span>}</td>
              <td className="num">{r.score}</td>
              <td className="num"><PctChip pct={(r.score / quiz.form.items) * 100} /></td>
              <td className="muted hide-sm">{new Date(r.scannedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
