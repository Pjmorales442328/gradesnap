// Sheet designer: layout options and custom header text with a live print preview.
import type { AppData, Quiz, SheetForm } from '../../types'
import { PER_PAGE, layoutForm } from '../../lib/sheetLayout'
import { AnswerSheet } from '../../components/AnswerSheet'
import { PRESETS, withForm } from './quizModel'

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
        <fieldset>
          <legend>Header</legend>
          <label>Title<input value={f.title} onChange={(e) => set({ title: e.target.value })} /></label>
          <label>Text under title (up to 4 lines)
            <textarea rows={2} value={f.instructions} placeholder="e.g. Shade the circle of your answer completely." onChange={(e) => set({ instructions: e.target.value })} />
          </label>
          <label>Write-in fields (comma separated)
            <input
              defaultValue={f.fields.join(', ')}
              onBlur={(e) => set({ fields: e.target.value.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 8) })}
            />
          </label>
          <label>Class
            <select value={quiz.classId ?? ''} onChange={(e) => save({ ...quiz, classId: e.target.value || undefined })}>
              <option value="">No class</option>
              {data.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </fieldset>
        <fieldset>
          <legend>Layout</legend>
          <label>Template
            <select value="" onChange={(e) => e.target.value && set(PRESETS[+e.target.value].form)}>
              <option value="">Choose a ready-made layout…</option>
              {PRESETS.map((p, i) => <option key={p.name} value={i}>{p.name}</option>)}
            </select>
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
                {Object.keys(PER_PAGE).map(Number).map((n) => {
                  const cap = layoutForm({ ...f, perPage: n }).capacity
                  // ponytail: no room for a 10-row ID column; two-column ID block if teachers need 8-up with IDs
                  return <option key={n} value={n} disabled={!cap && n !== f.perPage}>{n} ({cap ? `max ${cap} items` : 'too small for ID'})</option>
                })}
              </select>
            </label>
          </div>
          {!fits && <p className="error">{f.items} items don't fit. This layout holds {capacity}. Use fewer forms per page, ID digits or choices.</p>}
          <p className="muted small">Changing the layout makes sheets you already printed unreadable. Header text can change any time.</p>
        </fieldset>
        <button className="primary" disabled={!fits} onClick={() => print()}>Print or save as PDF</button>
        <p className="muted small">Prints on A4. On Letter or short bond paper, choose "Fit to page".</p>
        <div className="danger-zone">
          <button onClick={duplicate}>Duplicate for another section</button>
          <button className="danger" onClick={() => confirm('Delete this quiz and its results?') && remove()}>Delete quiz</button>
        </div>
      </div>
      <div className="print-area"><AnswerSheet form={f} /></div>
    </div>
  )
}
