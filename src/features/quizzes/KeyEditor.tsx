// Tap bubbles to set the answer key; tapping more than one accepts multiple answers.
import type { Quiz } from '../../types'
import { choiceLetter } from '../../lib/sheetLayout'

export function KeyEditor({ quiz, save }: { quiz: Quiz; save: (q: Quiz) => void }) {
  const toggle = (i: number, c: number) =>
    save({ ...quiz, key: quiz.key.map((k, j) => (j === i ? k ^ (1 << c) : k)) })
  const missing = quiz.key.filter((k) => !k).length

  return (
    <div>
      <p className="muted">{missing ? `${missing} item(s) have no answer yet.` : 'Key complete.'}</p>
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
