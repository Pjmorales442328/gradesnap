// Reports hub: sub-navigation, printable header, CSV export and print for every report.
import type { ComponentType } from 'react'
import type { AppData, Quiz, Result } from '../../types'
import { download, toCsv } from '../../lib/csv'
import { quizResults } from '../results/resultsModel'
import { competencyCsv, errorsCsv, itemAnalysisCsv, responsesCsv, studentsCsv, summaryCsv } from './reportCsv'
import { SummaryReport } from './SummaryReport'
import { ItemAnalysisReport } from './ItemAnalysisReport'
import { ErrorReport } from './ErrorReport'
import { CompetencyReport } from './CompetencyReport'
import { StudentsReport } from './StudentsReport'
import { ResponsesReport } from './ResponsesReport'

export interface ReportProps { quiz: Quiz; data: AppData; rs: Result[]; save: (q: Quiz) => void }

const REPORTS: { id: string; label: string; View: ComponentType<ReportProps>; csv: (d: AppData, rs: Result[], q: Quiz) => (string | number)[][] }[] = [
  { id: 'summary', label: 'Summary', View: SummaryReport, csv: (_, rs, q) => summaryCsv(rs, q) },
  { id: 'errors', label: 'Frequency of errors', View: ErrorReport, csv: (_, rs, q) => errorsCsv(rs, q) },
  { id: 'items', label: 'Item analysis', View: ItemAnalysisReport, csv: (_, rs, q) => itemAnalysisCsv(rs, q) },
  { id: 'competencies', label: 'Competencies', View: CompetencyReport, csv: (_, rs, q) => competencyCsv(rs, q) },
  { id: 'students', label: 'Student ranking', View: StudentsReport, csv: studentsCsv },
  { id: 'responses', label: 'Response matrix', View: ResponsesReport, csv: responsesCsv },
]

export function ReportsPage({ quiz, data, save, sub }: Omit<ReportProps, 'rs'> & { sub?: string }) {
  const rs = quizResults(data, quiz)
  const report = REPORTS.find((r) => r.id === sub) ?? REPORTS[0]
  const cls = data.classes.find((c) => c.id === quiz.classId)
  const file = `${quiz.form.title} - ${report.label}.csv`.replace(/[\\/:*?"<>|]/g, '-')

  return (
    <div>
      <nav className="subtabs">
        {REPORTS.map((r) => (
          <a key={r.id} href={`#/quiz/${quiz.id}/reports/${r.id}`} className={r === report ? 'active' : ''}>{r.label}</a>
        ))}
      </nav>
      {!rs.length ? <p className="empty">No papers scanned yet. Reports appear after the first scan.</p> : (
        <section className="report">
          <header className="report-head">
            <div>
              <h3>{report.label}</h3>
              <p className="muted">{quiz.form.title} · {cls?.name ?? 'No class'} · {rs.length} papers · {quiz.form.items} items · {new Date().toLocaleDateString()}</p>
            </div>
            <div className="row no-print">
              <button onClick={() => download(file, toCsv(report.csv(data, rs, quiz)))}>Export CSV</button>
              <button onClick={() => print()}>Print</button>
            </div>
          </header>
          <report.View quiz={quiz} data={data} rs={rs} save={save} />
        </section>
      )}
    </div>
  )
}
