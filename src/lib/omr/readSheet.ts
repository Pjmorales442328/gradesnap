// Reads student ID and answer bubbles from a grayscale photo containing one or more printed forms.
import { layoutForm, type FormLayout, type Pt } from '../sheetLayout'
import type { SheetForm } from '../../types'
import { findMarkers, type Gray } from './findMarkers'
import { homography, project, type Homography } from './homography'

// Calibration knob: share of the way from paper-white to marker-black that counts as a filled bubble.
export const FILL_THRESHOLD = 0.4

export interface SheetRead {
  studentId: string // '?' marks a column with several bubbles
  answers: number[] // bitmasks
  h: Homography // frame mm -> image px, for drawing overlays
  layout: FormLayout
}

function mean(img: Gray, h: Homography, c: Pt, r: number): number {
  let sum = 0, n = 0
  for (let dy = -r; dy <= r; dy += r / 3)
    for (let dx = -r; dx <= r; dx += r / 3) {
      if (dx * dx + dy * dy > r * r) continue
      const p = project(h, { x: c.x + dx, y: c.y + dy })
      const x = Math.round(p.x), y = Math.round(p.y)
      if (x < 0 || y < 0 || x >= img.width || y >= img.height) continue
      sum += img.data[y * img.width + x]
      n++
    }
  return n ? sum / n : 255
}

function readWith(img: Gray, h: Homography, layout: FormLayout): Omit<SheetRead, 'h' | 'layout'> | null {
  const { w: W, h: H, marker: MARKER, orient: ORIENT } = layout
  const corners = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: 0, y: H }, { x: W, y: H }]
  const r = layout.bubbleR * 0.6
  const black = corners.reduce((s, c) => s + mean(img, h, c, MARKER / 4), 0) / 4
  const idVals = layout.id.map((col) => col.map((c) => mean(img, h, c, r)))
  const itemVals = layout.items.map((it) => it.bubbles.map((c) => mean(img, h, c, r)))
  const all = [...idVals.flat(), ...itemVals.flat()].sort((a, b) => a - b)
  const white = all[Math.floor(all.length * 0.9)] ?? 255 // most bubbles are empty
  if (white - black < 30) return null // no contrast: not our sheet
  const dark = (v: number) => (white - v) / (white - black)

  // Orientation mark must be dark, and its 180-degree twin spot must be blank paper.
  if (dark(mean(img, h, ORIENT, ORIENT.size / 3)) < 0.6) return null
  if (dark(mean(img, h, { x: W - ORIENT.x, y: H - ORIENT.y }, ORIENT.size / 3)) > 0.3) return null

  // Frame edges between markers are blank paper; a wrong marker set usually lands on print.
  const edges = [{ x: W / 2, y: 0 }, { x: W / 2, y: H }, { x: 0, y: H / 2 }, { x: W, y: H / 2 }]
  if (edges.some((c) => dark(mean(img, h, c, 1)) > 0.3)) return null

  const filled = (v: number) => dark(v) > FILL_THRESHOLD
  const answers = itemVals.map((vals) => vals.reduce((m, v, c) => (filled(v) ? m | (1 << c) : m), 0))
  const studentId = idVals
    .map((col) => {
      const marked = col.flatMap((v, d) => (filled(v) ? [d] : []))
      return marked.length === 1 ? String(marked[0]) : marked.length ? '?' : '' // unused columns are fine
    })
    .join('')
  return { studentId, answers }
}

export function readSheet(img: Gray, form: SheetForm): SheetRead | null {
  const layout = layoutForm(form)
  const frame = [{ x: 0, y: 0 }, { x: layout.w, y: 0 }, { x: 0, y: layout.h }, { x: layout.w, y: layout.h }]
  const shape = { aspect: layout.w / layout.h, markerRatio: layout.marker / layout.w }
  for (const [tl, tr, bl, br] of findMarkers(img, shape)) {
    for (const dst of [[tl, tr, bl, br], [br, bl, tr, tl]]) { // upright, then upside-down
      const h = homography(frame, dst)
      const read = readWith(img, h, layout)
      if (read) return { ...read, h, layout }
    }
  }
  return null
}
