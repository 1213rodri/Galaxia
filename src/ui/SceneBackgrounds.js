/**
 * SceneBackgrounds.js
 * Pixel art backgrounds for each story scene.
 * Canvas resolution: 320 × 180.
 *
 * Exports:
 *   bgRoom(ctx)     — interior nocturno  (escenas 1 y 2)
 *   bgPhone(ctx)    — pantalla de chat   (escena 3)
 *   bgNight(ctx)    — exterior nocturno  (escenas 4 y 5)
 *   bgSunset(ctx)   — atardecer romántico (escena 6)
 *   bgGalaxy(ctx)   — galaxia desde abajo (escena 7)
 *
 * GROUND_Y = 148  ← characters should stand with feet at this y
 */

export const GROUND_Y = 148

// ── Helpers ──────────────────────────────────────────────────────────────────

function r(ctx, x, y, w, h, c) {
  ctx.fillStyle = c
  ctx.fillRect(x, y, w, h)
}

function dot(ctx, x, y, c) {
  ctx.fillStyle = c
  ctx.fillRect(x, y, 1, 1)
}

// Fixed star field positions (deterministic, no Math.random)
const STAR_POSITIONS = [
  [14,7],[34,19],[59,4],[84,14],[104,29],[134,9],[164,21],
  [204,7],[234,17],[264,4],[294,11],[314,24],[47,39],[174,34],
  [254,39],[77,54],[147,17],[307,49],[21,44],[187,11],[97,64],
  [141,47],[269,27],[31,61],[194,44],[117,24],[284,37],[51,17],
  [224,54],[159,7],[74,29],[244,61],[9,51],[184,67],[304,14],
  [119,42],[69,12],[199,52],[279,42],[44,28],[159,62],[229,9],
]

function drawStars(ctx, count = 30, color = '#ffffff') {
  STAR_POSITIONS.slice(0, count).forEach(([x, y]) => dot(ctx, x, y, color))
}

// ── SCENE 1 & 2 — Interior nocturno ─────────────────────────────────────────
/**
 * Bedroom at night. Adolfo tells Rodrigo about Mar.
 * Ground at y=148.
 */
export function bgRoom(ctx) {
  // Wall (back)
  r(ctx, 0, 0,   320, 180, '#0d0e1c')
  r(ctx, 0, 30,  320, 120, '#10112a')

  // Ceiling molding
  r(ctx, 0, 28, 320, 3, '#0b0c1a')

  // Window (upper right) ─ night sky, moon visible
  r(ctx, 218, 34, 68, 56, '#1b1c38')   // frame
  r(ctx, 221, 37, 62, 50, '#03040c')   // glass (dark sky)
  // Moon
  r(ctx, 242, 43, 14, 14, '#d8e4ff')
  r(ctx, 246, 41, 6,  2,  '#d8e4ff')
  r(ctx, 244, 47, 10, 8,  '#03040c')   // crescent shadow
  // Window cross bars
  r(ctx, 251, 37, 2, 50, '#1b1c38')
  r(ctx, 221, 61, 62, 2, '#1b1c38')
  // Stars through window
  [[225,41],[232,49],[263,43],[258,55],[228,66],[262,67]].forEach(
    ([x, y]) => dot(ctx, x, y, '#8899cc')
  )

  // Poster on wall (left, simple pixel art decoration)
  r(ctx, 18, 40, 42, 55, '#161728')   // frame
  r(ctx, 20, 42, 38, 51, '#0e0f22')   // inner
  // Abstract art in poster — horizontal lines
  [[24,50,'#441166'],[24,56,'#661188'],[24,62,'#8833aa'],
   [24,68,'#aa44cc'],[24,74,'#cc66dd'],[24,80,'#aa44cc']].forEach(
    ([x, y, c]) => r(ctx, x, y, 28, 4, c)
  )

  // Desk (bottom left)
  r(ctx, 5,  130, 85, 6,  '#2a1e0e')   // tabletop
  r(ctx, 8,  136, 6,  14, '#1e1508')   // leg left
  r(ctx, 78, 136, 6,  14, '#1e1508')   // leg right
  // Lamp on desk
  r(ctx, 55, 108, 4,  22, '#333344')   // pole
  r(ctx, 48, 104, 18, 5,  '#665522')   // shade
  r(ctx, 56, 109, 2,  2,  '#ffe0aa')   // bulb glow

  // Floor
  r(ctx, 0, 148, 320, 32, '#0c0c18')
  r(ctx, 0, 148, 320, 1,  '#181828')
  // Floor planks
  for (let i = 0; i < 320; i += 45) r(ctx, i, 149, 1, 31, '#141420')
}

// ── SCENE 3 — Pantalla de chat ────────────────────────────────────────────────
/**
 * Close-up of a phone screen with a chat conversation.
 * Messages drawn externally via drawChatMessage().
 */
export function bgPhone(ctx) {
  // Background (blurred room, very dark)
  r(ctx, 0, 0, 320, 180, '#080810')
  // Vignette dots
  STAR_POSITIONS.slice(0, 8).forEach(([x, y]) => dot(ctx, x, y, '#1a1a28'))

  // Phone body
  r(ctx, 78, 4,  164, 172, '#1c1c2e')   // body
  r(ctx, 80, 6,  160, 168, '#22223a')   // slight gradient
  // Rounded corners (cut them manually)
  r(ctx, 78,  4,  2, 2, '#080810')
  r(ctx, 240, 4,  2, 2, '#080810')
  r(ctx, 78,  174,2, 2, '#080810')
  r(ctx, 240, 174,2, 2, '#080810')

  // Screen area
  r(ctx, 83, 16, 154, 148, '#0f0f20')

  // Status bar
  r(ctx, 83, 16, 154, 10, '#0a0a18')
  ctx.fillStyle = '#556688'
  ctx.font = '4px "Courier New", monospace'
  ctx.textAlign = 'left'
  ctx.fillText('9:41', 87, 23)
  ctx.fillStyle = '#445577'
  ctx.textAlign = 'right'
  ctx.fillText('●●●', 233, 23)

  // Contact header bar
  r(ctx, 83, 26, 154, 18, '#14142a')
  // Avatar circle (pink — Mar)
  r(ctx, 88, 29, 10, 10, '#cc4477')
  ctx.fillStyle = '#ffffff'
  ctx.font = '6px "Courier New", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('M', 93, 37)
  // Contact name
  ctx.fillStyle = '#dde8ff'
  ctx.font = '5px "Courier New", monospace'
  ctx.textAlign = 'left'
  ctx.fillText('Mar', 104, 37)
  ctx.fillStyle = '#334455'
  ctx.fillText('en linea', 104, 41)

  // Messages area background
  r(ctx, 83, 44, 154, 108, '#0f0f20')

  // Input bar (bottom)
  r(ctx, 83, 152, 154, 12, '#0a0a18')
  r(ctx, 87, 154, 118, 8,  '#1a1a2e')
  // Send button
  r(ctx, 209, 153, 24, 10, '#cc4477')
  ctx.fillStyle = '#ffffff'
  ctx.font = '5px "Courier New", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('>', 221, 160)

  // Home indicator
  r(ctx, 140, 168, 40, 2, '#334455')

  // Side buttons
  r(ctx, 76, 40, 2, 20, '#151525')
  r(ctx, 76, 65, 2, 14, '#151525')
  r(ctx, 242, 50, 2, 24, '#151525')
}

/**
 * Draw a single chat message bubble on the phone screen.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {'left'|'right'} side   left = received, right = sent
 * @param {number} y              canvas y position of the bubble top
 */
export function drawChatMessage(ctx, text, side, y) {
  const maxW   = 100
  const pad    = 5
  const bh     = 14
  ctx.font = '5px "Courier New", monospace'
  const tw = Math.min(ctx.measureText(text).width, maxW)
  const bw = Math.ceil(tw) + pad * 2

  const bx = side === 'right' ? 233 - bw : 87
  const bc = side === 'right' ? '#2d5ea8' : '#2a2a44'
  const tc = '#eef2ff'

  // Bubble
  ctx.fillStyle = bc
  ctx.fillRect(bx, y, bw, bh)
  // Tail pixel
  if (side === 'right') {
    ctx.fillRect(bx + bw, y + bh - 4, 2, 3)
  } else {
    ctx.fillRect(bx - 2, y + bh - 4, 2, 3)
  }
  // Text
  ctx.fillStyle = tc
  ctx.textAlign = 'left'
  ctx.fillText(text, bx + pad, y + 9)
}

// ── SCENE 4 & 5 — Exterior nocturno ──────────────────────────────────────────
/**
 * City night exterior. Conversations, growing connection.
 * Ground at y=148.
 */
export function bgNight(ctx) {
  // Sky
  r(ctx, 0, 0,   320, 55,  '#03030a')
  r(ctx, 0, 55,  320, 55,  '#050510')
  r(ctx, 0, 110, 320, 38,  '#06060c')

  // Stars
  drawStars(ctx, 32, '#ffffff')
  // Dim star layer
  [[20,15],[90,8],[200,20],[280,10],[155,40],[240,30],[60,25]].forEach(
    ([x, y]) => dot(ctx, x, y, '#334455')
  )
  // Blue-tinted stars
  [[50,22],[185,9],[310,32]].forEach(
    ([x, y]) => dot(ctx, x, y, '#99aacc')
  )

  // City skyline silhouette
  const buildings = [
    [0, 115, 22, 33], [22, 108, 16, 40], [38, 118, 26, 30],
    [64, 100, 22, 48], [86, 112, 28, 36], [114, 96, 20, 52],
    [134, 108, 24, 40], [158, 99, 16, 49], [174, 113, 30, 35],
    [204, 104, 20, 44], [224, 111, 26, 37], [250, 98, 18, 50],
    [268, 106, 32, 42], [300, 101, 20, 47],
  ]
  buildings.forEach(([x, y, w, h]) => r(ctx, x, y, w, h, '#07071a'))

  // Building windows (warm lights)
  const winLights = [
    [66,103],[70,110],[88,113],[117,99],[136,109],[160,102],
    [205,107],[252,101],[270,109],[303,104],
  ]
  winLights.forEach(([x, y]) => {
    dot(ctx, x,     y, '#ffe088')
    dot(ctx, x + 2, y, '#ffe088')
    dot(ctx, x,     y + 2, '#cc9933')
  })

  // Ground
  r(ctx, 0, 148, 320, 32, '#080e08')
  r(ctx, 0, 148, 320, 1,  '#121f12')
  // Grass edge
  for (let i = 0; i < 320; i += 6) r(ctx, i, 146, 1, 2, '#0e1a0e')
  for (let i = 2; i < 320; i += 8) r(ctx, i, 147, 1, 1, '#162216')
}

// ── SCENE 6 — Atardecer romántico ────────────────────────────────────────────
/**
 * Romantic sunset — first kiss scene.
 * Ground at y=148.
 */
export function bgSunset(ctx) {
  // Sky bands (top to bottom — night purple → warm orange)
  r(ctx, 0, 0,   320, 18, '#12022a')
  r(ctx, 0, 18,  320, 18, '#300a50')
  r(ctx, 0, 36,  320, 18, '#6a185a')
  r(ctx, 0, 54,  320, 18, '#a82848')
  r(ctx, 0, 72,  320, 18, '#d84030')
  r(ctx, 0, 90,  320, 18, '#f06030')
  r(ctx, 0, 108, 320, 18, '#f08040')
  r(ctx, 0, 126, 320, 22, '#f0a060')

  // Sun (setting, bottom half hidden by ground)
  const sx = 148, sy = 122, sr = 18
  r(ctx, sx,       sy,      36, 26, '#ffdd44')
  r(ctx, sx - 4,   sy + 6,  44, 14, '#ffdd44')
  r(ctx, sx + 4,   sy - 3,  28, 4,  '#ffdd44')
  // Sun corona (glow rays)
  r(ctx, sx - 8,   sy + 8,  4,  10, '#f8aa22')
  r(ctx, sx + 40,  sy + 8,  4,  10, '#f8aa22')
  r(ctx, sx + 8,   sy - 6,  20, 4,  '#f8aa22')
  r(ctx, sx,       sy + 28, 36, 3,  '#f8cc44')

  // Ground reflection strip
  r(ctx, 0, 144, 320, 4, '#cc5520')
  r(ctx, 0, 142, 320, 2, '#e07030')

  // Ground / silhouette
  r(ctx, 0, 148, 320, 32, '#0a0806')
  r(ctx, 0, 147, 320, 2,  '#180e06')
  // Subtle grass silhouette
  for (let i = 0; i < 320; i += 7) r(ctx, i, 146, 2, 2, '#14100a')

  // First stars appearing (top of sky)
  [[30,10],[85,5],[210,14],[275,7],[315,18],[150,4]].forEach(
    ([x, y]) => dot(ctx, x, y, '#ffffff')
  )

  // Fireflies / sparkles near ground (romantic atmosphere)
  [[60,140],[100,136],[180,142],[240,138],[290,140]].forEach(
    ([x, y]) => dot(ctx, x, y, '#ffe0aa')
  )
}

// ── SCENE 7 — Galaxia desde abajo ────────────────────────────────────────────
/**
 * Looking up at the galaxy — the world Rodrigo built for her.
 * Ground at y=148 (dark hill silhouette).
 */
export function bgGalaxy(ctx) {
  // Deep space
  r(ctx, 0, 0, 320, 180, '#020208')

  // Milky Way band — diagonal sweep of pre-computed faint star positions
  const MW_STARS = [
    [68,10,'#334455'],[72,14,'#445566'],[78,8,'#556677'],[82,18,'#334455'],
    [90,6,'#445566'],[95,22,'#3a4a5a'],[100,12,'#556677'],[108,4,'#445566'],
    [115,16,'#334455'],[120,26,'#556677'],[128,10,'#445566'],[135,20,'#334455'],
    [142,8,'#556677'],[148,28,'#445566'],[155,14,'#3a4a5a'],[162,4,'#445566'],
    [170,22,'#556677'],[178,12,'#334455'],[185,30,'#445566'],[192,6,'#556677'],
    [200,18,'#334455'],[208,28,'#445566'],[215,10,'#556677'],[222,20,'#3a4a5a'],
    [230,6,'#445566'],[237,24,'#334455'],[245,14,'#556677'],[252,32,'#445566'],
    [73,32,'#2a3a4a'],[88,28,'#3a4a5a'],[103,38,'#2a3a4a'],[118,30,'#3a4a5a'],
    [133,42,'#2a3a4a'],[148,36,'#3a4a5a'],[163,26,'#2a3a4a'],[178,40,'#3a4a5a'],
    [193,34,'#2a3a4a'],[208,46,'#3a4a5a'],[223,38,'#2a3a4a'],[238,28,'#3a4a5a'],
  ]
  MW_STARS.forEach(([x, y, c]) => dot(ctx, x, y, c))

  // Bright stars
  drawStars(ctx, 38, '#ffffff')

  // Blue-tinted stars
  [[55,24],[125,14],[255,34],[190,7],[305,21],[42,48]].forEach(
    ([x, y]) => dot(ctx, x, y, '#aaccff')
  )
  // Warm (yellow) stars
  [[82,39],[202,27],[158,54],[272,17],[15,33]].forEach(
    ([x, y]) => dot(ctx, x, y, '#ffddaa')
  )

  // A planet (pink, like Mar) in the sky
  r(ctx, 255, 28, 22, 22, '#cc4477')
  r(ctx, 251, 35, 30, 8,  '#cc4477')
  r(ctx, 259, 26, 14, 4,  '#cc4477')
  // Planet ring
  r(ctx, 247, 39, 38, 2,  '#e077aa')
  r(ctx, 249, 38, 34, 1,  '#f099cc')
  // Planet shadow (slightly darker right side)
  r(ctx, 269, 28, 8,  22, '#aa2255')

  // Nebula hint (soft color blobs)
  [[30,20,'#220033'],[32,22,'#330044'],[34,20,'#220033'],
   [31,21,'#330044'],[33,21,'#440055'],[35,22,'#330044']].forEach(
    ([x, y, c]) => dot(ctx, x, y, c)
  )
  [[285,55,'#003322'],[287,57,'#004433'],[289,55,'#003322'],
   [286,56,'#004433'],[288,56,'#005544']].forEach(
    ([x, y, c]) => dot(ctx, x, y, c)
  )

  // Ground — rolling dark hill
  for (let x = 0; x < 320; x++) {
    const hillY = 150 + Math.round(
      Math.sin(x * 0.018) * 5 + Math.sin(x * 0.007) * 4
    )
    r(ctx, x, hillY, 1, 180 - hillY, '#06060e')
  }
  // Grass edge
  for (let i = 0; i < 320; i += 5) {
    const hillY = 150 + Math.round(
      Math.sin(i * 0.018) * 5 + Math.sin(i * 0.007) * 4
    )
    dot(ctx, i, hillY - 1, '#0c0c1a')
  }
}
