// Class list and roster editor (paste IDs and names from a spreadsheet).
import { useState } from 'react'
import type { AppData, ClassRoom } from '../../types'
import type { Update } from '../../hooks/useAppData'
import { go } from '../../hooks/useHashRoute'
import { parseRoster, rosterText } from './rosterModel'

export function ClassList({ data, update }: { data: AppData; update: Update }) {
  const create = () => {
    const c: ClassRoom = { id: crypto.randomUUID(), name: 'New class', students: [] }
    update((d) => ({ ...d, classes: [...d.classes, c] }))
    go('class', c.id)
  }
  return (
    <section>
      <button className="primary" onClick={create}>+ New class</button>
      {data.classes.length === 0 && <p className="empty">No classes yet. Add a class and paste its roster so scanned IDs show student names.</p>}
      <ul className="list">
        {data.classes.map((c) => (
          <li key={c.id} onClick={() => go('class', c.id)}>
            <strong>{c.name}</strong><span className="muted">{c.students.length} students</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ClassEditor({ cls, update }: { cls: ClassRoom; update: Update }) {
  const [text, setText] = useState(rosterText(cls.students))
  const save = (patch: Partial<ClassRoom>) =>
    update((d) => ({ ...d, classes: d.classes.map((c) => (c.id === cls.id ? { ...c, ...patch } : c)) }))
  const parsed = parseRoster(text)
  const remove = () => {
    if (!confirm('Delete this class? Quizzes keep their results.')) return
    update((d) => ({ ...d, classes: d.classes.filter((c) => c.id !== cls.id) }))
    go('classes')
  }

  return (
    <section className="form">
      <label>Class name<input value={cls.name} onChange={(e) => save({ name: e.target.value })} /></label>
      <label>Roster — one per line: ID, Name (paste two columns from Excel)
        <textarea rows={14} value={text} onChange={(e) => setText(e.target.value)} onBlur={() => save({ students: parsed })} placeholder={'1001, Dela Cruz, Juan\n1002, Santos, Maria'} />
      </label>
      <p className="muted">{parsed.length} students recognized. IDs must match the digits students bubble on the sheet.</p>
      <button className="danger" onClick={remove}>Delete class</button>
    </section>
  )
}
