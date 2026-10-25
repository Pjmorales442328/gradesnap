// Short confirmation beep + vibration on capture.
let audio: AudioContext | undefined

export function beep() {
  navigator.vibrate?.(60)
  try {
    audio ??= new AudioContext()
    const osc = audio.createOscillator()
    osc.frequency.value = 1320
    osc.connect(audio.destination)
    osc.start()
    osc.stop(audio.currentTime + 0.08)
  } catch {
    // audio blocked until a user gesture; vibration already signalled
  }
}
