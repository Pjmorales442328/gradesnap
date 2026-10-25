// Renders a sheet through a skewed perspective, fills bubbles, and checks the reader recovers them.
import { expect, test } from 'vitest'
import { BUBBLE_R, FRAME, layoutSheet } from '../sheetLayout'
import { homography, project } from './homography'
import { readSheet } from './readSheet'
import type { SheetForm } from '../../types'

const form: SheetForm = { title: 'T', items: 50, choices: 5, idDigits: 4, fields: ['Name'] }

function render(answers: number[], id: string) {
  const width = 900, height = 1200
  const layout = layoutSheet(form)
  const frame = [{ x: 0, y: 0 }, { x: FRAME.w, y: 0 }, { x: 0, y: FRAME.h }, { x: FRAME.w, y: FRAME.h }]
  // Tilted, keystoned camera view
  const corners = [{ x: 120, y: 90 }, { x: 790, y: 130 }, { x: 80, y: 1100 }, { x: 830, y: 1070 }]
  const toMm = homography(corners, frame)
  const fills = [
    ...layout.items.flatMap((it, i) => it.bubbles.filter((_, c) => answers[i] & (1 << c))),
    ...[...id].map((d, c) => layout.id[c][+d]),
  ]
  const outlines = [...layout.items.flatMap((it) => it.bubbles), ...layout.id.flat()]
  const data = new Uint8Array(width * height)
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const p = project(toMm, { x, y })
      const m = FRAME.marker / 2
      const inMarker = frame.some((c) => Math.abs(p.x - c.x) < m && Math.abs(p.y - c.y) < m)
      const dist = (c: { x: number; y: number }) => Math.hypot(p.x - c.x, p.y - c.y)
      let v = 200 + ((x * 7 + y * 13) % 30) // paper with noise
      if (outlines.some((c) => Math.abs(dist(c) - BUBBLE_R) < 0.15)) v = 90
      if (fills.some((c) => dist(c) < BUBBLE_R * 0.9)) v = 60 // pencil, lighter than ink
      if (inMarker) v = 20
      data[y * width + x] = v
    }
  return { data, width, height }
}

test('reads answers and student id through perspective skew', () => {
  const answers = Array.from({ length: 50 }, (_, i) => (i % 7 === 3 ? 0 : 1 << i % 5))
  answers[10] = 0b00101 // double mark
  const read = readSheet(render(answers, '4071'), form)
  expect(read).not.toBeNull()
  expect(read!.studentId).toBe('4071')
  expect(read!.answers).toEqual(answers)
}, 60_000)
