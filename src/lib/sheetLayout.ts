// Form geometry in mm. The marker frame wraps only the bubbles and is sized from the form, so headers/text
// never move what the scanner reads. Printing and scanning both use this.
import type { SheetForm } from '../types'

export interface Pt { x: number; y: number }

export const PAGE = { w: 210, h: 297, margin: 5, gutter: 4 }
export const PER_PAGE: Record<number, [number, number]> = { 1: [1, 1], 2: [1, 2], 3: [1, 3], 4: [2, 2], 6: [2, 3], 8: [2, 4] }
// Base sizes at scale 1; roomy layouts scale all of them up together (see layoutForm).
const MARKER = 6
const BUBBLE_R = 1.6
const ORIENT = { x: 6.5, y: 0, size: 3 } // small square right of the top-left marker
const MAX_SCALE = 1.6
export const GUIDE_H = 13 // marking guide printed under the frame
const P = 4.2 // bubble pitch
const IN = 4 // frame line to content
const LABEL_W = 5
const COL_GAP = 2
const ID_GAP = 3
const Y0 = IN + 4 // first bubble row (room for the ID label above)

// Header (outside the frame): title, text lines, then write-in fields 2 or 3 per row; a Score field is always last.
export function headerLayout(f: SheetForm) {
  const labels = f.fields.some((l) => /^score$/i.test(l)) ? f.fields : [...f.fields, 'Score']
  const cell = cellSize(f.perPage)
  const lines = textLines(f)
  const perRow = cell.w > 150 ? 3 : 2
  const fw = cell.w / perRow
  const top = 7 + lines.length * 4
  const fields = labels.map((label, i) => ({ label, x: 1 + (i % perRow) * fw, y: top + Math.floor(i / perRow) * 6 + 4, w: fw - 4 }))
  return { lines: lines.map((t, i) => ({ t, y: 8.5 + i * 4 })), fields, height: top + Math.ceil(labels.length / perRow) * 6 + 1 }
}

export const textLines = (f: SheetForm) => (f.instructions ? f.instructions.split('\n').slice(0, 4) : [])

export function cellSize(perPage: number) {
  const [gc, gr] = PER_PAGE[perPage] ?? PER_PAGE[1]
  return {
    w: (PAGE.w - 2 * PAGE.margin - (gc - 1) * PAGE.gutter) / gc,
    h: (PAGE.h - 2 * PAGE.margin - (gr - 1) * PAGE.gutter) / gr,
  }
}

export function cellOrigins(perPage: number): Pt[] {
  const [gc, gr] = PER_PAGE[perPage] ?? PER_PAGE[1]
  const c = cellSize(perPage)
  return Array.from({ length: gc * gr }, (_, i) => ({
    x: PAGE.margin + (i % gc) * (c.w + PAGE.gutter),
    y: PAGE.margin + Math.floor(i / gc) * (c.h + PAGE.gutter),
  }))
}

export interface FormLayout {
  w: number // frame size: marker center to marker center
  h: number
  frameOrigin: Pt // top-left marker center, relative to the cell
  scale: number
  marker: number
  bubbleR: number
  orient: { x: number; y: number; size: number }
  id: Pt[][] // [digitColumn][0..9]
  items: { label: Pt; bubbles: Pt[] }[]
  capacity: number
}

export function layoutForm(f: SheetForm): FormLayout {
  const cell = cellSize(f.perPage)
  const head = headerLayout(f).height
  const idW = f.idDigits ? f.idDigits * P + ID_GAP : 0
  const colW = LABEL_W + f.choices * P + COL_GAP
  const maxCols = Math.max(0, Math.floor((cell.w - MARKER - 2 * IN - idW + COL_GAP) / colW))
  const maxRows = Math.max(0, Math.floor((cell.h - head - MARKER - Y0 - IN + P / 2) / P) + 1)
  const minRows = f.idDigits ? 10 : 1
  const capacity = maxRows >= minRows ? maxCols * maxRows : 0

  const n = Math.max(1, Math.min(f.items, capacity))
  // Grow to fill the cell (keeping room for the marking guide), trying taller arrangements too; the widest
  // arrangement at scale 1 always fits, so capacity is unchanged. Marker/frame ratio stays constant for the scanner.
  const size = (r: number) => {
    const w1 = 2 * IN + idW + Math.ceil(n / r) * colW - COL_GAP
    const h1 = Y0 + (r - 1) * P + P / 2 + IN
    return { r, w1, h1, fit: Math.min(MAX_SCALE, (cell.w - 2) / (w1 + MARKER), (cell.h - head - GUIDE_H) / (h1 + MARKER)) }
  }
  let best = size(Math.max(minRows, Math.ceil(n / Math.max(1, maxCols))))
  for (let r = best.r + 1; r <= n; r++) {
    const c = size(r)
    if (c.fit > best.fit) best = c
  }
  const { r: rows, w1, h1 } = best
  const s = Math.max(1, best.fit)
  const k = (v: number) => v * s

  const id = Array.from({ length: f.idDigits }, (_, c) =>
    Array.from({ length: 10 }, (_, d) => ({ x: k(IN + P * (c + 0.5)), y: k(Y0 + d * P) })),
  )
  const items = Array.from({ length: n }, (_, i) => {
    const x0 = IN + idW + Math.floor(i / rows) * colW
    const y = k(Y0 + (i % rows) * P)
    return {
      label: { x: k(x0 + LABEL_W - 1), y },
      bubbles: Array.from({ length: f.choices }, (_, c) => ({ x: k(x0 + LABEL_W + P * (c + 0.5)), y })),
    }
  })
  return {
    w: k(w1), h: k(h1), frameOrigin: { x: (cell.w - k(w1)) / 2, y: head + k(MARKER) / 2 }, id, items, capacity,
    scale: s, marker: k(MARKER), bubbleR: k(BUBBLE_R), orient: { x: k(ORIENT.x), y: 0, size: k(ORIENT.size) },
  }
}

export const choiceLetter = (c: number) => String.fromCharCode(65 + c)
