<!-- pages/index.vue -->
<template>
    <div class="container mx-auto">
      <h1 class="text-xl font-bold mb-4 py-3 px-3">Health Facility Search Surges</h1>
      <!-- <MapDisplay /> -->
      <MapView />
    </div>
  </template>
  
  <script lang="ts" setup>
  // import MapDisplay from '@/components/MapDisplay.vue';
  definePageMeta({
    layout: 'admin-dashboard'
 })
  </script>
  