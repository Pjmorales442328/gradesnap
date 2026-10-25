// Roster text <-> students. One student per line: "ID, Name" or "ID<tab>Name" (pasted from Excel/Sheets).
import type { Student } from '../../types'
import { normalizeId } from '../scan/scanModel'

export function parseRoster(text: string): Student[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*(\d+)\s*[,\t;]\s*(.+?)\s*$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map((m) => ({ id: normalizeId(m[1]), name: m[2].replace(/^"|"$/g, '') }))
}

export const rosterText = (students: Student[]) => students.map((s) => `${s.id}, ${s.name}`).join('\n')
