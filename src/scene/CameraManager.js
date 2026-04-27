import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import gsap from 'gsap'

const SOLAR_TRIGGER_DIST  = 2.5  // distance from center that triggers solar transition
const GALAXY_RETURN_DIST  = 200  // distance from solar origin that triggers return to galaxy

export class CameraManager {
  constructor(canvas) {
    this.introComplete = false
    this._mode         = 'galaxy'   // 'galaxy' | 'solar'
    this._locked       = false      // true during transitions
    this.onEnterSolar  = null       // callback set by main.js
    this.onExitSolar   = null       // callback set by main.js
    this.followTarget  = null       // () => Vector3 — dynamic orbit target

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
    this.controls.enableDamping  = true
    this.controls.dampingFactor  = 0.04
    this.controls.minDistance    = 0.05
    this.controls.maxDistance    = 120
    this.controls.enabled        = false
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
        this.introComplete    = true
      },
    })
  }

  /** Lock/unlock controls during transitions */
  lock()   { this._locked = true;  this.controls.enabled = false }
  unlock() { this._locked = false; this.controls.enabled = true  }

  /** Switch camera to solar system view (Sun at origin) */
  enterSolarMode() {
    this._mode = 'solar'
    this.controls.minDistance = 1
    this.controls.maxDistance = 260  // must be > GALAXY_RETURN_DIST so user can reach it
    this.controls.target.set(0, 0, 0)
    this.camera.position.set(0, 40, 130)
    this.camera.lookAt(0, 0, 0)
    this.controls.update()
  }

  /** Switch camera back to galaxy view */
  enterGalaxyMode() {
    this._mode = 'galaxy'
    this.controls.minDistance = 0.05
    this.controls.maxDistance = 120
    this.controls.target.set(0, 0, 0)
    this.camera.position.set(14, 9, 22)
    this.camera.lookAt(0, 0, 0)
    this.controls.update()
  }

  update() {
    if (!this.introComplete) {
      this.camera.lookAt(0, 0, 0)
      return
    }

    // Follow dynamic target (e.g. Earth) in solar mode
    if (this._mode === 'solar' && this.followTarget) {
      const pos = this.followTarget()
      this.controls.target.copy(pos)
    }

    this.controls.update()

    if (this._locked) return

    if (this._mode === 'galaxy') {
      const dist = this.camera.position.length()
      if (dist < SOLAR_TRIGGER_DIST && this.onEnterSolar) {
        this._locked = true
        this.onEnterSolar()
      }
    } else if (this._mode === 'solar') {
      const dist = this.camera.position.length()
      if (dist > GALAXY_RETURN_DIST && this.onExitSolar) {
        this._locked = true
        this.onExitSolar()
      }
    }
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }
}
