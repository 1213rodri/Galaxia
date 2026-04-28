/**
 * StoryPlayer.js
 * Orchestrates the 7-scene pixel art story of how Rodrigo and Mar met.
 *
 * Usage:
 *   const player = new StoryPlayer(storyOverlay)
 *   player.play()
 *
 * Draw order per frame:
 *   1. Background (full canvas)
 *   2. Narration box (bottom strip, semi-transparent)
 *   3. Characters + effects (drawn on top of narration box)
 */

import { drawRodrigo, drawMar, drawAdolfo, drawBubble, CHAR_HEIGHT } from './PixelCharacters.js'
import {
  bgRoom, bgPhone, bgNight, bgSunset, bgGalaxy,
  drawChatMessage, GROUND_Y,
} from './SceneBackgrounds.js'

const G   = GROUND_Y   // 148  — canvas y of ground / character feet
const CPS = 26         // characters per second for typewriter

// ── Pixel art heart (7×6 art pixels, 1px per art pixel) ─────────────────────

function drawHeart(ctx, cx, cy, color) {
  const rows = ['.HH.HH.', 'HHHHHHH', 'HHHHHHH', '.HHHHH.', '..HHH..', '...H...']
  rows.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) {
      if (row[dx] === 'H') {
        ctx.fillStyle = color
        ctx.fillRect(Math.round(cx - 3 + dx), Math.round(cy + dy), 1, 1)
      }
    }
  })
}

// ── Narration box (bottom strip) ─────────────────────────────────────────────

/**
 * Draw semi-transparent narration bar at bottom of canvas.
 * Text types out at CPS chars/second. hint blinks when player can advance.
 */
function drawNarration(ctx, text, t, hint) {
  const by = 154, bh = 26, W = 320

  ctx.globalAlpha = 0.92
  ctx.fillStyle   = '#030308'
  ctx.fillRect(0, by, W, bh)
  ctx.globalAlpha = 1

  // Top border
  ctx.fillStyle = '#243050'
  ctx.fillRect(0, by, W, 1)

  // Typewriter text
  const visible = text.slice(0, Math.min(text.length, Math.floor(t * CPS)))
  ctx.fillStyle  = '#ccd8f4'
  ctx.font       = '6px "Courier New", monospace'
  ctx.textAlign  = 'left'

  // Simple word-wrap into two lines
  const words = visible.split(' ')
  let l1 = '', l2 = '', on2 = false
  words.forEach(w => {
    if (on2) {
      l2 += (l2 ? ' ' : '') + w
    } else {
      const test = l1 + (l1 ? ' ' : '') + w
      if (ctx.measureText(test).width > 296) { on2 = true; l2 = w }
      else l1 = test
    }
  })
  ctx.fillText(l1, 10, by + 11)
  if (l2) ctx.fillText(l2, 10, by + 21)

  // Advance hint: bright when ready, dim pulsing "..." when waiting
  if (hint) {
    // Ready: bright blinking text
    const blink = Math.floor(t * 1.8) % 2 === 0
    ctx.fillStyle = blink ? '#7799cc' : '#3a4a66'
    ctx.font      = '5px "Courier New", monospace'
    ctx.textAlign = 'right'
    ctx.fillText(hint, 314, by + 22)
  } else if (text.length > 0) {
    // Still waiting: dim pulsing dots
    const dots = '.'.repeat(1 + Math.floor(t * 2) % 3)
    ctx.fillStyle = `rgba(60,80,110,${0.3 + 0.2 * Math.abs(Math.sin(t * 2))})`
    ctx.font      = '6px "Courier New", monospace'
    ctx.textAlign = 'right'
    ctx.fillText(dots, 314, by + 22)
  }
}

// ── Floating hearts helper ────────────────────────────────────────────────────

/**
 * @param {Array} defs  [{x, baseY, rise, cycle, delay}]
 */
function floatHearts(ctx, t, defs, color) {
  defs.forEach(h => {
    const elapsed = Math.max(0, t - h.delay)
    const cycleT  = elapsed % h.cycle
    const y       = h.baseY - cycleT * h.rise
    const fadeIn  = h.cycle * 0.35
    const fadeOut = h.cycle * 0.28
    const alpha   = cycleT < fadeIn
      ? Math.min(1, cycleT / fadeIn * 2)
      : cycleT > h.cycle - fadeOut
        ? Math.max(0, (h.cycle - cycleT) / fadeOut)
        : 1
    ctx.globalAlpha = alpha
    drawHeart(ctx, h.x, y, color)
    ctx.globalAlpha = 1
  })
}

// ── Scene definitions ─────────────────────────────────────────────────────────

function buildScenes() {
  return [

    // ── 0. Welcome title card ─────────────────────────────────────────────────
    {
      bg:          bgGalaxy,
      narration:   '',
      minT:        2.6,
      autoAdvance: 2.8,    // auto-advance after this many seconds
      draw(ctx, t) {
        // Title fades in
        const titleAlpha = Math.min(1, t * 1.2)
        ctx.globalAlpha  = titleAlpha
        ctx.fillStyle    = '#f0eaff'
        ctx.font         = '10px "Courier New", monospace'
        ctx.textAlign    = 'center'
        ctx.fillText('Bienvenida a nuestro mundo', 160, 78)
        ctx.globalAlpha  = 1

        // Subtitle appears at t > 0.9
        if (t > 0.9) {
          const subAlpha = Math.min(1, (t - 0.9) * 1.4)
          ctx.globalAlpha = subAlpha
          ctx.fillStyle   = '#9988cc'
          ctx.font        = '6px "Courier New", monospace'
          ctx.fillText('nuestra historia, para ti  ♥', 160, 96)
          ctx.globalAlpha = 1
        }
      },
    },

    // ── 1. Adolfo tells Rodrigo about Mar ────────────────────────────────────
    {
      bg:       bgRoom,
      narration: 'Todo empezó con nuestro amigo Adolfo...',
      minT:     2.8,
      draw(ctx, t) {
        // Adolfo walks in from the left
        const ax = Math.min(72, -28 + (t / 1.1) * 100)
        drawAdolfo(ctx, ax, G)
        // Rodrigo on the right
        drawRodrigo(ctx, 240, G, 'stand')
        // Bubbles
        if (t > 1.5)
          drawBubble(ctx, ax + 10, G - CHAR_HEIGHT.adolfo + 4, 'Oye bro...', 'right')
        if (t > 2.8)
          drawBubble(ctx, ax + 10, G - CHAR_HEIGHT.adolfo - 16, 'hay una chica que debes conocer', 'right')
      },
    },

    // ── 2. Adolfo gives Rodrigo Mar's contact ────────────────────────────────
    {
      bg:       bgRoom,
      narration: 'Me habló de ti y me pasó tu contacto.',
      minT:     2.2,
      draw(ctx, t) {
        drawAdolfo(ctx, 64, G)
        drawRodrigo(ctx, 192, G, 'phone')
        if (t > 0.8)
          drawBubble(ctx, 64 + 10, G - CHAR_HEIGHT.adolfo + 4, 'Se llama Mar :)', 'right')
        if (t > 2.1)
          drawBubble(ctx, 192 + 10, G - CHAR_HEIGHT.rodrigo + 4, '¿Quién es...?', 'right')
      },
    },

    // ── 3. First text messages ───────────────────────────────────────────────
    {
      bg:       bgPhone,
      narration: 'Así que te mandé un mensaje...',
      minT:     4.8,
      draw(ctx, t) {
        if (t > 0.8)  drawChatMessage(ctx, 'Hola :)',            'right', 54)
        if (t > 2.1)  drawChatMessage(ctx, 'Hola! quién eres?',  'left',  72)
        if (t > 3.3)  drawChatMessage(ctx, 'Soy Rodrigo',        'right', 90)
        if (t > 4.5)  drawChatMessage(ctx, 'Ah hola Rodrigo! :)','left', 108)
      },
    },

    // ── 4. Getting to know each other ────────────────────────────────────────
    {
      bg:       bgNight,
      narration: 'Empezamos a hablar, a conocernos...',
      minT:     3.8,
      draw(ctx, t) {
        drawRodrigo(ctx, 98,  G, 'stand')
        drawMar(ctx,     222, G, 'stand')
        if (t > 0.9)
          drawBubble(ctx, 98 + 10,  G - CHAR_HEIGHT.rodrigo + 4,  '¿Qué te gusta?',    'right')
        if (t > 2.3)
          drawBubble(ctx, 222 - 10, G - CHAR_HEIGHT.mar     + 4,  'La música, el cine...','left')
        if (t > 3.6)
          drawBubble(ctx, 98 + 10,  G - CHAR_HEIGHT.rodrigo - 15, '¡Igual que yo!',    'right')
      },
    },

    // ── 5. Same wavelength — hearts ──────────────────────────────────────────
    {
      bg:       bgNight,
      narration: 'Descubrimos que pensábamos y sentíamos igual.',
      minT:     2.5,
      draw(ctx, t) {
        drawRodrigo(ctx, 118, G, 'happy')
        drawMar(ctx,     202, G, 'happy')
        floatHearts(ctx, t, [
          { x: 152, baseY: 118, rise: 22, cycle: 2.3, delay: 0.0 },
          { x: 161, baseY: 122, rise: 26, cycle: 2.5, delay: 0.5 },
          { x: 144, baseY: 115, rise: 20, cycle: 2.1, delay: 0.9 },
          { x: 169, baseY: 120, rise: 24, cycle: 2.7, delay: 1.4 },
          { x: 157, baseY: 125, rise: 28, cycle: 2.2, delay: 0.3 },
        ], '#ff5577')
      },
    },

    // ── 6. First kiss ────────────────────────────────────────────────────────
    {
      bg:       bgSunset,
      narration: 'Y llegó nuestro primer beso...',
      minT:     3.2,
      draw(ctx, t) {
        // Characters drift toward each other
        const rX = 130 + Math.min(13, t * 13)
        const mX = 190 - Math.min(13, t * 13)
        drawRodrigo(ctx, rX, G, 'stand')
        drawMar(ctx,     mX, G, 'stand')

        // Big heart (appears at t>1.3, 2×2 pixel art pixel render)
        if (t > 1.3) {
          const a = Math.min(1, (t - 1.3) * 1.4)
          ctx.globalAlpha = a
          for (let dy = 0; dy <= 1; dy++)
            for (let dx = 0; dx <= 1; dx++)
              drawHeart(ctx, 157 + dx, 104 + dy, '#ff2255')
          ctx.globalAlpha = 1
        }

        // Rotating sparkle dots
        if (t > 0.9) {
          const st = t - 0.9
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + st * 1.4
            const dist  = 22 + Math.sin(st * 2.2 + i) * 5
            const sx    = 160 + Math.cos(angle) * dist
            const sy    = 118 + Math.sin(angle) * dist * 0.55
            const a     = 0.35 + 0.65 * Math.abs(Math.sin(st * 2.8 + i * 0.95))
            ctx.globalAlpha = a
            ctx.fillStyle   = i % 2 === 0 ? '#ffddaa' : '#ffaabb'
            ctx.fillRect(Math.round(sx), Math.round(sy), 2, 2)
          }
          ctx.globalAlpha = 1
        }
      },
    },

    // ── 7. Everything is perfect ─────────────────────────────────────────────
    {
      bg:       bgGalaxy,
      narration: 'Desde entonces, todo ha sido perfecto. ♥',
      minT:     3.5,
      isLast:   true,
      draw(ctx, t) {
        drawRodrigo(ctx, 120, G, 'happy')
        drawMar(ctx,     200, G, 'happy')
        floatHearts(ctx, t, [
          { x: 156, baseY: 128, rise: 18, cycle: 3.4, delay: 0.4 },
          { x: 165, baseY: 123, rise: 22, cycle: 3.7, delay: 1.1 },
          { x: 147, baseY: 130, rise: 16, cycle: 3.2, delay: 2.0 },
          { x: 161, baseY: 126, rise: 20, cycle: 3.5, delay: 0.0 },
        ], '#dd4499')

        // Dedication text fades in after narration finishes
        if (t > 3.0) {
          const a = Math.min(1, (t - 3.0) * 1.3)
          ctx.globalAlpha = a
          ctx.fillStyle   = '#f0e0ff'
          ctx.font        = '7px "Courier New", monospace'
          ctx.textAlign   = 'center'
          ctx.fillText('Esta galaxia es para ti, Mar  ♥', 160, 44)
          ctx.globalAlpha = 1
        }
      },
    },

  ]
}

// ── StoryPlayer ───────────────────────────────────────────────────────────────

export class StoryPlayer {
  constructor(overlay) {
    this._overlay    = overlay
    this._ctx        = overlay.ctx
    this._scenes     = buildScenes()
    this._idx        = 0
    this._startT     = 0
    this._running    = false
    this._raf        = null
    this._canAdvance = false
  }

  /** True while the story is showing */
  get isActive() { return this._running }

  /** Start the story from scene 0 */
  play() {
    this._running = true
    this._overlay.show(() => {
      this._enterScene(0)
      this._loop()
    })
    this._overlay.onAdvance(() => {
      if (this._canAdvance) this._nextScene()
    })
    this._overlay.onClose = () => this._stop()
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  _enterScene(idx) {
    this._idx        = idx
    this._startT     = performance.now()
    this._canAdvance = false
    const scene = this._scenes[idx]
    const minT  = scene.minT ?? 2.0
    setTimeout(() => {
      if (this._idx === idx) this._canAdvance = true
    }, minT * 1000)
    // Auto-advance scenes (e.g. welcome title card)
    if (scene.autoAdvance) {
      setTimeout(() => {
        if (this._idx === idx) this._nextScene()
      }, scene.autoAdvance * 1000)
    }
  }

  _nextScene() {
    const next = this._idx + 1
    if (next >= this._scenes.length) {
      this._overlay.hide()
      return
    }
    this._enterScene(next)
  }

  _stop() {
    this._running = false
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null }
  }

  _loop() {
    if (!this._running) return
    this._raf = requestAnimationFrame(() => this._loop())

    const t     = (performance.now() - this._startT) / 1000
    const scene = this._scenes[this._idx]
    const ctx   = this._ctx

    // 1. Background (full canvas repaint)
    scene.bg(ctx)

    // 2. Narration box (under characters)
    const hint = this._canAdvance
      ? (scene.isLast ? '▼ volver a las estrellas' : '▼ click para continuar')
      : null
    drawNarration(ctx, scene.narration, t, hint)

    // 3. Characters + effects (on top)
    scene.draw(ctx, t)
  }
}
