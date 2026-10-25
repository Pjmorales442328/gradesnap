// Print preview; the browser print dialog handles copies and PDF export.
import type { Quiz } from '../../types'
import { AnswerSheet } from '../../components/AnswerSheet'

export function PrintSheet({ quiz }: { quiz: Quiz }) {
  return (
    <div>
      <p className="muted">Designed for A4; on Letter/Short bond, use "Fit to page". All four black squares must print. Choose copies in the print dialog, or save as PDF.</p>
      <button className="primary" onClick={() => print()}>Print / Save PDF</button>
      <div className="print-area"><AnswerSheet form={quiz.form} /></div>
    </div>
  )
}
