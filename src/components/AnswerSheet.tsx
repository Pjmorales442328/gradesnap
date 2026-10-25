// Printable A4 page tiled with N forms; each form = custom header + marker frame around the bubbles.
import {
  BUBBLE_R, MARKER, ORIENT, PAGE, PER_PAGE, cellOrigins, cellSize, choiceLetter, headerLayout, layoutForm, type Pt,
} from '../lib/sheetLayout'
import type { SheetForm } from '../types'

const Bubble = ({ c, label }: { c: Pt; label: string }) => (
  <g>
    <circle cx={c.x} cy={c.y} r={BUBBLE_R} fill="none" stroke="#444" strokeWidth={0.22} />
    <text x={c.x} y={c.y} fontSize={1.8} fill="#999" textAnchor="middle" dominantBaseline="central">{label}</text>
  </g>
)

// Marking guide drawn below the frame, outside the scanned area: one right example, three wrong ones.
function MarkGuide({ x, y }: Pt) {
  const r = BUBBLE_R, cy = y + 5, line = { fill: 'none', stroke: '#444', strokeWidth: 0.22 }
  const [ok, w1, w2, w3] = [x + 12, x + 29, x + 34, x + 39]
  return (
    <g fontSize={2.4} fill="#333">
      <text x={x} y={y} dominantBaseline="central">Use a dark pencil or pen. Fill the circle completely.</text>
      <text x={x} y={cy} dominantBaseline="central">Correct:</text>
      <circle cx={ok} cy={cy} r={r} fill="#222" />
      <text x={x + 18} y={cy} dominantBaseline="central">Wrong:</text>
      <g {...line}>
        <circle cx={w1} cy={cy} r={r} /><path d={`M${w1 - 0.9},${cy} l0.7,0.8 l1.2,-1.6`} />
        <circle cx={w2} cy={cy} r={r} /><path d={`M${w2 - 0.9},${cy - 0.9} l1.8,1.8 m0,-1.8 l-1.8,1.8`} />
        <circle cx={w3} cy={cy} r={r} />
      </g>
      <path d={`M${w3},${cy - r} a${r},${r} 0 0 1 0,${2 * r} z`} fill="#222" />
    </g>
  )
}

function Form({ form }: { form: SheetForm }) {
  const cell = cellSize(form.perPage)
  const l = layoutForm(form)
  const head = headerLayout(form)
  const { x: fx, y: fy } = l.frameOrigin
  const corners = [[0, 0], [l.w, 0], [0, l.h], [l.w, l.h]]

  return (
    <g>
      <text x={1} y={5} fontSize={4.5} fontWeight="bold">{form.title}</text>
      <text x={cell.w - 1} y={5} fontSize={3} textAnchor="end">Score: ______ / {form.items}</text>
      {head.lines.map((l, i) => <text key={i} x={1} y={l.y} fontSize={3} fill="#333">{l.t}</text>)}
      {head.fields.map((f, i) => (
        <g key={i}>
          <text x={f.x} y={f.y} fontSize={3}>{f.label}:</text>
          <line x1={f.x + f.label.length * 1.7 + 3} x2={f.x + f.w} y1={f.y + 0.6} y2={f.y + 0.6} stroke="#000" strokeWidth={0.2} />
        </g>
      ))}
      <g transform={`translate(${fx} ${fy})`}>
        {corners.map(([x, y]) => <rect key={`${x}-${y}`} x={x - MARKER / 2} y={y - MARKER / 2} width={MARKER} height={MARKER} fill="#000" />)}
        <rect x={ORIENT.x - ORIENT.size / 2} y={ORIENT.y - ORIENT.size / 2} width={ORIENT.size} height={ORIENT.size} fill="#000" />
        {form.idDigits > 0 && <text x={l.id[0][0].x - BUBBLE_R} y={l.id[0][0].y - 2.6} fontSize={2.2} fontWeight="bold">ID</text>}
        {l.id.map((col, ci) => col.map((c, d) => <Bubble key={`${ci}-${d}`} c={c} label={String(d)} />))}
        {l.items.map((it, i) => (
          <g key={i}>
            <text x={it.label.x} y={it.label.y} fontSize={2.2} textAnchor="end" dominantBaseline="central">{i + 1}</text>
            {it.bubbles.map((c, ci) => <Bubble key={ci} c={c} label={choiceLetter(ci)} />)}
          </g>
        ))}
      </g>
      {cell.h - (fy + l.h + MARKER / 2) >= 13 && <MarkGuide x={fx - MARKER / 2} y={fy + l.h + MARKER / 2 + 4} />}
    </g>
  )
}

export function AnswerSheet({ form }: { form: SheetForm }) {
  const [gc, gr] = PER_PAGE[form.perPage] ?? PER_PAGE[1]
  const cell = cellSize(form.perPage)
  const cutX = Array.from({ length: gc - 1 }, (_, i) => PAGE.margin + (i + 1) * cell.w + (i + 0.5) * PAGE.gutter)
  const cutY = Array.from({ length: gr - 1 }, (_, i) => PAGE.margin + (i + 1) * cell.h + (i + 0.5) * PAGE.gutter)
  const fits = layoutForm(form).capacity >= form.items

  return (
    <svg className="sheet" width={`${PAGE.w}mm`} height={`${PAGE.h}mm`} viewBox={`0 0 ${PAGE.w} ${PAGE.h}`} fontFamily="Arial, sans-serif">
      <rect width={PAGE.w} height={PAGE.h} fill="#fff" />
      {cutX.map((x) => <line key={x} x1={x} x2={x} y1={0} y2={PAGE.h} stroke="#bbb" strokeWidth={0.2} strokeDasharray="2 2" />)}
      {cutY.map((y) => <line key={y} x1={0} x2={PAGE.w} y1={y} y2={y} stroke="#bbb" strokeWidth={0.2} strokeDasharray="2 2" />)}
      {fits && cellOrigins(form.perPage).map((o) => (
        <g key={`${o.x}-${o.y}`} transform={`translate(${o.x} ${o.y})`}><Form form={form} /></g>
      ))}
    </svg>
  )
}
