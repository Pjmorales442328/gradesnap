// Offline persistence in IndexedDB. Single document; sync layer can wrap this later.
import { get, set } from 'idb-keyval'
import type { AppData } from '../types'

const KEY = 'gradesnap-data'
export const EMPTY: AppData = { classes: [], quizzes: [], results: [] }

export async function loadData(): Promise<AppData> {
  try {
    return { ...EMPTY, ...(await get<AppData>(KEY)) }
  } catch (e) {
    console.error('Failed to load saved data', e)
    alert('Could not read saved data from this browser. Starting empty.')
    return EMPTY
  }
}

export async function saveData(data: AppData) {
  try {
    await set(KEY, data)
  } catch (e) {
    console.error('Failed to save data', e)
    alert('Saving failed — storage may be full or blocked. Export your results as CSV.')
  }
}
