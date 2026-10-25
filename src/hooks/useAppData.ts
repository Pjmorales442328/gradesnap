// App-wide state backed by IndexedDB; every update is persisted.
import { useCallback, useEffect, useState } from 'react'
import type { AppData } from '../types'
import { EMPTY, loadData, saveData } from '../services/storage'

export type Update = (fn: (d: AppData) => AppData) => void

export function useAppData() {
  const [data, setData] = useState<AppData>(EMPTY)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadData().then((d) => {
      setData(d)
      setReady(true)
    })
  }, [])

  const update: Update = useCallback((fn) => {
    setData((d) => {
      const next = fn(d)
      saveData(next)
      return next
    })
  }, [])

  return { data, ready, update }
}
