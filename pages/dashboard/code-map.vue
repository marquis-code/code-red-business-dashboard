
<template>
    <main>
     <div id="map" class="absolute top-0 left-0 w-full h-full rounded-md"></div>
     <div v-if="currentLocationInfo" class="absolute top-24 right-2 bg-white p-4 rounded-lg shadow-md max-w-sm">
         <h3 class="font-medium text-lg mb-2">Current Location</h3>
         <p class="text-sm"><strong>Address:</strong> {{ currentLocationInfo.address }}</p>
         <p class="text-sm"><strong>Coordinates:</strong> {{ currentLocationInfo.coordinates.lat.toFixed(6) }}, {{ currentLocationInfo.coordinates.lng.toFixed(6) }}</p>
         <p class="text-sm"><strong>Status:</strong> 
           <span :class="isNearHospital ? 'text-green-600' : 'text-red-600'">
             {{ isNearHospital ? 'Within Hospital Range' : 'Outside Hospital Range' }}
           </span>
         </p>
       </div>
    </main>
   </template>
   
   <script setup lang="ts">
   import { ref, onMounted } from 'vue';
   import { Loader } from "@googlemaps/js-api-loader";
   import defaultMarkerImage from "@/assets/img/roomBg.png";
   import axios from 'axios';
 
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
   
   // Center and zoom for the map
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
       coordinates: { lat: 6.5171, lng: 3.3528 },
       radius: 400 // 100 meters radius
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
   
   // Generate random coordinates within a boundary
   const generateRandomPoints = (center: { lat: number, lng: number }, count: number) => {
     const points = [];
     const radius = 0.1; // Roughly 11km radius
   
     // Create clusters of points to simulate high traffic areas
     const clusters = [
       { weight: 0.4, center: center }, // Main cluster
       { weight: 0.3, center: { lat: center.lat + 0.05, lng: center.lng + 0.05 } }, // Secondary cluster
       { weight: 0.3, center: { lat: center.lat - 0.05, lng: center.lng - 0.05 } }, // Third cluster
     ];
   
     for (let i = 0; i < count; i++) {
       // Choose a cluster based on weights
       const cluster = clusters[Math.random() < clusters[0].weight ? 0 : 
                             Math.random() < clusters[0].weight + clusters[1].weight ? 1 : 2];
       
       // Generate point within cluster
       const r = radius * Math.sqrt(Math.random()) * 0.5; // Reduce radius for tighter clusters
       const theta = Math.random() * 2 * Math.PI;
       
       const point = {
         lat: cluster.center.lat + r * Math.cos(theta),
         lng: cluster.center.lng + r * Math.sin(theta),
         weight: Math.random() * 2 + 1 // Random weight between 1-3
       };
       
       points.push(point);
     }
   
     return points;
   };
   
   // Initialize the map and add visualization
   const initializeMap = async () => {
     const loader = new Loader({
       apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
       version: "weekly",
       libraries: ["visualization", "geometry"]
     //   libraries: ["visualization"]
     });
   
     try {
       const google = await loader.load();
       const mapElement = document.getElementById("map");
       
       if (mapElement) {
         const map = new google.maps.Map(mapElement, {
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
   
         // Generate random points
         const points = generateRandomPoints(center.value, 200);
   
         // Create markers for each point
         points.forEach(point => {
           new google.maps.Marker({
             position: point,
             map,
             icon: {
               url: defaultMarkerImage,
               scaledSize: new google.maps.Size(20, 20),
               origin: new google.maps.Point(0, 0),
               anchor: new google.maps.Point(10, 10),
             }
           });
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
   
         // Create heatmap layer
         const heatmap = new google.maps.visualization.HeatmapLayer({
           data: points.map(point => ({
             location: new google.maps.LatLng(point.lat, point.lng),
             weight: point.weight
           })),
           map: map,
           radius: 30,
           gradient: [
             'rgba(0, 255, 0, 0)',    // transparent
             'rgba(0, 255, 0, 0.6)',  // green for low traffic
             'rgba(255, 255, 0, 0.7)', // yellow for medium traffic
             'rgba(255, 0, 0, 0.8)',   // red for high traffic
           ]
         });
   
         // Add legend
         const legendDiv = document.createElement('div');
         legendDiv.innerHTML = `
           <div class="bg-white p-3 rounded-lg shadow-md" style="position: absolute; bottom: 24px; left: 24px;">
             <h3 class="font-medium mb-2">Traffic Density</h3>
             <div class="flex items-center gap-2">
               <div class="w-4 h-4 rounded-full" style="background: rgba(255, 0, 0, 0.8)"></div>
               <span class="text-sm">High</span>
             </div>
             <div class="flex items-center gap-2">
               <div class="w-4 h-4 rounded-full" style="background: rgba(255, 255, 0, 0.7)"></div>
               <span class="text-sm">Medium</span>
             </div>
             <div class="flex items-center gap-2">
               <div class="w-4 h-4 rounded-full" style="background: rgba(0, 255, 0, 0.6)"></div>
               <span class="text-sm">Low</span>
             </div>
           </div>
         `;
         map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legendDiv);
   
         // Add refresh button
         const refreshButton = document.createElement('button');
         refreshButton.className = 'bg-white p-2 rounded-lg shadow-md hover:bg-gray-50';
         refreshButton.innerHTML = `
           <div class="flex items-center gap-2 px-2">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
             </svg>
             <span>Refresh Data</span>
           </div>
         `;
         refreshButton.addEventListener('click', () => {
           const newPoints = generateRandomPoints(center.value, 200);
           heatmap.setData(
             newPoints.map(point => ({
               location: new google.maps.LatLng(point.lat, point.lng),
               weight: point.weight
             }))
           );
         });
         map.controls[google.maps.ControlPosition.TOP_RIGHT].push(refreshButton);
       }
     } catch (error) {
       console.error("Error initializing map:", error);
     }
   };
   
   // Set current location and initialize map
   const setCurrentLocation = () => {
     if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (position: GeolocationPosition) => {
           center.value = {
             lat: position.coords.latitude,
             lng: position.coords.longitude,
           };
           zoom.value = 13;
           initializeMap();
         },
         (error: GeolocationPositionError) => {
           console.error("Error getting location:", error);
           initializeMap(); // Initialize with default location
         }
       );
     } else {
       initializeMap(); // Initialize with default location
     }
   };
   
     // Cleanup function
     onUnmounted(() => {
     if (watchId.value !== null) {
       navigator.geolocation.clearWatch(watchId.value);
     }
   });
 
   onMounted(() => {
     initializeMap();
     setCurrentLocation();
   });

   definePageMeta({
    layout: 'admin-dashboard'
 })
   </script>
 
 