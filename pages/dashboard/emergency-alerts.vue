<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
    <main class="max-w-7xl mx-auto">
      <!-- Emergency Alerts Section -->
      <div class="bg-white shadow-xl rounded-xl overflow-hidden transition-all duration-500 transform hover:shadow-2xl">
        <div class="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-red-500 mr-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Emergency Alerts
            </h2>
            <p class="text-gray-500">Critical incidents requiring immediate attention</p>
          </div>
          
          <div class="mt-4 md:mt-0 flex space-x-2">
            <button class="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New Alert
            </button>
            <button class="flex items-center px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
          </div>
        </div>

        <!-- Loader -->
        <div v-if="loading" class="p-6">
          <div v-for="i in 3" :key="i" class="animate-pulse mb-6">
            <div class="flex items-start">
              <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div class="ml-4 flex-1">
                <div class="w-3/4 h-6 bg-gray-200 rounded-lg mb-3"></div>
                <div class="w-full h-4 bg-gray-200 rounded-lg mb-2"></div>
                <div class="w-2/3 h-4 bg-gray-200 rounded-lg mb-3"></div>
                <div class="flex">
                  <div class="w-24 h-6 bg-gray-200 rounded-lg"></div>
                  <div class="w-32 h-6 bg-gray-200 rounded-lg ml-4"></div>
                </div>
              </div>
              <div class="w-24 h-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>

        <!-- Alert Status Summary -->
        <div v-else-if="alerts.length > 0" class="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white p-3 rounded-lg shadow-sm flex items-center">
              <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-gray-500">Active Alerts</p>
                <p class="text-lg font-bold text-gray-800">{{ activeAlertsCount }}</p>
              </div>
            </div>
            
            <div class="bg-white p-3 rounded-lg shadow-sm flex items-center">
              <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-gray-500">High Severity</p>
                <p class="text-lg font-bold text-gray-800">{{ highSeverityCount }}</p>
              </div>
            </div>
            
            <div class="bg-white p-3 rounded-lg shadow-sm flex items-center">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-gray-500">Today's Alerts</p>
                <p class="text-lg font-bold text-gray-800">{{ todayAlertsCount }}</p>
              </div>
            </div>
            
            <div class="bg-white p-3 rounded-lg shadow-sm flex items-center">
              <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-gray-500">Resolved</p>
                <p class="text-lg font-bold text-gray-800">{{ resolvedAlertsCount }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- No Alerts Message -->
        <div v-else-if="!loading && alerts.length === 0" class="p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-700 mb-2">No Active Alerts</h3>
          <p class="text-gray-500 mb-6">There are currently no emergency alerts in the system.</p>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors duration-300">
            Create New Alert
          </button>
        </div>

        <!-- Alerts List -->
        <div v-else class="p-6">
          <TransitionGroup name="list" tag="div" class="space-y-6">
            <div
              v-for="alert in alerts"
              :key="alert._id"
              class="bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div class="p-5">
                <div class="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div class="flex items-start">
                    <div
                      :class="{
                        'bg-red-100 text-red-600': alert.severity === 'High',
                        'bg-yellow-100 text-yellow-600': alert.severity === 'Moderate',
                        'bg-blue-100 text-blue-600': alert.severity === 'Medium',
                        'bg-green-100 text-green-600': alert.severity === 'Low'
                      }"
                      class="flex items-center justify-center w-12 h-12 rounded-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div class="ml-4">
                      <h3 class="text-lg font-semibold text-gray-800">{{ alert.title }}</h3>
                      <p class="text-sm text-gray-600 mt-1">{{ alert.description }}</p>
                    </div>
                  </div>
                  <div class="mt-4 md:mt-0 flex items-center">
                    <span
                      :class="{
                        'bg-red-100 text-red-600': alert.severity === 'High',
                        'bg-yellow-100 text-yellow-600': alert.severity === 'Moderate',
                        'bg-blue-100 text-blue-600': alert.severity === 'Medium',
                        'bg-green-100 text-green-600': alert.severity === 'Low'
                      }"
                      class="px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {{ alert.severity }} Severity
                    </span>
                    <span
                      :class="{
                        'bg-red-100 text-red-600': alert.status === 'Active',
                        'bg-green-100 text-green-600': alert.status === 'Resolved',
                        'bg-yellow-100 text-yellow-600': alert.status === 'Pending'
                      }"
                      class="ml-2 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {{ alert.status }}
                    </span>
                  </div>
                </div>

                <div class="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div class="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500">
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {{ alert.affectedDepartment }}
                    </div>
                    <div class="flex items-center mt-2 sm:mt-0 sm:ml-6">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ formatTimeRange(alert.startTime, alert.endTime) }}
                    </div>
                  </div>
                  
                  <button
                    @click="showDetails(alert)"
                    class="mt-4 sm:mt-0 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center"
                  >
                    <span>View Details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </main>

    <!-- Details Modal -->
    <Transition name="modal">
      <div
        v-if="selectedAlert"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-xl shadow-2xl w-11/12 md:w-2/3 lg:w-1/2 max-w-2xl p-6 relative transform transition-all duration-300">
          <!-- Alert Status Badge -->
          <div 
            :class="{
              'bg-red-100 text-red-600': selectedAlert.status === 'Active',
              'bg-green-100 text-green-600': selectedAlert.status === 'Resolved',
              'bg-yellow-100 text-yellow-600': selectedAlert.status === 'Pending'
            }"
            class="absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-medium"
          >
            {{ selectedAlert.status }}
          </div>

          <!-- Close Button -->
          <button
            @click="closeModal"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
          <div class="flex items-start mb-6">
            <div
              :class="{
                'bg-red-100 text-red-600': selectedAlert.severity === 'High',
                'bg-yellow-100 text-yellow-600': selectedAlert.severity === 'Moderate',
                'bg-blue-100 text-blue-600': selectedAlert.severity === 'Medium',
                'bg-green-100 text-green-600': selectedAlert.severity === 'Low'
              }"
              class="flex items-center justify-center w-12 h-12 rounded-full mr-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800">{{ selectedAlert.title }}</h3>
              <p class="text-gray-500">{{ selectedAlert.affectedDepartment }}</p>
            </div>
          </div>

          <!-- Alert Details -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 class="font-medium text-gray-700 mb-2">Description</h4>
            <p class="text-gray-600">{{ selectedAlert.description }}</p>
          </div>

          <!-- Timeline -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-700 mb-3">Timeline</h4>
            <div class="flex">
              <div class="flex flex-col items-center mr-4">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="h-full w-0.5 bg-gray-200 mt-2"></div>
              </div>
              <div>
                <p class="font-medium text-gray-800">Alert Created</p>
                <p class="text-sm text-gray-500">{{ formatDateTime(selectedAlert.startTime) }}</p>
              </div>
            </div>
            
            <div class="flex mt-4">
              <div class="flex flex-col items-center mr-4">
                <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="h-full w-0.5 bg-gray-200 mt-2"></div>
              </div>
              <div>
                <p class="font-medium text-gray-800">Expected Resolution</p>
                <p class="text-sm text-gray-500">{{ formatDateTime(selectedAlert.endTime) }}</p>
              </div>
            </div>
          </div>

          <!-- Actions Taken -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-700 mb-3">Actions Taken</h4>
            <ul class="space-y-2">
              <li 
                v-for="(action, index) in selectedAlert.actions" 
                :key="index"
                class="flex items-start"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-600">{{ action }}</span>
              </li>
            </ul>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3">
            <button class="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg shadow hover:bg-red-700 transition-colors duration-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Emergency Call
            </button>
            <button class="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Send Message
            </button>
            <button class="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mark as Resolved
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { useFetchEmergencyAlerts } from "@/composables/modules/emergency-alerts/useFetchEmergencyAlerts";
import { definePageMeta } from '#imports'

definePageMeta({
  layout: 'admin-dashboard',
  middleware: 'auth'
})

// Get data from composable
const { loading, error, alerts } = useFetchEmergencyAlerts();

// State for selected alert
const selectedAlert = ref(null);

// Computed properties for alert statistics
const activeAlertsCount = computed(() => {
  return alerts.value?.filter(alert => alert.status === 'Active').length || 0;
});

const highSeverityCount = computed(() => {
  return alerts.value?.filter(alert => alert.severity === 'High').length || 0;
});

const todayAlertsCount = computed(() => {
  return alerts.value?.filter(alert => {
    const alertDate = new Date(alert.startTime);
    return isToday(alertDate);
  }).length || 0;
});

const resolvedAlertsCount = computed(() => {
  return alerts.value?.filter(alert => alert.status === 'Resolved').length || 0;
});

// Helper functions
const formatTimeRange = (startTime: string, endTime: string) => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : null;
  
  if (!end) {
    return `Started ${format(start, 'MMM d, h:mm a')}`;
  }
  
  if (start.toDateString() === end.toDateString()) {
    return `${format(start, 'MMM d')} · ${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  }
  
  return `${format(start, 'MMM d, h:mm a')} - ${format(end, 'MMM d, h:mm a')}`;
};

const formatDateTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  return format(date, 'MMM d, yyyy · h:mm a');
};

// Show alert details in modal
const showDetails = (alert: any) => {
  selectedAlert.value = alert;
};

// Close modal
const closeModal = () => {
  selectedAlert.value = null;
};
</script>

<style scoped>
/* List transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Pulse animation for active alerts */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Hover effects */
.hover\:-translate-y-1:hover {
  transform: translateY(-4px);
}
</style>