<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-50 w-[94px] bg-[#C41E1E] text-white transition-transform duration-300',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="flex flex-col items-center py-6 h-full">
        <!-- Logo -->
        <button class="mb-8 p-3 hover:bg-red-700 rounded-lg transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Navigation Icons -->
        <nav class="flex-1 flex flex-col items-center space-y-6">
          <NuxtLink  to="/dashboard"class="p-3 hover:bg-red-700 rounded-lg transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </NuxtLink>
          <NuxtLink to="/dashboard" class="p-3 hover:bg-red-700 rounded-lg transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
          </NuxtLink>
          <NuxtLink to="/dashboard" class="p-3 hover:bg-red-700 rounded-lg transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
            </svg>
          </NuxtLink>
          <NuxtLink to="/dashboard" class="p-3 hover:bg-red-700 rounded-lg transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </NuxtLink>
        </nav>

        <!-- Settings -->
        <button class="mt-auto p-3 hover:bg-red-700 rounded-lg transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m5.2-14.2l-4.2 4.2m-2 2l-4.2 4.2M23 12h-6m-6 0H1m14.2 5.2l-4.2-4.2m-2-2l-4.2-4.2" />
          </svg>
        </button>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="isSidebarOpen = false"
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              class="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              @click="isSidebarOpen = true"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 class="text-xl lg:text-2xl font-semibold text-gray-900">
                {{ user?.hospitalName }} Ambulance Services
              </h1>
              <p class="text-sm text-gray-500">Powered by CODE-RED</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="hidden sm:flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-sm text-gray-600">Online</span>
            </div>
            <button class="relative p-2 hover:bg-gray-100 rounded-lg">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto p-4 lg:p-8">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm mb-1">Available Ambulances</p>
                <p class="text-4xl font-bold text-gray-900">4</p>
              </div>
              <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm mb-1">Incoming Requests</p>
                <p class="text-4xl font-bold text-gray-900">{{ emergencyRequests.length }}</p>
              </div>
              <div class="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <div class="w-6 h-6 flex items-center justify-center">
                  <div class="w-4 h-4 border-2 border-red-500 rounded-full flex items-center justify-center">
                    <div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sm:col-span-2 lg:col-span-1">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm mb-1">Active Trips</p>
                <p class="text-4xl font-bold text-gray-900">1</p>
              </div>
              <div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <!-- Left Column -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Incoming Emergency Requests -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <h2 class="text-lg font-semibold text-gray-900">
                  Incoming Emergency Requests
                </h2>
              </div>
              <div v-if="emergencyRequests.length > 0" class="divide-y divide-gray-100">
                <div
                  v-for="request in emergencyRequests"
                  :key="request.id"
                  class="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-center space-x-4 min-w-0 flex-1">
                      <span class="text-sm font-medium text-gray-500 whitespace-nowrap">
                        {{ request.id }}
                      </span>
                      <div class="flex items-center space-x-2 min-w-0">
                        <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span class="text-sm text-gray-700 truncate">{{ request.location }}</span>
                      </div>
                      <span class="hidden lg:inline text-sm text-gray-900 font-medium">
                        {{ request.type }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between sm:justify-end space-x-4">
                      <span class="text-sm text-gray-500">{{ request.distance }}</span>
                      <span class="text-sm font-semibold text-gray-900">
                        {{ request.amount }}
                      </span>
                      <div class="flex items-center space-x-2">
                        <button
                          class="px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          @click="openModal('decline', request)"
                        >
                          Decline
                        </button>
                        <button
                          class="px-4 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium"
                          @click="openModal('accept', request)"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="lg:hidden mt-2">
                    <span class="text-sm text-gray-900 font-medium">{{ request.type }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="px-6 py-12 text-center">
                <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-500 text-sm">No pending emergency requests</p>
              </div>
            </div>

            <!-- Active Trip Monitor -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100">
              <div class="px-6 py-4 border-b border-gray-100">
                <h2 class="text-lg font-semibold text-gray-900">
                  Active Trip Monitor
                </h2>
              </div>
              <div class="p-6">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-green-50 rounded-xl p-4">
                  <div class="flex items-center space-x-4 flex-wrap gap-4">
                    <span class="inline-flex items-center px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-lg">
                      {{ activeTrip.id }}
                    </span>
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span class="text-sm text-gray-700">{{ activeTrip.driver }}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 21h18M4 16h16M6 11h12M8 6h8" />
                      </svg>
                      <span class="text-sm text-gray-700">{{ activeTrip.destination }}</span>
                    </div>
                  </div>
                  <div class="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span class="text-sm font-medium text-green-600">
                      {{ activeTrip.status }}
                    </span>
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span class="text-sm text-gray-700">ETA: {{ activeTrip.eta }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Earnings Snapshot -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100">
              <div class="px-6 py-4 border-b border-gray-100">
                <h2 class="text-lg font-semibold text-gray-900">
                  Earnings Snapshot
                </h2>
              </div>
              <div class="p-6 space-y-6">
                <div>
                  <div class="flex items-center space-x-2 mb-2">
                    <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    <span class="text-sm text-gray-600">Today's Total</span>
                  </div>
                  <p class="text-4xl font-bold text-purple-600">₦45,000</p>
                </div>

                <div class="space-y-4 pt-4 border-t border-gray-100">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span class="text-sm text-gray-600">Completed Trips</span>
                    </div>
                    <span class="text-lg font-semibold text-gray-900">6</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <line x1="19" y1="5" x2="5" y2="19" />
                        <circle cx="6.5" cy="6.5" r="2.5" />
                        <circle cx="17.5" cy="17.5" r="2.5" />
                      </svg>
                      <span class="text-sm text-gray-600">CODE-RED Commission</span>
                    </div>
                    <span class="text-lg font-semibold text-gray-900">15%</span>
                  </div>

                  <div class="flex items-center justify-between pt-2">
                    <span class="text-sm text-gray-600">Commission Amount</span>
                    <span class="text-lg font-semibold text-red-600">-₦6,750</span>
                  </div>

                  <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span class="text-sm font-medium text-gray-900">Net Earnings</span>
                    <span class="text-2xl font-bold text-green-600">₦38,250</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Confirmation Modal using Teleport -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4"
          @click.self="closeModal"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black bg-opacity-50 transition-opacity"></div>

          <!-- Modal Content -->
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <!-- Close Button -->
            <button
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              @click="closeModal"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Modal Icon -->
            <div class="flex items-center justify-center mb-4">
              <div
                :class="[
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  modalAction === 'accept' ? 'bg-green-100' : 'bg-red-100'
                ]"
              >
                <svg
                  v-if="modalAction === 'accept'"
                  class="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg
                  v-else
                  class="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>

            <!-- Modal Title -->
            <h3 class="text-2xl font-bold text-gray-900 text-center mb-2">
              {{ modalAction === 'accept' ? 'Accept Request' : 'Decline Request' }}
            </h3>

            <!-- Modal Description -->
            <p class="text-gray-600 text-center mb-6">
              {{ modalAction === 'accept' 
                ? 'Are you sure you want to accept this emergency request?' 
                : 'Are you sure you want to decline this emergency request?' 
              }}
            </p>

            <!-- Request Details -->
            <div v-if="selectedRequest" class="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Request ID:</span>
                <span class="text-sm font-semibold text-gray-900">{{ selectedRequest.id }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Location:</span>
                <span class="text-sm font-semibold text-gray-900">{{ selectedRequest.location }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Type:</span>
                <span class="text-sm font-semibold text-gray-900">{{ selectedRequest.type }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Amount:</span>
                <span class="text-sm font-semibold text-gray-900">{{ selectedRequest.amount }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-3">
              <button
                class="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                @click="closeModal"
              >
                Cancel
              </button>
              <button
                :class="[
                  'flex-1 px-6 py-3 font-medium rounded-lg transition-colors',
                  modalAction === 'accept'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                ]"
                @click="confirmAction"
              >
                {{ modalAction === 'accept' ? 'Accept' : 'Decline' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUser } from "@/composables/auth/user"
const { user } = useUser()


interface EmergencyRequest {
  id: string
  location: string
  type: string
  distance: string
  amount: string
}

interface ActiveTrip {
  id: string
  driver: string
  destination: string
  status: string
  eta: string
}

const isSidebarOpen = ref(false)
const showModal = ref(false)
const modalAction = ref<'accept' | 'decline'>('accept')
const selectedRequest = ref<EmergencyRequest | null>(null)

const emergencyRequests = ref<EmergencyRequest[]>([
  {
    id: 'ER-1024',
    location: 'Ikeja, Lagos',
    type: 'Cardiac Emergency',
    distance: '3.2 km',
    amount: '₦8,500'
  },
  {
    id: 'ER-1025',
    location: 'Yaba, Lagos',
    type: 'Trauma',
    distance: '5.7 km',
    amount: '₦12,000'
  }
])

const activeTrip = ref<ActiveTrip>({
  id: 'AMB-08',
  driver: 'Chukwudi Okafor',
  destination: 'Lagos University Teaching Hospital',
  status: 'En Route',
  eta: '12 mins'
})

const openModal = (action: 'accept' | 'decline', request: EmergencyRequest) => {
  modalAction.value = action
  selectedRequest.value = request
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  setTimeout(() => {
    selectedRequest.value = null
  }, 300)
}

const confirmAction = () => {
  if (!selectedRequest.value) return

  if (modalAction.value === 'accept') {
    console.log(`Accepted request: ${selectedRequest.value.id}`)
    // Remove from emergency requests
    emergencyRequests.value = emergencyRequests.value.filter(
      req => req.id !== selectedRequest.value?.id
    )
  } else {
    console.log(`Declined request: ${selectedRequest.value.id}`)
    // Remove from emergency requests
    emergencyRequests.value = emergencyRequests.value.filter(
      req => req.id !== selectedRequest.value?.id
    )
  }

  closeModal()
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9);
  opacity: 0;
}
</style>