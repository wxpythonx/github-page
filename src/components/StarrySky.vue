<template>
  <div class="starry-sky-wrapper">
    <div ref="containerRef" class="canvas-container"></div>
    
    <div class="ui-layer">
      <div class="content">
        <h1 class="glow-text">Starry Night</h1>
        <p class="subtitle">Drag to explore · Zoom to see details</p>
        <button class="action-btn" @click="toggleAnimation">{{ isAnimating ? 'Pause' : 'Animate' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const containerRef = ref(null)
let scene, camera, renderer, controls, animationId
let starGroup
let isAnimating = ref(true)

onMounted(() => {
  init()
  createStarrySky()
  animate()
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onWindowResize)
  if (renderer) renderer.dispose()
  if (starGroup) {
    starGroup.traverse((child) => {
      if (child.isPoints || child.isMesh) {
        child.geometry.dispose()
        child.material.dispose()
        if (child.material.map) child.material.map.dispose()
      }
    })
  }
})

function onWindowResize() {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000010) // 深邃星空蓝
  scene.fog = new THREE.FogExp2(0x000010, 0.01)
  
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 0, 100)
  
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  
  if (containerRef.value) {
    containerRef.value.appendChild(renderer.domElement)
  }
  
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.5
  controls.enablePan = true
  
  // ====== 修复 1：补充宇宙光源，照亮星球 ======
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2) // 基础环境光
  scene.add(ambientLight)
  
  const sunLight = new THREE.PointLight(0xffddaa, 2, 1000) // 宇宙中心恒星光
  sunLight.position.set(0, 0, 0)
  scene.add(sunLight)
  // ============================================

  starGroup = new THREE.Group()
  scene.add(starGroup)
}

function createGlowingParticleTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)')
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
}

function createStarrySky() {
  const particleTexture = createGlowingParticleTexture()
  
  // 普通星星
  const starCount = 20000
  const starGeometry = new THREE.BufferGeometry()
  const starPositions = new Float32Array(starCount * 3)
  const starColors = new Float32Array(starCount * 3)
  const starSizes = new Float32Array(starCount)
  
  for (let i = 0; i < starCount; i++) {
    const distance = Math.random() * 500
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    
    starPositions[i * 3] = distance * Math.sin(phi) * Math.cos(theta)
    starPositions[i * 3 + 1] = distance * Math.sin(phi) * Math.sin(theta)
    starPositions[i * 3 + 2] = distance * Math.cos(phi)
    
    const brightness = Math.random() * 0.8 + 0.2
    starColors[i * 3] = brightness
    starColors[i * 3 + 1] = brightness
    starColors[i * 3 + 2] = brightness
    
    starSizes[i] = Math.random() * 0.5 + 0.1
  }
  
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
  starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1))
  
  const starMaterial = new THREE.PointsMaterial({
    size: 0.3,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  
  const stars = new THREE.Points(starGeometry, starMaterial)
  starGroup.add(stars)
  
  // 明亮的恒星
  const brightStarCount = 500
  const brightStarGeometry = new THREE.BufferGeometry()
  const brightStarPositions = new Float32Array(brightStarCount * 3)
  const brightStarColors = new Float32Array(brightStarCount * 3)
  
  const starColorPalette = [0xffffff, 0xffaa00, 0x00eeff, 0xff00aa, 0x00ff88]
  
  for (let i = 0; i < brightStarCount; i++) {
    const distance = Math.random() * 300 + 50
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    
    brightStarPositions[i * 3] = distance * Math.sin(phi) * Math.cos(theta)
    brightStarPositions[i * 3 + 1] = distance * Math.sin(phi) * Math.sin(theta)
    brightStarPositions[i * 3 + 2] = distance * Math.cos(phi)
    
    const color = new THREE.Color(starColorPalette[Math.floor(Math.random() * starColorPalette.length)])
    brightStarColors[i * 3] = color.r
    brightStarColors[i * 3 + 1] = color.g
    brightStarColors[i * 3 + 2] = color.b
  }
  
  brightStarGeometry.setAttribute('position', new THREE.BufferAttribute(brightStarPositions, 3))
  brightStarGeometry.setAttribute('color', new THREE.BufferAttribute(brightStarColors, 3))
  
  const brightStarMaterial = new THREE.PointsMaterial({
    size: 1.5,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  
  const brightStars = new THREE.Points(brightStarGeometry, brightStarMaterial)
  starGroup.add(brightStars)
  
  // 银河
  createGalaxy()
  
  // 星球
  createPlanets()
}

function createGalaxy() {
  const galaxyCount = 5000
  const galaxyGeometry = new THREE.BufferGeometry()
  const galaxyPositions = new Float32Array(galaxyCount * 3)
  const galaxyColors = new Float32Array(galaxyCount * 3)
  
  const centerX = 0
  const centerY = 0
  const centerZ = 0
  const radius = 100
  
  for (let i = 0; i < galaxyCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * radius
    const height = (Math.random() - 0.5) * 10
    
    galaxyPositions[i * 3] = centerX + Math.cos(angle) * distance
    galaxyPositions[i * 3 + 1] = centerY + height
    galaxyPositions[i * 3 + 2] = centerZ + Math.sin(angle) * distance
    
    const color = new THREE.Color(0xffffff)
    const brightness = 0.5 + Math.random() * 0.5
    color.multiplyScalar(brightness)
    galaxyColors[i * 3] = color.r
    galaxyColors[i * 3 + 1] = color.g
    galaxyColors[i * 3 + 2] = color.b
  }
  
  galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3))
  galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3))
  
  const galaxyMaterial = new THREE.PointsMaterial({
    size: 0.2,
    map: createGlowingParticleTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  
  const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial)
  starGroup.add(galaxy)
}

function createPlanets() {
  const planetCount = 10
  const planetColorPalette = [
    0x3498db, 0x2ecc71, 0xe74c3c, 0xf39c12, 
    0x9b59b6, 0x1abc9c, 0xf1c40f, 0xe67e22
  ]
  
  for (let i = 0; i < planetCount; i++) {
    const distance = Math.random() * 200 + 100
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    
    const x = distance * Math.sin(phi) * Math.cos(theta)
    const y = distance * Math.sin(phi) * Math.sin(theta)
    const z = distance * Math.cos(phi)
    
    const size = Math.random() * 3 + 1
    const color = new THREE.Color(planetColorPalette[Math.floor(Math.random() * planetColorPalette.length)])
    
    const planetGeometry = new THREE.SphereGeometry(size, 32, 32)
    const planetMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8,
      metalness: 0.2
    })
    
    const planet = new THREE.Mesh(planetGeometry, planetMaterial)
    planet.position.set(x, y, z)
    starGroup.add(planet)
    
    if (Math.random() > 0.5) {
      createPlanetRing(planet, size)
    }
  }
}

function createPlanetRing(planet, planetSize) {
  const ringGeometry = new THREE.RingGeometry(
    planetSize * 1.5,
    planetSize * 2.5,
    64
  )
  
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    opacity: 0.5,
    transparent: true,
    side: THREE.DoubleSide
  })
  
  const ring = new THREE.Mesh(ringGeometry, ringMaterial)
  ring.rotation.x = Math.PI / 2
  ring.position.copy(planet.position)
  starGroup.add(ring)
}

const clock = new THREE.Clock()

function animate() {
  animationId = requestAnimationFrame(animate)
  const elapsedTime = clock.getElapsedTime()
  
  controls.update()
  
  if (isAnimating.value) {
    starGroup.rotation.y += 0.001
    
    // ====== 修复 2：将随机跳动改为平滑呼吸 ======
    if (starGroup) {
      starGroup.traverse((child) => {
        if (child.isPoints) {
          const material = child.material
          if (material) {
            // 用平滑的正弦波替代 Math.random()
            material.opacity = 0.8 + Math.sin(elapsedTime * 1.5) * 0.2
          }
        } else if (child.isMesh && child.geometry.type === 'SphereGeometry') {
          child.rotation.y += 0.01 // 星球自转
        }
      })
    }
    // ===========================================
  }
  
  renderer.render(scene, camera)
}

function toggleAnimation() {
  isAnimating.value = !isAnimating.value
  controls.autoRotate = isAnimating.value
}
</script>

<style scoped>
.starry-sky-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #000010;
  margin: 0;
  padding: 0;
}

.canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.ui-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.content {
  text-align: center;
  pointer-events: auto;
}

.glow-text {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 3rem;
  color: #fff;
  margin: 0;
  text-shadow: 0 0 20px rgba(0, 238, 255, 0.8), 0 0 40px rgba(0, 136, 255, 0.5);
  letter-spacing: 2px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  margin-top: 10px;
  margin-bottom: 30px;
  font-family: monospace;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 12px 30px;
  font-size: 1.1rem;
  border-radius: 30px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(0, 238, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 238, 255, 0.4);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .glow-text { font-size: 2rem; }
}
</style>
