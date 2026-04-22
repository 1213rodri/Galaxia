import * as THREE from 'three'
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js'

function makeFlareTexture(size = 256, rings = false) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')

  if (rings) {
    // Hexagonal diffraction ring texture
    const g = ctx.createRadialGradient(size/2, size/2, size*0.1, size/2, size/2, size/2)
    g.addColorStop(0.0, 'rgba(255,255,255,0.0)')
    g.addColorStop(0.3, 'rgba(180,210,255,0.6)')
    g.addColorStop(0.5, 'rgba(100,160,255,0.2)')
    g.addColorStop(1.0, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  } else {
    // Soft circular glow
    const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
    g.addColorStop(0.0, 'rgba(255,255,255,1)')
    g.addColorStop(0.1, 'rgba(220,235,255,0.8)')
    g.addColorStop(0.4, 'rgba(100,150,255,0.3)')
    g.addColorStop(1.0, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }

  return new THREE.CanvasTexture(canvas)
}

export class LensFlares {
  constructor(scene) {
    const texGlow = makeFlareTexture(256, false)
    const texRing = makeFlareTexture(256, true)

    // ── Galaxy core flare ─────────────────────────────────────────────────────
    const coreFlare = new Lensflare()
    coreFlare.position.set(0, 0.1, 0)
    coreFlare.addElement(new LensflareElement(texGlow, 120, 0,   new THREE.Color('#ffc87a')))
    coreFlare.addElement(new LensflareElement(texRing, 200, 0.1, new THREE.Color('#aa88ff')))
    coreFlare.addElement(new LensflareElement(texGlow, 40,  0.4, new THREE.Color('#6688ff')))
    coreFlare.addElement(new LensflareElement(texGlow, 20,  0.7, new THREE.Color('#aaccff')))
    scene.add(coreFlare)

    // ── Mar star flare ────────────────────────────────────────────────────────
    const marFlare = new Lensflare()
    marFlare.position.set(7.5, 0.4, 4.8)
    marFlare.addElement(new LensflareElement(texGlow, 80,  0,   new THREE.Color('#ffe0a0')))
    marFlare.addElement(new LensflareElement(texRing, 140, 0.08,new THREE.Color('#ffcc66')))
    marFlare.addElement(new LensflareElement(texGlow, 25,  0.5, new THREE.Color('#ff9966')))
    scene.add(marFlare)

    // ── A few random bright-star flares in the outer disk ────────────────────
    const brightPositions = [
      new THREE.Vector3(-9,  0.2,  3),
      new THREE.Vector3( 5,  0.1, -10),
      new THREE.Vector3(-4,  0.3,  9),
    ]

    for (const p of brightPositions) {
      const f = new Lensflare()
      f.position.copy(p)
      f.addElement(new LensflareElement(texGlow, 45, 0,    new THREE.Color('#b0c8ff')))
      f.addElement(new LensflareElement(texRing, 80, 0.06, new THREE.Color('#8899ff')))
      scene.add(f)
    }
  }
}
