// Opens the rear camera into a <video>; reports errors (permission, no HTTPS, no camera).
import { useEffect, useRef, useState } from 'react'

export function useCamera(active: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!active) return
    let stream: MediaStream | undefined
    let cancelled = false
    if (!navigator.mediaDevices?.getUserMedia) return
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop())
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          videoRef.current.play().catch(() => {})
        }
        setError('')
      })
      .catch((e: Error) => setError(`Camera unavailable: ${e.message}`))
    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [active])

  const unsupported = !navigator.mediaDevices?.getUserMedia
  return { videoRef, error: unsupported ? 'Camera needs HTTPS (or localhost). Use "Scan from photo" instead.' : error }
}
