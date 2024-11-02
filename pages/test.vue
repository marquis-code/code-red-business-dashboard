<template>
    <div class="relative w-full h-full">
      <div id="map" class="absolute top-0 left-0 w-full h-full rounded-md"></div>
      <div v-if="currentLocationInfo" class="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-md max-w-sm">
        <h3 class="font-medium text-lg mb-2">Current Location</h3>
        <p class="text-sm"><strong>Address:</strong> {{ currentLocationInfo.address }}</p>
        <p class="text-sm"><strong>Coordinates:</strong> {{ currentLocationInfo.coordinates.lat.toFixed(6) }}, {{ currentLocationInfo.coordinates.lng.toFixed(6) }}</p>
        <p class="text-sm"><strong>Status:</strong> 
          <span :class="isNearHospital ? 'text-green-600' : 'text-red-600'">
            {{ isNearHospital ? 'Within Hospital Range' : 'Outside Hospital Range' }}
          </span>
        </p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { Loader } from "@googlemaps/js-api-loader";
  
  interface LocationInfo {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    placeId?: string;
  }
  
  interface HospitalFacility {
    id: string;
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    radius: number; // radius in meters
  }
  
  // State variables
  const center = ref({ lat: 6.465422, lng: 3.406448 }); // Default to Lagos
  const zoom = ref(14);
  const currentLocationInfo = ref<LocationInfo | null>(null);
  const isNearHospital = ref(false);
  const watchId = ref<number | null>(null);
  const map = ref<google.maps.Map | null>(null);
  const userMarker = ref<google.maps.Marker | null>(null);
  const heatmap = ref<google.maps.visualization.HeatmapLayer | null>(null);
  const geocoder = ref<google.maps.Geocoder | null>(null);
  
  // Sample hospital facilities - replace with your actual hospital data
  const hospitalFacilities: HospitalFacility[] = [
    {
      id: '1',
      name: 'Central Hospital',
      coordinates: { lat: 6.465422, lng: 3.406448 },
      radius: 100 // 100 meters radius
    },
    // Add more hospitals as needed
  ];
  
  // Function to check if user is near any hospital facility
  const checkNearHospital = (userLat: number, userLng: number): HospitalFacility | null => {
    return hospitalFacilities.find(hospital => {
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(userLat, userLng),
        new google.maps.LatLng(hospital.coordinates.lat, hospital.coordinates.lng)
      );
      return distance <= hospital.radius;
    }) || null;
  };
  
  // Function to get address from coordinates
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    if (!geocoder.value) {
      geocoder.value = new google.maps.Geocoder();
    }
  
    try {
      const response = await geocoder.value.geocode({
        location: { lat, lng }
      });
  
      if (response.results[0]) {
        return response.results[0].formatted_address;
      }
      return 'Address not found';
    } catch (error) {
      console.error('Geocoding error:', error);
      return 'Error getting address';
    }
  };
  
  // Function to send attendance data to backend
  const recordAttendance = async (locationInfo: LocationInfo, hospitalId: string) => {
    try {
      await axios.post('/api/attendance', {
        userId: 'current-user-id', // Replace with actual user ID
        hospitalId,
        timestamp: new Date().toISOString(),
        coordinates: locationInfo.coordinates,
        address: locationInfo.address
      });
      console.log('Attendance recorded successfully');
    } catch (error) {
      console.error('Error recording attendance:', error);
    }
  };
  
  // Function to update user location and heatmap
  const updateUserLocation = async (position: GeolocationPosition) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    
    // Update current location info
    const address = await getAddressFromCoordinates(lat, lng);
    currentLocationInfo.value = {
      address,
      coordinates: { lat, lng }
    };
  
    // Update user marker position
    if (userMarker.value) {
      userMarker.value.setPosition({ lat, lng });
    }
  
    // Check if near hospital and record attendance if necessary
    const nearbyHospital = checkNearHospital(lat, lng);
    isNearHospital.value = !!nearbyHospital;
    
    if (nearbyHospital) {
      await recordAttendance(currentLocationInfo.value, nearbyHospital.id);
    }
  
    // Update heatmap data
    if (heatmap.value && map.value) {
      const heatmapData = [
        {
          location: new google.maps.LatLng(lat, lng),
          weight: isNearHospital.value ? 3 : 1
        }
      ];
      heatmap.value.setData(heatmapData);
    }
  };
  
  // Initialize the map
  const initializeMap = async () => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["visualization", "geometry"]
    });
  
    try {
      const google = await loader.load();
      const mapElement = document.getElementById("map");
      
      if (mapElement) {
        map.value = new google.maps.Map(mapElement, {
          center: center.value,
          zoom: zoom.value,
          styles: [
            {
              featureType: "poi.medical",
              elementType: "labels",
              stylers: [{ visibility: "on" }]
            }
          ]
        });
  
        // Add hospital markers and radius circles
        hospitalFacilities.forEach(hospital => {
          // Hospital marker
          new google.maps.Marker({
            position: hospital.coordinates,
            map: map.value!,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#FF0000',
              fillOpacity: 0.8,
              strokeWeight: 2,
              scale: 8
            },
            title: hospital.name
          });
  
          // Hospital radius circle
          new google.maps.Circle({
            map: map.value!,
            center: hospital.coordinates,
            radius: hospital.radius,
            fillColor: '#FF0000',
            fillOpacity: 0.1,
            strokeColor: '#FF0000',
            strokeWeight: 2
          });
  
          // Add info window for hospital
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-medium">${hospital.name}</h3>
                <p class="text-sm">Radius: ${hospital.radius}m</p>
                <p class="text-sm">Coordinates: ${hospital.coordinates.lat.toFixed(6)}, ${hospital.coordinates.lng.toFixed(6)}</p>
              </div>
            `
          });
  
          // Show info window on hover
          const marker = new google.maps.Marker({
            position: hospital.coordinates,
            map: map.value!
          });
  
          marker.addListener('mouseover', () => infoWindow.open(map.value!, marker));
          marker.addListener('mouseout', () => infoWindow.close());
        });
  
        // Initialize user marker
        userMarker.value = new google.maps.Marker({
          map: map.value,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#4285F4',
            fillOpacity: 0.9,
            strokeWeight: 2,
            scale: 7
          },
          title: 'Your Location'
        });
  
        // Initialize heatmap
        heatmap.value = new google.maps.visualization.HeatmapLayer({
          map: map.value,
          radius: 30,
          gradient: [
            'rgba(0, 255, 0, 0)',
            'rgba(0, 255, 0, 0.6)',
            'rgba(255, 255, 0, 0.7)',
            'rgba(255, 0, 0, 0.8)',
          ]
        });
  
        // Start watching user location
        if (navigator.geolocation) {
          watchId.value = navigator.geolocation.watchPosition(
            updateUserLocation,
            (error) => console.error('Error watching position:', error),
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
          );
        }
      }
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };
  
  // Cleanup function
  onUnmounted(() => {
    if (watchId.value !== null) {
      navigator.geolocation.clearWatch(watchId.value);
    }
  });
  
  // Initialize map on component mount
  onMounted(() => {
    initializeMap();
  });
  </script>