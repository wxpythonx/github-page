<template>
  <div class="web-page-wrapper">
    <div ref="containerRef" class="canvas-container"></div>

    <div class="ui-layer">
      <div class="content">
        <h1 class="glow-text">Special Gift For You</h1>
        <p class="subtitle">Drag to rotate · Zoom to explore</p>
        <button class="action-btn" @click="triggerSurprise">Open Surprise</button>
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
let treeGroup

onMounted(() => {
  init()
  createParticleTree()
  animate()
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onWindowResize)
  if (renderer) renderer.dispose()
  if (treeGroup) {
    treeGroup.traverse((child) => {
      if (child.isPoints || child.isMesh || child.isSprite) {
        child.geometry.dispose()
        child.material.dispose()
        if (child.material.map) child.material.map.dispose()
      }
    })
  }
})

// 窗口大小自适应
function onWindowResize() {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020208) // 深邃星空黑
  scene.fog = new THREE.FogExp2(0x020208, 0.03)

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 3, 16) 

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
  controls.autoRotateSpeed = 1.5
  controls.enablePan = false 
  controls.maxPolarAngle = Math.PI / 2 + 0.1

  treeGroup = new THREE.Group()
  scene.add(treeGroup)
}

// 生成发光粒子贴图
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

function createParticleTree() {
  const particleTexture = createGlowingParticleTexture()
  const treeHeight = 8
  const baseRadius = 3.5

  // ====== A. 构建树身 (海量发光粒子) ======
  const bodyParticleCount = 12000
  const bodyGeometry = new THREE.BufferGeometry()
  const bodyPositions = new Float32Array(bodyParticleCount * 3)
  const bodyColors = new Float32Array(bodyParticleCount * 3)
  
  const color1 = new THREE.Color(0x00ff88) 
  const color2 = new THREE.Color(0x0088ff) 
  const tempColor = new THREE.Color()

  for (let i = 0; i < bodyParticleCount; i++) {
    const y = Math.pow(Math.random(), 1.5) * treeHeight 
    const progress = y / treeHeight
    const currentRadius = (1 - progress) * baseRadius
    const angle = progress * Math.PI * 40 + (Math.random() * Math.PI * 2)
    const r = currentRadius * (0.3 + Math.random() * 0.7)

    bodyPositions[i * 3] = Math.cos(angle) * r
    bodyPositions[i * 3 + 1] = y - (treeHeight / 2) 
    bodyPositions[i * 3 + 2] = Math.sin(angle) * r

    tempColor.lerpColors(color1, color2, Math.random())
    bodyColors[i * 3] = tempColor.r
    bodyColors[i * 3 + 1] = tempColor.g
    bodyColors[i * 3 + 2] = tempColor.b
  }

  bodyGeometry.setAttribute('position', new THREE.BufferAttribute(bodyPositions, 3))
  bodyGeometry.setAttribute('color', new THREE.BufferAttribute(bodyColors, 3))

  const bodyMaterial = new THREE.PointsMaterial({
    size: 0.15,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending, 
    depthWrite: false 
  })

  const bodyPoints = new THREE.Points(bodyGeometry, bodyMaterial)
  treeGroup.add(bodyPoints)

  // ====== B. 构建装饰彩灯 (大颗粒明亮粒子) ======
  const lightParticleCount = 200
  const lightGeometry = new THREE.BufferGeometry()
  const lightPositions = new Float32Array(lightParticleCount * 3)
  const lightColors = new Float32Array(lightParticleCount * 3)
  
  const lightColorPalette = [0xff2222, 0xffaa00, 0xffffff, 0x00eeff, 0xff00aa]

  for (let i = 0; i < lightParticleCount; i++) {
    const y = Math.random() * treeHeight
    const progress = y / treeHeight
    const currentRadius = (1 - progress) * baseRadius
    const angle = progress * Math.PI * 20 
    const r = currentRadius * 1.05

    lightPositions[i * 3] = Math.cos(angle) * r
    lightPositions[i * 3 + 1] = y - (treeHeight / 2)
    lightPositions[i * 3 + 2] = Math.sin(angle) * r

    const randomColor = new THREE.Color(lightColorPalette[Math.floor(Math.random() * lightColorPalette.length)])
    lightColors[i * 3] = randomColor.r
    lightColors[i * 3 + 1] = randomColor.g
    lightColors[i * 3 + 2] = randomColor.b
  }

  lightGeometry.setAttribute('position', new THREE.BufferAttribute(lightPositions, 3))
  lightGeometry.setAttribute('color', new THREE.BufferAttribute(lightColors, 3))

  const lightMaterial = new THREE.PointsMaterial({
    size: 0.4, 
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  const lightPoints = new THREE.Points(lightGeometry, lightMaterial)
  treeGroup.add(lightPoints)

  // ====== C. 树顶耀眼星星 (全新：赛博朋克线框水晶星) ======
  const starGroup = new THREE.Group()
  starGroup.name = 'topStar' // 命名以便在动画中引用
  starGroup.position.set(0, (treeHeight / 2) + 0.6, 0)

  // 1. 外壳：金色的锐利线框
  const shellGeometry = new THREE.IcosahedronGeometry(0.5, 0)
  const shellMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd700, 
    wireframe: true, // 核心机制：只渲染锋利的线条，绝对不糊
    transparent: true,
    opacity: 0.9
  })
  const shellMesh = new THREE.Mesh(shellGeometry, shellMaterial)
  starGroup.add(shellMesh)

  // 2. 内核：悬浮的极亮小钻石
  const coreGeometry = new THREE.OctahedronGeometry(0.15, 0)
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffaa00,
    emissiveIntensity: 2, 
  })
  const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial)
  starGroup.add(coreMesh)

  // 3. 物理光源：照亮树顶
  const topLight = new THREE.PointLight(0xffddaa, 2, 4)
  starGroup.add(topLight)

  treeGroup.add(starGroup)
}

const clock = new THREE.Clock()

function animate() {
  animationId = requestAnimationFrame(animate)
  const elapsedTime = clock.getElapsedTime()
  
  // 1. 轨道控制器自动旋转
  controls.update()
  
  // 2. 树体整体上下悬浮呼吸感
  treeGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.1
  
  // 3. 顶部线框水晶独立翻转
  const topStar = treeGroup.getObjectByName('topStar')
  if (topStar) {
    topStar.rotation.x += 0.01
    topStar.rotation.y += 0.02
  }

  renderer.render(scene, camera)
}

// UI 按钮交互
function triggerSurprise() {
  controls.autoRotateSpeed = 10.0 // 点击后加速旋转
  setTimeout(() => {
    controls.autoRotateSpeed = 1.5
    alert('惊喜开启！你可以把这里换成页面跳转或动画效果！')
  }, 2000)
}
</script>

<style scoped>
.web-page-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #020208;
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
  justify-content: flex-end; 
  align-items: center;
  padding-bottom: 80px;
  pointer-events: none; /* 允许鼠标穿透操作 3D 树 */
}

.content {
  text-align: center;
  pointer-events: auto; /* 让文字层可点击 */
}

.glow-text {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 3rem;
  color: #fff;
  margin: 0;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.8), 0 0 40px rgba(0, 136, 255, 0.5);
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
  border-color: rgba(0, 255, 136, 0.8);
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .glow-text { font-size: 2rem; }
  .ui-layer { padding-bottom: 50px; }
}
</style>
