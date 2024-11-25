<template>
  <div class="flex items-center justify-center h-screen bg-gray-50">
    <!-- Surge Map Modal -->
    <div
        v-if="showMapModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
    <div class="flex justify-center items-center absolute top-32 z-50 left-32">
      <button @close="emit('close')" class="rounded-full  p-1 bg-white z-50 shadow">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
      <div class="relative bg-white w-11/12 lg:w-3/4 h-3/4 rounded-lg shadow-lg">
<!--        <button-->
<!--            @click="closeMap"-->
<!--            class="absolute top-4 right-4 text-gray-500 hover:text-gray-800"-->
<!--        >-->
<!--          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>-->
<!--        </button>-->
        <div id="map" class="w-full h-full rounded-lg"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { Loader } from '@googlemaps/js-api-loader';

const props = defineProps({
  showMapModal: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close', 'open']);

// Reactive variable for user location
const userLocation = ref<{ lat: number; lng: number } | null>(null);

// Google Maps instance
let map: google.maps.Map | null = null;

// Generate random surge data with smaller and scattered patches
const generateSurgeData = (centerLat: number, centerLng: number, count: number) => {
  const surgeData = [];
  for (let i = 0; i < count; i++) {
    const offsetLat = (Math.random() - 0.5) * 0.1; // Smaller scatter range
    const offsetLng = (Math.random() - 0.5) * 0.1;
    const severity = Math.random() > 0.5 ? 'high' : 'low'; // Random severity
    const radius = severity === 'high' ? 100 : 50; // Smaller radius for patches

    surgeData.push({
      lat: centerLat + offsetLat,
      lng: centerLng + offsetLng,
      severity,
      radius,
    });
  }
  return surgeData;
};

// Function to fetch user location
const fetchUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation.value = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        },
        (error) => {
          console.error('Error fetching location:', error.message);
          userLocation.value = { lat: 37.7749, lng: -122.4194 }; // Fallback (San Francisco)
        }
    );
  } else {
    console.error('Geolocation not supported.');
    userLocation.value = { lat: 37.7749, lng: -122.4194 }; // Fallback (San Francisco)
  }
};

// Function to initialize the Google Map
const initMap = () => {
  if (!userLocation.value) return;

  const loader = new Loader({
    apiKey: 'AIzaSyCTBVK36LVNlXs_qBOC4RywX_Ihf765lDg', // Replace with your API Key
    version: 'weekly',
  });

  loader.load().then(() => {
    nextTick(() => {
      const mapOptions = {
        center: userLocation.value,
        zoom: 14,
      };

      map = new google.maps.Map(document.getElementById('map') as HTMLElement, mapOptions);

      // Generate Surge Data
      const surgeData = generateSurgeData(
          userLocation.value.lat,
          userLocation.value.lng,
          50 // Generate 50 small surge points
      );

      // Add Surge Areas to Map
      surgeData.forEach((surge) => {
        new google.maps.Circle({
          strokeColor: surge.severity === 'high' ? '#FF0000' : '#00FF00',
          strokeOpacity: 0.8,
          strokeWeight: 1,
          fillColor: surge.severity === 'high' ? '#FF0000' : '#00FF00',
          fillOpacity: 0.6,
          map: map,
          center: { lat: surge.lat, lng: surge.lng },
          radius: surge.radius,
        });
      });

      // Add User Location Marker
      new google.maps.Marker({
        position: userLocation.value,
        map: map,
        title: 'Your Location',
      });
    });
  });
};

// Watch for `showMapModal` to initialize the map
watch(
    () => props.showMapModal,
    (newValue) => {
      if (newValue) {
        emit('open');
        initMap();
      }
    }
);

// Close Map Modal
const closeMap = () => {
  emit('close');
};

// Fetch User Location on Component Mount
onMounted(fetchUserLocation);
</script>

<style scoped>
#map {
  width: 100%;
  height: 100%;
}

button {
  transition: background-color 0.2s;
}
</style>

