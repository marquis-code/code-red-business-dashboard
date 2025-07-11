<template>
    <div class="relative w-full h-full">
      <!-- Google Map Container -->
      <div ref="mapContainer" class="w-full h-full rounded-lg overflow-hidden"></div>
      
      <!-- Loading Overlay -->
      <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="mt-4 text-gray-700 font-medium">Loading map data...</p>
        </div>
      </div>
      
      <!-- Connection Status -->
      <div 
        v-if="!isConnected" 
        class="absolute top-4 right-4 bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow-md"
      >
        Not connected to surge data
      </div>
      
      <!-- Surge Count Badge -->
      <div 
        v-if="surgeEvents.length > 0" 
        class="absolute top-4 left-4 bg-rose-500 text-white px-3 py-1 rounded-full shadow-md"
      >
        {{ surgeEvents.length }} {{ surgeEvents.length === 1 ? 'surge' : 'surges' }}
      </div>
      
      <!-- Map Controls -->
      <div class="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button 
          @click="toggleHeatmap"
          class="p-2 bg-white rounded-full shadow-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          :class="{ 'bg-rose-100 text-rose-700': showHeatmap }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
        
        <button 
          @click="toggleAccuracyCircles"
          class="p-2 bg-white rounded-full shadow-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          :class="{ 'bg-blue-100 text-blue-700': showAccuracyCircles }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12a3 3 0 100-6 3 3 0 000 6z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
        </button>
        
        <button 
          @click="centerOnHospital"
          class="p-2 bg-white rounded-full shadow-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { useSurgeWebSocket } from '@/composables/useSurgeWebSocket'
  import * as google from 'googlemaps'
  
  // Props
  const props = defineProps({
    hospitalId: {
      type: String,
      required: true
    },
    hospitalLocation: {
      type: Object,
      required: true,
      validator: (value: any) => {
        return typeof value.lat === 'number' && typeof value.lng === 'number'
      }
    },
    mapOptions: {
      type: Object,
      default: () => ({
        zoom: 14,
        mapTypeId: 'roadmap',
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
      })
    }
  })
  
  // Refs
  const mapContainer = ref<HTMLElement | null>(null)
  const map = ref<google.maps.Map | null>(null)
  const hospitalMarker = ref<google.maps.Marker | null>(null)
  const surgeMarkers = ref<google.maps.Marker[]>([])
  const accuracyCircles = ref<google.maps.Circle[]>([])
  const heatmap = ref<google.maps.visualization.HeatmapLayer | null>(null)
  const loading = ref(true)
  const showHeatmap = ref(true)
  const showAccuracyCircles = ref(true)
  
  // Use the surge websocket composable
  const { 
    initializeSocket, 
    isConnected, 
    surgeEvents, 
    subscribeToHospitalSurges 
  } = useSurgeWebSocket()
  
  // Initialize Google Map
  const initializeMap = () => {
    if (!mapContainer.value) return
    
    // Create the map with advanced options
    map.value = new google.maps.Map(mapContainer.value, {
      center: props.hospitalLocation,
      ...props.mapOptions,
      styles: [
        {
          "featureType": "poi.medical",
          "elementType": "geometry",
          "stylers": [
            { "color": "#f5f0ff" }
          ]
        },
        {
          "featureType": "poi.medical",
          "elementType": "labels.icon",
          "stylers": [
            { "color": "#9061f9" }
          ]
        }
      ],
      mapId: 'hospital_surge_map'
    })
    
    // Add hospital marker with custom icon
    hospitalMarker.value = new google.maps.Marker({
      position: props.hospitalLocation,
      map: map.value,
      title: 'Hospital Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#3b82f6', // Blue
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#1d4ed8',
        scale: 10
      },
      zIndex: 10,
      animation: google.maps.Animation.DROP
    })
    
    // Add hospital radius circle (1km)
    new google.maps.Circle({
      strokeColor: '#3b82f6',
      strokeOpacity: 0.3,
      strokeWeight: 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.05,
      map: map.value,
      center: props.hospitalLocation,
      radius: 1000, // 1km radius
      zIndex: 1
    })
    
    // Initialize heatmap layer with advanced options
    heatmap.value = new google.maps.visualization.HeatmapLayer({
      map: showHeatmap.value ? map.value : null,
      data: [],
      radius: 30,
      opacity: 0.7,
      dissipating: true,
      maxIntensity: 10,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
      ]
    })
    
    // Add traffic layer for context
    const trafficLayer = new google.maps.TrafficLayer()
    trafficLayer.setMap(map.value)
    
    loading.value = false
  }
  
  // Update surge markers on the map
  const updateSurgeMarkers = () => {
    if (!map.value) return
    
    // Clear existing markers and circles
    surgeMarkers.value.forEach(marker => marker.setMap(null))
    surgeMarkers.value = []
    
    accuracyCircles.value.forEach(circle => circle.setMap(null))
    accuracyCircles.value = []
    
    // Create heatmap data points
    const heatmapData = surgeEvents.value.map(event => {
      const lat = event.surge.latitude || 0
      const lng = event.surge.longitude || 0
      const accuracy = event.surge.metadata?.locationAccuracy || 100
      
      // Create a new marker for each surge with custom icon based on accuracy
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map.value!,
        title: `Surge at ${new Date(event.timestamp).toLocaleString()}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: getMarkerColor(accuracy), // Color based on accuracy
          fillOpacity: 0.8,
          strokeWeight: 1,
          strokeColor: '#b91c1c',
          scale: getMarkerSize(accuracy) // Size based on accuracy
        },
        animation: google.maps.Animation.DROP,
        zIndex: 5
      })
      
      // Add accuracy circle if enabled
      if (showAccuracyCircles.value) {
        const circle = new google.maps.Circle({
          strokeColor: getMarkerColor(accuracy),
          strokeOpacity: 0.3,
          strokeWeight: 1,
          fillColor: getMarkerColor(accuracy),
          fillOpacity: 0.1,
          map: map.value!,
          center: { lat, lng },
          radius: accuracy, // Use actual accuracy in meters
          zIndex: 2
        })
        
        accuracyCircles.value.push(circle)
      }
      
      // Add click listener to show info window with detailed information
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3">
            <h3 class="font-bold text-gray-900 text-lg">Surge Event</h3>
            <p class="text-sm text-gray-600 mb-2">Time: ${new Date(event.timestamp).toLocaleString()}</p>
            
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span class="font-semibold">Type:</span> 
                <span>${event.surge.emergencyType || 'Visit'}</span>
              </div>
              <div>
                <span class="font-semibold">Status:</span> 
                <span>${event.surge.status || 'pending'}</span>
              </div>
              <div>
                <span class="font-semibold">Accuracy:</span> 
                <span>${Math.round(accuracy)}m</span>
              </div>
              <div>
                <span class="font-semibold">Source:</span> 
                <span>${event.surge.metadata?.locationSource || 'unknown'}</span>
              </div>
            </div>
            
            ${event.surge.address ? `
              <div class="mt-2 text-xs">
                <span class="font-semibold">Address:</span> 
                <span>${event.surge.address}</span>
              </div>
            ` : ''}
          </div>
        `
      })
      
      marker.addListener('click', () => {
        infoWindow.open(map.value!, marker)
      })
      
      surgeMarkers.value.push(marker)
      
      // Return weighted heatmap data point based on accuracy
      return {
        location: new google.maps.LatLng(lat, lng),
        weight: getHeatmapWeight(accuracy)
      }
    })
    
    // Update heatmap data
    if (heatmap.value && heatmapData.length > 0) {
      heatmap.value.setData(heatmapData)
    }
  }
  
  // Helper functions for visualization
  const getMarkerColor = (accuracy: number): string => {
    // Return color based on accuracy
    if (accuracy < 20) return '#10b981' // Green for high accuracy
    if (accuracy < 50) return '#f59e0b' // Yellow for medium accuracy
    if (accuracy < 100) return '#ef4444' // Red for low accuracy
    return '#6b7280' // Gray for very low accuracy
  }
  
  const getMarkerSize = (accuracy: number): number => {
    // Return size based on accuracy (inverse relationship)
    if (accuracy < 20) return 10 // Larger for high accuracy
    if (accuracy < 50) return 8
    if (accuracy < 100) return 6
    return 4 // Smaller for low accuracy
  }
  
  const getHeatmapWeight = (accuracy: number): number => {
    // Return weight based on accuracy (inverse relationship)
    if (accuracy < 20) return 10 // Higher weight for high accuracy
    if (accuracy < 50) return 7
    if (accuracy < 100) return 4
    return 1 // Lower weight for low accuracy
  }
  
  // Toggle heatmap visibility
  const toggleHeatmap = () => {
    showHeatmap.value = !showHeatmap.value
    if (heatmap.value) {
      heatmap.value.setMap(showHeatmap.value ? map.value : null)
    }
  }
  
  // Toggle accuracy circles visibility
  const toggleAccuracyCircles = () => {
    showAccuracyCircles.value = !showAccuracyCircles.value
    
    accuracyCircles.value.forEach(circle => {
      circle.setMap(showAccuracyCircles.value ? map.value : null)
    })
    
    // Refresh markers to update circles
    if (showAccuracyCircles.value) {
      updateSurgeMarkers()
    }
  }
  
  // Center map on hospital
  const centerOnHospital = () => {
    if (map.value) {
      map.value.panTo(props.hospitalLocation)
      map.value.setZoom(14)
    }
  }
  
  // Connect to websocket and subscribe to hospital surges
  const connectAndSubscribe = async () => {
    try {
      // Initialize socket connection
      initializeSocket()
      
      // Wait for connection to be established
      if (!isConnected.value) {
        await new Promise<void>((resolve) => {
          const checkConnection = setInterval(() => {
            if (isConnected.value) {
              clearInterval(checkConnection)
              resolve()
            }
          }, 500)
          
          // Timeout after 5 seconds
          setTimeout(() => {
            clearInterval(checkConnection)
            if (!isConnected.value) {
              console.error('Timed out waiting for socket connection')
              resolve() // Resolve anyway to continue
            }
          }, 5000)
        })
      }
      
      // Subscribe to hospital surges
      if (isConnected.value) {
        await subscribeToHospitalSurges(props.hospitalId)
      }
    } catch (error) {
      console.error('Failed to connect and subscribe:', error)
    }
  }
  
  // Lifecycle hooks
  onMounted(() => {
    // Initialize map when component is mounted
    if (window.google && window.google.maps) {
      initializeMap()
    } else {
      // Google Maps API not loaded yet, wait for it
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps)
          initializeMap()
        }
      }, 100)
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkGoogleMaps)
        if (!window.google || !window.google.maps) {
          console.error('Google Maps API not loaded')
          loading.value = false
        }
      }, 10000)
    }
    
    // Connect to websocket and subscribe to hospital surges
    connectAndSubscribe()
  })
  
  // Watch for changes in surge events to update markers
  watch(surgeEvents, () => {
    updateSurgeMarkers()
  }, { deep: true })
  
  // Clean up on unmount
  onUnmounted(() => {
    // Clear markers
    if (hospitalMarker.value) {
      hospitalMarker.value.setMap(null)
    }
    
    surgeMarkers.value.forEach(marker => marker.setMap(null))
    
    accuracyCircles.value.forEach(circle => circle.setMap(null))
    
    if (heatmap.value) {
      heatmap.value.setMap(null)
    }
  })
  </script>
  
  <style scoped>
  /* Add your custom styles here */
  </style>