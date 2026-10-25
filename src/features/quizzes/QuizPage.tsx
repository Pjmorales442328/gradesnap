// One quiz with tabs: sheet form, answer key, print, scan, results, item analysis.
import type { AppData, Quiz } from '../../types'
import type { Update } from '../../hooks/useAppData'
import { go } from '../../hooks/useHashRoute'
import { FormEditor } from './FormEditor'
import { KeyEditor } from './KeyEditor'
import { PrintSheet } from './PrintSheet'
import { saveQuiz } from './quizModel'
import { Scanner } from '../scan/Scanner'
import { Results } from '../results/Results'
import { ItemAnalysis } from '../results/ItemAnalysis'

const TABS = [['form', 'Sheet'], ['key', 'Key'], ['print', 'Print'], ['scan', 'Scan'], ['results', 'Results'], ['analysis', 'Analysis']]

export function QuizPage({ quiz, tab, data, update }: { quiz: Quiz; tab: string; data: AppData; update: Update }) {
  const save = (q: Quiz) => update((d) => saveQuiz(d, q))
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
      {tab === 'form' && <FormEditor quiz={quiz} data={data} save={save} remove={remove} />}
      {tab === 'key' && <KeyEditor quiz={quiz} save={save} />}
      {tab === 'print' && <PrintSheet quiz={quiz} />}
      {tab === 'scan' && <Scanner quiz={quiz} data={data} update={update} save={save} />}
      {tab === 'results' && <Results quiz={quiz} data={data} update={update} />}
      {tab === 'analysis' && <ItemAnalysis quiz={quiz} data={data} />}
    </section>
  )
}
