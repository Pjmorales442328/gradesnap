// Reads student ID and answer bubbles from a grayscale photo of a printed sheet.
import { BUBBLE_R, FRAME, layoutSheet, type Pt } from '../sheetLayout'
import type { SheetForm } from '../../types'
import { findMarkers, type Gray } from './findMarkers'
import { homography, project, type Homography } from './homography'

// Calibration knob: share of the way from paper-white to marker-black that counts as a filled bubble.
export const FILL_THRESHOLD = 0.4

export interface SheetRead {
  studentId: string // '?' marks a column with several bubbles
  answers: number[] // bitmasks
  markers: Pt[]
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

export function readSheet(img: Gray, form: SheetForm): SheetRead | null {
  const markers = findMarkers(img)
  if (!markers) return null
  const frame = [{ x: 0, y: 0 }, { x: FRAME.w, y: 0 }, { x: 0, y: FRAME.h }, { x: FRAME.w, y: FRAME.h }]
  const h = homography(frame, markers)
  const layout = layoutSheet(form)
  const r = BUBBLE_R * 0.6

  const black = frame.reduce((s, c) => s + mean(img, h, c, FRAME.marker / 4), 0) / 4
  const idVals = layout.id.map((col) => col.map((c) => mean(img, h, c, r)))
  const itemVals = layout.items.map((it) => it.bubbles.map((c) => mean(img, h, c, r)))
  const all = [...idVals.flat(), ...itemVals.flat()].sort((a, b) => a - b)
  const white = all[Math.floor(all.length * 0.9)] ?? 255 // most bubbles are empty
  if (white - black < 30) return null // no contrast: probably not our sheet
  const filled = (v: number) => (white - v) / (white - black) > FILL_THRESHOLD

  const answers = itemVals.map((vals) => vals.reduce((m, v, c) => (filled(v) ? m | (1 << c) : m), 0))
  const studentId = idVals
    .map((col) => {
      const marked = col.flatMap((v, d) => (filled(v) ? [d] : []))
      return marked.length === 1 ? String(marked[0]) : marked.length ? '?' : '' // unused columns are fine
    })
    .join('')
  return { studentId, answers, markers }
}
