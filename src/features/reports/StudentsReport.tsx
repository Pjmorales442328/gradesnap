// Student ranking: rank, score, percent and pass mark; links to each paper.
import { studentName } from '../results/resultsModel'
import { rankStudents } from './studentRanking'
import type { ReportProps } from './ReportsPage'

export function StudentsReport({ quiz, data, rs }: ReportProps) {
  const roster = data.classes.find((c) => c.id === quiz.classId)?.students ?? []
  const scanned = new Set(rs.map((r) => r.studentId))
  const absent = roster.filter((s) => !scanned.has(s.id))

  return (
    <>
      <div className="scroll">
        <table className="data">
          <thead><tr><th>Rank</th><th>ID</th><th>Name</th><th className="num">Score</th><th className="bar-col">Percent</th><th>Remark</th></tr></thead>
          <tbody>
            {rankStudents(rs).map(({ r, rank }) => {
              const pct = (r.score / quiz.form.items) * 100
              return (
                <tr key={r.id}>
                  <td>{rank}</td>
                  <td><a href={`#/quiz/${quiz.id}/results/${r.id}`}>{r.studentId || '—'}</a></td>
                  <td>{studentName(data, quiz, r.studentId) || <span className="muted">Not in roster</span>}</td>
                  <td className="num">{r.score} / {quiz.form.items}</td>
                  <td className="bar-col">
                    <span className="inline-bar"><i style={{ width: `${pct}%` }} /></span>
                    <span className="num">{pct.toFixed(0)}%</span>
                  </td>
                  <td>{pct >= 75 ? 'Passed' : <span className="flag critical">▲ Below 75%</span>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {absent.length > 0 && (
        <p className="callout">No paper yet from {absent.length} student(s) in the roster: {absent.map((s) => s.name).join('; ')}</p>
      )}
    </>
  )
}
