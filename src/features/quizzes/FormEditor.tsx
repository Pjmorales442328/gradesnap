// Sheet designer: layout options and custom header text with a live print preview.
import type { AppData, Quiz, SheetForm } from '../../types'
import { PER_PAGE, layoutForm } from '../../lib/sheetLayout'
import { AnswerSheet } from '../../components/AnswerSheet'
import { withForm } from './quizModel'

interface Props { quiz: Quiz; data: AppData; save: (q: Quiz) => void; remove: () => void; duplicate: () => void }

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(v) || lo))

export function FormEditor({ quiz, data, save, remove, duplicate }: Props) {
  const f = quiz.form
  const set = (patch: Partial<SheetForm>) => save(withForm(quiz, { ...f, ...patch }))
  const capacity = layoutForm(f).capacity
  const fits = capacity >= f.items

  return (
    <div className="designer">
      <div className="form">
        <label>Title<input value={f.title} onChange={(e) => set({ title: e.target.value })} /></label>
        <label>Text under title (up to 4 lines)
          <textarea rows={3} value={f.instructions} placeholder="e.g. Shade the circle of your answer completely." onChange={(e) => set({ instructions: e.target.value })} />
        </label>
        <label>Write-in fields (comma separated)
          <input
            defaultValue={f.fields.join(', ')}
            onBlur={(e) => set({ fields: e.target.value.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 8) })}
          />
        </label>
        <div className="grid2">
          <label>Items
            <input type="number" min={1} max={100} value={f.items} onChange={(e) => set({ items: clamp(+e.target.value, 1, 100) })} />
          </label>
          <label>Choices
            <select value={f.choices} onChange={(e) => set({ choices: +e.target.value })}>
              {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>A–{String.fromCharCode(64 + n)}</option>)}
            </select>
          </label>
          <label>ID digits
            <select value={f.idDigits} onChange={(e) => set({ idDigits: +e.target.value })}>
              {Array.from({ length: 11 }, (_, n) => <option key={n} value={n}>{n || 'No ID'}</option>)}
            </select>
          </label>
          <label>Forms per page
            <select value={f.perPage} onChange={(e) => set({ perPage: +e.target.value })}>
              {Object.keys(PER_PAGE).map(Number).map((n) => (
                <option key={n} value={n}>{n} (max {layoutForm({ ...f, perPage: n }).capacity} items)</option>
              ))}
            </select>
          </label>
        </div>
        {!fits && <p className="error">{f.items} items don't fit — max {capacity}. Use fewer forms per page, fewer ID digits or fewer choices.</p>}
        <label>Class
          <select value={quiz.classId ?? ''} onChange={(e) => save({ ...quiz, classId: e.target.value || undefined })}>
            <option value="">— none —</option>
            {data.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <button className="primary" disabled={!fits} onClick={() => print()}>Print / Save PDF</button>
        <p className="muted">A4 page. On Letter/Short bond use "Fit to page". Header text can change any time; changing items, choices, ID digits or forms per page makes already-printed sheets unreadable.</p>
        <button onClick={duplicate}>Duplicate quiz (for another section)</button>
        <button className="danger" onClick={() => confirm('Delete this quiz and its results?') && remove()}>Delete quiz</button>
      </div>
      <div className="print-area"><AnswerSheet form={f} /></div>
    </div>
  )
}
