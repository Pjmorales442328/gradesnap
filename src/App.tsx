// Shell: header nav + hash routes.
import { useAppData } from './hooks/useAppData'
import { useHashRoute } from './hooks/useHashRoute'
import { QuizList } from './features/quizzes/QuizList'
import { QuizPage } from './features/quizzes/QuizPage'
import { ClassList } from './features/classes/Classes'
import { ClassPage } from './features/classes/ClassPage'
import { Backup } from './features/settings/Backup'

export default function App() {
  const { data, ready, update } = useAppData()
  const [page, id, tab, sub] = useHashRoute()
  if (!ready) return null

  const quiz = page === 'quiz' && data.quizzes.find((q) => q.id === id)
  const cls = page === 'class' && data.classes.find((c) => c.id === id)

  return (
    <>
      <header>
        <div className="bar-inner">
          <a href="#/" className="brand" aria-label="GradeSnap home">
            <svg viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="11" fill="none" stroke="#fff" strokeWidth="2.5" /><circle cx="13" cy="13" r="6.5" fill="#f5b800" /></svg>
            <span>GradeSnap</span>
          </a>
          <nav>
            <a href="#/" className={!page || page === 'quiz' ? 'active' : ''}>Quizzes</a>
            <a href="#/classes" className={page?.startsWith('class') ? 'active' : ''}>Classes</a>
            <a href="#/settings" className={page === 'settings' ? 'active' : ''}>Backup</a>
          </nav>
        </div>
      </header>
      <main>
        {quiz ? <QuizPage quiz={quiz} tab={tab ?? 'key'} sub={sub} data={data} update={update} />
          : cls ? <ClassPage cls={cls} tab={tab} data={data} update={update} />
          : page === 'settings' ? <Backup data={data} update={update} />
          : page === 'classes' ? <ClassList data={data} update={update} />
          : <QuizList data={data} update={update} />}
      </main>
    </>
  )
}
