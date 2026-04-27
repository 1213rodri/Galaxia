import * as THREE from 'three'

// Relative sizes and distances (not to scale, but proportional feel)
const PLANETS = [
  { name: 'Mercury', radius: 0.08, distance: 1.4,  speed: 4.15,  color: '#b5b5b5', emissive: '#222' },
  { name: 'Venus',   radius: 0.15, distance: 2.0,  speed: 1.62,  color: '#e8cda0', emissive: '#3a2a00' },
  { name: 'Earth',   radius: 0.16, distance: 2.8,  speed: 1.00,  color: '#4fa3e0', emissive: '#001a33' },
  { name: 'Mars',    radius: 0.10, distance: 3.8,  speed: 0.53,  color: '#c1440e', emissive: '#1a0500' },
  { name: 'Jupiter', radius: 0.45, distance: 6.0,  speed: 0.084, color: '#c88b3a', emissive: '#1a0a00' },
  { name: 'Saturn',  radius: 0.38, distance: 8.5,  speed: 0.034, color: '#e4d191', emissive: '#1a1500' },
  { name: 'Uranus',  radius: 0.22, distance: 11.0, speed: 0.012, color: '#7de8e8', emissive: '#003333' },
  { name: 'Neptune', radius: 0.20, distance: 13.5, speed: 0.006, color: '#4b70dd', emissive: '#000a33' },
]

export class SolarSystem {
  constructor(scene) {
    this._scene  = scene
    this._group  = new THREE.Group()
    this._pivots = []
    this._rings  = []

    scene.add(this._group)
    this._group.visible = false

    this._buildSun()
    this._buildPlanets()
    this._buildStarfield()
  }

  _buildSun() {
    // Sun glow (additive sphere)
    const geo  = new THREE.SphereGeometry(0.6, 32, 32)
    const mat  = new THREE.MeshStandardMaterial({
      color:     0xffdd44,
      emissive:  0xffaa00,
      emissiveIntensity: 2.5,
    })
    this._sun = new THREE.Mesh(geo, mat)
    this._group.add(this._sun)

    // Point light from sun
    const light = new THREE.PointLight(0xfff4cc, 3, 60)
    this._group.add(light)

    // Ambient so dark side isn't pitch black
    const ambient = new THREE.AmbientLight(0x111133, 1.2)
    this._group.add(ambient)

    // Sun corona halo
    const haloGeo = new THREE.SphereGeometry(0.85, 32, 32)
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffcc33,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    })
    this._group.add(new THREE.Mesh(haloGeo, haloMat))
  }

  _buildPlanets() {
    PLANETS.forEach((p, i) => {
      // Orbit ring
      const orbitGeo = new THREE.RingGeometry(p.distance - 0.01, p.distance + 0.01, 128)
      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.07,
        side: THREE.DoubleSide,
      })
      const orbit = new THREE.Mesh(orbitGeo, orbitMat)
      orbit.rotation.x = Math.PI / 2
      this._group.add(orbit)

      // Pivot for orbital animation
      const pivot = new THREE.Object3D()
      this._group.add(pivot)

      // Planet mesh
      const geo = new THREE.SphereGeometry(p.radius, 32, 32)
      const mat = new THREE.MeshStandardMaterial({
        color:    new THREE.Color(p.color),
        emissive: new THREE.Color(p.emissive),
        emissiveIntensity: 0.4,
        roughness: 0.85,
        metalness: 0.1,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.x = p.distance

      // Saturn rings
      if (p.name === 'Saturn') {
        const ringGeo = new THREE.RingGeometry(p.radius * 1.5, p.radius * 2.5, 64)
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xd4c47a,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.rotation.x = Math.PI / 2.8
        mesh.add(ring)
      }

      // Earth: add a simple moon
      if (p.name === 'Earth') {
        const moonPivot = new THREE.Object3D()
        mesh.add(moonPivot)
        const moonGeo = new THREE.SphereGeometry(0.04, 16, 16)
        const moonMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 1 })
        const moon = new THREE.Mesh(moonGeo, moonMat)
        moon.position.x = 0.35
        moonPivot.add(moon)
        this._moonPivot = moonPivot
      }

      pivot.add(mesh)

      // Random start angle
      pivot.rotation.y = Math.random() * Math.PI * 2

      this._pivots.push({ pivot, speed: p.speed, mesh, data: p })
    })
  }

  _buildStarfield() {
    // Background stars for solar system view
    const count = 3000
    const pos   = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r     = 80 + Math.random() * 120
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, sizeAttenuation: true })
    this._group.add(new THREE.Points(geo, mat))
  }

  show() {
    this._group.visible = true
  }

  hide() {
    this._group.visible = false
  }

  update(elapsed) {
    if (!this._group.visible) return

    // Rotate sun
    this._sun.rotation.y = elapsed * 0.2

    // Orbit planets
    this._pivots.forEach(({ pivot, speed }) => {
      pivot.rotation.y += speed * 0.005
    })

    // Moon orbit
    if (this._moonPivot) {
      this._moonPivot.rotation.y += 0.02
    }
  }
}
