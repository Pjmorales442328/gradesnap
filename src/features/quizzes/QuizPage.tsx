// One quiz with tabs: sheet designer, answer key, scan, results, reports.
import type { AppData, Quiz } from '../../types'
import type { Update } from '../../hooks/useAppData'
import { go } from '../../hooks/useHashRoute'
import { FormEditor } from './FormEditor'
import { KeyEditor } from './KeyEditor'
import { copyQuiz, saveQuiz } from './quizModel'
import { Scanner } from '../scan/Scanner'
import { Results } from '../results/Results'
import { ResultDetail } from '../results/ResultDetail'
import { ReportsPage } from '../reports/ReportsPage'

const TABS = [['form', 'Sheet'], ['key', 'Key'], ['scan', 'Scan'], ['results', 'Results'], ['reports', 'Reports']]

interface Props { quiz: Quiz; tab: string; sub?: string; data: AppData; update: Update }

export function QuizPage({ quiz, tab, sub, data, update }: Props) {
  const save = (q: Quiz) => update((d) => saveQuiz(d, q))
  const duplicate = () => {
    const q = copyQuiz(quiz)
    update((d) => ({ ...d, quizzes: [q, ...d.quizzes] }))
    go('quiz', q.id, 'form')
  }
  const remove = () => {
    update((d) => ({ ...d, quizzes: d.quizzes.filter((q) => q.id !== quiz.id), results: d.results.filter((r) => r.quizId !== quiz.id) }))
    go()
  }

  return (
    <section>
      <h2>{quiz.form.title}</h2>
      <nav className="tabs">
        {TABS.map(([id, label]) => (
          <a key={id} href={`#/quiz/${quiz.id}/${id}`} className={tab === id ? 'active' : ''}>{label}</a>
        ))}
      </nav>
      {tab === 'form' && <FormEditor quiz={quiz} data={data} save={save} remove={remove} duplicate={duplicate} />}
      {tab === 'key' && <KeyEditor quiz={quiz} save={save} />}
      {tab === 'scan' && <Scanner quiz={quiz} data={data} update={update} save={save} />}
      {tab === 'results' && (sub ? <ResultDetail quiz={quiz} data={data} update={update} resultId={sub} /> : <Results quiz={quiz} data={data} />)}
      {tab === 'reports' && <ReportsPage quiz={quiz} data={data} save={save} sub={sub} />}
    </section>
  )
}
