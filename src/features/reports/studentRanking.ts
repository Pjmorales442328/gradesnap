// Ranks papers by score, highest first; equal scores share a rank (1, 2, 2, 4).
import type { Result } from '../../types'

export function rankStudents(rs: Result[]) {
  const sorted = [...rs].sort((a, b) => b.score - a.score || a.studentId.localeCompare(b.studentId))
  const ranks: number[] = []
  sorted.forEach((r, i) => ranks.push(i && r.score === sorted[i - 1].score ? ranks[i - 1] : i + 1))
  return sorted.map((r, i) => ({ r, rank: ranks[i] }))
}
