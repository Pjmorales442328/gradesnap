// Mastery per learning competency: teacher maps item ranges to competencies, report shows MPS + DepEd level.
import { useState } from 'react'
import type { Competency } from '../../types'
import { competencyMastery, parseItems } from '../../lib/competency'
import type { ReportProps } from './ReportsPage'

export function CompetencyReport({ quiz, rs, save }: ReportProps) {
  const [draft, setDraft] = useState<Competency[]>(quiz.competencies?.length ? quiz.competencies : [{ name: '', items: '' }])
  const commit = (next: Competency[]) => save({ ...quiz, competencies: next.filter((c) => c.name.trim() && c.items.trim()) })
  const edit = (i: number, patch: Partial<Competency>) => setDraft(draft.map((c, j) => (j === i ? { ...c, ...patch } : c)))
  const rows = competencyMastery(rs, quiz.key, quiz.competencies ?? [])
  const covered = new Set(draft.flatMap((c) => parseItems(c.items, quiz.form.items)))
  const missing = quiz.form.items - covered.size

  return (
    <>
      {/* ponytail: editor sits above the table so a blur-commit growing the table never shifts the buttons mid-click */}
      <div className="comp-editor no-print">
        <h4>Map items to competencies</h4>
        {draft.map((c, i) => (
          <div key={i} className="comp-row">
            <input placeholder="Competency, e.g. Describe the particle nature of matter" value={c.name}
              onChange={(e) => edit(i, { name: e.target.value })} onBlur={() => commit(draft)} />
            <input placeholder="Items, e.g. 1-5, 9" value={c.items} className="items-input"
              onChange={(e) => edit(i, { items: e.target.value })} onBlur={() => commit(draft)} />
            <button className="link danger" aria-label="Remove competency" onClick={() => { const next = draft.filter((_, j) => j !== i); setDraft(next); commit(next) }}>✕</button>
          </div>
        ))}
        <button onClick={() => setDraft([...draft, { name: '', items: '' }])}>+ Add competency</button>
        <p className="muted small">{missing > 0 ? `${missing} item(s) not mapped to any competency yet.` : 'All items are mapped.'} Below 75% MPS is flagged for remediation.</p>
      </div>
      {rows.length > 0 && (
        <table className="data">
          <thead><tr><th>Learning competency</th><th>Items</th><th className="bar-col">MPS</th><th>Mastery level</th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.name}>
                <td>{c.name}</td>
                <td>{c.items.length} ({compress(c.items)})</td>
                <td className="bar-col">
                  <span className="inline-bar"><i style={{ width: `${c.mps}%` }} /></span>
                  <span className="num">{c.mps.toFixed(1)}%</span>
                </td>
                <td>{c.mps < 75 ? <span className="flag critical">▲ {c.level}</span> : c.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

// [1,2,3,5] -> "1–3, 5"
function compress(items: number[]) {
  const out: string[] = []
  for (let i = 0; i < items.length; i++) {
    let j = i
    while (j + 1 < items.length && items[j + 1] === items[j] + 1) j++
    out.push(j > i ? `${items[i]}–${items[j]}` : String(items[i]))
    i = j
  }
  return out.join(', ')
}
