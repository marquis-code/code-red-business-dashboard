<template>
  <div class="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
    <!-- Main Content -->
    <main class="flex-1 p-6">
      <!-- Loader -->
      <div v-if="loading">
        <div class="animate-pulse">
          <div class="h-8 w-1/3 bg-gray-200 rounded mb-6"></div>
          <div class="h-6 bg-gray-200 rounded mb-4"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="h-12 bg-gray-200 rounded"></div>
            <div class="h-12 bg-gray-200 rounded"></div>
          </div>
          <div class="h-6 bg-gray-200 rounded mt-8 mb-4"></div>
          <div class="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- Settings Content -->
      <div v-else class="bg-white shadow-lg rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">Settings</h2>

        <!-- General Settings -->
        <section class="mb-8">
          <h3 class="text-base font-semibold text-gray-700 mb-4">General Settings</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="organizationName" class="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                  id="organizationName"
                  v-model="settings.organizationName"
                  type="text"
                  class="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label for="contactEmail" class="block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <input
                  id="contactEmail"
                  v-model="settings.contactEmail"
                  type="email"
                  class="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
          </div>
        </section>

        <!-- Dashboard Data Points -->
        <section class="mb-8">
          <h3 class="text-base font-semibold text-gray-700 mb-4">Update Dashboard Data Points</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Available Beds -->
            <div>
              <label for="bedsAvailable" class="block text-sm font-medium text-gray-700">
                Available Beds
              </label>
              <input
                  id="bedsAvailable"
                  v-model.number="dashboardData.bedsAvailable"
                  type="number"
                  class="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>

            <!-- ICU Occupancy -->
            <div>
              <label for="icuOccupancy" class="block text-sm font-medium text-gray-700">
                ICU Occupancy (%)
              </label>
              <input
                  id="icuOccupancy"
                  v-model.number="dashboardData.icuOccupancy"
                  type="number"
                  class="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>

            <!-- Admissions -->
            <div>
              <label for="admissions" class="block text-sm font-medium text-gray-700">
                Admissions
              </label>
              <input
                  id="admissions"
                  v-model.number="dashboardData.admissions"
                  type="number"
                  class="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>

            <!-- Oxygen Levels -->
            <div>
              <label for="oxygenLevels" class="block text-sm font-medium text-gray-700">
                Oxygen Levels (%)
              </label>
              <input
                  id="oxygenLevels"
                  v-model.number="dashboardData.oxygenLevels"
                  type="number"
                  class="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>

            <!-- Staff Availability -->
            <div>
              <label for="staffAvailability" class="block text-sm font-medium text-gray-700">
                Staff Availability (%)
              </label>
              <input
                  id="staffAvailability"
                  v-model.number="dashboardData.staffAvailability"
                  type="number"
                  class="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>

            <!-- Average Response Time -->
            <div>
              <label for="responseTime" class="block text-sm font-medium text-gray-700">
                Response Time (Minutes)
              </label>
              <input
                  id="responseTime"
                  v-model.number="dashboardData.responseTime"
                  type="number"
                  class="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
          </div>
        </section>

        <!-- Save Button -->
        <div class="mt-8 flex justify-end">
          <button
              @click="saveSettings"
              class="bg-black text-white px-6 py-3 text-sm rounded-lg shadow transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

// Loading state
const loading = ref(true);

// Settings data
const settings = ref({
  organizationName: "City Hospital",
  contactEmail: "contact@cityhospital.com",
});

// Dashboard data points
const dashboardData = ref({
  bedsAvailable: 120,
  icuOccupancy: 75,
  admissions: 540,
  oxygenLevels: 80,
  staffAvailability: 85,
  responseTime: 15,
});

// Simulate loading
onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 2000);
});


definePageMeta({
  layout: 'admin-dashboard',
  middleware: 'auth'
})

// Save settings function
const saveSettings = () => {
  console.log("Settings saved:", settings.value);
  console.log("Dashboard data updated:", dashboardData.value);
  alert("Settings and dashboard data have been saved successfully.");
};
</script>

<style scoped>
/* Add custom styles if necessary */
</style>
