<template>
  <div>
    <div class="relative">
      <svg class="absolute left-3 top-4" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- SVG Path -->
      </svg>
      <input
        ref="searchInput"
        type="text"
        placeholder="Search for a location"
        class="py-3 w-full pl-10 outline-none border border-gray-100 rounded-t-md"
      />
      <svg v-if="locationSelected" class="absolute right-3 top-4" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- SVG Path -->
      </svg>
    </div>

    <!-- Render GoogleMap only if center has been set to avoid initialization errors -->
    <GoogleMap
      v-if="center && googleMapsApiKey"
      :api-key="googleMapsApiKey"
      :center="center"
      :zoom="zoom"
      class="google-map"
    >
      <Marker
        v-for="(marker, index) in surgeMarkers"
        :key="index"
        :options="{
          position: marker,
          icon: surgeIcon,
        }"
      />
    </GoogleMap>
  </div>
</template>

<style scoped>
.google-map {
  width: 100%;
  height: 400px; /* Adjust height as necessary for visibility */
  position: relative;
}
</style>

<script>
import { GoogleMap, Marker } from "vue3-google-map";
import { Loader } from "@googlemaps/js-api-loader";
import { ref, toRefs, onUnmounted, onMounted } from "vue";

export default {
  name: "App",
  components: { GoogleMap, Marker },
  props: {
    payload: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      center: null,
      zoom: 15,
      googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Ensure this API key is correct
      autocomplete: null,
      placesService: null,
      surgeMarkers: [],
      locationSelected: false,
      surgeIcon: null,
      mapInitialized: false,
    };
  },
  mounted() {
    this.setCurrentLocation();

    if (this.payload?.address?.value) {
      this.$refs.searchInput.value = this.payload.address.value;
    }
    if (this.payload?.latitude?.value && this.payload?.longitude?.value) {
      this.center = {
        lat: this.payload.latitude.value,
        lng: this.payload.longitude.value,
      };
    }

    this.initAutocomplete();

    window.addEventListener("resize", this.updateMapCenter);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateMapCenter);
  },
  methods: {
    setCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.center = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            this.zoom = 15;
            this.generateSurgeMarkers();
          },
          (error) => {
            console.error("Error getting user location:", error);
            this.generateSurgeMarkers();
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        this.generateSurgeMarkers();
      }
    },
    generateSurgeMarkers() {
      const surgeRadius = 5;
      const surgeCount = 10;
      this.surgeMarkers = [];

      for (let i = 0; i < surgeCount; i++) {
        const randomLocation = this.generateRandomCoordinates(this.center, surgeRadius);
        this.surgeMarkers.push(randomLocation);
      }
    },
    generateRandomCoordinates(center, radius) {
      const randomLat =
        center.lat + (Math.random() - 0.5) * (radius / 111.32);
      const randomLng =
        center.lng +
        (Math.random() - 0.5) *
          (radius / (111.32 * Math.cos(center.lat * (Math.PI / 180))));
      return { lat: randomLat, lng: randomLng };
    },
    initAutocomplete() {
      const loader = new Loader({
        apiKey: this.googleMapsApiKey,
        version: "weekly",
        libraries: ["places"],
      });
      loader.load().then(() => {
        const input = this.$refs.searchInput;
        this.autocomplete = new google.maps.places.Autocomplete(input);
        this.autocomplete.addListener("place_changed", this.onPlaceChanged);
        const map = new google.maps.Map(document.createElement("div"));
        this.placesService = new google.maps.places.PlacesService(map);

        this.surgeIcon = {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new google.maps.Size(20, 20),
        };
        this.mapInitialized = true;
      });
    },
    onPlaceChanged() {
      const place = this.autocomplete.getPlace();
      if (!place.geometry) return;
      this.center = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      this.populateSelectedLocationData(place);
      this.zoom = 15;
      this.generateSurgeMarkers();
    },
    populateSelectedLocationData(place) {
      this.$emit("update:payload", {
        ...this.payload,
        latitude: { value: place.geometry.location.lat() },
        longitude: { value: place.geometry.location.lng() },
        address: { value: place.formatted_address || place.name },
      });
      this.locationSelected = true;
    },
    updateMapCenter() {
      if (this.mapInitialized && this.center) {
        this.center = { ...this.center };
      }
    },
  },
};
</script>
