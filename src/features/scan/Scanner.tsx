// Continuous camera scanning: captures when two frames agree, skips the paper just captured, plus photo upload.
import { useEffect, useRef, useState } from 'react'
import type { AppData, Quiz, Result } from '../../types'
import type { Update } from '../../hooks/useAppData'
import { readSheet, type SheetRead } from '../../lib/omr/readSheet'
import { toGray } from '../../lib/omr/toGray'
import { layoutForm } from '../../lib/sheetLayout'
import { beep } from '../../lib/beep'
import { useCamera } from './useCamera'
import { makeResult, sameRead, upsertResult } from './scanModel'
import { drawOverlay } from './drawOverlay'
import { ScanResult } from './ScanResult'

interface Props { quiz: Quiz; data: AppData; update: Update; save: (q: Quiz) => void }

export function Scanner({ quiz, data, update, save }: Props) {
  const [keyMode, setKeyMode] = useState(false)
  const [last, setLast] = useState<Result | null>(null)
  const [note, setNote] = useState('')
  const [count, setCount] = useState(0)
  const { videoRef, error } = useCamera(true)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const prev = useRef<SheetRead | null>(null)
  const captured = useRef<SheetRead | null>(null)
  const fits = layoutForm(quiz.form).capacity >= quiz.form.items

  const accept = (read: SheetRead) => {
    beep()
    captured.current = read
    if (keyMode) {
      save({ ...quiz, key: read.answers })
      setKeyMode(false)
      setLast(null)
      setNote('Answer key set from this sheet. Check it in the Key tab.')
      return
    }
    const r = makeResult(quiz, read)
    update((d) => upsertResult(d, r))
    setLast(r)
    setNote('')
    setCount((n) => n + 1)
  }

  useEffect(() => {
    const t = setInterval(() => {
      const v = videoRef.current
      if (!v || v.readyState < 2 || !v.videoWidth) return
      const gray = toGray(v, v.videoWidth, v.videoHeight)
      const read = readSheet(gray, quiz.form)
      const done = !!read && !!captured.current && sameRead(read, captured.current)
      const o = overlayRef.current
      if (o) {
        if (o.width !== gray.width) Object.assign(o, { width: gray.width, height: gray.height })
        drawOverlay(o.getContext('2d')!, read, quiz.key, done)
      }
      if (read && !done && prev.current && sameRead(read, prev.current)) accept(read)
      prev.current = read
    }, 250)
    return () => clearInterval(t)
  })

  const fromPhoto = async (file?: File) => {
    if (!file) return
    try {
      const img = await createImageBitmap(file)
      const read = readSheet(toGray(img, img.width, img.height, 1600), quiz.form)
      if (read) accept(read)
      else setNote('No form found. Keep all 4 corner squares and the small square beside the top-left one visible, sheet flat.')
    } catch (e) {
      setNote(`Could not open image: ${(e as Error).message}`)
    }
  }

  if (!fits) return <p className="error">This form doesn't fit its page layout. Fix it in the Sheet tab.</p>

  return (
    <div className="scanner">
      <div className="row">
        <label className="toggle"><input type="checkbox" checked={keyMode} onChange={(e) => setKeyMode(e.target.checked)} /> Next scan sets the answer key</label>
        <label className="button">Scan from photo
          <input type="file" accept="image/*" hidden onChange={(e) => { fromPhoto(e.target.files?.[0]); e.target.value = '' }} />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="viewfinder">
        <video ref={videoRef} playsInline muted />
        <canvas ref={overlayRef} />
        {last && <div className="banner">{bannerText(last, quiz, data)}</div>}
        <p className="hint">{keyMode ? 'Scan the answer key sheet' : `Aim at one form · ${count} scanned this session`}</p>
      </div>
      {note && <p className="card">{note}</p>}
      {last && <ScanResult result={last} quiz={quiz} data={data} />}
    </div>
  )
}

function bannerText(r: Result, quiz: Quiz, data: AppData) {
  const name = data.classes.find((c) => c.id === quiz.classId)?.students.find((s) => s.id === r.studentId)?.name
  return `${name ?? (r.studentId ? `ID ${r.studentId}` : 'No ID')} · ${r.score}/${quiz.form.items}`
}
