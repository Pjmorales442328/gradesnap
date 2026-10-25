// Frequency of errors: items ranked by how many students missed them, least-learned items flagged.
import { errorFrequency } from '../../lib/errorFrequency'
import { maskLabel } from '../../lib/grade'
import type { ReportProps } from './ReportsPage'

export function ErrorReport({ quiz, rs }: ReportProps) {
  const rows = errorFrequency(rs, quiz.key)
  const least = rows.filter((r) => r.leastLearned).map((r) => r.item).sort((a, b) => a - b)

  return (
    <>
      <p className="callout">
        {least.length
          ? <>Least-learned items (fewer than 75% answered correctly): <strong>{least.join(', ')}</strong> — {least.length} of {quiz.form.items}.</>
          : 'Every item was answered correctly by at least 75% of the class.'}
      </p>
      <div className="scroll">
        <table className="data">
          <thead>
            <tr><th>Rank</th><th>Item</th><th>Key</th><th className="num">Wrong</th><th className="bar-col">% wrong</th><th className="num">Blank</th><th>Common wrong</th><th>Remark</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.item}>
                <td>{r.rank}</td>
                <td>{r.item}</td>
                <td>{maskLabel(quiz.key[r.item - 1])}</td>
                <td className="num">{r.wrong} / {rs.length}</td>
                <td className="bar-col">
                  <span className="inline-bar" title={`${r.pctWrong.toFixed(1)}% wrong`}><i style={{ width: `${r.pctWrong}%` }} /></span>
                  <span className="num">{r.pctWrong.toFixed(0)}%</span>
                </td>
                <td className="num">{r.blank}</td>
                <td>{r.commonWrong}</td>
                <td>{r.leastLearned && <span className="flag critical">▲ Least learned</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted small">Wrong includes blank and multiple-marked answers. "Common wrong" is the wrong choice picked most often — a strong distractor or a misconception worth reteaching.</p>
    </>
  )
}
