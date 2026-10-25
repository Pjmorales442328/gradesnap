// 4-point perspective transform: maps sheet-frame mm coordinates onto image pixels.
import type { Pt } from '../sheetLayout'

export type Homography = number[] // 8 params, h[8] = 1 implied

export function homography(src: Pt[], dst: Pt[]): Homography {
  const A: number[][] = []
  src.forEach(({ x, y }, i) => {
    const { x: u, y: v } = dst[i]
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u])
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v])
  })
  // Gaussian elimination with partial pivoting on the 8x9 augmented matrix
  for (let c = 0; c < 8; c++) {
    let p = c
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r
    ;[A[c], A[p]] = [A[p], A[c]]
    if (Math.abs(A[c][c]) < 1e-12) throw new Error('Degenerate marker positions')
    for (let r = 0; r < 8; r++) {
      if (r === c) continue
      const f = A[r][c] / A[c][c]
      for (let k = c; k < 9; k++) A[r][k] -= f * A[c][k]
    }
  }
  return A.map((row, i) => row[8] / row[i])
}

export function project(h: Homography, { x, y }: Pt): Pt {
  const w = h[6] * x + h[7] * y + 1
  return { x: (h[0] * x + h[1] * y + h[2]) / w, y: (h[3] * x + h[4] * y + h[5]) / w }
}
