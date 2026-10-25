// Finds the 4 corner markers of one form in a grayscale image, even when several forms are in view.
import type { Pt } from '../sheetLayout'

export interface Gray { data: Uint8Array; width: number; height: number }

interface Blob { cx: number; cy: number; area: number }

// Bradley adaptive threshold: dark if pixel is 15% below its local mean. Survives uneven lighting.
function darkMask({ data, width: w, height: h }: Gray): Uint8Array {
  const integral = new Float64Array((w + 1) * (h + 1))
  for (let y = 0; y < h; y++) {
    let row = 0
    for (let x = 0; x < w; x++) {
      row += data[y * w + x]
      integral[(y + 1) * (w + 1) + x + 1] = integral[y * (w + 1) + x + 1] + row
    }
  }
  const s = Math.max(8, Math.floor(w / 8)) >> 1
  const mask = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - s), y1 = Math.min(h, y + s + 1)
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - s), x1 = Math.min(w, x + s + 1)
      const sum = integral[y1 * (w + 1) + x1] - integral[y0 * (w + 1) + x1] - integral[y1 * (w + 1) + x0] + integral[y0 * (w + 1) + x0]
      if (data[y * w + x] * (x1 - x0) * (y1 - y0) < sum * 0.85) mask[y * w + x] = 1
    }
  }
  return mask
}

function squareBlobs(mask: Uint8Array, w: number, h: number): Blob[] {
  const blobs: Blob[] = []
  const stack: number[] = []
  for (let start = 0; start < mask.length; start++) {
    if (mask[start] !== 1) continue
    mask[start] = 2
    stack.push(start)
    let area = 0, sx = 0, sy = 0, minX = w, maxX = 0, minY = h, maxY = 0
    while (stack.length) {
      const i = stack.pop()!
      const x = i % w, y = (i / w) | 0
      area++; sx += x; sy += y
      if (x < minX) minX = x; if (x > maxX) maxX = x
      if (y < minY) minY = y; if (y > maxY) maxY = y
      for (const n of [i - 1, i + 1, i - w, i + w]) {
        if (n >= 0 && n < mask.length && mask[n] === 1 && Math.abs((n % w) - x) <= 1) {
          mask[n] = 2
          stack.push(n)
        }
      }
    }
    const bw = maxX - minX + 1, bh = maxY - minY + 1
    const touchesEdge = minX === 0 || minY === 0 || maxX === w - 1 || maxY === h - 1
    // Solid, roughly square, not tiny, not huge. Rotation up to ~30deg keeps fill above 0.55.
    if (!touchesEdge && bw >= 5 && bh >= 5 && bw < w / 5 && bh / bw > 0.6 && bh / bw < 1.6 && area / (bw * bh) > 0.55)
      blobs.push({ cx: sx / area, cy: sy / area, area })
  }
  return blobs
}

export interface FrameShape { aspect: number; markerRatio: number } // frame w/h, marker size / frame w

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)
const cross = (o: Pt, a: Pt, b: Pt) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)

const similar = (a: number, b: number) => a < b * 1.4 && b < a * 1.4 // opposite sides under mild perspective
// Corner angle within ~25deg of square
const squareish = (prev: Pt, p: Pt, next: Pt) =>
  Math.abs((prev.x - p.x) * (next.x - p.x) + (prev.y - p.y) * (next.y - p.y)) < 0.42 * dist(prev, p) * dist(next, p)

// Point inside convex quad (TL,TR,BR,BL ring order) or within `slack` px outside its edges
const inside = (p: Pt, ring: Pt[], slack = 0) =>
  ring.every((a, i) => cross(a, ring[(i + 1) % 4], p) / dist(a, ring[(i + 1) % 4]) > -slack)

// Returns candidate frames as marker centers [TL, TR, BL, BR] in image order, best first.
// A frame needs the expected aspect, marker size proportional to frame, and no similar-sized blob inside it
// (rules out mixing markers from neighbouring forms). Ranked by: covers image centre, then marker size.
// The caller confirms with the orientation mark, so lookalikes (e.g. 4 filled bubbles) fall through.
export function findMarkers(img: Gray, shape: FrameShape, max = 6): Pt[][] {
  const blobs = squareBlobs(darkMask(img), img.width, img.height)
    .sort((a, b) => b.area - a.area)
    .slice(0, 16) // ponytail: 16 largest -> 1820 combos; raise if pages with >4 forms are scanned whole
  const pts = blobs.map((b) => ({ x: b.cx, y: b.cy }))
  const center = { x: img.width / 2, y: img.height / 2 }
  const found: { quad: Pt[]; score: number }[] = []

  const n = blobs.length
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) for (let d = c + 1; d < n; d++) {
    const idx = [a, b, c, d]
    const areas = idx.map((i) => blobs[i].area)
    const minA = Math.min(...areas)
    if (minA * 2.5 < Math.max(...areas)) continue
    const byY = idx.map((i) => pts[i]).sort((p, q) => p.y - q.y)
    const [tl, tr] = byY.slice(0, 2).sort((p, q) => p.x - q.x)
    const [bl, br] = byY.slice(2).sort((p, q) => p.x - q.x)
    const ring = [tl, tr, br, bl]
    if (!ring.every((p, i) => cross(p, ring[(i + 1) % 4], ring[(i + 2) % 4]) > 0)) continue // convex, clockwise
    const [top, bottom, left, right] = [dist(tl, tr), dist(bl, br), dist(tl, bl), dist(tr, br)]
    if (!similar(top, bottom) || !similar(left, right) || !ring.every((p, i) => squareish(ring[(i + 3) % 4], p, ring[(i + 1) % 4]))) continue
    const wide = (top + bottom) / 2
    const tall = (left + right) / 2
    const aspect = wide / tall / shape.aspect
    if (aspect < 0.75 || aspect > 1.33) continue
    const meanA = areas.reduce((s, v) => s + v, 0) / 4
    const marker = Math.sqrt(meanA) / wide / shape.markerRatio
    if (marker < 0.5 || marker > 2) continue
    if (blobs.some((bl2, i) => !idx.includes(i) && bl2.area > minA * 0.5 && inside(pts[i], ring, Math.sqrt(minA)))) continue
    found.push({ quad: [tl, tr, bl, br], score: (inside(center, ring) ? 1e12 : 0) + meanA * 1e4 + wide })
  }
  return found.sort((p, q) => q.score - p.score).slice(0, max).map((f) => f.quad)
}
