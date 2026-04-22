import * as THREE from 'three'
import vertShader from './shaders/galaxy.vert.glsl?raw'
import fragShader from './shaders/galaxy.frag.glsl?raw'

// ─── Galaxy parameters ────────────────────────────────────────────────────────
const PARAMS = {
  // Disk / spiral arms
  diskCount:        160000,
  diskRadius:       12,
  branches:         3,
  spinFactor:       1.3,   // how much each arm curls
  randomness:       0.28,
  randomnessPower:  3.2,

  // Central bulge
  coreCount:        18000,
  coreRadius:       2.2,

  // Outer halo
  haloCount:        18000,
  haloRadius:       24,

  // Star colors
  innerColor:    '#ffc87a',  // warm orange-white near core
  outerColor:    '#2255ff',  // cold blue at edges

  // Base point size (tuned for perspective shader)
  baseSize:  70,

  // Galaxy slow rotation speed (radians/second)
  rotationSpeed: 0.018,
}

// ─── Nebula cloud definitions ─────────────────────────────────────────────────
// Each entry: [branchIndex, radiusFraction, color, scale, opacity]
const NEBULAE = [
  [0, 0.30, '#4422ff', 3.2, 0.18],
  [0, 0.65, '#7733ff', 2.8, 0.14],
  [1, 0.25, '#ff2266', 2.5, 0.16],
  [1, 0.55, '#cc00ff', 3.5, 0.12],
  [1, 0.80, '#3344ff', 2.2, 0.10],
  [2, 0.35, '#00aaff', 3.0, 0.15],
  [2, 0.70, '#ff6600', 2.4, 0.12],
  [0, 0.85, '#8833ff', 2.0, 0.09],
  [2, 0.18, '#ff3388', 2.6, 0.14],
  // Central nebula glow
  [0, 0.05, '#ffcc88', 4.0, 0.10],
  [1, 0.05, '#ffcc88', 3.5, 0.08],
]

export class Galaxy {
  constructor(scene) {
    this.group = new THREE.Group()
    scene.add(this.group)

    this._material = null
    this._clock    = 0

    this._buildStars()
    this._buildNebulae()
  }

  // ─── Star particle system ───────────────────────────────────────────────────
  _buildStars() {
    const { diskCount, diskRadius, branches, spinFactor, randomness, randomnessPower,
            coreCount, coreRadius, haloCount, haloRadius,
            innerColor, outerColor, baseSize } = PARAMS

    const total = diskCount + coreCount + haloCount

    const positions       = new Float32Array(total * 3)
    const colors          = new Float32Array(total * 3)
    const sizes           = new Float32Array(total)
    const twinkleSpeeds   = new Float32Array(total)
    const twinkleOffsets  = new Float32Array(total)
    const spikeIntensities = new Float32Array(total)

    const colorA = new THREE.Color(innerColor)
    const colorB = new THREE.Color(outerColor)
    const temp   = new THREE.Color()

    let i = 0

    // ── Disk: logarithmic spiral arms ─────────────────────────────────────────
    for (let d = 0; d < diskCount; d++, i++) {
      const arm         = d % branches
      const branchAngle = (arm / branches) * Math.PI * 2

      // Bias toward center (more stars there)
      const radius = Math.pow(Math.random(), 0.6) * diskRadius

      const spinAngle = radius * spinFactor

      // Scatter: concentrated near 0, small y (galaxy is a flat disk)
      const scatter   = randomness * radius
      const rx = _scatter(scatter, randomnessPower)
      const ry = _scatter(scatter * 0.12, randomnessPower)
      const rz = _scatter(scatter, randomnessPower)

      positions[i * 3]     = Math.cos(branchAngle + spinAngle) * radius + rx
      positions[i * 3 + 1] = ry
      positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + rz

      // Color: lerp from warm inner to cold outer
      temp.copy(colorA).lerp(colorB, Math.pow(radius / diskRadius, 0.8))

      // Sprinkle special star types
      const roll = Math.random()
      if      (roll < 0.025) temp.set('#b8d4ff')  // blue giant
      else if (roll < 0.055) temp.set('#ff8855')  // red dwarf
      else if (roll < 0.060) temp.set('#ffffff')  // bright white

      colors[i * 3]     = temp.r
      colors[i * 3 + 1] = temp.g
      colors[i * 3 + 2] = temp.b

      // 2% bright stars — larger, with diffraction spikes
      const isBright = Math.random() < 0.02
      sizes[i]            = isBright ? _rand(7, 13) : _rand(0.4, 1.6)
      spikeIntensities[i] = isBright ? _rand(0.7, 1.0) : 0.0
      twinkleSpeeds[i]    = _rand(0.4, 2.5)
      twinkleOffsets[i]   = Math.random() * Math.PI * 2
    }

    // ── Core / bulge: warm dense center ──────────────────────────────────────
    const coreColor = new THREE.Color('#fff4d0')
    for (let c = 0; c < coreCount; c++, i++) {
      const r     = Math.pow(Math.random(), 0.5) * coreRadius
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.35
      positions[i * 3 + 2] = r * Math.cos(phi)

      // Core stars: warm white to pale yellow
      temp.copy(coreColor).lerp(colorA, Math.random() * 0.4)
      colors[i * 3]     = temp.r
      colors[i * 3 + 1] = temp.g
      colors[i * 3 + 2] = temp.b

      sizes[i]         = _rand(0.5, 2.2)
      twinkleSpeeds[i] = _rand(1.0, 3.5)
      twinkleOffsets[i]= Math.random() * Math.PI * 2
    }

    // ── Halo: sparse spherical shell of old stars ─────────────────────────────
    for (let h = 0; h < haloCount; h++, i++) {
      const r     = coreRadius + Math.pow(Math.random(), 0.6) * (haloRadius - coreRadius)
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.28
      positions[i * 3 + 2] = r * Math.cos(phi)

      // Halo: blue-white to white (old Population II stars)
      temp.set(Math.random() < 0.5 ? '#aabeff' : '#e8eeff')
      colors[i * 3]     = temp.r
      colors[i * 3 + 1] = temp.g
      colors[i * 3 + 2] = temp.b

      sizes[i]         = _rand(0.25, 0.9)
      twinkleSpeeds[i] = _rand(0.2, 1.2)
      twinkleOffsets[i]= Math.random() * Math.PI * 2
    }

    // ── Build geometry & material ─────────────────────────────────────────────
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position',        new THREE.BufferAttribute(positions,       3))
    geo.setAttribute('aColor',          new THREE.BufferAttribute(colors,          3))
    geo.setAttribute('aSize',           new THREE.BufferAttribute(sizes,           1))
    geo.setAttribute('aTwinkleSpeed',   new THREE.BufferAttribute(twinkleSpeeds,   1))
    geo.setAttribute('aTwinkleOffset',  new THREE.BufferAttribute(twinkleOffsets,  1))
    geo.setAttribute('aSpikeIntensity', new THREE.BufferAttribute(spikeIntensities,1))

    this._material = new THREE.ShaderMaterial({
      vertexShader:   vertShader,
      fragmentShader: fragShader,
      uniforms: {
        uTime:       { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize:       { value: baseSize },
      },
      transparent:  true,
      depthWrite:   false,
      blending:     THREE.AdditiveBlending,
    })

    this.group.add(new THREE.Points(geo, this._material))
  }

  // ─── Nebula clouds (color sprites) ─────────────────────────────────────────
  _buildNebulae() {
    const { branches, diskRadius, spinFactor } = PARAMS

    NEBULAE.forEach(([arm, fraction, color, scale, opacity]) => {
      const branchAngle = (arm / branches) * Math.PI * 2
      const radius      = fraction * diskRadius
      const spinAngle   = radius * spinFactor

      const x = Math.cos(branchAngle + spinAngle) * radius
      const z = Math.sin(branchAngle + spinAngle) * radius
      const y = (Math.random() - 0.5) * 0.6

      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map:        _makeNebulaTexture(color),
          blending:   THREE.AdditiveBlending,
          transparent:true,
          depthWrite: false,
          opacity,
        })
      )
      sprite.position.set(x, y, z)
      sprite.scale.set(scale, scale, 1)
      this.group.add(sprite)
    })
  }

  // ─── Animation tick ─────────────────────────────────────────────────────────
  update(elapsed) {
    if (this._material) {
      this._material.uniforms.uTime.value = elapsed
    }
    this.group.rotation.y = elapsed * PARAMS.rotationSpeed
  }

  dispose() {
    this.group.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) obj.material.dispose()
    })
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _rand(min, max) {
  return min + Math.random() * (max - min)
}

function _scatter(amplitude, power) {
  return Math.pow(Math.random(), power) * (Math.random() < 0.5 ? 1 : -1) * amplitude
}

function _makeNebulaTexture(hexColor) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width  = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  )
  gradient.addColorStop(0.0, hexColor + 'cc')  // 80% alpha center
  gradient.addColorStop(0.4, hexColor + '55')
  gradient.addColorStop(1.0, hexColor + '00')  // fully transparent edge

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  return new THREE.CanvasTexture(canvas)
}
