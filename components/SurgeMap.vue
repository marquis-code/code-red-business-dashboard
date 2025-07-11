<template>
  <div class="flex items-center justify-center h-screen bg-gray-50">
    <!-- Surge Map Modal -->
    <div
        v-if="showMapModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <!-- Close Button -->
      <div class="flex justify-center items-center absolute top-32 z-50 left-32">
        <button @click="closeMap" class="rounded-full p-1 bg-white z-50 shadow hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Connection Status Indicator -->
      <div class="absolute top-4 right-4 z-50 px-3 py-1 rounded-full text-sm font-medium"
           :class="isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
        <div class="flex items-center space-x-2">
          <div v-if="isConnected" class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div v-else class="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
        </div>
      </div>

      <!-- Module Indicator -->
      <div class="absolute top-16 right-4 z-50 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
        Active: {{ activeModules.join(', ') || 'None' }}
      </div>

      <!-- Surge Statistics -->
      <div class="absolute top-4 left-4 z-50 bg-white p-3 rounded-lg shadow-lg">
        <div class="text-sm">
          <div class="font-semibold mb-1">Live Surge Monitor</div>
          <div class="flex space-x-4">
            <span class="text-red-600">High: {{ surgeStats.high }}</span>
            <span class="text-orange-600">Medium: {{ surgeStats.medium }}</span>
            <span class="text-green-600">Low: {{ surgeStats.low }}</span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            Total Active: {{ activeSurges?.length }}
          </div>
          <div class="text-xs text-gray-500">
            Status: {{ isConnected ? 'Live' : 'Offline' }}
          </div>
          <div v-if="lastSurgeReceived" class="text-xs text-green-600 mt-1">
            Last: {{ lastSurgeReceived }}
          </div>
        </div>
      </div>

      <!-- Map Container -->
      <div class="relative bg-white w-11/12 lg:w-3/4 h-3/4 rounded-lg shadow-lg">
        <div id="map" class="w-full h-full rounded-lg"></div>
      </div>

      <!-- Unified Socket Manager -->
      <UnifiedSocketManager />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onUnmounted } from 'vue';
import { Loader } from '@googlemaps/js-api-loader';
import { useUser } from "@/composables/auth/user";
import { useRegionSurges } from "@/composables/modules/surge/useRegionSurges";
import { useHospitalSurges } from "@/composables/modules/surge/useHospitalSurges";
import { useUnifiedHospitalSocket } from '@/composables/useUnifiedHospitalSocket';
import { onMounted } from 'vue';
import UnifiedSocketManager from './UnifiedSocketManager.vue';

const props = defineProps({
  showMapModal: {
    type: Boolean,
    required: true,
  },
  regionRadius: {
    type: Number,
    default: 15,
  },
});

const emit = defineEmits(['close', 'open']);

// Composables
const { user } = useUser();
const { fetchSurgesInRegion, surges: surgesBasedOnRegion } = useRegionSurges();
const { surges: hospitalSurges } = useHospitalSurges();

// Unified WebSocket composable
const {
  initSocket,
  isConnected,
  activeModules,
  surgeData: realtimeSurgeData,
  activeSurges: realtimeActiveSurges,
  subscribeToHospitalSurges,
  subscribeToRegionalSurges,
  onSurgeCreated,
  onSurgeUpdated,
  switchModule,
  cleanup,
} = useUnifiedHospitalSocket();

// State
const userLocation = ref<{ lat: number; lng: number } | null>(null);
const markers = ref<Map<string, google.maps.Marker>>(new Map());
const infoWindows = ref<Map<string, google.maps.InfoWindow>>(new Map());
const mapInitialized = ref(false);
const lastSurgeReceived = ref<string>('');

// Google Maps instance
let map: google.maps.Map | null = null;
let google: any;

// Computed properties
const apiActiveSurges = computed(() => {
  const combined = new Map();
  
  surgesBasedOnRegion.value?.forEach(surge => {
    if (['pending', 'active', 'in-progress'].includes(surge.status)) {
      combined.set(surge._id, { ...surge, source: 'api' });
    }
  });
  
  hospitalSurges.value?.forEach(surge => {
    if (['pending', 'active', 'in-progress'].includes(surge.status)) {
      combined.set(surge._id, { ...surge, source: 'api' });
    }
  });
  
  return Array.from(combined.values());
});

const allActiveSurges = computed(() => {
  const combined = new Map();
  
  // Add API surges first
  apiActiveSurges.value.forEach(surge => {
    combined.set(surge._id, surge);
  });
  
  // Override with real-time surges (they have priority)
  realtimeActiveSurges.value.forEach(surge => {
    combined.set(surge._id, { ...surge, source: 'websocket' });
  });
  
  return Array.from(combined.values());
});

const surgeStats = computed(() => {
  const stats = { high: 0, medium: 0, low: 0 };
  allActiveSurges.value.forEach(surge => {
    const severity = surge.metadata?.severity?.toLowerCase() || 'low';
    if (severity === 'high') stats.high++;
    else if (severity === 'medium') stats.medium++;
    else stats.low++;
  });
  return stats;
});

// Helper functions
const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'high': return '#FF0000';
    case 'medium': return '#FFA500';
    case 'low': return '#00FF00';
    default: return '#888888';
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return '#FFA500';
    case 'resolved': return '#00FF00';
    case 'active': return '#FF0000';
    case 'in-progress': return '#0066FF';
    default: return '#888888';
  }
};

// Marker management
const createSurgeMarker = (surge: any) => {
  if (!map || !surge.latitude || !surge.longitude) return;

  if (markers.value.has(surge._id)) {
    updateSurgeMarker(surge);
    return;
  }

  const severity = surge.metadata?.severity || 'low';
  const severityColor = getSeverityColor(severity);
  
  const marker = new google.maps.Marker({
    position: { lat: surge.latitude, lng: surge.longitude },
    map: map,
    title: `${surge.emergencyType?.toUpperCase() || 'EMERGENCY'} - ${severity.toUpperCase()}`,
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="${severityColor}" stroke="#ffffff" stroke-width="2"/>
          <circle cx="12" cy="12" r="6" fill="${severityColor}" opacity="0.3"/>
          <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">!</text>
        </svg>
      `),
      scaledSize: new google.maps.Size(40, 40),
      anchor: new google.maps.Point(20, 20)
    },
    animation: google.maps.Animation.DROP
  });

  const infoWindowContent = `
    <div style="max-width: 320px; padding: 12px; font-family: Arial, sans-serif;">
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${severityColor}; margin-right: 8px;"></div>
        <h3 style="margin: 0; color: ${severityColor}; font-size: 18px; font-weight: bold;">
          ${surge.emergencyType?.toUpperCase() || 'EMERGENCY'} SURGE
        </h3>
      </div>
      
      <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 12px; margin-bottom: 12px;">
        <strong>Severity:</strong> 
        <span style="color: ${severityColor}; font-weight: bold;">
          ${severity.toUpperCase()}
        </span>
        
        <strong>Status:</strong> 
        <span style="color: ${getStatusColor(surge.status)}; font-weight: bold;">
          ${surge.status?.toUpperCase() || 'UNKNOWN'}
        </span>
        
        ${surge.address ? `
          <strong>Address:</strong> 
          <span>${surge.address}</span>
        ` : ''}
        
        <strong>Source:</strong> 
        <span style="font-size: 11px; color: #666;">${surge.source || 'unknown'}</span>
      </div>
      
      ${surge.description ? `
        <div style="margin-bottom: 12px;">
          <strong>Description:</strong>
          <p style="margin: 4px 0; color: #555; line-height: 1.4;">${surge.description}</p>
        </div>
      ` : ''}
      
      <div style="border-top: 1px solid #eee; padding-top: 8px; font-size: 12px; color: #666;">
        <div>Created: ${new Date(surge.createdAt).toLocaleString()}</div>
        <div style="margin-top: 4px; font-family: monospace;">ID: ${surge._id}</div>
      </div>
    </div>
  `;

  const infoWindow = new google.maps.InfoWindow({
    content: infoWindowContent,
    maxWidth: 350
  });

  marker.addListener('click', () => {
    infoWindows.value.forEach(window => window.close());
    infoWindow.open(map, marker);
  });

  markers.value.set(surge._id, marker);
  infoWindows.value.set(surge._id, infoWindow);
};

const updateSurgeMarker = (surge: any) => {
  const existingMarker = markers.value.get(surge._id);
  if (existingMarker) {
    const severity = surge.metadata?.severity || 'low';
    const severityColor = getSeverityColor(severity);
    
    existingMarker.setPosition({ lat: surge.latitude, lng: surge.longitude });
    existingMarker.setIcon({
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="${severityColor}" stroke="#ffffff" stroke-width="2"/>
          <circle cx="12" cy="12" r="6" fill="${severityColor}" opacity="0.3"/>
          <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">!</text>
        </svg>
      `),
      scaledSize: new google.maps.Size(40, 40),
      anchor: new google.maps.Point(20, 20)
    });
  } else {
    createSurgeMarker(surge);
  }
};

const removeSurgeMarker = (surgeId: string) => {
  const marker = markers.value.get(surgeId);
  const infoWindow = infoWindows.value.get(surgeId);

  if (marker) {
    marker.setMap(null);
    markers.value.delete(surgeId);
  }

  if (infoWindow) {
    infoWindow.close();
    infoWindows.value.delete(surgeId);
  }
};

const refreshAllMarkers = () => {
  if (!mapInitialized.value) return;
  
  // Clear existing markers
  markers.value.forEach(marker => marker.setMap(null));
  markers.value.clear();
  infoWindows.value.clear();
  
  // Add all active surges
  allActiveSurges.value.forEach(surge => {
    createSurgeMarker(surge);
  });
};

// Location and map initialization
const fetchUserLocation = async (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          userLocation.value = location;
          resolve(location);
        },
        () => {
          const fallbackLocation = { lat: 6.5244, lng: 3.3792 }; // Lagos, Nigeria
          userLocation.value = fallbackLocation;
          resolve(fallbackLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      const fallbackLocation = { lat: 6.5244, lng: 3.3792 };
      userLocation.value = fallbackLocation;
      resolve(fallbackLocation);
    }
  });
};

const initMap = async () => {
  if (!userLocation.value) return;

  const loader = new Loader({
    apiKey: 'AIzaSyBAfieAIDL1vGbkQd74otnW2t0jkDjiPW0',
    version: 'weekly'
  });

  try {
    const googleResponse = await loader.load();
    google = googleResponse;
    await nextTick();
    
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    map = new google.maps.Map(mapElement, {
      center: userLocation.value,
      zoom: 12,
      styles: [
        {
          featureType: 'poi.medical',
          elementType: 'geometry',
          stylers: [{ color: '#ffeaa7' }]
        }
      ]
    });

    mapInitialized.value = true;

    // Add user location marker
    new google.maps.Marker({
      position: userLocation.value,
      map: map,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="#ffffff" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="#ffffff"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16)
      }
    });

    refreshAllMarkers();
  } catch (error) {
    console.error('Error initializing Google Map:', error);
  }
};

// WebSocket connection and event handling
const setupWebSocketConnection = async () => {
  return new Promise<void>((resolve) => {
    console.log("🔌 Setting up unified WebSocket connection...");
    
    // Switch to surge module
    switchModule('surge');
    
    // Initialize unified socket
    initSocket();
    
    // Wait for connection
    const checkConnection = () => {
      if (isConnected.value) {
        console.log("✅ Unified WebSocket connected successfully");
        resolve();
      } else {
        setTimeout(checkConnection, 500);
      }
    };
    
    checkConnection();
    
    // Timeout after 15 seconds
    setTimeout(() => {
      if (!isConnected.value) {
        console.log("⏰ Connection timeout, continuing anyway");
        resolve(); // Continue anyway
      }
    }, 15000);
  });
};

const setupSubscriptions = async () => {
  if (!isConnected.value || !userLocation.value) return;

  try {
    console.log("🔄 Setting up surge subscriptions...");
    
    // Subscribe to regional surges
    await subscribeToRegionalSurges(
      userLocation.value.lat,
      userLocation.value.lng,
      props.regionRadius
    );

    // Subscribe to hospital surges if user is logged in
    if (user.value?.id) {
      await subscribeToHospitalSurges(user.value.id);
    }
    
    console.log("✅ All surge subscriptions set up successfully");
  } catch (error) {
    console.error("❌ Error setting up subscriptions:", error);
  }
};

let removeSurgeCreatedListener: () => void;
let removeSurgeUpdatedListener: () => void;

const setupEventListeners = () => {
  console.log("🎧 Setting up surge event listeners...");
  
  // Listen for new surges
  removeSurgeCreatedListener = onSurgeCreated(({ surge, eventType }) => {
    console.log("🚨 New surge received:", surge, eventType);
    
    if (surge && ['pending', 'active', 'in-progress'].includes(surge.status)) {
      lastSurgeReceived.value = new Date().toLocaleTimeString();
      
      if (mapInitialized.value) {
        createSurgeMarker({ ...surge, source: 'websocket' });
        
        // Pan to high severity surges
        if (surge.metadata?.severity === 'high' && map) {
          map.panTo({ lat: surge.latitude, lng: surge.longitude });
          map.setZoom(15);
        }
      }
    }
  });

  // Listen for surge updates
  removeSurgeUpdatedListener = onSurgeUpdated(({ surge }) => {
    console.log("🔄 Surge updated:", surge);
    
    if (surge && mapInitialized.value) {
      if (['pending', 'active', 'in-progress'].includes(surge.status)) {
        updateSurgeMarker({ ...surge, source: 'websocket' });
      } else {
        removeSurgeMarker(surge._id);
      }
    }
  });

  console.log("✅ Surge event listeners set up successfully");
  
  return () => {
    if (removeSurgeCreatedListener) removeSurgeCreatedListener();
    if (removeSurgeUpdatedListener) removeSurgeUpdatedListener();
  };
};

const loadInitialData = async () => {
  if (!userLocation.value) return;

  try {
    console.log("📊 Loading initial surge data...");
    await fetchSurgesInRegion(
      userLocation.value.lat, 
      userLocation.value.lng, 
      props.regionRadius
    );
    console.log("✅ Initial surge data loaded successfully");
  } catch (error) {
    console.error('❌ Error loading initial data:', error);
  }
};

// Main initialization function
const initializeSurgeMap = async () => {
  try {
    console.log("🚀 Initializing surge map with unified socket...");
    
    // Step 1: Get user location
    console.log("📍 Step 1: Getting user location...");
    await fetchUserLocation();
    
    // Step 2: Load initial API data
    console.log("📊 Step 2: Loading initial data...");
    await loadInitialData();
    
    // Step 3: Initialize map
    console.log("🗺️ Step 3: Initializing map...");
    await initMap();
    
    // Step 4: Setup WebSocket connection and wait for it
    console.log("🔌 Step 4: Setting up WebSocket connection...");
    await setupWebSocketConnection();
    
    // Step 5: Setup subscriptions
    console.log("📡 Step 5: Setting up subscriptions...");
    await setupSubscriptions();
    
    // Step 6: Setup event listeners
    console.log("🎧 Step 6: Setting up event listeners...");
    setupEventListeners();
    
    console.log("✅ Surge map initialization complete!");
    
  } catch (error) {
    console.error('❌ Error initializing surge map:', error);
  }
};

// Watchers
watch([allActiveSurges], () => {
  if (mapInitialized.value) {
    refreshAllMarkers();
  }
}, { deep: true });

watch(isConnected, (connected) => {
  console.log(`🔌 Connection status changed: ${connected ? 'Connected' : 'Disconnected'}`);
});

let initializePromise: Promise<void> | null = null;

const isMapModalOpen = ref(false);

const initializeOnMount = async () => {
  if (props.showMapModal && !initializePromise) {
    isMapModalOpen.value = true;
    emit('open');
    initializePromise = initializeSurgeMap();
    await initializePromise;
    initializePromise = null;
  }
};

onMounted(async () => {
  await initializeOnMount();
});

watch(
  () => props.showMapModal,
  async (newValue) => {
    if (newValue) {
      console.log("🔓 Modal opened, initializing surge map...");
      isMapModalOpen.value = true;
      if (!initializePromise) {
        initializePromise = initializeSurgeMap();
        await initializePromise;
        initializePromise = null;
      }
    } else {
      console.log("🔒 Modal closed, cleaning up...");
      isMapModalOpen.value = false;
      cleanup();
      mapInitialized.value = false;
      if (removeSurgeCreatedListener) {
        removeSurgeCreatedListener();
      }
      if (removeSurgeUpdatedListener) {
        removeSurgeUpdatedListener();
      }
    }
  }
);

const closeMap = () => {
  emit('close');
};

onUnmounted(() => {
  cleanup();
  if (removeSurgeCreatedListener) {
    removeSurgeCreatedListener();
  }
  if (removeSurgeUpdatedListener) {
    removeSurgeUpdatedListener();
  }
});
</script>

<style scoped>
#map {
  width: 100%;
  height: 100%;
}

button {
  transition: all 0.2s ease-in-out;
}

button:hover {
  transform: scale(1.05);
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>
