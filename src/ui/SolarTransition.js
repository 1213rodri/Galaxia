/**
 * SolarTransition
 * Full-screen fade-to-black with a message, then calls onComplete.
 * Also used to fade back out to galaxy.
 */
export class SolarTransition {
  constructor() {
    this._el = document.createElement('div')
    Object.assign(this._el.style, {
      position:        'fixed',
      inset:           '0',
      background:      '#000',
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
      zIndex:          '100',
      opacity:         '0',
      pointerEvents:   'none',
      fontFamily:      '"Georgia", serif',
      color:           '#fff',
      transition:      'opacity 1.2s ease',
    })

    this._text = document.createElement('p')
    Object.assign(this._text.style, {
      fontSize:      'clamp(1rem, 2.5vw, 1.5rem)',
      letterSpacing: '0.08em',
      textAlign:     'center',
      margin:        '0',
      padding:       '0 2rem',
      opacity:       '0',
      transition:    'opacity 1s ease',
      maxWidth:      '600px',
      lineHeight:    '1.8',
      color:         '#d0d8ff',
    })

    this._el.appendChild(this._text)
    document.body.appendChild(this._el)
  }

  /**
   * Show the transition with a message, then call onComplete after a delay.
   * @param {string} message
   * @param {Function} onComplete
   */
  show(message, onComplete) {
    this._el.style.pointerEvents = 'all'
    this._text.textContent = message

    // Fade overlay in
    requestAnimationFrame(() => {
      this._el.style.opacity = '1'
    })

    // Fade text in after overlay is solid
    setTimeout(() => {
      this._text.style.opacity = '1'
    }, 1300)

    // Call onComplete after reading time
    setTimeout(() => {
      if (onComplete) onComplete()
    }, 4000)
  }

  /**
   * Fade the overlay out, then call onComplete.
   * @param {Function} onComplete
   */
  hide(onComplete) {
    this._text.style.opacity = '0'
    setTimeout(() => {
      this._el.style.opacity = '0'
      this._el.style.pointerEvents = 'none'
      if (onComplete) onComplete()
    }, 1400)
  }
}
