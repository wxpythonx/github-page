<template>
  <div class="container">
    <StarrySky />
  </div>
</template>

<script>
import StarrySky from './components/StarrySky.vue'

export default {
  name: 'App',
  components: {
    StarrySky
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, #0a0a1a 0%, #1a1a3a 50%, #2a2a4a 100%);
  overflow: hidden;
  position: relative;
}
</style>
