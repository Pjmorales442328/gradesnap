// Printable A4 bubble sheet drawn as SVG in millimetres.
import { BUBBLE_R, FRAME, PAGE, choiceLetter, layoutSheet, type Pt } from '../lib/sheetLayout'
import type { SheetForm } from '../types'

const Bubble = ({ c, label }: { c: Pt; label: string }) => (
  <g>
    <circle cx={c.x} cy={c.y} r={BUBBLE_R} fill="none" stroke="#444" strokeWidth={0.25} />
    <text x={c.x} y={c.y} fontSize={2.3} fill="#aaa" textAnchor="middle" dominantBaseline="central">{label}</text>
  </g>
)

export function AnswerSheet({ form }: { form: SheetForm }) {
  const l = layoutSheet(form)
  const m = FRAME.marker
  const corners = [[0, 0], [FRAME.w, 0], [0, FRAME.h], [FRAME.w, FRAME.h]]
  const fieldsRight = form.idDigits ? l.idTopLeft.x - 8 : FRAME.w - 6

  return (
    <svg className="sheet" width={`${PAGE.w}mm`} height={`${PAGE.h}mm`} viewBox={`0 0 ${PAGE.w} ${PAGE.h}`} fontFamily="Arial, sans-serif">
      <rect width={PAGE.w} height={PAGE.h} fill="#fff" />
      <g transform={`translate(${PAGE.ox} ${PAGE.oy})`}>
        {corners.map(([x, y]) => <rect key={`${x}-${y}`} x={x - m / 2} y={y - m / 2} width={m} height={m} fill="#000" />)}
        <text x={6} y={11} fontSize={5} fontWeight="bold">{form.title}</text>
        {form.fields.map((f, i) => (
          <g key={i}>
            <text x={6} y={l.fieldsY[i]} fontSize={3.2}>{f}:</text>
            <line x1={6 + f.length * 1.9 + 4} x2={fieldsRight} y1={l.fieldsY[i] + 0.8} y2={l.fieldsY[i] + 0.8} stroke="#000" strokeWidth={0.2} />
          </g>
        ))}
        {form.idDigits > 0 && <text x={l.idTopLeft.x} y={l.idTopLeft.y - 4.5} fontSize={3} fontWeight="bold">STUDENT ID</text>}
        {l.id.map((col, ci) => col.map((c, d) => <Bubble key={`${ci}-${d}`} c={c} label={String(d)} />))}
        {l.items.map((it, i) => (
          <g key={i}>
            <text x={it.label.x} y={it.label.y} fontSize={2.8} textAnchor="end" dominantBaseline="central">{i + 1}</text>
            {it.bubbles.map((c, ci) => <Bubble key={ci} c={c} label={choiceLetter(ci)} />)}
          </g>
        ))}
        <text x={FRAME.w / 2} y={FRAME.h - 1} fontSize={2.5} fill="#666" textAnchor="middle">
          Use a dark pencil or pen. Fill bubbles completely. Do not fold or mark the black squares.
        </text>
      </g>
    </svg>
  )
}
