// Renders a whole page of forms through a skewed perspective and checks the reader picks the aimed-at form.
import { expect, test } from 'vitest'
import { BUBBLE_R, MARKER, ORIENT, PAGE, cellOrigins, layoutForm, type Pt } from '../sheetLayout'
import { homography, project } from './homography'
import { readSheet } from './readSheet'
import type { SheetForm } from '../../types'

const form: SheetForm = { title: 'T', items: 30, choices: 4, idDigits: 4, fields: ['Name', 'Section'], instructions: 'Shade fully', perPage: 4 }
const L = layoutForm(form)
const sheets = cellOrigins(4).map((_, k) => ({
  id: `${k + 1}07${k}`,
  answers: Array.from({ length: 30 }, (_, i) => ((i + k) % 6 === 5 ? 0 : 1 << (i + k) % 4)),
}))
sheets[2].answers[7] = 0b0110 // double mark

// pageCorners: where the page's TL, TR, BL, BR land in the image
function render(pageCorners: Pt[], width = 1000, height = 1300) {
  const page = [{ x: 0, y: 0 }, { x: PAGE.w, y: 0 }, { x: 0, y: PAGE.h }, { x: PAGE.w, y: PAGE.h }]
  const toMm = homography(pageCorners, page)
  const origins = cellOrigins(4).map((o) => ({ x: o.x + L.frameOrigin.x, y: o.y + L.frameOrigin.y }))
  const outlines = [...L.items.flatMap((it) => it.bubbles), ...L.id.flat()]
  const data = new Uint8Array(width * height)
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const p = project(toMm, { x, y })
      let v = p.x < 0 || p.y < 0 || p.x > PAGE.w || p.y > PAGE.h ? 90 : 205 + ((x * 7 + y * 13) % 25) // desk vs paper
      origins.forEach((o, k) => {
        const q = { x: p.x - o.x, y: p.y - o.y }
        if (q.x < -MARKER || q.y < -MARKER || q.x > L.w + MARKER || q.y > L.h + MARKER) return
        const d = (c: Pt) => Math.hypot(q.x - c.x, q.y - c.y)
        const near = (c: Pt) => Math.abs(q.y - c.y) < 2.5
        if (outlines.some((c) => near(c) && Math.abs(d(c) - BUBBLE_R) < 0.15)) v = 100
        const fills = [
          ...L.items.flatMap((it, i) => it.bubbles.filter((_, c) => sheets[k].answers[i] & (1 << c))),
          ...[...sheets[k].id].map((dg, c) => L.id[c][+dg]),
        ]
        if (fills.some((c) => near(c) && d(c) < BUBBLE_R * 0.9)) v = 60 // pencil
        const sq = (c: Pt, s: number) => Math.abs(q.x - c.x) < s / 2 && Math.abs(q.y - c.y) < s / 2
        if ([{ x: 0, y: 0 }, { x: L.w, y: 0 }, { x: 0, y: L.h }, { x: L.w, y: L.h }].some((c) => sq(c, MARKER)) || sq(ORIENT, ORIENT.size)) v = 20
      })
      data[y * width + x] = v
    }
  return { data, width, height }
}

// Which form's frame lies under the image centre (the one the teacher is aiming at)
function aimed(pageCorners: Pt[], width = 1000, height = 1300) {
  const page = [{ x: 0, y: 0 }, { x: PAGE.w, y: 0 }, { x: 0, y: PAGE.h }, { x: PAGE.w, y: PAGE.h }]
  const c = project(homography(pageCorners, page), { x: width / 2, y: height / 2 })
  return cellOrigins(4).findIndex((o) => {
    const x = c.x - o.x - L.frameOrigin.x, y = c.y - o.y - L.frameOrigin.y
    return x > 0 && y > 0 && x < L.w && y < L.h
  })
}

const skewed = [{ x: -560, y: -900 }, { x: 760, y: -860 }, { x: -600, y: 1080 }, { x: 800, y: 1110 }]
const views: [string, Pt[]][] = [
  ['skewed, zoomed on bottom-right', skewed],
  ['upside-down', skewed.map((p) => ({ x: 1000 - p.x, y: 1300 - p.y }))], // same view rotated 180deg
  ['bottom-left (double mark)', [{ x: 300, y: -900 }, { x: 1620, y: -860 }, { x: 260, y: 1080 }, { x: 1660, y: 1110 }]],
]
for (const [name, corners] of views)
  test(`reads the aimed form from a full page of 4: ${name}`, () => {
    const k = aimed(corners)
    expect(k).toBeGreaterThanOrEqual(0)
    const read = readSheet(render(corners), form)
    expect(read?.studentId).toBe(sheets[k].id)
    expect(read?.answers).toEqual(sheets[k].answers)
  }, 120_000)

test('layout leaves room: 4 per page fits 30 items with a 4-digit ID', () => {
  expect(L.capacity).toBeGreaterThanOrEqual(30)
  expect(L.items.length).toBe(30)
})

test('rejects an image with no form', () => {
  expect(readSheet({ data: new Uint8Array(400 * 300).fill(200), width: 400, height: 300 }, form)).toBeNull()
})

test('aims cover the double-mark form', () => expect(views.map(([, c]) => aimed(c))).toContain(2))
