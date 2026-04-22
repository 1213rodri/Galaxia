import gsap from 'gsap'

export class IntroScreen {
  constructor(audioManager) {
    this._audio = audioManager
    this._build()
    this._animate()
  }

  _build() {
    // ── Overlay ───────────────────────────────────────────────────────────────
    this._el = document.createElement('div')
    this._el.id = 'intro-screen'
    this._el.innerHTML = `
      <div class="intro-inner">
        <div class="intro-star" id="intro-star">✦</div>

        <p class="intro-body" id="intro-body">
          Espero te guste esta galaxia que aunque no pude<br>
          bajarte las estrellas, pude programarte una<br>
          especialmente para ti.
        </p>

        <div class="intro-divider" id="intro-divider"></div>

        <p class="intro-sign" id="intro-sign">
          Te amo Mar, con todo mi cariño,<br>
          <span class="intro-name">Rodri.</span>
        </p>
      </div>
    `
    document.body.appendChild(this._el)

    // Start audio on first interaction with the intro screen
    this._el.addEventListener('click', () => {
      if (this._audio) this._audio.start()
    }, { once: true })

    // ── Styles ────────────────────────────────────────────────────────────────
    const style = document.createElement('style')
    style.textContent = `
      #intro-screen {
        position: fixed; inset: 0;
        background: #000008;
        display: flex; align-items: center; justify-content: center;
        z-index: 200;
        pointer-events: all;
      }

      .intro-inner {
        text-align: center;
        color: #d8e8ff;
        font-family: 'Georgia', 'Times New Roman', serif;
        max-width: 520px;
        padding: 0 32px;
      }

      .intro-star {
        font-size: 22px;
        color: #ffd8a0;
        opacity: 0;
        margin-bottom: 32px;
        letter-spacing: 0.3em;
      }

      .intro-body {
        font-size: 17px;
        line-height: 1.95;
        color: #c8dcf8;
        opacity: 0;
        margin: 0 0 28px;
        font-style: italic;
        letter-spacing: 0.02em;
      }

      .intro-divider {
        width: 50px; height: 1px;
        background: rgba(150,180,255,0.3);
        margin: 0 auto 28px;
        opacity: 0;
      }

      .intro-sign {
        font-size: 16px;
        line-height: 1.8;
        color: #b0c8e8;
        opacity: 0;
        margin: 0;
        letter-spacing: 0.04em;
      }

      .intro-name {
        color: #ffd8a0;
        font-style: normal;
      }
    `
    document.head.appendChild(style)
  }

  _animate() {
    const star    = document.getElementById('intro-star')
    const body    = document.getElementById('intro-body')
    const divider = document.getElementById('intro-divider')
    const sign    = document.getElementById('intro-sign')
    const overlay = this._el

    // Staggered fade-in of elements
    gsap.to(star,    { opacity: 1, duration: 1.8, delay: 0.5,  ease: 'power2.inOut' })
    gsap.to(body,    { opacity: 1, duration: 2.2, delay: 2.0,  ease: 'power2.inOut' })
    gsap.to(divider, { opacity: 1, duration: 1.5, delay: 4.8,  ease: 'power2.inOut' })
    gsap.to(sign,    { opacity: 1, duration: 2.0, delay: 5.5,  ease: 'power2.inOut' })

    // After 10s: fade out the whole overlay
    gsap.to(overlay, {
      opacity:  0,
      duration: 2.5,
      delay:    10,
      ease:     'power1.inOut',
      onComplete: () => overlay.remove(),
    })
  }
}
