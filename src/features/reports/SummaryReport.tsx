// Test summary: headline stats, DepEd mastery level, reliability and the score distribution.
import { distribution, reliabilityLabel, summarize } from '../../lib/stats'
import { Histogram } from './Histogram'
import type { ReportProps } from './ReportsPage'

export function SummaryReport({ quiz, rs }: ReportProps) {
  const s = summarize(rs, quiz.key)
  const tiles: [string, string, string?][] = [
    ['MPS', `${s.mps.toFixed(1)}%`, s.mastery],
    ['Mean', s.mean.toFixed(2), `of ${s.items} items`],
    ['Median', String(s.median)],
    ['Std. deviation', s.sd.toFixed(2)],
    ['Highest / lowest', `${s.high} / ${s.low}`],
    ['Passed (≥75%)', `${s.passed} of ${s.n}`, `${((s.passed / s.n) * 100).toFixed(0)}%`],
    ['KR-20 reliability', s.kr20 === null ? '—' : s.kr20.toFixed(2), reliabilityLabel(s.kr20)],
  ]
  const unset = quiz.key.filter((k) => !k).length

  return (
    <>
      {unset > 0 && <p className="warn">⚠ {unset} item(s) have no answer key; they count as wrong for everyone.</p>}
      <div className="tiles">
        {tiles.map(([label, value, note]) => (
          <div key={label} className="tile">
            <span className="tile-label">{label}</span>
            <strong className="tile-value">{value}</strong>
            {note && <span className="tile-note">{note}</span>}
          </div>
        ))}
      </div>
      <Histogram bins={distribution(rs, quiz.form.items)} />
      <p className="muted small">
        MPS = mean ÷ items × 100, with DepEd mastery levels (DM 160 s. 2012). KR-20 estimates how consistently the test
        measures; 0.70+ is acceptable for classroom tests. Passing mark used: 75%.
      </p>
    </>
  )
}
