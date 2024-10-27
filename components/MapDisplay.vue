<!-- <template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMapbox } from '@/composables/core/useMapbox';

// Center on Lagos, Nigeria
const lagosCenter = [3.3792, 6.5244];  // [Longitude, Latitude] of Lagos

// Define boundaries for Lagos
const lagosBounds: [[number, number], [number, number]] = [[3.2686, 6.3934], [3.4957, 6.6028]];  // Southwest and Northeast corners of Lagos

// Define coordinates for locations around Lagos (random or predefined)
const coordinates = [
  [7.667, 31.750]  // Lagos Center
];

// Example surge data indicating whether there's a surge at each coordinate
// True means surge, false means no surge
const surgeData = [true, false, true, false];  // Random example

const { mapContainer, initMap } = useMapbox();

onMounted(() => {
  console.log("Map container mounted. Initializing map...");
  initMap(coordinates, surgeData, lagosCenter, lagosBounds);  
});
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.map-container {
  width: 100vw;
  height: 100vh;
}
</style> -->

<!-- components/MapDisplay.vue -->
<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { useMapbox } from '@/composables/core/useMapbox';

// Center on Lagos, Nigeria
const lagosCenter = [3.3792, 6.5244];  // [Longitude, Latitude] of Lagos

// Define boundaries for Lagos
const lagosBounds: [[number, number], [number, number]] = [[3.2686, 6.3934], [3.4957, 6.6028]];  // Southwest and Northeast corners of Lagos

// Define coordinates for surge locations around Lagos
const coordinates = [
  [3.3700, 6.5240],  // Example location 1
  [3.4100, 6.5200],  // Example location 2
  [3.4500, 6.5000],  // Example location 3
  [3.4000, 6.5500]   // Example location 4
];

// Example surge data indicating whether there's a surge at each coordinate
const surgeData = [true, false, true, false];  // Random example

const { mapContainer, initMap } = useMapbox();

onMounted(() => {
  console.log("Map container mounted. Initializing map...");
  initMap(coordinates, surgeData, lagosCenter, lagosBounds);  
});
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.map-container {
  width: 100vw;
  height: 100vh;
}
</style>
