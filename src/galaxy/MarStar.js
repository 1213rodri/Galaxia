import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import gsap from 'gsap'
import fontData from 'three/examples/fonts/helvetiker_bold.typeface.json'

// World position of Mar's star — in an outer spiral arm
const MAR_POSITION = new THREE.Vector3(7.5, 0.4, 4.8)

export class MarStar {
  constructor(scene, camera, canvas) {
    this.scene  = scene
    this.camera = camera
    this.canvas = canvas
    this.group  = new THREE.Group()
    scene.add(this.group)

    this._raycaster   = new THREE.Raycaster()
    this._mouse       = new THREE.Vector2()
    this._hitMesh     = null
    this._revealed    = false

    this._buildStar()
    this._buildRings()
    this._buildLabel()
    this._buildOverlay()
    this._listenClick()
  }

  // ── Bright star point ───────────────────────────────────────────────────────
  _buildStar() {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array([MAR_POSITION.x, MAR_POSITION.y, MAR_POSITION.z]), 3
    ))

    const mat = new THREE.PointsMaterial({
      color:       new THREE.Color('#ffe8c0'),
      size:        0.55,
      sizeAttenuation: true,
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    })

    this.group.add(new THREE.Points(geo, mat))

    // Invisible sphere for raycasting
    this._hitMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 8, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    )
    this._hitMesh.position.copy(MAR_POSITION)
    this.scene.add(this._hitMesh)
  }

  // ── Pulsing rings around the star ──────────────────────────────────────────
  _buildRings() {
    this._rings = []

    for (let r = 0; r < 2; r++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.5, 0.52, 64),
        new THREE.MeshBasicMaterial({
          color:       new THREE.Color('#aad4ff'),
          transparent: true,
          opacity:     0,
          side:        THREE.DoubleSide,
          depthWrite:  false,
          blending:    THREE.AdditiveBlending,
        })
      )
      ring.position.copy(MAR_POSITION)
      this.scene.add(ring)
      this._rings.push(ring)

      // Stagger the two rings
      this._animateRing(ring, r * 1.2)
    }
  }

  _animateRing(ring, delay) {
    const tl = gsap.timeline({ repeat: -1, delay })
    tl.set(ring.scale, { x: 1, y: 1, z: 1 })
    tl.set(ring.material, { opacity: 0 })
    tl.to(ring.material, { opacity: 0.6, duration: 0.3 })
    tl.to(ring.scale, { x: 3.5, y: 3.5, z: 3.5, duration: 2.5, ease: 'power1.out' }, '<')
    tl.to(ring.material, { opacity: 0, duration: 2.0, ease: 'power1.out' }, '<0.3')
  }

  // ── Billboard label "Mar ★" ─────────────────────────────────────────────────
  _buildLabel() {
    this._labelGroup = new THREE.Group()
    this._labelGroup.position.copy(MAR_POSITION).add(new THREE.Vector3(0, 0.9, 0))
    this.scene.add(this._labelGroup)

    const font = new FontLoader().parse(fontData)

    const geo = new TextGeometry('Mar  ★', {
      font,
      size:          0.22,
      depth:         0.02,
      curveSegments: 10,
    })
    geo.center()

    this._labelMat = new THREE.MeshBasicMaterial({
      color:       new THREE.Color('#ffd8a0'),
      transparent: true,
      opacity:     0,
    })

    this._labelGroup.add(new THREE.Mesh(geo, this._labelMat))

    // Fade in after galaxy label appears
    gsap.to(this._labelMat, { opacity: 1, duration: 2, delay: 18, ease: 'power2.inOut' })
  }

  // ── Click overlay HTML ──────────────────────────────────────────────────────
  _buildOverlay() {
    const el = document.createElement('div')
    el.id = 'mar-reveal'
    el.innerHTML = `
      <div class="mar-card">
        <div class="mar-star-icon">✦</div>
        <h2>Estrella Mar</h2>
        <p class="mar-subtitle">NGC-RoMar · Brazo espiral exterior</p>
        <div class="mar-divider"></div>
        <p class="mar-message">
          En una galaxia de millones de estrellas,<br>
          esta fue la única con tu nombre.
        </p>
        <button class="mar-close" id="mar-close-btn">× Cerrar</button>
      </div>
    `
    document.body.appendChild(el)

    document.getElementById('mar-close-btn').addEventListener('click', () => {
      el.classList.remove('visible')
    })

    this._overlay = el

    // Inject styles
    const style = document.createElement('style')
    style.textContent = `
      #mar-reveal {
        position: fixed; inset: 0;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,10,0.7);
        backdrop-filter: blur(6px);
        opacity: 0; pointer-events: none;
        transition: opacity 0.6s ease;
        z-index: 100;
      }
      #mar-reveal.visible { opacity: 1; pointer-events: all; }
      .mar-card {
        text-align: center;
        color: #d8ecff;
        font-family: 'Georgia', serif;
        max-width: 440px;
        padding: 48px 40px;
        border: 1px solid rgba(150,180,255,0.2);
        background: rgba(5,10,30,0.85);
        border-radius: 4px;
        letter-spacing: 0.05em;
      }
      .mar-star-icon {
        font-size: 28px;
        color: #ffd8a0;
        margin-bottom: 16px;
        animation: pulse-star 2s ease-in-out infinite;
      }
      @keyframes pulse-star {
        0%,100% { opacity: 1; transform: scale(1); }
        50%      { opacity: 0.6; transform: scale(1.15); }
      }
      .mar-card h2 {
        font-size: 26px; font-weight: normal;
        letter-spacing: 0.3em; margin: 0 0 8px;
        color: #fff;
      }
      .mar-subtitle {
        font-size: 11px; letter-spacing: 0.2em;
        color: #556688; margin: 0 0 24px;
        text-transform: uppercase;
      }
      .mar-divider {
        width: 60px; height: 1px;
        background: rgba(150,180,255,0.3);
        margin: 0 auto 24px;
      }
      .mar-message {
        font-size: 15px; line-height: 1.9;
        color: #b8d0f0; margin: 0 0 32px;
        font-style: italic;
      }
      .mar-close {
        background: none; border: 1px solid rgba(150,180,255,0.25);
        color: #667799; padding: 8px 24px;
        cursor: pointer; letter-spacing: 0.15em;
        font-size: 12px; border-radius: 2px;
        transition: color 0.2s, border-color 0.2s;
      }
      .mar-close:hover { color: #aac0e0; border-color: rgba(150,180,255,0.5); }
    `
    document.head.appendChild(style)
  }

  // ── Click detection ─────────────────────────────────────────────────────────
  _listenClick() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      this._mouse.set(
        ((e.clientX - rect.left) / rect.width)  * 2 - 1,
        -((e.clientY - rect.top)  / rect.height) * 2 + 1
      )
      this._raycaster.setFromCamera(this._mouse, this.camera)
      const hits = this._raycaster.intersectObject(this._hitMesh)
      if (hits.length > 0) {
        this._overlay.classList.add('visible')
      }
    })
  }

  // ── Rings always face camera ───────────────────────────────────────────────
  update(camera) {
    this._rings.forEach(r => r.quaternion.copy(camera.quaternion))
    this._labelGroup.quaternion.copy(camera.quaternion)
  }
}
