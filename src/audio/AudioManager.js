const MUSIC_SRC  = '/music/rosalina.mp3'
const TARGET_VOL = 0.45
const FADE_STEPS = 80
const FADE_MS    = 4000  // total fade duration in ms

export class AudioManager {
  constructor() {
    this._audio = new Audio(MUSIC_SRC)
    this._audio.loop    = true
    this._audio.volume  = 0
    this._audio.preload = 'auto'
    this._started = false
  }

  // Call this from a direct user interaction (click handler)
  start() {
    if (this._started) return
    this._started = true

    this._audio.play()
      .then(() => this._fadeIn())
      .catch(err => console.warn('Audio blocked:', err))
  }

  _fadeIn() {
    const stepVol  = TARGET_VOL / FADE_STEPS
    const stepTime = FADE_MS / FADE_STEPS
    let step = 0

    const tick = setInterval(() => {
      step++
      this._audio.volume = Math.min(stepVol * step, TARGET_VOL)
      if (step >= FADE_STEPS) clearInterval(tick)
    }, stepTime)
  }
}
