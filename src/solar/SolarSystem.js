import * as THREE from 'three'

const T = new THREE.TextureLoader()
const load = path => T.load(path)

// ── Planet data ───────────────────────────────────────────────────────────────
const PLANETS = [
  {
    name: 'Mercury', radius: 1.1,  distance: 10,  speed: 4.15,
    tex: '/textures/planets/mercury.jpg',
    roughness: 0.9, metalness: 0.0,
    emissive: 0x332211, emissiveIntensity: 0.25,
  },
  {
    name: 'Venus',   radius: 1.9,  distance: 18,  speed: 1.62,
    tex: '/textures/planets/venus.jpg',
    roughness: 0.8, metalness: 0.0,
    emissive: 0x553300, emissiveIntensity: 0.3,
    atmosphere: { color: new THREE.Color(0xffe090), opacity: 0.25 },
  },
  {
    name: 'Earth',   radius: 2.1,  distance: 27,  speed: 1.00,
    tex:    '/textures/planets/earth.jpg',
    clouds: '/textures/planets/earth_clouds.jpg',
    roughness: 0.6, metalness: 0.1,
    emissive: 0x001133, emissiveIntensity: 0.35,
    atmosphere: { color: new THREE.Color(0x4488ff), opacity: 0.35 },
    moon: true,
  },
  {
    name: 'Mars',    radius: 1.4,  distance: 38,  speed: 0.53,
    tex: '/textures/planets/mars.jpg',
    roughness: 0.95, metalness: 0.0,
    emissive: 0x331100, emissiveIntensity: 0.3,
    atmosphere: { color: new THREE.Color(0xff6633), opacity: 0.12 },
  },
  {
    name: 'Jupiter', radius: 5.0,  distance: 58,  speed: 0.084,
    tex: '/textures/planets/jupiter.jpg',
    roughness: 0.7, metalness: 0.0,
    emissive: 0x221100, emissiveIntensity: 0.2,
  },
  {
    name: 'Saturn',  radius: 4.2,  distance: 80,  speed: 0.034,
    tex: '/textures/planets/saturn.jpg',
    roughness: 0.7, metalness: 0.0,
    emissive: 0x221a00, emissiveIntensity: 0.2,
    rings: true,
  },
  {
    name: 'Uranus',  radius: 2.5,  distance: 100, speed: 0.012,
    tex: '/textures/planets/uranus.jpg',
    roughness: 0.5, metalness: 0.0,
    emissive: 0x003333, emissiveIntensity: 0.3,
    atmosphere: { color: new THREE.Color(0x88eeff), opacity: 0.18 },
  },
  {
    name: 'Neptune', radius: 2.2,  distance: 118, speed: 0.006,
    tex: '/textures/planets/neptune.jpg',
    roughness: 0.5, metalness: 0.0,
    emissive: 0x000833, emissiveIntensity: 0.35,
    atmosphere: { color: new THREE.Color(0x3355ff), opacity: 0.2 },
  },
]

// ── Atmosphere (Fresnel rim) shader ───────────────────────────────────────────
const ATMO_VERT = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal  = normalize(normalMatrix * normal);
    vec4 mvp = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvp.xyz);
    gl_Position = projectionMatrix * mvp;
  }
`
const ATMO_FRAG = `
  uniform vec3  uColor;
  uniform float uOpacity;
  varying vec3  vNormal;
  varying vec3  vViewDir;
  void main() {
    float rim = 1.0 - abs(dot(vNormal, vViewDir));
    float a   = pow(rim, 2.5) * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`

// ── Saturn ring canvas texture ────────────────────────────────────────────────
function buildRingTexture() {
  const size   = 512
  const canvas = document.createElement('canvas')
  canvas.width  = size
  canvas.height = 1
  const ctx = canvas.getContext('2d')
  const grd = ctx.createLinearGradient(0, 0, size, 0)

  // Transparent gap near planet, then bands
  grd.addColorStop(0.00, 'rgba(0,0,0,0)')
  grd.addColorStop(0.20, 'rgba(0,0,0,0)')
  grd.addColorStop(0.22, 'rgba(210,190,130,0.55)')
  grd.addColorStop(0.30, 'rgba(180,160,100,0.35)')
  grd.addColorStop(0.38, 'rgba(220,200,140,0.65)')
  grd.addColorStop(0.50, 'rgba(190,170,110,0.45)')
  grd.addColorStop(0.62, 'rgba(215,195,135,0.6)')
  grd.addColorStop(0.75, 'rgba(170,150,90,0.3)')
  grd.addColorStop(0.88, 'rgba(200,180,120,0.2)')
  grd.addColorStop(1.00, 'rgba(0,0,0,0)')

  ctx.fillStyle = grd
  ctx.fillRect(0, 0, size, 1)
  return new THREE.CanvasTexture(canvas)
}

// ── Sun plasma shader ─────────────────────────────────────────────────────────
const SUN_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const SUN_FRAG = `
  uniform sampler2D uTex;
  uniform float     uTime;
  varying vec2      vUv;

  // Simple fbm noise
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i),               hash(i + vec2(1,0)), u.x),
               mix(hash(i + vec2(0,1)),   hash(i + vec2(1,1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec2  uv   = vUv;
    float t    = uTime * 0.12;
    float n    = fbm(uv * 3.0 + t);
    float n2   = fbm(uv * 5.0 - t * 0.7 + n * 0.4);
    vec4  base = texture2D(uTex, uv + n2 * 0.03);

    // Enhance warmth and brightness
    vec3  hot  = mix(vec3(1.0, 0.45, 0.05), vec3(1.0, 0.85, 0.3), n2);
    vec3  col  = mix(base.rgb, hot, 0.45);
    col       *= 1.6;                          // overall brightness
    gl_FragColor = vec4(col, 1.0);
  }
`

export class SolarSystem {
  constructor(scene) {
    this._scene   = scene
    this._group   = new THREE.Group()
    this._pivots  = []
    this._clouds  = []
    this._sunUni  = null

    scene.add(this._group)
    this._group.visible = false

    this._buildSun()
    this._buildPlanets()
    this._buildStarfield()
  }

  // ── Sun ────────────────────────────────────────────────────────────────────
  _buildSun() {
    const sunTex = load('/textures/planets/sun.jpg')

    this._sunUni = {
      uTex:  { value: sunTex },
      uTime: { value: 0 },
    }

    const mat = new THREE.ShaderMaterial({
      uniforms:       this._sunUni,
      vertexShader:   SUN_VERT,
      fragmentShader: SUN_FRAG,
    })

    const geo  = new THREE.SphereGeometry(4.0, 64, 64)
    this._sunMesh = new THREE.Mesh(geo, mat)
    this._group.add(this._sunMesh)

    // Corona halos — additive blending spheres
    const halos = [
      { r: 4.8,  opacity: 0.08, color: 0xffcc44 },
      { r: 6.0,  opacity: 0.045, color: 0xff9922 },
      { r: 7.5,  opacity: 0.022, color: 0xff6600 },
      { r: 9.5,  opacity: 0.010, color: 0xff4400 },
    ]
    halos.forEach(h => {
      const m = new THREE.MeshBasicMaterial({
        color:       h.color,
        transparent: true,
        opacity:     h.opacity,
        blending:    THREE.AdditiveBlending,
        depthWrite:  false,
        side:        THREE.BackSide,
      })
      this._group.add(new THREE.Mesh(new THREE.SphereGeometry(h.r, 32, 32), m))
    })

    // Point light from sun
    const light = new THREE.PointLight(0xfff5cc, 2.5, 400)
    this._group.add(light)

    // Ambient so dark sides aren't pitch black
    this._group.add(new THREE.AmbientLight(0x334466, 2.2))

    // Soft fill light from the opposite side (simulates scattered light)
    const fill = new THREE.DirectionalLight(0x223355, 0.6)
    fill.position.set(-50, 20, -50)
    this._group.add(fill)
  }

  // ── Planets ────────────────────────────────────────────────────────────────
  _buildPlanets() {
    PLANETS.forEach(p => {
      // ── Orbit ring
      const orbitGeo = new THREE.RingGeometry(p.distance - 0.008, p.distance + 0.008, 180)
      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.06,
        side: THREE.DoubleSide, depthWrite: false,
      })
      const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat)
      orbitMesh.rotation.x = Math.PI / 2
      this._group.add(orbitMesh)

      // ── Pivot
      const pivot = new THREE.Object3D()
      pivot.rotation.y = Math.random() * Math.PI * 2
      this._group.add(pivot)

      // ── Planet body
      const tex = load(p.tex)
      const mat = new THREE.MeshStandardMaterial({
        map:               tex,
        roughness:         p.roughness,
        metalness:         p.metalness,
        emissive:          new THREE.Color(p.emissive || 0x000000),
        emissiveIntensity: p.emissiveIntensity || 0,
      })
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.radius, 64, 64), mat)
      mesh.position.x = p.distance
      mesh.rotation.y = Math.random() * Math.PI * 2
      pivot.add(mesh)

      // ── Earth cloud layer
      if (p.clouds) {
        const cloudTex = load(p.clouds)
        const cloudMat = new THREE.MeshStandardMaterial({
          map:         cloudTex,
          alphaMap:    cloudTex,
          transparent: true,
          opacity:     0.65,
          depthWrite:  false,
        })
        const cloudMesh = new THREE.Mesh(
          new THREE.SphereGeometry(p.radius * 1.02, 64, 64), cloudMat
        )
        mesh.add(cloudMesh)
        this._clouds.push(cloudMesh)
      }

      // ── Saturn rings
      if (p.rings) {
        const ringTex = buildRingTexture()
        const ringGeo = new THREE.RingGeometry(p.radius * 1.3, p.radius * 2.6, 128)

        // Map UVs radially so texture maps inner→outer
        const pos = ringGeo.attributes.position
        const uv  = ringGeo.attributes.uv
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), y = pos.getY(i)
          const r = Math.sqrt(x * x + y * y)
          const t = (r - p.radius * 1.3) / (p.radius * 2.6 - p.radius * 1.3)
          uv.setXY(i, t, 0.5)
        }
        uv.needsUpdate = true

        const ringMat = new THREE.MeshBasicMaterial({
          map:         ringTex,
          transparent: true,
          depthWrite:  false,
          side:        THREE.DoubleSide,
        })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.rotation.x = Math.PI / 2.2
        mesh.add(ring)
      }

      // ── Moon (Earth)
      if (p.moon) {
        const moonTex  = load('/textures/planets/moon.jpg')
        const moonMat  = new THREE.MeshStandardMaterial({
          map: moonTex, roughness: 0.95, metalness: 0.0,
        })
        const moonMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 32, 32), moonMat
        )
        moonMesh.position.x = p.radius * 2.8
        const moonPivot = new THREE.Object3D()
        moonPivot.add(moonMesh)
        mesh.add(moonPivot)
        this._moonPivot = moonPivot
      }

      this._pivots.push({ pivot, mesh, speed: p.speed })
    })
  }

  // ── Starfield ──────────────────────────────────────────────────────────────
  _buildStarfield() {
    const count = 4000
    const pos   = new Float32Array(count * 3)
    const col   = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r     = 150 + Math.random() * 200
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      // Slight color variation — white/blue/warm
      const t = Math.random()
      col[i * 3]     = 0.8 + t * 0.2
      col[i * 3 + 1] = 0.8 + (1 - t) * 0.1
      col[i * 3 + 2] = 0.9 + t * 0.1
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3))
    const mat = new THREE.PointsMaterial({
      size: 0.2, sizeAttenuation: true,
      vertexColors: true, transparent: true,
    })
    this._group.add(new THREE.Points(geo, mat))
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  show()            { this._group.visible = true  }
  hide()            { this._group.visible = false }
  setVisible(v)     { this._group.visible = v     }

  update(elapsed) {
    if (!this._group.visible) return

    // Sun animation
    if (this._sunUni) this._sunUni.uTime.value = elapsed
    if (this._sunMesh) this._sunMesh.rotation.y = elapsed * 0.05

    // Planets orbit + self-rotation
    this._pivots.forEach(({ pivot, mesh, speed }) => {
      pivot.rotation.y += speed * 0.004
      mesh.rotation.y  += speed * 0.008
    })

    // Clouds rotate slightly faster than planet
    this._clouds.forEach(c => { c.rotation.y += 0.0004 })

    // Moon
    if (this._moonPivot) this._moonPivot.rotation.y += 0.015
  }
}
