import * as THREE from 'three'

const POOL_SIZE   = 5
const TRAIL_LEN   = 60
const MIN_INTERVAL = 6   // seconds between spawns
const MAX_INTERVAL = 18

export class ShootingStars {
  constructor(scene) {
    this._pool      = []
    this._nextSpawn = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL)

    for (let i = 0; i < POOL_SIZE; i++) {
      this._pool.push(this._createStar(scene))
    }
  }

  _createStar(scene) {
    const positions = new Float32Array(TRAIL_LEN * 3)
    const colors    = new Float32Array(TRAIL_LEN * 3)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage))
    geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3).setUsage(THREE.DynamicDrawUsage))

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent:  true,
      blending:     THREE.AdditiveBlending,
      depthWrite:   false,
    })

    const line = new THREE.Line(geo, mat)
    line.visible = false
    scene.add(line)

    return {
      line,
      active:      false,
      life:        0,
      maxLife:     0,
      head:        new THREE.Vector3(),
      direction:   new THREE.Vector3(),
      speed:       0,
      trailLength: 0,
    }
  }

  _spawn(star) {
    star.active  = true
    star.life    = 0
    star.maxLife = 0.6 + Math.random() * 0.9

    // Random start: outer sphere around galaxy
    const theta = Math.random() * Math.PI * 2
    const phi   = Math.random() * Math.PI
    const r     = 20 + Math.random() * 20
    star.head.set(
      r * Math.sin(phi) * Math.cos(theta),
      (Math.random() - 0.5) * 15,
      r * Math.sin(phi) * Math.sin(theta)
    )

    // Direction: random but mostly "falling" inward/across
    star.direction.set(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 0.4,
      (Math.random() - 0.5) * 2
    ).normalize()

    star.speed       = 18 + Math.random() * 22
    star.trailLength = 4 + Math.random() * 4
    star.line.visible = true
  }

  update(elapsed, delta) {
    // Spawn timer
    this._nextSpawn -= delta
    if (this._nextSpawn <= 0) {
      const inactive = this._pool.find(s => !s.active)
      if (inactive) this._spawn(inactive)
      this._nextSpawn = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL)
    }

    for (const star of this._pool) {
      if (!star.active) continue

      star.life += delta
      const t = star.life / star.maxLife  // 0 → 1

      // Fade out toward end
      const fade = t < 0.8 ? 1 : 1 - (t - 0.8) / 0.2

      // Move head
      star.head.addScaledVector(star.direction, star.speed * delta)

      // Update trail geometry
      const pos = star.line.geometry.attributes.position
      const col = star.line.geometry.attributes.color

      for (let i = 0; i < TRAIL_LEN; i++) {
        const frac = i / (TRAIL_LEN - 1)
        pos.setXYZ(
          i,
          star.head.x - star.direction.x * frac * star.trailLength,
          star.head.y - star.direction.y * frac * star.trailLength,
          star.head.z - star.direction.z * frac * star.trailLength
        )
        const brightness = (1 - frac) * fade
        col.setXYZ(i, brightness, brightness, brightness * 0.9 + 0.1)
      }

      pos.needsUpdate = true
      col.needsUpdate = true

      if (star.life >= star.maxLife) {
        star.active = false
        star.line.visible = false
      }
    }
  }

  setVisible(v) {
    this._pool.forEach(s => {
      if (!v) s.line.visible = false
      s.active = false
    })
    this._hidden = !v
  }
}
