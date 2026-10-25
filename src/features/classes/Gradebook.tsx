// Gradebook table for a class with per-quiz and per-student averages; CSV export and print.
import type { AppData, ClassRoom } from '../../types'
import { download, toCsv } from '../../lib/csv'
import { gradebook, gradebookCsv } from './gradebookModel'

const cell = (p: number | null) => (p === null ? <span className="muted">—</span> : p < 75 ? <span className="low">{p.toFixed(0)}</span> : p.toFixed(0))

export function Gradebook({ cls, data }: { cls: ClassRoom; data: AppData }) {
  const g = gradebook(data, cls)
  if (!g.quizzes.length) return <p className="empty">No quizzes are assigned to this class yet. Pick this class in a quiz's Sheet tab.</p>
  if (!g.rows.length) return <p className="empty">Add students to the roster to see the gradebook.</p>

  return (
    <section className="report">
      <header className="report-head">
        <div>
          <h3>Gradebook — {cls.name}</h3>
          <p className="muted">{g.rows.length} students · {g.quizzes.length} quizzes · percentages · {new Date().toLocaleDateString()}</p>
        </div>
        <div className="row no-print">
          <button onClick={() => download(`${cls.name} - gradebook.csv`, toCsv(gradebookCsv(data, cls)))}>Export CSV</button>
          <button onClick={() => print()}>Print</button>
        </div>
      </header>
      <div className="scroll">
        <table className="data">
          <thead>
            <tr><th>ID</th><th>Name</th>{g.quizzes.map((q) => <th key={q.id} className="num"><a href={`#/quiz/${q.id}/reports`}>{q.form.title}</a></th>)}<th className="num">Average</th></tr>
          </thead>
          <tbody>
            {g.rows.map((r) => (
              <tr key={r.student.id}>
                <td>{r.student.id}</td><td>{r.student.name}</td>
                {r.pcts.map((p, i) => <td key={i} className="num">{cell(p)}</td>)}
                <td className="num"><strong>{cell(r.average)}</strong></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><th /><th>Class average</th>{g.quizAverages.map((p, i) => <th key={i} className="num">{cell(p)}</th>)}<th /></tr>
          </tfoot>
        </table>
      </div>
      <p className="muted small">Scores below 75% are marked in red. — means no paper scanned.</p>
    </section>
  )
}
