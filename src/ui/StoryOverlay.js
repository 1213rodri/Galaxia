/**
 * StoryOverlay
 * Full-screen 2D canvas overlay for the pixel art story animation.
 * Part 1: base container — show/hide with fade, skip button, canvas ready.
 */
export class StoryOverlay {
  constructor() {
    // ── Outer wrapper ──────────────────────────────────────────────────────────
    this._el = document.createElement('div')
    Object.assign(this._el.style, {
      position:       'fixed',
      inset:          '0',
      background:     '#0a0a12',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      zIndex:         '200',
      opacity:        '0',
      pointerEvents:  'none',
      transition:     'opacity 0.8s ease',
    })

    // ── 2D canvas (pixel art resolution scaled up) ─────────────────────────────
    this.canvas = document.createElement('canvas')
    // Internal resolution: 320×180 (16:9 pixel art)
    this.canvas.width  = 320
    this.canvas.height = 180
    Object.assign(this.canvas.style, {
      width:           'min(90vw, 160vh)',   // keep 16:9
      height:          'auto',
      imageRendering:  'pixelated',          // crisp pixel art scaling
      display:         'block',
    })
    this.ctx = this.canvas.getContext('2d')

    // ── Skip button ────────────────────────────────────────────────────────────
    this._skip = document.createElement('button')
    this._skip.textContent = '✕ saltar'
    Object.assign(this._skip.style, {
      position:    'fixed',
      top:         '1.2rem',
      right:       '1.4rem',
      background:  'rgba(255,255,255,0.08)',
      border:      '1px solid rgba(255,255,255,0.2)',
      color:       '#ccc',
      fontFamily:  '"Courier New", monospace',
      fontSize:    '0.75rem',
      letterSpacing: '0.1em',
      padding:     '0.4rem 0.9rem',
      borderRadius:'4px',
      cursor:      'pointer',
      zIndex:      '201',
      opacity:     '0',
      pointerEvents: 'none',
      transition:  'opacity 0.4s ease, background 0.2s',
    })
    this._skip.addEventListener('mouseenter', () => {
      this._skip.style.background = 'rgba(255,255,255,0.18)'
    })
    this._skip.addEventListener('mouseleave', () => {
      this._skip.style.background = 'rgba(255,255,255,0.08)'
    })
    this._skip.addEventListener('click', () => this.hide())

    // ── Click canvas to advance ────────────────────────────────────────────────
    this.canvas.style.cursor = 'pointer'
    this.canvas.addEventListener('click', () => {
      if (this._onAdvance) this._onAdvance()
    })

    // ── Mount ──────────────────────────────────────────────────────────────────
    this._el.appendChild(this.canvas)
    document.body.appendChild(this._el)
    document.body.appendChild(this._skip)

    // ── Callbacks ──────────────────────────────────────────────────────────────
    this._onAdvance = null   // called on canvas click (advance scene)
    this.onClose    = null   // called when fully hidden
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  /** Show the overlay, draw first frame, then call onReady */
  show(onReady) {
    this._el.style.pointerEvents  = 'all'
    this._el.style.opacity        = '1'

    setTimeout(() => {
      this._skip.style.opacity      = '1'
      this._skip.style.pointerEvents = 'all'
      if (onReady) onReady()
    }, 500)
  }

  /** Fade out and call onClose */
  hide() {
    this._el.style.opacity         = '0'
    this._el.style.pointerEvents   = 'none'
    this._skip.style.opacity       = '0'
    this._skip.style.pointerEvents = 'none'
    setTimeout(() => {
      this._clear()
      if (this.onClose) this.onClose()
    }, 900)
  }

  /** Set the callback for canvas click (advance story) */
  onAdvance(fn) {
    this._onAdvance = fn
  }

  // ── Drawing helpers (used by future scene layers) ─────────────────────────

  /** Clear canvas with background color */
  _clear(color = '#0a0a12') {
    const { ctx } = this
    ctx.fillStyle = color
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * Draw a pixel-art rectangle (1 unit = 1 canvas pixel).
   * @param {number} x @param {number} y @param {number} w @param {number} h @param {string} color
   */
  _rect(x, y, w, h, color) {
    this.ctx.fillStyle = color
    this.ctx.fillRect(x, y, w, h)
  }

  /**
   * Draw pixel-art text using ctx.font.
   * @param {string} text @param {number} x @param {number} y @param {object} opts
   */
  _text(text, x, y, { color = '#fff', size = 5, align = 'left' } = {}) {
    const { ctx } = this
    ctx.fillStyle  = color
    ctx.font       = `${size}px "Courier New", monospace`
    ctx.textAlign  = align
    ctx.fillText(text, x, y)
  }

  /** Draw a test frame so we can verify the overlay works */
  drawTestFrame() {
    this._clear('#0a0a12')
    // Starry background dots
    const stars = [
      [10,8],[30,20],[55,5],[80,15],[100,30],[130,10],[160,22],
      [200,8],[230,18],[260,5],[290,12],[310,25],[45,40],[170,35],
    ]
    stars.forEach(([x, y]) => this._rect(x, y, 1, 1, '#ffffff'))

    // Ground
    this._rect(0, 155, 320, 25, '#1a2a1a')
    // Grass highlights
    for (let i = 0; i < 320; i += 6) {
      this._rect(i, 154, 1, 2, '#2a4a2a')
    }

    // Label
    this._text('Bienvenida a nuestro mundo', 160, 100, {
      color: '#d0d8ff', size: 8, align: 'center'
    })
    this._text('[ haz click para continuar ]', 160, 170, {
      color: '#667799', size: 5, align: 'center'
    })
  }
}
