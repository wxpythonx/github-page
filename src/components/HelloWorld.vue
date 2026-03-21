<script setup>
import { ref } from 'vue'

defineProps({
  msg: {
    type: String,
    required: true
  }
})

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>
  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit <code>components/HelloWorld.vue</code> to test hot module replacement
    </p>
  </div>
  <p class="read-the-docs">
    Click on the Vite and Vue logos to learn more
  </p>
</template>

<style scoped>
h1 {
  font-size: 2.5em;
  line-height: 1.1;
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}
</style>
