// Live camera scanning (auto-captures once two consecutive frames agree) plus photo upload fallback.
import { useEffect, useRef, useState } from 'react'
import type { AppData, Quiz, Result } from '../../types'
import type { Update } from '../../hooks/useAppData'
import { readSheet, type SheetRead } from '../../lib/omr/readSheet'
import { toGray } from '../../lib/omr/toGray'
import { useCamera } from './useCamera'
import { makeResult, sameRead, upsertResult } from './scanModel'
import { ScanResult } from './ScanResult'

interface Props { quiz: Quiz; data: AppData; update: Update; save: (q: Quiz) => void }

export function Scanner({ quiz, data, update, save }: Props) {
  const [keyMode, setKeyMode] = useState(false)
  const [last, setLast] = useState<Result | null>(null)
  const [note, setNote] = useState('')
  const paused = !!last || !!note
  const { videoRef, error } = useCamera(!paused)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const prev = useRef<SheetRead | null>(null)

  const accept = (read: SheetRead) => {
    navigator.vibrate?.(80)
    prev.current = null
    if (keyMode) {
      save({ ...quiz, key: read.answers })
      setKeyMode(false)
      setNote('Answer key captured from sheet. Check it in the Key tab.')
      return
    }
    const r = makeResult(quiz, read)
    update((d) => upsertResult(d, r))
    setLast(r)
  }

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => {
      const v = videoRef.current
      if (!v || v.readyState < 2 || !v.videoWidth) return
      const gray = toGray(v, v.videoWidth, v.videoHeight)
      const read = readSheet(gray, quiz.form)
      const o = overlayRef.current
      if (o) {
        Object.assign(o, { width: gray.width, height: gray.height })
        const ctx = o.getContext('2d')!
        ctx.fillStyle = '#22c55e'
        read?.markers.forEach((m) => ctx.fillRect(m.x - 8, m.y - 8, 16, 16))
      }
      if (read && prev.current && sameRead(read, prev.current)) accept(read)
      else prev.current = read
    }, 300)
    return () => clearInterval(t)
  })

  const fromPhoto = async (file?: File) => {
    if (!file) return
    try {
      const img = await createImageBitmap(file)
      const read = readSheet(toGray(img, img.width, img.height, 1600), quiz.form)
      if (read) accept(read)
      else setNote('Could not find all 4 black corner squares. Retake with the whole sheet visible and flat.')
    } catch (e) {
      setNote(`Could not open image: ${(e as Error).message}`)
    }
  }

  const next = () => { setLast(null); setNote('') }

  return (
    <div className="scanner">
      <div className="row">
        <label className="toggle"><input type="checkbox" checked={keyMode} onChange={(e) => setKeyMode(e.target.checked)} /> Next scan sets the answer key</label>
        <label className="button">Scan from photo
          <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => { fromPhoto(e.target.files?.[0]); e.target.value = '' }} />
        </label>
      </div>
      {error && !paused && <p className="error">{error}</p>}
      {!paused && (
        <div className="viewfinder">
          <video ref={videoRef} playsInline muted />
          <canvas ref={overlayRef} />
          <p className="hint">Fit all 4 black squares in view. Hold steady.</p>
        </div>
      )}
      {note && <p className="card">{note}</p>}
      {last && <ScanResult result={last} quiz={quiz} data={data} />}
      {paused && <button className="primary" onClick={next}>Scan next sheet</button>}
    </div>
  )
}
