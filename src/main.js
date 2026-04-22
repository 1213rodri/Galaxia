import './style.css'
import * as THREE from 'three'
import { SceneManager }   from './scene/SceneManager.js'
import { CameraManager }  from './scene/CameraManager.js'
import { Galaxy }         from './galaxy/Galaxy.js'
import { GalaxyLabel }    from './galaxy/GalaxyLabel.js'
import { MarStar }        from './galaxy/MarStar.js'
import { Constellation }  from './galaxy/Constellation.js'
import { ShootingStars }  from './galaxy/ShootingStars.js'
import { Comet }          from './galaxy/Comet.js'
import { LensFlares }     from './galaxy/LensFlares.js'
import { AudioManager }   from './audio/AudioManager.js'
import { IntroScreen }    from './ui/IntroScreen.js'

const canvas = document.getElementById('galaxy-canvas')

const sceneManager   = new SceneManager(canvas)
const cameraManager  = new CameraManager(canvas)
const galaxy         = new Galaxy(sceneManager.scene)
const label          = new GalaxyLabel(sceneManager.scene)
const marStar        = new MarStar(sceneManager.scene, cameraManager.camera, canvas)
const constellation  = new Constellation(sceneManager.scene)
const shootingStars  = new ShootingStars(sceneManager.scene)
const comet          = new Comet(sceneManager.scene)
new LensFlares(sceneManager.scene)
const audio = new AudioManager()
new IntroScreen(audio)

sceneManager.setCamera(cameraManager.camera)

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
  sceneManager.render()
}

animate()
