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
        <a href="#/" className="brand">GradeSnap</a>
        <nav>
          <a href="#/" className={!page || page === 'quiz' ? 'active' : ''}>Quizzes</a>
          <a href="#/classes" className={page?.startsWith('class') ? 'active' : ''}>Classes</a>
          <a href="#/settings" className={page === 'settings' ? 'active' : ''}>Backup</a>
        </nav>
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
