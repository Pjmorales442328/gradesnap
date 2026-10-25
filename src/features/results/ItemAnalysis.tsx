// Per-item difficulty, discrimination and choice distribution.
import type { AppData, Quiz } from '../../types'
import { download, toCsv } from '../../lib/csv'
import { maskLabel } from '../../lib/grade'
import { difficultyLabel, itemAnalysis } from '../../lib/itemAnalysis'
import { choiceLetter } from '../../lib/sheetLayout'
import { analysisCsv, quizResults } from './resultsModel'

export function ItemAnalysis({ quiz, data }: { quiz: Quiz; data: AppData }) {
  const rs = quizResults(data, quiz)
  if (!rs.length) return <p className="muted">Scan some papers first.</p>
  const stats = itemAnalysis(rs, quiz.key, quiz.form.choices)
  const letters = Array.from({ length: quiz.form.choices }, (_, c) => choiceLetter(c))

  return (
    <div>
      {rs.length < 10 && <p className="muted">Only {rs.length} paper(s) — remarks become meaningful from about 10 papers.</p>}
      <button onClick={() => download(`${quiz.form.title}-item-analysis.csv`, toCsv(analysisCsv(rs, quiz)))}>Export CSV</button>
      <div className="scroll">
        <table>
          <thead>
            <tr><th>#</th><th>Key</th><th>Diff.</th><th>Disc.</th><th>Remark</th>{letters.map((l) => <th key={l}>{l}</th>)}<th>Blank</th><th>Multi</th></tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.item}>
                <td>{s.item}</td>
                <td>{maskLabel(quiz.key[s.item - 1])}</td>
                <td title={difficultyLabel(s.difficulty)}>{s.difficulty.toFixed(2)}</td>
                <td>{s.discrimination.toFixed(2)}</td>
                <td className={s.remark.toLowerCase()}>{s.remark}</td>
                {s.counts.map((n, i) => <td key={i} className={quiz.key[s.item - 1] & (1 << i) ? 'ok' : ''}>{n}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">Difficulty = share correct. Discrimination = upper 27% minus lower 27%. Retain: 0.21–0.80 difficulty and ≥0.30 discrimination.</p>
    </div>
  )
}
