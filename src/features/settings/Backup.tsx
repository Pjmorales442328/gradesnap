// Backup page: download all data as JSON, restore from a file, show storage status.
import { useEffect, useState } from 'react'
import type { AppData } from '../../types'
import type { Update } from '../../hooks/useAppData'
import { download } from '../../lib/csv'
import { parseBackup, storageInfo, toBackup } from '../../services/backup'

const mb = (n: number) => `${(n / 1048576).toFixed(1)} MB`

export function Backup({ data, update }: { data: AppData; update: Update }) {
  const [info, setInfo] = useState<Awaited<ReturnType<typeof storageInfo>>>(null)
  const [msg, setMsg] = useState('')
  useEffect(() => { storageInfo().then(setInfo) }, [])

  const save = () => download(`gradesnap-backup-${new Date().toISOString().slice(0, 10)}.json`, toBackup(data), 'application/json')
  const restore = async (file?: File) => {
    if (!file) return
    try {
      const d = parseBackup(await file.text())
      if (!confirm(`Replace everything on this device with the backup (${d.quizzes.length} quizzes, ${d.classes.length} classes, ${d.results.length} results)?`)) return
      update(() => d)
      setMsg('Backup restored.')
    } catch (e) {
      setMsg((e as Error).message)
    }
  }

  return (
    <section className="form">
      <h2>Backup &amp; restore</h2>
      <p className="muted">Everything is stored only in this browser. Download a backup regularly and before clearing browser data or switching phones.</p>
      <p>{data.quizzes.length} quizzes · {data.classes.length} classes · {data.results.length} scanned papers</p>
      <button className="primary" onClick={save}>Download backup</button>
      <label>Restore from a backup file
        <input type="file" accept="application/json,.json" onChange={(e) => { restore(e.target.files?.[0]); e.target.value = '' }} />
      </label>
      {msg && <p className="callout">{msg}</p>}
      {info && <p className="muted">Storage: {mb(info.usage)} used of {mb(info.quota)} · {info.persisted ? 'protected from automatic clearing' : 'browser may clear it under low space'}</p>}
    </section>
  )
}
