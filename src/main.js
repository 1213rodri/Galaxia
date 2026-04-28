import './style.css'
import * as THREE from 'three'
import { SceneManager }     from './scene/SceneManager.js'
import { CameraManager }    from './scene/CameraManager.js'
import { Galaxy }           from './galaxy/Galaxy.js'
import { GalaxyLabel }      from './galaxy/GalaxyLabel.js'
import { MarStar }          from './galaxy/MarStar.js'
import { Constellation }    from './galaxy/Constellation.js'
import { ShootingStars }    from './galaxy/ShootingStars.js'
import { Comet }            from './galaxy/Comet.js'
import { LensFlares }       from './galaxy/LensFlares.js'
import { SolarSystem }      from './solar/SolarSystem.js'
import { AudioManager }     from './audio/AudioManager.js'
import { IntroScreen }      from './ui/IntroScreen.js'
import { SolarTransition }  from './ui/SolarTransition.js'
import { StoryOverlay }    from './ui/StoryOverlay.js'
import { StoryPlayer }    from './ui/StoryPlayer.js'

const canvas = document.getElementById('galaxy-canvas')

// ── Scene & Camera ────────────────────────────────────────────────────────────
const sceneManager  = new SceneManager(canvas)
const cameraManager = new CameraManager(canvas)
sceneManager.setCamera(cameraManager.camera)

// ── Galaxy objects ────────────────────────────────────────────────────────────
const galaxy        = new Galaxy(sceneManager.scene)
const label         = new GalaxyLabel(sceneManager.scene)
const marStar       = new MarStar(sceneManager.scene, cameraManager.camera, canvas)
const constellation = new Constellation(sceneManager.scene)
const shootingStars = new ShootingStars(sceneManager.scene)
const comet         = new Comet(sceneManager.scene)
new LensFlares(sceneManager.scene)

// ── Solar system ──────────────────────────────────────────────────────────────
const solarSystem   = new SolarSystem(sceneManager.scene)

// ── Audio & UI ────────────────────────────────────────────────────────────────
const audio           = new AudioManager()
const solarTransition = new SolarTransition()
const storyOverlay    = new StoryOverlay()
const storyPlayer     = new StoryPlayer(storyOverlay)
new IntroScreen(audio)

// ── Planet click detection ─────────────────────────────────────────────────────
const raycaster  = new THREE.Raycaster()
const mouse2d    = new THREE.Vector2()
let _inSolar     = false       // true while in solar mode
let _mouseDownXY = null        // used to distinguish clicks from drags

canvas.addEventListener('mousedown', e => {
  _mouseDownXY = { x: e.clientX, y: e.clientY }
})

canvas.addEventListener('mouseup', e => {
  if (!_mouseDownXY || !_inSolar || storyPlayer.isActive) {
    _mouseDownXY = null
    return
  }
  // Only fire if this was a real click (not a drag)
  const dx = e.clientX - _mouseDownXY.x
  const dy = e.clientY - _mouseDownXY.y
  _mouseDownXY = null
  if (dx * dx + dy * dy > 25) return   // >5px movement = drag

  const rect = canvas.getBoundingClientRect()
  mouse2d.x  =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
  mouse2d.y  = -((e.clientY - rect.top)  / rect.height) * 2 + 1
  raycaster.setFromCamera(mouse2d, cameraManager.camera)

  const hits = raycaster.intersectObjects(solarSystem.getPlanetMeshes())
  if (hits.length > 0) storyPlayer.play()
})

// Touch support (mobile)
canvas.addEventListener('touchend', e => {
  if (!_inSolar || storyPlayer.isActive) return
  const touch = e.changedTouches[0]
  const rect  = canvas.getBoundingClientRect()
  mouse2d.x   =  ((touch.clientX - rect.left) / rect.width)  * 2 - 1
  mouse2d.y   = -((touch.clientY - rect.top)  / rect.height) * 2 + 1
  raycaster.setFromCamera(mouse2d, cameraManager.camera)
  const hits = raycaster.intersectObjects(solarSystem.getPlanetMeshes())
  if (hits.length > 0) storyPlayer.play()
})

// ── Galaxy objects show/hide ──────────────────────────────────────────────────
function setGalaxyVisible(v) {
  galaxy.group.visible       = v
  label.group.visible        = v
  marStar.group.visible      = v
  constellation.group.visible = v
  shootingStars.setVisible(v)
  comet.setVisible(v)
}

// ── State machine: galaxy ↔ solar ─────────────────────────────────────────────
cameraManager.onEnterSolar = () => {
  _inSolar = true
  solarTransition.show('Déjame llevarte a nuestro sistema solar...', () => {
    setGalaxyVisible(false)
    solarSystem.show()
    cameraManager.enterSolarMode()
    sceneManager.setBloom(0.25, 0.5, 0.55)

    // Orbit around Earth
    cameraManager.followTarget = () => solarSystem.getEarthPosition()
    // Position camera near Earth
    const earthPos = solarSystem.getEarthPosition()
    cameraManager.camera.position.set(
      earthPos.x, earthPos.y + 8, earthPos.z + 20
    )

    solarTransition.hide(() => {
      cameraManager.unlock()
    })
  })
}

cameraManager.onExitSolar = () => {
  _inSolar = false
  solarTransition.show('Regresando a la galaxia...', () => {
    solarSystem.hide()
    setGalaxyVisible(true)
    cameraManager.followTarget = null
    cameraManager.enterGalaxyMode()
    // Restore galaxy bloom
    sceneManager.setBloom(0.1, 0.35, 0.38)

    solarTransition.hide(() => {
      cameraManager.unlock()
    })
  })
}

// ── Animation loop ────────────────────────────────────────────────────────────
const clock = new THREE.Clock()
let lastTime = 0

function animate() {
  requestAnimationFrame(animate)
  const elapsed = clock.getElapsedTime()
  const delta   = elapsed - lastTime
  lastTime      = elapsed

  galaxy.update(elapsed)
  cameraManager.update()
  label.update(cameraManager.camera)
  marStar.update(cameraManager.camera)
  shootingStars.update(elapsed, delta)
  comet.update(elapsed)
  solarSystem.update(elapsed)
  sceneManager.render()
}

animate()
