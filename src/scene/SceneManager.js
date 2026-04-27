import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas
    this.scene = new THREE.Scene()

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 1)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2

    this._camera = null
    this._composer = null
    this._renderPass = null

    window.addEventListener('resize', this._onResize.bind(this))
  }

  setCamera(camera) {
    this._camera = camera
    this._setupPostProcessing()
  }

  _setupPostProcessing() {
    this._composer = new EffectComposer(this.renderer)

    this._renderPass = new RenderPass(this.scene, this._camera)
    this._composer.addPass(this._renderPass)

    // Bloom — makes stars glow beautifully
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.1,   // strength
      0.35,  // radius
      0.38   // threshold (higher = only bright stars bloom)
    )
    this._composer.addPass(bloomPass)
    this._bloomPass = bloomPass

    // Correct color output
    this._composer.addPass(new OutputPass())
  }

  setBloom(strength, radius, threshold) {
    if (!this._bloomPass) return
    this._bloomPass.strength  = strength
    this._bloomPass.radius    = radius
    this._bloomPass.threshold = threshold
  }

  render() {
    if (this._composer) {
      this._composer.render()
    }
  }

  _onResize() {
    const w = window.innerWidth
    const h = window.innerHeight

    this.renderer.setSize(w, h)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    if (this._composer) {
      this._composer.setSize(w, h)
      this._bloomPass.setSize(w, h)
    }

    if (this._camera) {
      this._camera.aspect = w / h
      this._camera.updateProjectionMatrix()
    }
  }
}
