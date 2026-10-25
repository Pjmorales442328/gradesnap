// Bubble-sheet geometry in mm, relative to the corner-marker frame. Printing and scanning both use it.
import type { SheetForm } from '../types'

export interface Pt { x: number; y: number }

export const FRAME = { w: 180, h: 260, marker: 8 }
export const PAGE = { w: 210, h: 297, ox: 15, oy: 18 } // A4, frame origin offset
export const BUBBLE_R = 2.1
const PITCH = 5.5
const PAD = 6

export interface SheetLayout {
  fieldsY: number[]
  idTopLeft: Pt
  id: Pt[][] // [digitColumn][0..9]
  items: { label: Pt; bubbles: Pt[] }[]
  capacity: number
}

export function layoutSheet(form: SheetForm): SheetLayout {
  const right = FRAME.w - PAD
  const bottom = FRAME.h - PAD

  const fieldsY = form.fields.map((_, i) => 24 + i * 9)
  const idX = right - form.idDigits * PITCH
  const idY = 22
  const id = Array.from({ length: form.idDigits }, (_, c) =>
    Array.from({ length: 10 }, (_, d) => ({ x: idX + PITCH * (c + 0.5), y: idY + PITCH * d })),
  )

  const headerBottom = Math.max(
    form.idDigits ? idY + PITCH * 10 : 0,
    fieldsY.length ? fieldsY[fieldsY.length - 1] + 4 : 0,
    16,
  )
  const top = headerBottom + 6
  const colW = 8 + form.choices * PITCH + 4
  const cols = Math.floor((right - PAD) / colW)
  const maxRows = Math.floor((bottom - top) / PITCH)
  const rows = Math.min(maxRows, Math.max(10, Math.ceil(form.items / cols)))

  const items = Array.from({ length: Math.min(form.items, rows * cols) }, (_, i) => {
    const x0 = PAD + Math.floor(i / rows) * colW
    const y = top + (i % rows) * PITCH
    return {
      label: { x: x0 + 6, y },
      bubbles: Array.from({ length: form.choices }, (_, c) => ({ x: x0 + 8 + PITCH * (c + 0.5), y })),
    }
  })
  return { fieldsY, idTopLeft: { x: idX, y: idY }, id, items, capacity: cols * maxRows }
}

export const choiceLetter = (c: number) => String.fromCharCode(65 + c)
