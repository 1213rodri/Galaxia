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
const audio          = new AudioManager()
const solarTransition = new SolarTransition()
new IntroScreen(audio)

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
  solarTransition.show('Déjame llevarte a nuestro sistema solar...', () => {
    setGalaxyVisible(false)
    solarSystem.show()
    cameraManager.enterSolarMode()
    // Subtle bloom for sun and planet glow
    sceneManager.setBloom(0.25, 0.5, 0.55)

    solarTransition.hide(() => {
      cameraManager.unlock()
    })
  })
}

cameraManager.onExitSolar = () => {
  solarTransition.show('Regresando a la galaxia...', () => {
    solarSystem.hide()
    setGalaxyVisible(true)
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
