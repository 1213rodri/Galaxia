import { drawRodrigo, drawMar, drawAdolfo, drawBubble } from './PixelCharacters.js'
import { bgRoom, bgPhone, bgNight, bgSunset, bgGalaxy, GROUND_Y } from './SceneBackgrounds.js'

/**
 * StoryOverlay
 * Full-screen 2D canvas overlay for the pixel art story animation.
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

    // ── 2D canvas — scale by devicePixelRatio so text is crisp on HiDPI screens ──
    this.canvas = document.createElement('canvas')
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    // Logical pixel art resolution: 320×180. Physical: 320*dpr × 180*dpr.
    this.canvas.width  = 320 * dpr
    this.canvas.height = 180 * dpr
    Object.assign(this.canvas.style, {
      width:          'min(90vw, 160vh)',
      height:         'auto',
      imageRendering: 'pixelated',        // Chrome/Edge
      display:        'block',
    })
    this.ctx = this.canvas.getContext('2d')
    // Scale so all drawing code still uses 0–320 × 0–180 logical coordinates
    this.ctx.scale(dpr, dpr)
    this._dpr = dpr

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

  /** Clear canvas with background color (uses logical 320×180 coords) */
  _clear(color = '#0a0a12') {
    this.ctx.fillStyle = color
    this.ctx.fillRect(0, 0, 320, 180)
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

  /**
   * Preview all backgrounds + characters (cycle with click).
   * bgIndex: 0=room, 1=phone, 2=night, 3=sunset, 4=galaxy
   */
  drawTestFrame(bgIndex = 0) {
    const { ctx } = this
    const BG = [bgRoom, bgPhone, bgNight, bgSunset, bgGalaxy]
    BG[bgIndex % BG.length](ctx)

    const g = GROUND_Y
    const labels = ['bgRoom', 'bgPhone', 'bgNight', 'bgSunset', 'bgGalaxy']

    if (bgIndex % BG.length !== 1) {
      // Show characters on all backgrounds except the phone
      drawAdolfo(ctx, 70, g)
      drawRodrigo(ctx, 155, g, bgIndex === 2 ? 'phone' : 'stand')
      drawMar(ctx, 240, g, bgIndex === 3 ? 'happy' : 'stand')
    }

    // Label (which background)
    this._text(labels[bgIndex % BG.length], 160, 14, {
      color: '#aabbdd', size: 6, align: 'center',
    })
    this._text(`${bgIndex + 1}/5 — click para ver el siguiente`, 160, 175, {
      color: '#445566', size: 5, align: 'center',
    })

    this._bgIndex = bgIndex
  }
}
