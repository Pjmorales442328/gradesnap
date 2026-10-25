// Item analysis: difficulty, discrimination, retain/revise/reject and full choice distribution.
import { maskLabel } from '../../lib/grade'
import { difficultyLabel, itemAnalysis } from '../../lib/itemAnalysis'
import { choiceLetter } from '../../lib/sheetLayout'
import type { ReportProps } from './ReportsPage'

const discLabel = (d: number) => (d >= 0.4 ? 'Very good' : d >= 0.3 ? 'Good' : d >= 0.2 ? 'Fair' : 'Poor')

export function ItemAnalysisReport({ quiz, rs }: ReportProps) {
  const stats = itemAnalysis(rs, quiz.key, quiz.form.choices)
  const letters = Array.from({ length: quiz.form.choices }, (_, c) => choiceLetter(c))
  const tally = (remark: string) => stats.filter((s) => s.remark === remark).length

  return (
    <>
      {rs.length < 10 && <p className="warn">⚠ Only {rs.length} paper(s). Item statistics become dependable from about 20–30 papers.</p>}
      <p className="callout">Retain {tally('Retain')} · Revise {tally('Revise')} · Reject {tally('Reject')}</p>
      <div className="scroll">
        <table className="data">
          <thead>
            <tr>
              <th>Item</th><th>Key</th><th className="num">Difficulty</th><th>Level</th><th className="num">Discrim.</th><th>Power</th><th>Remark</th>
              {letters.map((l) => <th key={l} className="num">{l}</th>)}<th className="num">Blank</th><th className="num">Multi</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.item}>
                <td>{s.item}</td>
                <td>{maskLabel(quiz.key[s.item - 1])}</td>
                <td className="num">{s.difficulty.toFixed(2)}</td>
                <td>{difficultyLabel(s.difficulty)}</td>
                <td className="num">{s.discrimination.toFixed(2)}</td>
                <td>{discLabel(s.discrimination)}</td>
                <td><span className={`flag ${s.remark === 'Retain' ? 'good' : s.remark === 'Reject' ? 'critical' : 'serious'}`}>{s.remark}</span></td>
                {s.counts.map((n, i) => <td key={i} className={`num ${quiz.key[s.item - 1] & (1 << i) ? 'key-cell' : ''}`}>{n}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted small">
        Difficulty = proportion correct (0.21–0.80 is ideal). Discrimination = proportion correct in the top 27% minus the bottom 27%
        (≥0.30 discriminates well; negative means stronger students missed it — check the key). Retain: ideal difficulty and
        discrimination ≥0.30; Revise: discrimination 0.20–0.29 or difficulty outside the ideal range; Reject: below 0.20.
        Bold counts are the keyed answer.
      </p>
    </>
  )
}
