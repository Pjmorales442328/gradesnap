// One class with tabs: roster editor and gradebook.
import type { AppData, ClassRoom } from '../../types'
import type { Update } from '../../hooks/useAppData'
import { ClassEditor } from './Classes'
import { Gradebook } from './Gradebook'

export function ClassPage({ cls, tab, data, update }: { cls: ClassRoom; tab?: string; data: AppData; update: Update }) {
  const active = tab === 'gradebook' ? 'gradebook' : 'roster'
  return (
    <section>
      <h2>{cls.name}</h2>
      <nav className="tabs">
        <a href={`#/class/${cls.id}/roster`} className={active === 'roster' ? 'active' : ''}>Roster</a>
        <a href={`#/class/${cls.id}/gradebook`} className={active === 'gradebook' ? 'active' : ''}>Gradebook</a>
      </nav>
      {active === 'roster' ? <ClassEditor key={cls.id} cls={cls} update={update} /> : <Gradebook cls={cls} data={data} />}
    </section>
  )
}
