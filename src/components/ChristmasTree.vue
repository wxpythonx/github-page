<template>
  <div class="christmas-tree-container">
    <svg viewBox="0 0 400 500" class="christmas-tree">
      <g class="tree-layers">
        <path class="tree-layer" d="M200,50 L280,140 L120,140 Z" fill="#006400"/>
        <path class="tree-layer" d="M200,90 L320,200 L80,200 Z" fill="#006400"/>
        <path class="tree-layer" d="M200,160 L350,280 L50,280 Z" fill="#006400"/>
        <path class="tree-layer" d="M200,240 L380,360 L20,360 Z" fill="#006400"/>
      </g>
      
      <rect class="trunk" x="180" y="360" width="40" height="80" fill="#8B4513"/>
      
      <circle class="star" cx="200" cy="40" r="15" fill="#FFD700"/>
      
      <g class="lights">
        <circle 
          v-for="light in lights" 
          :key="light.id"
          class="light"
          :cx="light.x"
          :cy="light.y"
          :r="light.r"
          :fill="light.color"
          :style="{ animationDelay: light.delay + 's' }"
        />
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const lights = ref([])

onMounted(() => {
  generateLights()
})

function generateLights() {
  const colors = ['#FF0000', '#FFFF00', '#0000FF', '#FF0000', '#FFFF00', '#0000FF']
  
  for (let i = 0; i < 20; i++) {
    lights.value.push({
      id: i,
      x: getRandomX(),
      y: getRandomY(),
      r: 6 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2
    })
  }
}

function getRandomX() {
  const layer = Math.floor(Math.random() * 4)
  const baseX = 200
  const spread = 60 + layer * 40
  return baseX + (Math.random() - 0.5) * spread * 2
}

function getRandomY() {
  const layer = Math.floor(Math.random() * 4)
  const baseY = 90 + layer * 70
  return baseY + (Math.random() - 0.5) * 30
}
</script>

<style scoped>
.christmas-tree-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  background: linear-gradient(to bottom, #0a0a1a 0%, #1a1a3a 100%);
  border-radius: 20px;
  padding: 20px;
}

.christmas-tree {
  width: 400px;
  height: 500px;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
}

.tree-layer {
  filter: drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.1));
}

.trunk {
  filter: drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.1));
}

.star {
  filter: drop-shadow(0 0 10px #FFD700);
  animation: starPulse 2s ease-in-out infinite;
}

.light {
  animation: breathe 2s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% {
    opacity: 1;
    r: 6;
  }
  50% {
    opacity: 0.6;
    r: 8;
  }
}

@keyframes starPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
</style>
