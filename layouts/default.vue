<template>
  <div>
    <CoreLandingPageLoader @update:show="showOverlay = false" :show="showOverlay" />
    <NuxtPage />
  </div>
</template>


<script setup lang="ts">
const showOverlay = ref(true)
definePageMeta({
  middleware: 'auth'
})
</script>
