import * as THREE from 'three'

const ORBIT_A     = 18    // semi-major axis (XZ)
const ORBIT_B     = 11    // semi-minor axis
const TILT        = 0.42  // orbital tilt (radians)
const SPEED       = 0.08  // radians per second
const TRAIL_LEN   = 120
const TAIL_STEP   = 0.04  // seconds per trail sample

export class Comet {
  constructor(scene) {
    this._buildTrail(scene)
    this._buildHead(scene)
  }

  // Analytical position at time t
  _pos(t) {
    const angle = t * SPEED
    return new THREE.Vector3(
      ORBIT_A * Math.cos(angle),
      ORBIT_B * Math.sin(angle) * Math.sin(TILT),
      ORBIT_B * Math.sin(angle) * Math.cos(TILT)
    )
  }

  _buildTrail(scene) {
    const positions = new Float32Array(TRAIL_LEN * 3)
    const colors    = new Float32Array(TRAIL_LEN * 3)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage))
    geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3).setUsage(THREE.DynamicDrawUsage))

    this._trailMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent:  true,
      blending:     THREE.AdditiveBlending,
      depthWrite:   false,
    })

    this._trail = new THREE.Line(geo, this._trailMat)
    scene.add(this._trail)
  }

  _buildHead(scene) {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3).setUsage(THREE.DynamicDrawUsage))

    this._headMat = new THREE.PointsMaterial({
      color:           new THREE.Color('#d0eeff'),
      size:            0.45,
      sizeAttenuation: true,
      transparent:     true,
      blending:        THREE.AdditiveBlending,
      depthWrite:      false,
    })

    this._head = new THREE.Points(geo, this._headMat)
    scene.add(this._head)
  }

  update(elapsed) {
    // Update head
    const headPos = this._pos(elapsed)
    const hAttr   = this._head.geometry.attributes.position
    hAttr.setXYZ(0, headPos.x, headPos.y, headPos.z)
    hAttr.needsUpdate = true

    // Update trail — analytical: past positions computed from t history
    const pos = this._trail.geometry.attributes.position
    const col = this._trail.geometry.attributes.color

    for (let i = 0; i < TRAIL_LEN; i++) {
      const p          = this._pos(elapsed - i * TAIL_STEP)
      const brightness = Math.pow(1 - i / TRAIL_LEN, 1.8)

      pos.setXYZ(i, p.x, p.y, p.z)
      // Tail color: blue-white at head, fades to deep blue
      col.setXYZ(i, brightness * 0.7, brightness * 0.85, brightness)
    }

    pos.needsUpdate = true
    col.needsUpdate = true
  }
}
