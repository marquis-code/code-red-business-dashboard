<template>
  <div class="bg-gradient-to-br from-gray-50 to-gray-50 p-6">
    <div class="max-w-5xl mx-auto">
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-teal-800 mb-2">Emergency Bed Space Tracker</h1>
        <p class="text-slate-600">Real-time bed availability management system</p>
        <div v-if="isConnected" class="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          <span class="h-2 w-2 mr-1.5 rounded-full bg-emerald-500"></span>
          Connected
        </div>
        <div v-else class="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <span class="h-2 w-2 mr-1.5 rounded-full bg-red-500"></span>
          Disconnected
        </div>
        <div v-if="currentHospitalId" class="mt-2 text-sm text-slate-600">
          Hospital ID: {{ currentHospitalId }}
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600"></div>
      </div>

      <template v-else>
        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="bg-white rounded-xl shadow-md p-4 flex items-center transform hover:scale-105 transition-transform duration-300"
               :class="{'border-l-4 border-emerald-500': statsUpdated.totalBeds}">
            <div class="bg-teal-100 p-3 rounded-lg mr-4">
              <BedIcon class="text-teal-600 h-6 w-6" />
            </div>
            <div>
              <p class="text-slate-500 text-sm">Total Beds</p>
              <p class="text-2xl font-bold text-slate-800">{{ totalBeds }}</p>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-md p-4 flex items-center transform hover:scale-105 transition-transform duration-300"
               :class="{'border-l-4 border-emerald-500': statsUpdated.availableBeds}">
            <div class="bg-emerald-100 p-3 rounded-lg mr-4">
              <CheckCircleIcon class="text-emerald-600 h-6 w-6" />
            </div>
            <div>
              <p class="text-slate-500 text-sm">Available Beds</p>
              <p class="text-2xl font-bold text-emerald-600">{{ totalAvailable }}</p>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-md p-4 flex items-center transform hover:scale-105 transition-transform duration-300"
               :class="{'border-l-4 border-emerald-500': statsUpdated.occupancyRate}">
            <div class="bg-amber-100 p-3 rounded-lg mr-4">
              <AlertCircleIcon class="text-amber-600 h-6 w-6" />
            </div>
            <div>
              <p class="text-slate-500 text-sm">Occupancy Rate</p>
              <p class="text-2xl font-bold text-slate-800">{{ occupancyRate }}%</p>
            </div>
          </div>
        </div>

        <!-- Search and Filter -->
        <div class="bg-white rounded-xl shadow-md p-4 mb-8">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="relative flex-grow">
              <SearchIcon class="absolute left-3 top-3 text-slate-400 h-5 w-5" />
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search units..." 
                class="pl-10 pr-4 py-2 w-full rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div class="flex-shrink-0">
              <select 
                v-model="statusFilter"
                class="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="critical">Critical (10%)</option>
                <option value="warning">Warning (30%)</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Units List -->
        <div class="space-y-4">
          <TransitionGroup name="list">
            <div 
              v-for="unit in filteredUnits" 
              :key="unit._id"
              class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px]"
              :class="{'border-l-4 border-emerald-500': recentlyUpdated.includes(unit._id)}"
            >
              <div class="p-5">
                <div class="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h2 class="text-xl font-bold text-slate-800">{{ unit.departmentName }}</h2>
                    <p class="text-slate-500">{{ unit.location }}</p>
                  </div>
                  <div :class="`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(unit)}`">
                    {{ unit.status }}
                  </div>
                </div>

                <div class="flex flex-col md:flex-row gap-6">
                  <div class="flex-grow">
                    <div class="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        :class="`h-full ${getProgressBarClass(unit)}`"
                        :style="`width: ${(unit.availableBeds / unit.totalBeds) * 100}%`"
                        class="transition-all duration-500 ease-out"
                      ></div>
                    </div>
                    <div class="flex justify-between mt-2 text-sm text-slate-500">
                      <span>{{ unit.availableBeds }} available</span>
                      <span>{{ unit.totalBeds }} total</span>
                    </div>
                  </div>

                  <div class="flex items-center space-x-3">
                    <button 
                      @click="decrementBed(unit)"
                      :disabled="unit.availableBeds <= 0 || processing === unit._id"
                      class="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <div v-if="processing === unit._id && actionType === 'discharge'" class="animate-spin h-4 w-4 border-2 border-red-600 rounded-full border-t-transparent"></div>
                      <MinusIcon v-else class="h-5 w-5" />
                    </button>
                    
                    <div class="w-16 text-center">
                      <div class="text-2xl font-bold text-slate-800">{{ unit.availableBeds }}</div>
                      <div class="text-xs text-slate-500">beds</div>
                    </div>
                    
                    <button 
                      @click="incrementBed(unit)"
                      :disabled="unit.availableBeds >= unit.totalBeds || processing === unit._id"
                      class="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <div v-if="processing === unit._id && actionType === 'admit'" class="animate-spin h-4 w-4 border-2 border-emerald-600 rounded-full border-t-transparent"></div>
                      <PlusIcon v-else class="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div class="bg-slate-50 px-5 py-3 flex justify-between items-center">
                <div class="flex items-center text-sm text-slate-500">
                  <ClockIcon class="h-4 w-4 mr-1" />
                  <span>Last updated: {{ formatTime(unit.lastUpdated) }}</span>
                </div>
                <button 
                  @click="showUnitDetails(unit)"
                  class="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center"
                >
                  Details
                  <ChevronRightIcon class="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </TransitionGroup>

          <div v-if="filteredUnits.length === 0 && !loading" class="text-center py-10">
            <AlertOctagonIcon class="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 class="text-lg font-medium text-slate-700">No units found</h3>
            <p class="text-slate-500">Try adjusting your search or filters</p>
          </div>
        </div>
      </template>
    </div>

    <!-- Notification -->
    <Transition name="notification">
      <div 
        v-if="notification.show" 
        class="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md flex items-start"
      >
        <div :class="`p-2 rounded-full mr-3 ${notification.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`">
          <CheckCircleIcon v-if="notification.type === 'success'" class="h-5 w-5" />
          <AlertCircleIcon v-else class="h-5 w-5" />
        </div>
        <div class="flex-grow">
          <h4 class="font-medium text-slate-800">{{ notification.title }}</h4>
          <p class="text-sm text-slate-600">{{ notification.message }}</p>
        </div>
        <button @click="notification.show = false" class="text-slate-400 hover:text-slate-600">
          <XIcon class="h-5 w-5" />
        </button>
      </div>
    </Transition>

    <!-- Connection Error Alert -->
    <Transition name="notification">
      <div 
        v-if="lastError" 
        class="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md flex items-start border-l-4 border-red-500"
      >
        <div class="p-2 rounded-full mr-3 bg-red-100 text-red-600">
          <AlertTriangleIcon class="h-5 w-5" />
        </div>
        <div class="flex-grow">
          <h4 class="font-medium text-slate-800">Connection Error</h4>
          <p class="text-sm text-slate-600">{{ lastError }}</p>
          <button 
            @click="reconnect" 
            class="mt-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-md text-sm hover:bg-teal-200 transition-colors"
          >
            Reconnect
          </button>
        </div>
        <button @click="lastError = null" class="text-slate-400 hover:text-slate-600">
          <XIcon class="h-5 w-5" />
        </button>
      </div>
    </Transition>

    <!-- Debug Panel (only visible in development) -->
    <div v-if="debugMode" class="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-md border border-slate-200">
      <h4 class="font-medium text-slate-800 mb-2 flex items-center justify-between">
        Debug Panel
        <button @click="debugMode = false" class="text-slate-400 hover:text-slate-600">
          <XIcon class="h-4 w-4" />
        </button>
      </h4>
      <div class="text-xs text-slate-600 space-y-1">
        <p>Connected: {{ isConnected ? 'Yes' : 'No' }}</p>
        <p>Hospital ID: {{ currentHospitalId || 'None' }}</p>
        <p>Last Activity: {{ lastActivity ? new Date(lastActivity).toLocaleTimeString() : 'None' }}</p>
        <p>Updates Received: {{ updateCount }}</p>
        <div class="mt-2">
          <button 
            @click="reconnect" 
            class="px-2 py-1 bg-teal-100 text-teal-700 rounded-md text-xs hover:bg-teal-200 transition-colors"
          >
            Force Reconnect
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, reactive } from 'vue'
import { useUpdateBedAvailability } from "@/composables/modules/bedspace/useBedAvailability"
import { useBedspaces } from "@/composables/modules/bedspace/useFetchBedspaces"
import { useBedSpaceSocket } from "@/composables/useBedSpaceSocket"
import { 
  BedIcon, 
  CheckCircleIcon, 
  AlertCircleIcon, 
  SearchIcon, 
  MinusIcon, 
  PlusIcon, 
  ClockIcon, 
  ChevronRightIcon, 
  XIcon,
  AlertOctagonIcon,
  AlertTriangleIcon
} from 'lucide-vue-next'
import { definePageMeta } from '#imports'

// Get data from composables
const { bedspaces, loading, fetchBedspaces } = useBedspaces()
const { updateAvailability, loading: updateLoading } = useUpdateBedAvailability()

// Initialize WebSocket connection
const { 
  initSocket, 
  joinHospitalRoom, 
  leaveHospitalRoom, 
  isConnected, 
  lastError,
  lastActivity,
  onBedSpaceUpdated, 
  onInitialBedspaceData,
  onHospitalStatusChanged,
  getHospitalIdFromLocalStorage,
  debugMode
} = useBedSpaceSocket()

definePageMeta({
  layout: 'admin-dashboard'
})

// Types
interface Notification {
  show: boolean
  type: 'success' | 'warning'
  title: string
  message: string
}

interface BedSpace {
  _id: string
  status: string
  lastUpdated: string
  occupiedBeds: number
  availableBeds: number
  totalBeds: number
  location: string
  departmentName: string
  hospital: string
  history: {
    date: string
    available: number
    occupied: number
    _id: string
  }[]
  createdAt: string
  updatedAt: string
  __v: number
}

// State
const notification = ref<Notification>({
  show: false,
  type: 'success',
  title: '',
  message: ''
})
const searchQuery = ref('')
const statusFilter = ref('all')
const processing = ref<string | null>(null)
const actionType = ref<'admit' | 'discharge' | null>(null)
const recentlyUpdated = ref<string[]>([])
const currentHospitalId = ref<string | null>(null)
const connectionAttempts = ref(0)
const maxConnectionAttempts = 3
const updateCount = ref(0)

// Track stats updates for visual feedback
const statsUpdated = reactive({
  totalBeds: false,
  availableBeds: false,
  occupancyRate: false
})

// Previous stats values for comparison
const previousStats = reactive({
  totalBeds: 0,
  totalAvailable: 0,
  occupancyRate: 0
})

// Computed properties
const totalBeds = computed(() => {
  if (!bedspaces.value || bedspaces.value.length === 0) return 0
  const total = bedspaces.value.reduce((sum, unit) => sum + unit.totalBeds, 0)
  
  // Check if value changed and trigger visual feedback
  if (previousStats.totalBeds !== total) {
    highlightStat('totalBeds')
    previousStats.totalBeds = total
  }
  
  return total
})

const totalAvailable = computed(() => {
  if (!bedspaces.value || bedspaces.value.length === 0) return 0
  const available = bedspaces.value.reduce((sum, unit) => sum + unit.availableBeds, 0)
  
  // Check if value changed and trigger visual feedback
  if (previousStats.totalAvailable !== available) {
    highlightStat('availableBeds')
    previousStats.totalAvailable = available
  }
  
  return available
})

const occupancyRate = computed(() => {
  if (totalBeds.value === 0) return 0
  const rate = Math.round(((totalBeds.value - totalAvailable.value) / totalBeds.value) * 100)
  
  // Check if value changed and trigger visual feedback
  if (previousStats.occupancyRate !== rate) {
    highlightStat('occupancyRate')
    previousStats.occupancyRate = rate
  }
  
  return rate
})

const filteredUnits = computed(() => {
  if (!bedspaces.value) return []
  
  return bedspaces.value.filter(unit => {
    // Search filter
    const matchesSearch = 
      unit.departmentName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      unit.location.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    // Status filter
    const availabilityPercentage = (unit.availableBeds / unit.totalBeds) * 100
    const matchesStatus = 
      statusFilter.value === 'all' ||
      (statusFilter.value === 'critical' && availabilityPercentage < 10) ||
      (statusFilter.value === 'warning' && availabilityPercentage >= 10 && availabilityPercentage < 30) ||
      (statusFilter.value === 'normal' && availabilityPercentage >= 30)
    
    return matchesSearch && matchesStatus
  })
})

// Methods
const incrementBed = async (unit: BedSpace) => {
  if (unit.availableBeds < unit.totalBeds) {
    try {
      processing.value = unit._id
      actionType.value = 'admit'
      
      await updateAvailability(unit._id, "admit")
      
      showNotification(
        'success', 
        'Bed Added', 
        `Bed availability for ${unit.departmentName} has been increased to ${unit.availableBeds + 1}`
      )
    } catch (error) {
      showNotification(
        'warning', 
        'Update Failed', 
        'Failed to update bed availability. Please try again.'
      )
    } finally {
      processing.value = null
      actionType.value = null
    }
  }
}

const decrementBed = async (unit: BedSpace) => {
  if (unit.availableBeds > 0) {
    try {
      processing.value = unit._id
      actionType.value = 'discharge'
      
      await updateAvailability(unit._id, "discharge")
      
      showNotification(
        'success', 
        'Bed Occupied', 
        `Bed availability for ${unit.departmentName} has been decreased to ${unit.availableBeds - 1}`
      )
    } catch (error) {
      showNotification(
        'warning', 
        'Update Failed', 
        'Failed to update bed availability. Please try again.'
      )
    } finally {
      processing.value = null
      actionType.value = null
    }
  }
}

const showNotification = (type: 'success' | 'warning', title: string, message: string) => {
  notification.value = {
    show: true,
    type,
    title,
    message
  }
  
  // Auto-hide notification after 5 seconds
  setTimeout(() => {
    notification.value.show = false
  }, 5000)
}

const getStatusClass = (unit: BedSpace) => {
  const percentage = (unit.availableBeds / unit.totalBeds) * 100
  if (percentage < 10) return 'bg-red-100 text-red-800'
  if (percentage < 30) return 'bg-amber-100 text-amber-800'
  return 'bg-emerald-100 text-emerald-800'
}

const getProgressBarClass = (unit: BedSpace) => {
  const percentage = (unit.availableBeds / unit.totalBeds) * 100
  if (percentage < 10) return 'bg-red-500'
  if (percentage < 30) return 'bg-amber-500'
  return 'bg-emerald-500'
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const showUnitDetails = (unit: BedSpace) => {
  // This would typically open a modal or navigate to a details page
  showNotification('success', 'Unit Details', `Viewing details for ${unit.departmentName}`)
}

// Highlight a stat for visual feedback
const highlightStat = (stat: 'totalBeds' | 'availableBeds' | 'occupancyRate') => {
  statsUpdated[stat] = true
  
  // Reset highlight after animation
  setTimeout(() => {
    statsUpdated[stat] = false
  }, 3000)
}

// Handle real-time bedspace updates
const handleBedspaceUpdate = (data: any) => {
  console.log('Received bedspace update:', data)
  updateCount.value++
  
  if (!data || !data.bedspace) return
  
  // Find and update the bedspace in our local state
  const index = bedspaces.value.findIndex(unit => unit._id === data.bedspace._id)
  
  if (index !== -1) {
    // Update the existing bedspace
    bedspaces.value[index] = {
      ...bedspaces.value[index],
      ...data.bedspace,
      lastUpdated: data.timestamp || new Date().toISOString()
    }
    
    // Mark as recently updated for visual feedback
    recentlyUpdated.value.push(data.bedspace._id)
    setTimeout(() => {
      recentlyUpdated.value = recentlyUpdated.value.filter(id => id !== data.bedspace._id)
    }, 3000)
    
    // Show notification
    showNotification(
      'success',
      'Real-time Update',
      `${data.bedspace.departmentName} bed availability updated to ${data.bedspace.availableBeds}`
    )
  } else if (data.bedspace.hospital === currentHospitalId.value) {
    // If it's a new bedspace for our hospital, add it
    bedspaces.value.push({
      ...data.bedspace,
      lastUpdated: data.timestamp || new Date().toISOString()
    })
    
    // Mark as recently updated
    recentlyUpdated.value.push(data.bedspace._id)
    setTimeout(() => {
      recentlyUpdated.value = recentlyUpdated.value.filter(id => id !== data.bedspace._id)
    }, 3000)
  }
}

// Handle initial bedspace data
const handleInitialData = (data: any) => {
  console.log('Received initial bedspace data:', data)
  
  if (data && Array.isArray(data.bedspaces)) {
    // Replace our local state with the server data
    bedspaces.value = data.bedspaces.map((bedspace: any) => ({
      ...bedspace,
      lastUpdated: bedspace.updatedAt || new Date().toISOString()
    }))
  }
}

// Handle hospital status changes
const handleHospitalStatusChange = (data: any) => {
  console.log('Hospital status changed:', data)
  
  showNotification(
    'warning',
    'Hospital Status Changed',
    `Hospital status changed to: ${data.status}`
  )
}

// Connect to WebSocket and join hospital room
const connectAndJoinRoom = async () => {
  try {
    // Get hospital ID from local storage
    const hospitalId = getHospitalIdFromLocalStorage()
    
    if (!hospitalId) {
      console.error('No hospital ID found in local storage')
      showNotification(
        'warning',
        'Connection Error',
        'No hospital ID found. Please log in again.'
      )
      return
    }
    
    currentHospitalId.value = hospitalId
    
    // Initialize socket if not already connected
    if (!isConnected.value) {
      initSocket()
    }
    
    // Wait for connection before joining room
    if (!isConnected.value) {
      await new Promise<void>((resolve, reject) => {
        const checkConnection = setInterval(() => {
          if (isConnected.value) {
            clearInterval(checkConnection)
            resolve()
          }
          
          connectionAttempts.value++
          if (connectionAttempts.value >= maxConnectionAttempts) {
            clearInterval(checkConnection)
            reject(new Error('Failed to connect after multiple attempts'))
          }
        }, 1000)
      })
    }
    
    // Join hospital room
    await joinHospitalRoom(hospitalId)
    
    console.log(`Successfully joined hospital room for ${hospitalId}`)
    
    // Force fetch initial data if needed
    if (bedspaces.value.length === 0) {
      await fetchBedspaces()
    }
  } catch (error) {
    console.error('Error connecting to WebSocket:', error)
    showNotification(
      'warning',
      'Connection Error',
      'Failed to connect to real-time updates. Please try again.'
    )
  }
}

// Reconnect to WebSocket
const reconnect = async () => {
  try {
    // Reset error state
    lastError.value = null
    connectionAttempts.value = 0
    
    // Connect and join room
    await connectAndJoinRoom()
    
    showNotification(
      'success',
      'Reconnected',
      'Successfully reconnected to real-time updates.'
    )
  } catch (error) {
    console.error('Error reconnecting:', error)
    showNotification(
      'warning',
      'Reconnection Failed',
      'Failed to reconnect. Please try again later.'
    )
  }
}

// Setup WebSocket connection and listeners
onMounted(async () => {
  // Set up event listeners
  const bedspaceUpdateCleanup = onBedSpaceUpdated(handleBedspaceUpdate)
  const initialDataCleanup = onInitialBedspaceData(handleInitialData)
  const statusChangeCleanup = onHospitalStatusChanged(handleHospitalStatusChange)
  
  // Connect and join hospital room
  await connectAndJoinRoom()
  
  // Store initial stats values
  previousStats.totalBeds = totalBeds.value
  previousStats.totalAvailable = totalAvailable.value
  previousStats.occupancyRate = occupancyRate.value
  
  // Cleanup function
  onUnmounted(() => {
    if (currentHospitalId.value) {
      leaveHospitalRoom(currentHospitalId.value)
    }
    
    // Clean up event listeners
    if (bedspaceUpdateCleanup) bedspaceUpdateCleanup()
    if (initialDataCleanup) initialDataCleanup()
    if (statusChangeCleanup) statusChangeCleanup()
  })
})
</script>

<style scoped>
/* Transitions for list items */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Notification animation */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}
.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Highlight recently updated items */
.border-emerald-500 {
  transition: border-color 0.5s ease;
  animation: highlight 3s ease;
}

@keyframes highlight {
  0% {
    background-color: rgba(16, 185, 129, 0.1);
  }
  100% {
    background-color: transparent;
  }
}

/* Pulse animation for critical status */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
.bg-red-100 {
  animation: pulse 2s infinite;
}
</style>