// Draws a video frame or image onto a canvas (downscaled) and returns grayscale pixels.
import type { Gray } from './findMarkers'

export function toGray(src: CanvasImageSource, srcW: number, srcH: number, maxW = 1000): Gray {
  const scale = Math.min(1, maxW / srcW)
  const width = Math.round(srcW * scale), height = Math.round(srcH * scale)
  const canvas = Object.assign(document.createElement('canvas'), { width, height })
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(src, 0, 0, width, height)
  const rgba = ctx.getImageData(0, 0, width, height).data
  const data = new Uint8Array(width * height)
  for (let i = 0; i < data.length; i++) data[i] = (rgba[i * 4] * 77 + rgba[i * 4 + 1] * 150 + rgba[i * 4 + 2] * 29) >> 8
  return { data, width, height }
}
