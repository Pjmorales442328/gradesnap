// Customize the sheet: title, item count, choices, ID digits, header fields, class.
import type { AppData, Quiz, SheetForm } from '../../types'
import { layoutSheet } from '../../lib/sheetLayout'
import { withForm } from './quizModel'

interface Props { quiz: Quiz; data: AppData; save: (q: Quiz) => void; remove: () => void }

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v || lo))

export function FormEditor({ quiz, data, save, remove }: Props) {
  const f = quiz.form
  const set = (patch: Partial<SheetForm>) => {
    const next = { ...f, ...patch }
    next.items = Math.min(next.items, layoutSheet({ ...next, items: 1 }).capacity)
    save(withForm(quiz, next))
  }
  const capacity = layoutSheet(f).capacity

  return (
    <div className="form">
      <label>Title<input value={f.title} onChange={(e) => set({ title: e.target.value })} /></label>
      <label>Items (max {capacity})
        <input type="number" min={1} max={capacity} value={f.items} onChange={(e) => set({ items: clamp(+e.target.value, 1, 100) })} />
      </label>
      <label>Choices per item
        <select value={f.choices} onChange={(e) => set({ choices: +e.target.value })}>
          {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} (A–{String.fromCharCode(64 + n)})</option>)}
        </select>
      </label>
      <label>Student ID digits (0 = none)
        <input type="number" min={0} max={10} value={f.idDigits} onChange={(e) => set({ idDigits: clamp(+e.target.value, 0, 10) })} />
      </label>
      <label>Header fields (comma separated)
        <input
          defaultValue={f.fields.join(', ')}
          onBlur={(e) => set({ fields: e.target.value.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 6) })}
        />
      </label>
      <label>Class
        <select value={quiz.classId ?? ''} onChange={(e) => save({ ...quiz, classId: e.target.value || undefined })}>
          <option value="">— none —</option>
          {data.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <p className="muted">Changing the layout after printing makes old printed sheets unreadable.</p>
      <button className="danger" onClick={() => confirm('Delete this quiz and its results?') && remove()}>Delete quiz</button>
    </div>
  )
}
