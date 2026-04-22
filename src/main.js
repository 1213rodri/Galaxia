import './style.css'
import * as THREE from 'three'
import { SceneManager } from './scene/SceneManager.js'
import { CameraManager } from './scene/CameraManager.js'
import { Galaxy } from './galaxy/Galaxy.js'

const canvas = document.getElementById('galaxy-canvas')

const sceneManager  = new SceneManager(canvas)
const cameraManager = new CameraManager(canvas)
const galaxy        = new Galaxy(sceneManager.scene)

sceneManager.setCamera(cameraManager.camera)

const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const elapsed = clock.getElapsedTime()
  galaxy.update(elapsed)
  cameraManager.update()
  sceneManager.render()
}

animate()
