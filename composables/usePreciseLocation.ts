import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  altitude: number | null
  altitudeAccuracy: number | null
  heading: number | null
  speed: number | null
  timestamp: number
  source: string
  confidence: number
  address?: string
}

export interface LocationOptions {
  enableHighAccuracy: boolean
  timeout: number
  maximumAge: number
  continuousTracking: boolean
  trackingInterval: number
  useNetworkLocation: boolean
  useIPLocation: boolean
  useFusedLocation: boolean
  minAccuracyThreshold: number
  locationFilter: boolean
  kalmanFilter: boolean
}

export function usePreciseLocation(options: Partial<LocationOptions> = {}) {
  // Default options
  const defaultOptions: LocationOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    continuousTracking: true,
    trackingInterval: 5000,
    useNetworkLocation: true,
    useIPLocation: true,
    useFusedLocation: true,
    minAccuracyThreshold: 100, // meters
    locationFilter: true,
    kalmanFilter: true
  }
  
  const settings = { ...defaultOptions, ...options }
  
  // State
  const currentLocation = ref<LocationData | null>(null)
  const locationHistory = ref<LocationData[]>([])
  const isTracking = ref(false)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const watchId = ref<number | null>(null)
  const trackingIntervalId = ref<number | null>(null)
  const lastIPLocation = ref<LocationData | null>(null)
  const lastNetworkLocation = ref<LocationData | null>(null)
  
  // Kalman filter state (for smoothing location data)
  const kalmanState = ref({
    x: 0, // latitude
    y: 0, // longitude
    variance: 1
  })
  
  // Computed
  const hasLocation = computed(() => currentLocation.value !== null)
  const accuracy = computed(() => currentLocation.value?.accuracy || 0)
  const isHighAccuracy = computed(() => accuracy.value <= settings.minAccuracyThreshold)
  
  // Location history stats
  const locationStats = computed(() => {
    if (locationHistory.value.length === 0) return null
    
    const accuracies = locationHistory.value.map(loc => loc.accuracy)
    return {
      count: locationHistory.value.length,
      averageAccuracy: accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length,
      minAccuracy: Math.min(...accuracies),
      maxAccuracy: Math.max(...accuracies),
      timeSpan: locationHistory.value.length > 1 
        ? locationHistory.value[locationHistory.value.length - 1].timestamp - locationHistory.value[0].timestamp 
        : 0
    }
  })
  
  // Methods
  
  // Initialize Kalman filter
  const initKalmanFilter = (lat: number, lng: number) => {
    kalmanState.value = {
      x: lat,
      y: lng,
      variance: 1
    }
  }
  
  // Apply Kalman filter to smooth location data
  const applyKalmanFilter = (lat: number, lng: number, accuracy: number): [number, number] => {
    // Skip filter if it's not initialized
    if (kalmanState.value.x === 0 && kalmanState.value.y === 0) {
      initKalmanFilter(lat, lng)
      return [lat, lng]
    }
    
    // Calculate Kalman gain
    const k = kalmanState.value.variance / (kalmanState.value.variance + (accuracy * 0.01))
    
    // Update state
    const newLat = kalmanState.value.x + k * (lat - kalmanState.value.x)
    const newLng = kalmanState.value.y + k * (lng - kalmanState.value.y)
    
    // Update variance
    kalmanState.value.variance = (1 - k) * kalmanState.value.variance
    
    // Update state
    kalmanState.value.x = newLat
    kalmanState.value.y = newLng
    
    return [newLat, newLng]
  }
  
  // Get location using Geolocation API with high accuracy
  const getHighPrecisionLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }
      
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: settings.enableHighAccuracy,
          timeout: settings.timeout,
          maximumAge: settings.maximumAge
        }
      )
    })
  }
  
  // Get location from IP address (fallback)
  const getIPBasedLocation = async (): Promise<LocationData | null> => {
    try {
      // Use a geolocation API service
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      
      if (data.latitude && data.longitude) {
        const ipLocation: LocationData = {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: 3000, // IP geolocation is typically not very accurate (3km)
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          timestamp: Date.now(),
          source: 'ip',
          confidence: 0.3,
          address: `${data.city}, ${data.region}, ${data.country_name}`
        }
        
        lastIPLocation.value = ipLocation
        return ipLocation
      }
      
      return null
    } catch (err) {
      console.error('Error getting IP location:', err)
      return null
    }
  }
  
  // Get location using network triangulation (fallback)
  const getNetworkBasedLocation = async (): Promise<LocationData | null> => {
    // This is a simplified implementation
    // In a real app, you might use the Network Information API or a third-party service
    
    // For now, we'll use a less accurate geolocation request as a simulation
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 60000
          }
        )
      })
      
      const networkLocation: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy * 1.5, // Simulate less accuracy
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
        source: 'network',
        confidence: 0.7
      }
      
      lastNetworkLocation.value = networkLocation
      return networkLocation
    } catch (err) {
      console.error('Error getting network location:', err)
      return null
    }
  }
  
  // Fuse multiple location sources for better accuracy
  const fuseLocationSources = (
    gpsLocation: LocationData | null,
    networkLocation: LocationData | null,
    ipLocation: LocationData | null
  ): LocationData | null => {
    // If we only have one source, return it
    if (gpsLocation && !networkLocation && !ipLocation) return gpsLocation
    if (!gpsLocation && networkLocation && !ipLocation) return networkLocation
    if (!gpsLocation && !networkLocation && ipLocation) return ipLocation
    
    // If we have no sources, return null
    if (!gpsLocation && !networkLocation && !ipLocation) return null
    
    // If we have GPS with good accuracy, prioritize it
    if (gpsLocation && gpsLocation.accuracy < 50) return gpsLocation
    
    // Otherwise, fuse the available sources with weighted averaging
    let lat = 0
    let lng = 0
    let totalWeight = 0
    
    // Helper function to calculate weight based on accuracy and confidence
    const calculateWeight = (location: LocationData | null): number => {
      if (!location) return 0
      // Lower accuracy values are better (in meters)
      const accuracyFactor = Math.max(0.1, Math.min(1, 100 / location.accuracy))
      return location.confidence * accuracyFactor
    }
    
    // Calculate weighted coordinates
    if (gpsLocation) {
      const weight = calculateWeight(gpsLocation) * 2 // GPS gets double weight
      lat += gpsLocation.latitude * weight
      lng += gpsLocation.longitude * weight
      totalWeight += weight
    }
    
    if (networkLocation) {
      const weight = calculateWeight(networkLocation)
      lat += networkLocation.latitude * weight
      lng += networkLocation.longitude * weight
      totalWeight += weight
    }
    
    if (ipLocation) {
      const weight = calculateWeight(ipLocation)
      lat += ipLocation.latitude * weight
      lng += ipLocation.longitude * weight
      totalWeight += weight
    }
    
    // Normalize by total weight
    if (totalWeight > 0) {
      lat /= totalWeight
      lng /= totalWeight
      
      // Calculate blended accuracy
      let accuracy = 0
      let confidenceSum = 0
      
      if (gpsLocation) {
        accuracy += gpsLocation.accuracy * gpsLocation.confidence
        confidenceSum += gpsLocation.confidence
      }
      
      if (networkLocation) {
        accuracy += networkLocation.accuracy * networkLocation.confidence
        confidenceSum += networkLocation.confidence
      }
      
      if (ipLocation) {
        accuracy += ipLocation.accuracy * ipLocation.confidence
        confidenceSum += ipLocation.confidence
      }
      
      accuracy = confidenceSum > 0 ? accuracy / confidenceSum : 1000
      
      // Create fused location
      return {
        latitude: lat,
        longitude: lng,
        accuracy,
        altitude: gpsLocation?.altitude || null,
        altitudeAccuracy: gpsLocation?.altitudeAccuracy || null,
        heading: gpsLocation?.heading || null,
        speed: gpsLocation?.speed || null,
        timestamp: Date.now(),
        source: 'fused',
        confidence: Math.min(1, totalWeight / 3)
      }
    }
    
    // Fallback to GPS if fusion failed
    return gpsLocation
  }
  
  // Get reverse geocoding data (address from coordinates)
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const apiKey = process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) return null
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      )
      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address
      }
      
      return null
    } catch (err) {
      console.error('Error getting address:', err)
      return null
    }
  }
  
  // Process and filter location update
  const processLocationUpdate = async (position: GeolocationPosition): Promise<LocationData> => {
    let lat = position.coords.latitude
    let lng = position.coords.longitude
    
    // Apply Kalman filter for smoothing if enabled
    if (settings.kalmanFilter && locationHistory.value.length > 0) {
      [lat, lng] = applyKalmanFilter(lat, lng, position.coords.accuracy)
    }
    
    // Create location data object
    const locationData: LocationData = {
      latitude: lat,
      longitude: lng,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
      source: 'gps',
      confidence: 0.9
    }
    
    // Get address if we have good accuracy
    if (position.coords.accuracy < 100) {
      const address = await getAddressFromCoordinates(lat, lng)
      if (address) {
        locationData.address = address
      }
    }
    
    return locationData
  }
  
  // Update location with fusion from multiple sources
  const updateLocation = async (useFusion = settings.useFusedLocation) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Get high-precision GPS location
      let gpsLocationData: LocationData | null = null
      try {
        const position = await getHighPrecisionLocation()
        gpsLocationData = await processLocationUpdate(position)
      } catch (err) {
        console.warn('GPS location error:', err)
      }
      
      // If we have good GPS accuracy and don't need fusion, use it directly
      if (gpsLocationData && gpsLocationData.accuracy < 50 && !useFusion) {
        currentLocation.value = gpsLocationData
        locationHistory.value.push(gpsLocationData)
        return gpsLocationData
      }
      
      // Get network location if enabled
      let networkLocationData: LocationData | null = null
      if (settings.useNetworkLocation) {
        try {
          networkLocationData = await getNetworkBasedLocation()
        } catch (err) {
          console.warn('Network location error:', err)
        }
      }
      
      // Get IP location if enabled
      let ipLocationData: LocationData | null = null
      if (settings.useIPLocation && (!gpsLocationData || gpsLocationData.accuracy > 1000)) {
        try {
          ipLocationData = await getIPBasedLocation()
        } catch (err) {
          console.warn('IP location error:', err)
        }
      }
      
      // Fuse locations if we have multiple sources
      if (useFusion) {
        const fusedLocation = fuseLocationSources(
          gpsLocationData,
          networkLocationData,
          ipLocationData
        )
        
        if (fusedLocation) {
          currentLocation.value = fusedLocation
          locationHistory.value.push(fusedLocation)
          return fusedLocation
        }
      }
      
      // Fallback to GPS if fusion failed or is disabled
      if (gpsLocationData) {
        currentLocation.value = gpsLocationData
        locationHistory.value.push(gpsLocationData)
        return gpsLocationData
      }
      
      // If we still don't have a location, try network
      if (networkLocationData) {
        currentLocation.value = networkLocationData
        locationHistory.value.push(networkLocationData)
        return networkLocationData
      }
      
      // Last resort: IP location
      if (ipLocationData) {
        currentLocation.value = ipLocationData
        locationHistory.value.push(ipLocationData)
        return ipLocationData
      }
      
      throw new Error('Could not determine location from any source')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown location error'
      console.error('Location error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  // Start continuous location tracking
  const startTracking = () => {
    if (isTracking.value) return
    
    isTracking.value = true
    
    // Get initial location
    updateLocation()
    
    // Set up continuous tracking if enabled
    if (settings.continuousTracking) {
      // Use watchPosition for continuous updates
      watchId.value = navigator.geolocation.watchPosition(
        async (position) => {
          const locationData = await processLocationUpdate(position)
          
          // Apply location filtering if enabled
          if (settings.locationFilter && currentLocation.value) {
            // Only update if the new location is significantly different
            const distance = calculateDistance(
              currentLocation.value.latitude,
              currentLocation.value.longitude,
              locationData.latitude,
              locationData.longitude
            )
            
            // Only update if we moved more than accuracy/2 meters or accuracy improved by 20%
            const accuracyImprovement = currentLocation.value.accuracy * 0.8
            if (distance > currentLocation.value.accuracy / 2 || locationData.accuracy < accuracyImprovement) {
              currentLocation.value = locationData
              locationHistory.value.push(locationData)
            }
          } else {
            // No filtering, update directly
            currentLocation.value = locationData
            locationHistory.value.push(locationData)
          }
        },
        (err) => {
          console.warn('Watch position error:', err)
          error.value = err.message
        },
        {
          enableHighAccuracy: settings.enableHighAccuracy,
          timeout: settings.timeout,
          maximumAge: settings.maximumAge
        }
      )
      
      // Set up interval for fusion updates
      if (settings.useFusedLocation) {
        trackingIntervalId.value = window.setInterval(() => {
          updateLocation(true)
        }, settings.trackingInterval)
      }
    }
  }
  
  // Stop location tracking
  const stopTracking = () => {
    if (!isTracking.value) return
    
    isTracking.value = false
    
    // Clear watch
    if (watchId.value !== null) {
      navigator.geolocation.clearWatch(watchId.value)
      watchId.value = null
    }
    
    // Clear interval
    if (trackingIntervalId.value !== null) {
      clearInterval(trackingIntervalId.value)
      trackingIntervalId.value = null
    }
  }
  
  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3 // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    
    return R * c // Distance in meters
  }
  
  // Get location history within a time range
  const getLocationHistoryInRange = (startTime: number, endTime: number) => {
    return locationHistory.value.filter(
      loc => loc.timestamp >= startTime && loc.timestamp <= endTime
    )
  }
  
  // Clear location history
  const clearLocationHistory = () => {
    locationHistory.value = []
  }
  
  // Clean up on component unmount
  onUnmounted(() => {
    stopTracking()
  })
  
  return {
    currentLocation,
    locationHistory,
    isTracking,
    isLoading,
    error,
    hasLocation,
    accuracy,
    isHighAccuracy,
    locationStats,
    updateLocation,
    startTracking,
    stopTracking,
    getLocationHistoryInRange,
    clearLocationHistory,
    calculateDistance
  }
}