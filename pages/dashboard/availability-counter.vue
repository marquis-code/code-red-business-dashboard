<template>
  <div class="bg-gradient-to-br from-gray-50 to-gray-50 p-6">
    <div class="max-w-5xl mx-auto">
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-teal-800 mb-2">Emergency Bed Space Tracker</h1>
        <p class="text-slate-600">Real-time bed availability management system</p>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600"></div>
      </div>

      <template v-else>
        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="bg-white rounded-xl shadow-md p-4 flex items-center transform hover:scale-105 transition-transform duration-300">
            <div class="bg-teal-100 p-3 rounded-lg mr-4">
              <BedIcon class="text-teal-600 h-6 w-6" />
            </div>
            <div>
              <p class="text-slate-500 text-sm">Total Beds</p>
              <p class="text-2xl font-bold text-slate-800">{{ totalBeds }}</p>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-md p-4 flex items-center transform hover:scale-105 transition-transform duration-300">
            <div class="bg-emerald-100 p-3 rounded-lg mr-4">
              <CheckCircleIcon class="text-emerald-600 h-6 w-6" />
            </div>
            <div>
              <p class="text-slate-500 text-sm">Available Beds</p>
              <p class="text-2xl font-bold text-emerald-600">{{ totalAvailable }}</p>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-md p-4 flex items-center transform hover:scale-105 transition-transform duration-300">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUpdateBedAvailability } from "@/composables/modules/bedspace/useBedAvailability"
import { useBedspaces } from "@/composables/modules/bedspace/useFetchBedspaces"
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
  AlertOctagonIcon
} from 'lucide-vue-next'
import { definePageMeta } from '#imports'

// Get data from composables
const { bedspaces, loading } = useBedspaces()
const { updateAvailability, loading: updateLoading } = useUpdateBedAvailability()

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

// Computed properties
const totalBeds = computed(() => {
  if (!bedspaces.value || bedspaces.value.length === 0) return 0
  return bedspaces.value.reduce((sum, unit) => sum + unit.totalBeds, 0)
})

const totalAvailable = computed(() => {
  if (!bedspaces.value || bedspaces.value.length === 0) return 0
  return bedspaces.value.reduce((sum, unit) => sum + unit.availableBeds, 0)
})

const occupancyRate = computed(() => {
  if (totalBeds.value === 0) return 0
  return Math.round(((totalBeds.value - totalAvailable.value) / totalBeds.value) * 100)
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

/* Hover animations */
.bg-white {
  transition: all 0.3s ease;
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