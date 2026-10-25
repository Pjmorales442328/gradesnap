// Response matrix: every student's answer to every item, wrong answers highlighted; correct-count row at the bottom.
import { isCorrect, maskLabel } from '../../lib/grade'
import { studentName } from '../results/resultsModel'
import { rankStudents } from './studentRanking'
import type { ReportProps } from './ReportsPage'

export function ResponsesReport({ quiz, data, rs }: ReportProps) {
  const ranked = rankStudents(rs)
  const correctCounts = quiz.key.map((k, i) => rs.filter((r) => isCorrect(r.answers[i] ?? 0, k)).length)

  return (
    <div className="scroll">
      <table className="matrix">
        <thead>
          <tr><th className="sticky">Student</th><th>Score</th>{quiz.key.map((_, i) => <th key={i}>{i + 1}</th>)}</tr>
          <tr className="key-row-h"><th className="sticky">Key</th><th />{quiz.key.map((k, i) => <th key={i}>{maskLabel(k)}</th>)}</tr>
        </thead>
        <tbody>
          {ranked.map(({ r }) => (
            <tr key={r.id}>
              <td className="sticky">{studentName(data, quiz, r.studentId) || `ID ${r.studentId || '—'}`}</td>
              <td>{r.score}</td>
              {quiz.key.map((k, i) => {
                const a = r.answers[i] ?? 0
                return <td key={i} className={isCorrect(a, k) ? '' : 'wrong'}>{maskLabel(a)}</td>
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><th className="sticky">Correct</th><th />{correctCounts.map((n, i) => <th key={i}>{n}</th>)}</tr>
        </tfoot>
      </table>
      <p className="muted small">Shaded cells are wrong, blank (-) or multiple-marked answers. Ranked by score.</p>
    </div>
  )
}
