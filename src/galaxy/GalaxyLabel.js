import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import gsap from 'gsap'

import fontData from 'three/examples/fonts/helvetiker_bold.typeface.json'

export class GalaxyLabel {
  constructor(scene) {
    this.group = new THREE.Group()
    scene.add(this.group)

    // Floating outside the galaxy disk (radius ≈ 12), upper-left area
    this.group.position.set(-14, 5, 0)

    this._build()
  }

  _build() {
    const font = new FontLoader().parse(fontData)

    // ── Main title ────────────────────────────────────────────────────────────
    const titleGeo = new TextGeometry('NGC-RoMar', {
      font,
      size:           0.52,
      depth:          0.07,
      curveSegments:  14,
      bevelEnabled:   true,
      bevelThickness: 0.018,
      bevelSize:      0.008,
      bevelSegments:  4,
    })
    titleGeo.center()

    this._titleMat = new THREE.MeshBasicMaterial({
      color:       new THREE.Color('#b8d4ff'),
      transparent: true,
      opacity:     0,
    })
    this.group.add(new THREE.Mesh(titleGeo, this._titleMat))

    // ── Decorative line ───────────────────────────────────────────────────────
    const lineGeo = new THREE.PlaneGeometry(3.8, 0.006)
    this._lineMat = new THREE.MeshBasicMaterial({
      color:       new THREE.Color('#4466aa'),
      transparent: true,
      opacity:     0,
      side:        THREE.DoubleSide,
    })
    const lineMesh = new THREE.Mesh(lineGeo, this._lineMat)
    lineMesh.position.y = -0.52
    this.group.add(lineMesh)

    // ── Subtitle ──────────────────────────────────────────────────────────────
    const subGeo = new TextGeometry('SPIRAL GALAXY  ·  CLASS Sb  ·  z = 0.0024', {
      font,
      size:          0.13,
      depth:         0.015,
      curveSegments: 8,
    })
    subGeo.center()

    this._subMat = new THREE.MeshBasicMaterial({
      color:       new THREE.Color('#556688'),
      transparent: true,
      opacity:     0,
    })
    const subMesh = new THREE.Mesh(subGeo, this._subMat)
    subMesh.position.y = -0.78
    this.group.add(subMesh)

    // ── Fade in after camera intro ────────────────────────────────────────────
    gsap.to(this._titleMat, { opacity: 1,    duration: 2.5, delay: 6.5, ease: 'power2.inOut' })
    gsap.to(this._lineMat,  { opacity: 0.7,  duration: 2.0, delay: 7.0, ease: 'power2.inOut' })
    gsap.to(this._subMat,   { opacity: 0.65, duration: 2.5, delay: 7.3, ease: 'power2.inOut' })
  }

  // Call every frame — makes the label always face the camera (billboard)
  update(camera) {
    this.group.quaternion.copy(camera.quaternion)
  }
}
