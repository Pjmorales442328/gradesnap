// Paints the detected frame and graded bubbles over the camera view (canvas in gray-image pixels).
import { project } from '../../lib/omr/homography'
import { isCorrect } from '../../lib/grade'
import type { SheetRead } from '../../lib/omr/readSheet'

export function drawOverlay(ctx: CanvasRenderingContext2D, read: SheetRead | null, key: number[], captured: boolean) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  if (!read) return
  const { h, layout } = read
  const ring = [{ x: 0, y: 0 }, { x: layout.w, y: 0 }, { x: layout.w, y: layout.h }, { x: 0, y: layout.h }].map((p) => project(h, p))
  ctx.lineWidth = 3
  ctx.strokeStyle = captured ? '#22c55e' : '#facc15'
  ctx.beginPath()
  ring.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
  ctx.closePath()
  ctx.stroke()

  layout.items.forEach((it, i) => {
    const ok = isCorrect(read.answers[i], key[i])
    it.bubbles.forEach((b, c) => {
      const p = project(h, b)
      const e = project(h, { x: b.x + layout.bubbleR, y: b.y })
      const r = Math.hypot(e.x - p.x, e.y - p.y)
      const marked = read.answers[i] & (1 << c)
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      if (marked) {
        ctx.fillStyle = ok ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)'
        ctx.fill()
      } else if (!ok && key[i] & (1 << c)) {
        ctx.strokeStyle = '#22c55e' // the right answer the student missed
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  })
}
