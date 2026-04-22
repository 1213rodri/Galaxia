import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import gsap from 'gsap'

export class CameraManager {
  constructor(canvas) {
    this.introComplete = false

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    )

    // Start far from the galaxy — dramatic entrance
    this.camera.position.set(0, 0, 65)
    this.camera.lookAt(0, 0, 0)

    // Controls — disabled during intro
    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.04
    this.controls.minDistance = 0.05
    this.controls.maxDistance = 120
    this.controls.enabled = false
    this.controls.target.set(0, 0, 0)

    window.addEventListener('resize', this._onResize.bind(this))

    this._playIntro()
  }

  _playIntro() {
    const D = 10 // intro screen duration before camera starts

    // Phase 1: fly toward the galaxy from far away
    gsap.to(this.camera.position, {
      x: 0, y: 0, z: 30,
      duration: 2.5,
      delay: D,
      ease: 'power2.in',
      onUpdate: () => this.camera.lookAt(0, 0, 0),
    })

    // Phase 2: arc to a beautiful 3/4 angle view
    gsap.to(this.camera.position, {
      x: 14, y: 9, z: 22,
      duration: 3,
      delay: D + 2.5,
      ease: 'power2.inOut',
      onUpdate: () => this.camera.lookAt(0, 0, 0),
      onComplete: () => {
        this.controls.enabled = true
        this.introComplete = true
      },
    })
  }

  update() {
    if (!this.introComplete) {
      this.camera.lookAt(0, 0, 0)
    } else {
      this.controls.update()
    }
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }
}
