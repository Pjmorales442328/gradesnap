// Home screen: quizzes with their workflow status and the next thing to do.
import type { AppData, Quiz } from '../../types'
import type { Update } from '../../hooks/useAppData'
import { go } from '../../hooks/useHashRoute'
import { newQuiz, quizProgress } from './quizModel'

const HOWTO = ['Design the answer sheet and print it', 'Tap in the answer key', 'Scan papers with your phone camera', 'Read scores, item analysis and mastery']

function Status({ data, quiz }: { data: AppData; quiz: Quiz }) {
  const p = quizProgress(data, quiz)
  if (!p.done.form) return <span className="chip todo">Sheet doesn't fit the page</span>
  if (!p.done.key) return <span className="chip todo">Answer key: {p.keyed} of {quiz.form.items}</span>
  if (p.mps === null) return <span className="chip">Ready to scan</span>
  return <span className={`chip ${p.mps >= 75 ? 'pass' : 'fail'}`}>MPS {p.mps.toFixed(1)}% · {p.papers} papers</span>
}

const ACTION: Record<string, string> = { form: 'Fix sheet', key: 'Set key', scan: 'Scan papers', results: 'See results' }

export function QuizList({ data, update }: { data: AppData; update: Update }) {
  const create = () => {
    const q = newQuiz()
    update((d) => ({ ...d, quizzes: [q, ...d.quizzes] }))
    go('quiz', q.id, 'form')
  }
  const sorted = [...data.quizzes].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Quizzes</h1>
          {sorted.length > 0 && <p className="muted">{sorted.length} {sorted.length === 1 ? 'quiz' : 'quizzes'}, newest first</p>}
        </div>
        <button className="primary" onClick={create}>New quiz</button>
      </div>
      {sorted.length === 0 && (
        <div className="empty">
          <h2>Grade your first quiz</h2>
          <ol className="howto">
            {HOWTO.map((t, i) => <li key={t}><span className="dot">{i + 1}</span>{t}</li>)}
          </ol>
        </div>
      )}
      <ul className="list">
        {sorted.map((q) => {
          const cls = data.classes.find((c) => c.id === q.classId)
          const next = quizProgress(data, q).next
          return (
            <li key={q.id}>
              <a href={`#/quiz/${q.id}/${next}`}>
                <span className="grow">
                  <strong>{q.form.title}</strong>
                  <span className="muted small">{q.form.items} items · {cls?.name ?? 'No class'}</span>
                  <Status data={data} quiz={q} />
                </span>
                <span className="button">{ACTION[next]}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
