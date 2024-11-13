<!-- pages/hospitals.vue -->
<template>
    <div class="max-w-6xl mx-auto p-4">
      <!-- Search Section -->
      <div class="mb-6 space-y-4">
        <div class="relative">
          <input
            type="text"
            v-model="location"
            @input="handleSearch"
            placeholder="Enter location to search hospitals..."
            class="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Icon
            name="heroicons:magnifying-glass"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
          />
          <button
            @click="getCurrentLocation"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
          >
            <Icon name="heroicons:map-pin" class="w-4 h-4 mr-2" />
            Use my location
          </button>
        </div>
  
        <!-- Filters Toggle -->
        <div class="flex justify-between items-center">
          <button
            @click="showFilters = !showFilters"
            class="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Icon name="heroicons:funnel" class="w-4 h-4 mr-2" />
            Filters
          </button>
          <div v-if="error" class="text-red-500">
            {{ error }}
          </div>
        </div>
  
        <!-- Filters Section -->
        <div v-if="showFilters" class="bg-white p-4 rounded-lg shadow-lg">
          <div v-for="(options, key) in filterOptions" :key="key" class="space-y-2 mb-4">
            <h3 class="font-medium capitalize">{{ formatFilterName(key) }}</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="option in options"
                :key="option"
                @click="toggleFilter(key, option)"
                :class="[
                  'px-3 py-1 rounded-full text-sm',
                  selectedFilters[key].includes(option)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ option }}
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        Loading hospitals...
      </div>
  
      <!-- Hospital Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="hospital in filteredHospitals"
          :key="hospital.id"
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
        >
          <h3 class="text-lg font-semibold mb-2">{{ hospital.name }}</h3>
          <div class="space-y-2">
            <p class="text-sm text-gray-600 flex items-center">
              <Icon name="heroicons:map-pin" class="w-4 h-4 mr-1" />
              {{ hospital.location }}
            </p>
            <div class="flex justify-between items-center">
              <span
                :class="[
                  'px-2 py-1 rounded-full text-sm',
                  {
                    'bg-green-100 text-green-800': hospital.status === 'Available',
                    'bg-yellow-100 text-yellow-800': hospital.status === 'Busy',
                    'bg-red-100 text-red-800': hospital.status === 'Unavailable'
                  }
                ]"
              >
                {{ hospital.status }}
              </span>
              <span class="text-sm">
                {{ hospital.bedSpaces }} beds available
              </span>
            </div>
            <div v-if="hospital.rating" class="text-sm text-gray-600">
              Rating: {{ hospital.rating }} ⭐
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  
  // Types
  interface Hospital {
    id: string
    name: string
    location: string
    bedSpaces: number
    status: 'Available' | 'Busy' | 'Unavailable'
    rating?: number
    types: string[]
  }
  
  interface FilterState {
    location: string[]
    bedAvailability: string[]
    hospitalType: string[]
  }
  
  // State
  const location = ref('')
  const hospitals = ref<Hospital[]>([])
  const loading = ref(false)
  const error = ref('')
  const showFilters = ref(false)
  
  // Filter options
  const filterOptions = {
    location: ['Nearest to you', 'Surulere', 'Oshodi', 'Ikeja', 'Isolo', 'Mushin', 'Yaba', 'Idi-Araba'],
    bedAvailability: ['Available', 'Unavailable', 'Busy'],
    hospitalType: ['Teaching Hospital', 'General', 'Private', 'FMC']
  }
  
  const selectedFilters = ref<FilterState>({
    location: [],
    bedAvailability: [],
    hospitalType: []
  })
  
  // Computed
  const filteredHospitals = computed(() => {
    return hospitals.value.filter(hospital => {
      const locationMatch = selectedFilters.value.location.length === 0 || 
        selectedFilters.value.location.some(loc => hospital.location.includes(loc))
      const statusMatch = selectedFilters.value.bedAvailability.length === 0 || 
        selectedFilters.value.bedAvailability.includes(hospital.status)
      const typeMatch = selectedFilters.value.hospitalType.length === 0 || 
        selectedFilters.value.hospitalType.some(type => 
          hospital.types.map(t => t.toLowerCase()).includes(type.toLowerCase())
        )
      
      return locationMatch && statusMatch && typeMatch
    })
  })
  
  // Methods
  const formatFilterName = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').trim()
  }
  
  const getCurrentLocation = async () => {
    loading.value = true
    error.value = ''
  
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
  
      const { latitude, longitude } = position.coords
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      )
      const data = await response.json()
  
      if (data.results[0]) {
        location.value = data.results[0].formatted_address
        await fetchHospitals(data.results[0].formatted_address)
      }
    } catch (err) {
      error.value = 'Failed to get location details'
    } finally {
      loading.value = false
    }
  }
  
  const fetchHospitals = async (searchLocation: string) => {
    if (searchLocation.length < 3) return
  
    loading.value = true
    error.value = ''
  
    try {
      // Get coordinates for the search location
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchLocation)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      )
      const geocodeData = await geocodeResponse.json()
  
      if (geocodeData.results[0]) {
        const { lat, lng } = geocodeData.results[0].geometry.location
        
        // Search for nearby hospitals
        const placesResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=hospital&key=${process.env.GOOGLE_MAPS_API_KEY}`
        )
        const placesData = await placesResponse.json()
  
        hospitals.value = placesData.results.map((hospital: any) => ({
          id: hospital.place_id,
          name: hospital.name,
          location: hospital.vicinity,
          bedSpaces: Math.floor(Math.random() * 100),
          status: ['Available', 'Busy', 'Unavailable'][Math.floor(Math.random() * 3)] as Hospital['status'],
          rating: hospital.rating,
          types: hospital.types
        }))
      }
    } catch (err) {
      error.value = 'Failed to fetch hospitals'
    } finally {
      loading.value = false
    }
  }
  
  // Search handler with debounce
  let searchTimeout: NodeJS.Timeout
  const handleSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      fetchHospitals(location.value)
    }, 500)
  }
  
  const toggleFilter = (type: keyof FilterState, value: string) => {
    const index = selectedFilters.value[type].indexOf(value)
    if (index === -1) {
      selectedFilters.value[type].push(value)
    } else {
      selectedFilters.value[type].splice(index, 1)
    }
  }
  
  // Lifecycle
  onMounted(() => {
    getCurrentLocation()
  })
  
  // Cleanup
  onUnmounted(() => {
    clearTimeout(searchTimeout)
  })
  </script>
  
  <style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>