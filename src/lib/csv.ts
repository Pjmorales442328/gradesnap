// CSV building and browser download.

export function toCsv(rows: (string | number)[][]): string {
  return rows.map((r) => r.map((v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v)).join(',')).join('\n')
}

export function download(filename: string, text: string, type = 'text/csv') {
  const bom = type === 'text/csv' ? '﻿' : '' // BOM so Excel reads UTF-8
  const url = URL.createObjectURL(new Blob([bom + text], { type }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}
