// Home screen: list of quizzes.
import type { AppData } from '../../types'
import type { Update } from '../../hooks/useAppData'
import { go } from '../../hooks/useHashRoute'
import { newQuiz } from './quizModel'

export function QuizList({ data, update }: { data: AppData; update: Update }) {
  const create = () => {
    const q = newQuiz()
    update((d) => ({ ...d, quizzes: [q, ...d.quizzes] }))
    go('quiz', q.id, 'form')
  }
  const sorted = [...data.quizzes].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <section>
      <button className="primary" onClick={create}>+ New quiz</button>
      {sorted.length === 0 && <p className="muted">No quizzes yet. Create one, set the key, print sheets, then scan.</p>}
      <ul className="list">
        {sorted.map((q) => {
          const n = data.results.filter((r) => r.quizId === q.id).length
          const cls = data.classes.find((c) => c.id === q.classId)
          return (
            <li key={q.id} onClick={() => go('quiz', q.id, n ? 'results' : 'key')}>
              <strong>{q.form.title}</strong>
              <span className="muted">{q.form.items} items · {cls?.name ?? 'No class'} · {n} scanned</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
