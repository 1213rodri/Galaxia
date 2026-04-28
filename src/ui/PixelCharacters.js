/**
 * PixelCharacters.js
 * Pixel art characters for the story animation.
 * Each art "pixel" = PX × PX canvas pixels.
 *
 * Public API:
 *   drawRodrigo(ctx, cx, cy, pose)
 *   drawMar(ctx, cx, cy, pose)
 *   drawAdolfo(ctx, cx, cy)
 *   drawBubble(ctx, cx, cy, text, dir)
 *
 * cx, cy = canvas coordinates.
 * cx = horizontal CENTER of the character.
 * cy = bottom of the character (feet level).
 */

const PX = 2  // 1 art pixel = 2 canvas pixels

// ── Core sprite renderer ─────────────────────────────────────────────────────

/**
 * Render a sprite defined as an array of strings.
 * '.' = transparent. Each char maps to a color in the palette.
 * artX, artY = top-left in art pixel coordinates.
 */
function drawSprite(ctx, rows, palette, artX, artY) {
  rows.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) {
      const col = palette[row[dx]]
      if (!col) continue
      ctx.fillStyle = col
      ctx.fillRect((artX + dx) * PX, (artY + dy) * PX, PX, PX)
    }
  })
}

/** Convert canvas coords (center-x, feet-y) → art coords (top-left) */
function toArt(cx, cy, rows) {
  const artX = Math.round(cx / PX) - Math.floor(rows[0].length / 2)
  const artY  = Math.round(cy / PX) - rows.length
  return { artX, artY }
}

// ─────────────────────────────────────────────────────────────────────────────
// RODRIGO  —  short straight dark hair, male, blue shirt
// Sprite grid: 8 art px wide × 14 art px tall
// ─────────────────────────────────────────────────────────────────────────────

const RC = {
  H: '#1a0f05',  // hair (very dark brown)
  S: '#f5b48a',  // skin
  E: '#110a02',  // eyes / pupils
  M: '#cc7055',  // mouth
  T: '#2d5ea8',  // shirt (blue)
  P: '#1c1d30',  // pants (dark navy)
  K: '#0d0d15',  // shoes
  F: '#aaddff',  // phone screen
}

// Standing — neutral expression
const ROD_STAND = [
  '..HHHH..',
  '.HHHHHH.',
  '.SSSSSS.',
  '.SE..ES.',
  '.SSSSSS.',
  '.SM..MS.',
  '.TTTTTT.',
  'T.TTTT.T',
  '.TTTTTT.',
  '.TTTTTT.',
  '.PP..PP.',
  '.PP..PP.',
  '.PP..PP.',
  '.KK..KK.',
]

// Happy — wide smile
const ROD_HAPPY = [
  '..HHHH..',
  '.HHHHHH.',
  '.SSSSSS.',
  '.SE..ES.',
  '.SSSSSS.',
  '.SMMMMS.',
  '.TTTTTT.',
  'T.TTTT.T',
  '.TTTTTT.',
  '.TTTTTT.',
  '.PP..PP.',
  '.PP..PP.',
  '.PP..PP.',
  '.KK..KK.',
]

// Holding phone — right arm extended, phone visible on the right
const ROD_PHONE = [
  '..HHHH..',
  '.HHHHHH.',
  '.SSSSSS.',
  '.SE..ES.',
  '.SSSSSS.',
  '.SM..MS.',
  '.TTTTTT.',
  '.TTTTSFF',  // S = hand, FF = phone (2px wide)
  '.TTTTSFF',
  '.TTTTTT.',
  '.PP..PP.',
  '.PP..PP.',
  '.PP..PP.',
  '.KK..KK.',
]

// ─────────────────────────────────────────────────────────────────────────────
// MAR  —  long straight dark hair, female, pink dress
// Sprite grid: 8 art px wide × 13 art px tall
// Hair frames the face on both sides and flows down the body.
// ─────────────────────────────────────────────────────────────────────────────

const MC = {
  H: '#1a0f05',  // hair (dark)
  S: '#f5c09a',  // skin (face + legs)
  E: '#110a02',  // eyes
  M: '#e0706a',  // mouth (rosy)
  D: '#cc4477',  // dress (pink-magenta)
  K: '#881133',  // shoes (deep red)
}

// Standing
const MAR_STAND = [
  '.HHHHHH.',   // 0  hair top
  'HSSSSSSH',   // 1  face with hair sides
  'HSE..ESH',   // 2  eyes
  'HSSSSSSH',   // 3  face
  'HS.MM.SH',   // 4  mouth
  'H.DDDD.H',   // 5  dress (hair continues at sides)
  'H.DDDD.H',   // 6
  'H.DDDD.H',   // 7
  'H..SS..H',   // 8  legs (skin), hair still at sides
  'H..SS..H',   // 9
  'H..SS..H',   // 10
  '...KK...',   // 11 shoes
  '........',   // 12 ground clearance
]

// Happy — wide smile, same pose
const MAR_HAPPY = [
  '.HHHHHH.',
  'HSSSSSSH',
  'HSE..ESH',
  'HSSSSSSH',
  'HSMMMMSH',   // wide smile
  'H.DDDD.H',
  'H.DDDD.H',
  'H.DDDD.H',
  'H..SS..H',
  'H..SS..H',
  'H..SS..H',
  '...KK...',
  '........',
]

// ─────────────────────────────────────────────────────────────────────────────
// ADOLFO  —  medium brown hair, green shirt (Rodrigo's friend)
// Same proportions as Rodrigo, distinct colors.
// ─────────────────────────────────────────────────────────────────────────────

const AC = {
  H: '#3d2010',  // medium brown hair
  S: '#d4956a',  // skin (slightly warmer/darker)
  E: '#110a02',  // eyes
  M: '#b06040',  // mouth
  T: '#2a7a3a',  // shirt (green)
  P: '#2a2520',  // pants (dark brown)
  K: '#1a1510',  // shoes
}

const ADO_STAND = [
  '.HHHHHH.',   // slightly rounder hair than Rodrigo
  'HHHHHHHH',
  '.SSSSSS.',
  '.SE..ES.',
  '.SSSSSS.',
  '.SM..MS.',
  '.TTTTTT.',
  'T.TTTT.T',
  '.TTTTTT.',
  '.TTTTTT.',
  '.PP..PP.',
  '.PP..PP.',
  '.PP..PP.',
  '.KK..KK.',
]

// ─────────────────────────────────────────────────────────────────────────────
// Public drawing functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Draw Rodrigo.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx  canvas x (horizontal center)
 * @param {number} cy  canvas y (feet / ground level)
 * @param {'stand'|'happy'|'phone'} pose
 */
export function drawRodrigo(ctx, cx, cy, pose = 'stand') {
  const rows = pose === 'happy' ? ROD_HAPPY
             : pose === 'phone' ? ROD_PHONE
             : ROD_STAND
  const { artX, artY } = toArt(cx, cy, rows)
  drawSprite(ctx, rows, RC, artX, artY)
}

/**
 * Draw Mar.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx  canvas x (horizontal center)
 * @param {number} cy  canvas y (feet / ground level)
 * @param {'stand'|'happy'} pose
 */
export function drawMar(ctx, cx, cy, pose = 'stand') {
  const rows = pose === 'happy' ? MAR_HAPPY : MAR_STAND
  const { artX, artY } = toArt(cx, cy, rows)
  drawSprite(ctx, rows, MC, artX, artY)
}

/**
 * Draw Adolfo.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx  canvas x
 * @param {number} cy  canvas y (feet)
 */
export function drawAdolfo(ctx, cx, cy) {
  const { artX, artY } = toArt(cx, cy, ADO_STAND)
  drawSprite(ctx, ADO_STAND, AC, artX, artY)
}

/**
 * Draw a pixel-art speech bubble.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx    canvas x of the bubble tail anchor
 * @param {number} cy    canvas y of the bubble tail anchor (top of character head)
 * @param {string} text  short text string
 * @param {'right'|'left'} dir  direction the tail points (toward the character)
 */
export function drawBubble(ctx, cx, cy, text, dir = 'right') {
  const padX = 5
  const padY = 4
  const h    = 14
  // Measure approximate text width at 5px mono font
  ctx.font = '5px "Courier New", monospace'
  const tw = ctx.measureText(text).width
  const w  = Math.ceil(tw) + padX * 2

  // Bubble positioned above the anchor
  const bx = dir === 'right' ? cx + 4 : cx - w - 4
  const by = cy - h - 8

  // Background
  ctx.fillStyle = '#eef2ff'
  ctx.fillRect(bx, by, w, h)

  // Border (1px, dark blue-gray)
  ctx.fillStyle = '#334466'
  ctx.fillRect(bx - 1, by - 1,  w + 2, 1)  // top
  ctx.fillRect(bx - 1, by + h,  w + 2, 1)  // bottom
  ctx.fillRect(bx - 1, by,      1, h)       // left
  ctx.fillRect(bx + w, by,      1, h)       // right

  // Text
  ctx.fillStyle = '#112244'
  ctx.textAlign = 'left'
  ctx.fillText(text, bx + padX, by + padY + 5)

  // Tail (small triangle pointing down toward character)
  const tailX = dir === 'right' ? bx + 4 : bx + w - 8
  ctx.fillStyle = '#eef2ff'
  ctx.fillRect(tailX,     by + h, 4, 2)
  ctx.fillRect(tailX + 1, by + h + 2, 2, 1)
  ctx.fillStyle = '#334466'
  ctx.fillRect(tailX - 1, by + h, 1, 3)
  ctx.fillRect(tailX + 4, by + h, 1, 2)
  ctx.fillRect(tailX,     by + h + 2, 1, 1)
  ctx.fillRect(tailX + 3, by + h + 2, 1, 1)
}

/**
 * Pixel art height helpers (in canvas pixels) — useful for placing bubbles.
 */
export const CHAR_HEIGHT = {
  rodrigo: 14 * PX,  // 28 canvas px
  mar:     13 * PX,  // 26 canvas px
  adolfo:  14 * PX,  // 28 canvas px
}
