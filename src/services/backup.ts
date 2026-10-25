// Backup file format: whole AppData as JSON, validated on restore so a bad file can't wipe data.
import type { AppData } from '../types'

const isArr = (v: unknown, key: string) => Array.isArray((v as Record<string, unknown>)[key])

export const toBackup = (data: AppData) => JSON.stringify({ app: 'gradesnap', version: 1, savedAt: Date.now(), data })

export function parseBackup(text: string): AppData {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Not a GradeSnap backup (file is not JSON).')
  }
  const data = (parsed as { data?: unknown })?.data
  if ((parsed as { app?: string })?.app !== 'gradesnap' || !data || !['classes', 'quizzes', 'results'].every((k) => isArr(data, k)))
    throw new Error('Not a GradeSnap backup file.')
  const d = data as AppData
  if (!d.quizzes.every((q) => q?.id && q.form && Array.isArray(q.key)) || !d.results.every((r) => r?.quizId && Array.isArray(r.answers)))
    throw new Error('Backup file is damaged (quizzes or results are malformed).')
  return d
}

// Ask the browser not to evict our IndexedDB under storage pressure; report usage.
export async function storageInfo() {
  try {
    const persisted = (await navigator.storage?.persist?.()) ?? false
    const { usage = 0, quota = 0 } = (await navigator.storage?.estimate?.()) ?? {}
    return { persisted, usage, quota }
  } catch (e) {
    console.error('Storage info unavailable', e)
    return null
  }
}
