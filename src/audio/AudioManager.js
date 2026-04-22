import gsap from 'gsap'

const MUSIC_SRC    = '/music/rosalina.mp3'
const TARGET_VOL   = 0.45   // max volume (0-1)
const FADE_IN_SEC  = 4      // seconds to fade from 0 to TARGET_VOL
const FADE_DELAY   = 1      // seconds before fade starts

export class AudioManager {
  constructor() {
    this._audio = new Audio(MUSIC_SRC)
    this._audio.loop   = true     // repeat forever
    this._audio.volume = 0
    this._audio.preload = 'auto'

    this._started = false
    this._tryAutoplay()
  }

  _tryAutoplay() {
    const play = () => {
      if (this._started) return
      this._started = true

      this._audio.play().then(() => {
        this._fadeIn()
      }).catch(() => {
        // Autoplay blocked — wait for first user interaction
        this._started = false
      })
    }

    // Try immediately
    play()

    // Fallback: start on first interaction
    const onInteract = () => {
      play()
      window.removeEventListener('click',    onInteract)
      window.removeEventListener('keydown',  onInteract)
      window.removeEventListener('touchstart', onInteract)
    }

    window.addEventListener('click',     onInteract)
    window.addEventListener('keydown',   onInteract)
    window.addEventListener('touchstart',onInteract)
  }

  _fadeIn() {
    gsap.to(this._audio, {
      volume:   TARGET_VOL,
      duration: FADE_IN_SEC,
      delay:    FADE_DELAY,
      ease:     'power2.inOut',
    })
  }
}
