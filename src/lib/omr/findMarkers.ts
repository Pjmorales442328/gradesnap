// Locates the four solid corner squares in a grayscale image (adaptive threshold + connected components).
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
    if (!touchesEdge && bw >= 6 && bh >= 6 && bw < w / 5 && bh / bw > 0.6 && bh / bw < 1.6 && area / (bw * bh) > 0.55)
      blobs.push({ cx: sx / area, cy: sy / area, area })
  }
  return blobs
}

// Returns marker centers [TL, TR, BL, BR] or null.
// ponytail: assumes sheet is roughly upright (<45deg); add an orientation mark if upside-down scans matter.
export function findMarkers(img: Gray): Pt[] | null {
  const blobs = squareBlobs(darkMask(img), img.width, img.height)
  if (blobs.length < 4) return null
  const maxArea = Math.max(...blobs.map((b) => b.area))
  const big = blobs.filter((b) => b.area > maxArea * 0.4)
  const pick = (score: (b: Blob) => number) => big.reduce((a, b) => (score(b) > score(a) ? b : a))
  const corners = [
    pick((b) => -(b.cx + b.cy)),
    pick((b) => b.cx - b.cy),
    pick((b) => b.cy - b.cx),
    pick((b) => b.cx + b.cy),
  ]
  if (new Set(corners).size < 4) return null
  const areas = corners.map((b) => b.area)
  if (Math.min(...areas) < Math.max(...areas) * 0.4) return null
  return corners.map((b) => ({ x: b.cx, y: b.cy }))
}
