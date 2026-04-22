import * as THREE from 'three'
import gsap from 'gsap'

// M constellation — 5 stars, 4 line segments
// Positioned above the galaxy in the halo region
const CENTER = new THREE.Vector3(-5, 14, 2)
const SCALE  = 1.8

const STAR_OFFSETS = [
  new THREE.Vector3(-1.5, -1,  0),  // A — bottom-left
  new THREE.Vector3(-1.5,  1,  0),  // B — top-left
  new THREE.Vector3( 0,    0,  0),  // C — center (V-bottom)
  new THREE.Vector3( 1.5,  1,  0),  // D — top-right
  new THREE.Vector3( 1.5, -1,  0),  // E — bottom-right
]

// Line connections: A-B, B-C, C-D, D-E
const LINES = [[0,1],[1,2],[2,3],[3,4]]

export class Constellation {
  constructor(scene) {
    this.group = new THREE.Group()
    scene.add(this.group)

    this._starMats = []
    this._lineMats = []

    const worldPts = STAR_OFFSETS.map(o =>
      o.clone().multiplyScalar(SCALE).add(CENTER)
    )

    this._buildStars(worldPts)
    this._buildLines(worldPts)
    this._fadeIn()
  }

  _buildStars(pts) {
    const positions = new Float32Array(pts.length * 3)
    pts.forEach((p, i) => {
      positions[i * 3]     = p.x
      positions[i * 3 + 1] = p.y
      positions[i * 3 + 2] = p.z
    })

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const mat = new THREE.PointsMaterial({
      color:           new THREE.Color('#d0e8ff'),
      size:            0.28,
      sizeAttenuation: true,
      transparent:     true,
      opacity:         0,
      blending:        THREE.AdditiveBlending,
      depthWrite:      false,
    })

    this._starMats.push(mat)
    this.group.add(new THREE.Points(geo, mat))
  }

  _buildLines(pts) {
    LINES.forEach(([a, b]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([pts[a], pts[b]])

      const mat = new THREE.LineBasicMaterial({
        color:       new THREE.Color('#3355aa'),
        transparent: true,
        opacity:     0,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
      })

      this._lineMats.push(mat)
      this.group.add(new THREE.Line(geo, mat))
    })
  }

  _fadeIn() {
    const delay = 9

    this._starMats.forEach(m =>
      gsap.to(m, { opacity: 0.9, duration: 3, delay, ease: 'power2.inOut' })
    )
    this._lineMats.forEach((m, i) =>
      gsap.to(m, { opacity: 0.35, duration: 2.5, delay: delay + i * 0.15, ease: 'power2.inOut' })
    )
  }
}
