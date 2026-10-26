// Tap bubbles to set the answer key; tapping more than one accepts multiple answers.
import type { Quiz } from '../../types'
import { choiceLetter } from '../../lib/sheetLayout'

export function KeyEditor({ quiz, save }: { quiz: Quiz; save: (q: Quiz) => void }) {
  const toggle = (i: number, c: number) =>
    save({ ...quiz, key: quiz.key.map((k, j) => (j === i ? k ^ (1 << c) : k)) })
  const keyed = quiz.key.filter(Boolean).length
  const total = quiz.form.items

  return (
    <div>
      <div className="key-head">
        <div className="row">
          <strong>{keyed === total ? 'Answer key complete' : `${keyed} of ${total} answered`}</strong>
          {keyed === total
            ? <a className="button primary" href={`#/quiz/${quiz.id}/scan`}>Start scanning</a>
            : <span className="muted small">Tap the correct choice. Tap two to accept either.</span>}
        </div>
        <div className="progress" role="progressbar" aria-valuenow={keyed} aria-valuemax={total} aria-label="Answer key progress"><i style={{ width: `${(keyed / total) * 100}%` }} /></div>
      </div>
      <div className="key-grid">
        {quiz.key.map((k, i) => (
          <div key={i} className="key-row">
            <span className="num">{i + 1}</span>
            {Array.from({ length: quiz.form.choices }, (_, c) => (
              <button key={c} className={`bubble ${k & (1 << c) ? 'on' : ''}`} onClick={() => toggle(i, c)}>
                {choiceLetter(c)}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
