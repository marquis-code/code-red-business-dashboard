<template>
  <div class="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
    <!-- Main Content -->
    <main class="flex-1 p-6">
      <!-- Emergency Alerts Section -->
      <div class="bg-white shadow-lg rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">Emergency Alerts</h2>

        <!-- Loader -->
        <div v-if="loading" class="animate-pulse">
          <div v-for="i in 3" :key="i" class="p-4 border rounded-lg bg-gray-50 mb-4">
            <div class="w-1/2 h-6 bg-gray-300 rounded-lg mb-4"></div>
            <div class="w-full h-4 bg-gray-300 rounded-lg mb-2"></div>
            <div class="w-2/3 h-4 bg-gray-300 rounded-lg"></div>
          </div>
        </div>

        <!-- Grouped Alerts -->
        <div v-else>
          <div v-for="(alerts, date) in groupedAlerts" :key="date" class="mb-8">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ date }}</h3>

            <div
                v-for="alert in alerts"
                :key="alert.id"
                class="flex items-start p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 mb-4"
            >
              <!-- Alert Icon -->
              <div
                  :class="{
                  'bg-red-100 text-red-600': alert.severity === 'High',
                  'bg-yellow-100 text-yellow-600': alert.severity === 'Moderate',
                  'bg-green-100 text-green-600': alert.severity === 'Low',
                }"
                  class="flex items-center justify-center w-12 h-12 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636L5.636 18.364M6 8h.01M20 8h.01M16 12h.01M12 16h.01M8 12h.01M12 8h.01M8 16h.01" />
                </svg>
              </div>

              <!-- Alert Details -->
              <div class="ml-4 flex-1">
                <h3 class="text-sm font-semibold text-gray-800">{{ alert.title }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ alert.description }}</p>
                <div class="mt-2">
                  <span
                       class="text-xs"
                      :class="{
                      'bg-red-100 text-red-600 px-2 py-1 rounded-lg font-medium': alert.severity === 'High',
                      'bg-yellow-100 text-yellow-600 px-2 py-1 rounded-lg font-medium': alert.severity === 'Moderate',
                      'bg-green-100 text-green-600 px-2 py-1 rounded-lg font-medium': alert.severity === 'Low',
                    }"
                  >
                    {{ alert.severity }} Severity
                  </span>
                  <span class="ml-4 text-sm text-gray-500">{{ alert.timestamp }}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center space-x-2">
                <button
                    @click="showDetails(alert)"
                    class="bg-black text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-300"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Details Modal -->
      <div
          v-if="selectedAlert"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg shadow-xl w-11/12 md:w-2/3 lg:w-1/2 p-6 relative">
          <!-- Close Button -->
          <button
              @click="closeModal"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Modal Header -->
          <h3 class="text-sm font-semibold text-gray-800 mb-4">
            {{ selectedAlert.title }}
          </h3>

          <!-- Modal Content -->
          <p class="text-gray-700 mb-4">{{ selectedAlert.description }}</p>
          <div class="flex items-center space-x-4">
            <button
                @click="callEmergency(selectedAlert.contact)"
                class="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700"
            >
              Call Emergency
            </button>
            <button
                @click="sendMessage(selectedAlert.contact)"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { format, isToday, isYesterday } from "date-fns";

// Loading State
const loading = ref(true);

definePageMeta({
  layout: 'admin-dashboard',
  middleware: 'auth'
})

// Mock data for emergency alerts
const emergencyAlerts = ref([
  {
    id: 1,
    title: "ICU Bed Shortage",
    description: "The ICU is running low on available beds. Immediate action is required.",
    severity: "High",
    timestamp: "2024-11-24T10:45:00",
    contact: "+1-202-555-0123",
  },
  {
    id: 2,
    title: "Oxygen Supply Issue",
    description: "Oxygen supply in the ER is below the critical threshold.",
    severity: "Moderate",
    timestamp: "2024-11-24T09:30:00",
    contact: "+1-202-555-0456",
  },
  {
    id: 3,
    title: "General Ward Overcrowding",
    description: "General ward has reached 95% capacity. Redistribution needed.",
    severity: "Moderate",
    timestamp: "2024-11-23T17:15:00",
    contact: "+1-202-555-0456",
  },
]);

// Computed property to group alerts by date
const groupedAlerts = computed(() => {
  const groups: { [key: string]: any[] } = {};

  emergencyAlerts.value.forEach((alert) => {
    const date = new Date(alert.timestamp);

    let groupKey = "";
    if (isToday(date)) {
      groupKey = "Today";
    } else if (isYesterday(date)) {
      groupKey = "Yesterday";
    } else {
      groupKey = format(date, "MMMM dd, yyyy");
    }

    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(alert);
  });

  return groups;
});

// State for selected alert
const selectedAlert = ref(null);

// Simulate data loading
onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 2000); // Simulated delay
});

// Show alert details in modal
const showDetails = (alert: any) => {
  selectedAlert.value = alert;
};

// Close modal
const closeModal = () => {
  selectedAlert.value = null;
};

// Call emergency contact
const callEmergency = (contact: string) => {
  window.location.href = `tel:${contact}`;
};

// Send message
const sendMessage = (contact: string) => {
  window.location.href = `sms:${contact}`;
};
</script>

<style scoped>
/* Add additional styles if necessary */
</style>
