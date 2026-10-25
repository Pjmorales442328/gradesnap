// Card shown after a sheet is read: student, score, and each item's mark vs key.
import type { AppData, Quiz, Result } from '../../types'
import { isCorrect, maskLabel } from '../../lib/grade'

export function ScanResult({ result, quiz, data }: { result: Result; quiz: Quiz; data: AppData }) {
  const roster = data.classes.find((c) => c.id === quiz.classId)?.students ?? []
  const name = roster.find((s) => s.id === result.studentId)?.name
  const pct = Math.round((result.score / quiz.form.items) * 100)

  return (
    <div className="card">
      <h3>{name ?? (!result.studentId || result.studentId.includes('?') ? 'Unreadable ID — fix it in Results' : `ID ${result.studentId} (not in roster)`)}</h3>
      <p className="score">{result.score} / {quiz.form.items} · {pct}%</p>
      <div className="marks">
        {result.answers.map((a, i) => (
          <span key={i} className={isCorrect(a, quiz.key[i]) ? 'ok' : 'bad'} title={`Key: ${maskLabel(quiz.key[i])}`}>
            {i + 1}:{maskLabel(a)}
          </span>
        ))}
      </div>
    </div>
  )
}
