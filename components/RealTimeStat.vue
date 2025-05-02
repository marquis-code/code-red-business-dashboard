<template>
  <div class="bg-gradient-to-br rounded-2xl lg:w-full transition-all duration-300">
    <!-- Header Section -->
    <div class="lg:flex space-y-4 lg:space-y-0 items-center justify-between pb-6">
      <div class="transform transition-all duration-300 hover:translate-x-2">
        <h2 class="text-xl text-[#05004E] font-bold">Real Time Operation Overview</h2>
        <p class="text-[#737791] mt-1">Hospital Bed Management Dashboard</p>
      </div>
      <div class="flex space-x-3">
        <button
          class="flex items-center px-4 py-2 border-[0.5px] border-gray-200 rounded-lg text-sm text-[#0F3659] hover:bg-blue-50 transition-colors duration-300"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-2">
            <path d="M2 11.4997V13.9997H4.5L11.8733 6.62638L9.37333 4.12638L2 11.4997ZM13.8067 4.69305C14.0667 4.43305 14.0667 4.01305 13.8067 3.75305L12.2467 2.19305C11.9867 1.93305 11.5667 1.93305 11.3067 2.19305L10.0867 3.41305L12.5867 5.91305L13.8067 4.69305Z" fill="#0F3659"/>
          </svg>
          Edit
        </button>
        <button
          class="flex items-center px-4 py-2 border-[0.5px] border-gray-200 rounded-lg text-sm text-[#0F3659] hover:bg-blue-50 transition-colors duration-300"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-2">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M3.99935 9.33268C3.99935 8.96449 4.29783 8.66602 4.66602 8.66602H5.66602C6.03421 8.66602 6.33268 8.36754 6.33268 7.99935C6.33268 7.63116 6.03421 7.33268 5.66602 7.33268H4.66602C3.56145 7.33268 2.66602 8.22811 2.66602 9.33268V11.3327C2.66602 12.4373 3.56145 13.3327 4.66602 13.3327H11.3327C12.4373 13.3327 13.3327 12.4373 13.3327 11.3327V9.33268C13.3327 8.22811 12.4373 7.33268 11.3327 7.33268H10.3327C9.96449 7.33268 9.66602 7.63116 9.66602 7.99935C9.66602 8.36754 9.96449 8.66602 10.3327 8.66602H11.3327C11.7009 8.66602 11.9993 8.96449 11.9993 9.33268V11.3327C11.9993 11.7009 11.7009 11.9993 11.3327 11.9993H4.66602C4.29783 11.9993 3.99935 11.7009 3.99935 11.3327V9.33268Z" fill="#0F3659"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.0999 5.11196L8.43826 2.83077C8.31399 2.72183 8.15711 2.6661 7.9994 2.66602C7.89149 2.66596 7.7832 2.69196 7.6847 2.7448C7.64081 2.76828 7.59911 2.79696 7.56055 2.83077L4.89886 5.11196C4.6193 5.35156 4.5869 5.77242 4.8265 6.05198C5.0661 6.33155 5.48696 6.36395 5.76653 6.12435L7.33269 4.78207V9.94516C7.33269 10.3134 7.63117 10.6118 7.99936 10.6118C8.36755 10.6118 8.66602 10.3134 8.66602 9.94516L8.66603 4.782L10.2323 6.12435C10.5118 6.36395 10.9327 6.33155 11.1723 6.05198C11.4119 5.77242 11.3795 5.35156 11.0999 5.11196Z" fill="#0F3659"/>
          </svg>
          Export
        </button>
      </div>
    </div>

    <!-- Main Stats Overview -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <!-- Loading Skeletons -->
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="animate-pulse bg-white p-6 rounded-xl shadow">
          <div class="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div class="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </template>

      <!-- Actual Stats -->
      <template v-else>
        <!-- Available Beds -->
        <div 
          class="flex flex-col items-start bg-gradient-to-br from-red-50 to-white p-6 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <div class="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12V2.5C19 2.10218 18.842 1.72064 18.5607 1.43934C18.2794 1.15804 17.8978 1 17.5 1H13.5C13.1022 1 12.7206 1.15804 12.4393 1.43934C12.158 1.72064 12 2.10218 12 2.5V12M8 12V6H2C1.73478 6 1.48043 6.10536 1.29289 6.29289C1.10536 6.48043 1 6.73478 1 7V12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 6H19V8H1V7C1 6.73478 1.10536 6.48043 1.29289 6.29289C1.48043 6.10536 1.73478 6 2 6Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="flex items-baseline">
            <h3 class="text-4xl font-bold text-red-600 mr-2 counter">{{ summary?.availableBeds }}</h3>
            <span class="text-lg text-red-400">beds</span>
          </div>
          <p class="text-sm text-gray-600 mt-1">Available beds</p>
          <div class="flex items-center mt-3 text-sm">
            <span class="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <span class="text-red-600">{{ Math.round((summary?.availableBeds / summary?.totalBeds) * 100) }}% availability rate</span>
          </div>
        </div>

        <!-- Occupied Beds -->
        <div 
          class="flex flex-col items-start bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <div class="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M3 5C3.24493 5.00003 3.48134 5.08996 3.66437 5.25272C3.84741 5.41547 3.96434 5.63975 3.993 5.883L4 6V13H11V8C11 7.75507 11.09 7.51866 11.2527 7.33563C11.4155 7.15259 11.6397 7.03566 11.883 7.007L12 7H19C19.7652 6.99996 20.5015 7.29233 21.0583 7.81728C21.615 8.34224 21.9501 9.06011 21.995 9.824L22 10V18C21.9997 18.2549 21.9021 18.5 21.7272 18.6854C21.5522 18.8707 21.313 18.9822 21.0586 18.9972C20.8042 19.0121 20.5536 18.9293 20.3582 18.7657C20.1627 18.6021 20.0371 18.3701 20.007 18.117L20 18V15H4V18C3.99972 18.2549 3.90212 18.5 3.72715 18.6854C3.55218 18.8707 3.31305 18.9822 3.05861 18.9972C2.80416 19.0121 2.55362 18.9293 2.35817 18.7657C2.16271 18.6021 2.0371 18.3701 2.007 18.117L2 18V6C2 5.73478 2.10536 5.48043 2.29289 5.29289C2.48043 5.10536 2.73478 5 3 5Z" fill="white"/>
            </svg>
          </div>
          <div class="flex items-baseline">
            <h3 class="text-4xl font-bold text-amber-600 mr-2 counter">{{ summary?.occupiedBeds }}</h3>
            <span class="text-lg text-amber-400">beds</span>
          </div>
          <p class="text-sm text-gray-600 mt-1">Occupied beds</p>
          <div class="flex items-center mt-3 text-sm">
            <span class="inline-block w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
            <span class="text-amber-600">{{ summary?.occupancyRate }}% occupancy rate</span>
          </div>
        </div>

        <!-- Total Beds -->
        <div 
          class="flex flex-col items-start bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <div class="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 10H21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 2V6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 2V6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="flex items-baseline">
            <h3 class="text-4xl font-bold text-emerald-600 mr-2 counter">{{ summary?.totalBeds }}</h3>
            <span class="text-lg text-emerald-400">beds</span>
          </div>
          <p class="text-sm text-gray-600 mt-1">Total capacity</p>
          <div class="flex items-center mt-3 text-sm">
            <span class="inline-block w-3 h-3 rounded-full bg-emerald-500 mr-2"></span>
            <span class="text-emerald-600">{{ summary?.departments?.length }} departments</span>
          </div>
        </div>

        <!-- Occupancy Rate -->
        <div 
          class="flex flex-col items-start bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <div class="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2V6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 18V22" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4.93 4.93L7.76 7.76" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16.24 16.24L19.07 19.07" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12H6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18 12H22" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4.93 19.07L7.76 16.24" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16.24 7.76L19.07 4.93" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="flex items-baseline">
            <h3 class="text-4xl font-bold text-blue-600 mr-2 counter">{{ summary?.occupancyRate }}</h3>
            <span class="text-lg text-blue-400">%</span>
          </div>
          <p class="text-sm text-gray-600 mt-1">Occupancy rate</p>
          <div class="flex items-center mt-3 text-sm">
            <span class="inline-block w-3 h-3 rounded-full" :class="getOccupancyStatusColor(summary?.occupancyRate)"></span>
            <span :class="getOccupancyStatusTextColor(summary?.occupancyRate)" class="ml-2">{{ getOccupancyStatus(summary?.occupancyRate) }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Department List -->
    <div class="mt-8">
      <h3 class="text- font-semibold text-[#05004E] mb-4">Department Status</h3>
      

      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse bg-white p-4 rounded-lg shadow">
          <div class="flex justify-between items-center">
            <div>
              <div class="h-5 bg-gray-200 rounded w-40 mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div class="h-8 w-24 bg-gray-200 rounded"></div>
          </div>
          <div class="mt-4 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>


      <TransitionGroup 
        name="list" 
        tag="div" 
        class="space-y-4"
        v-else
      >
        <div 
          v-for="dept in summary?.departments" 
          :key="dept.name"
          class="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h4 class="font-semibold text-gray-800">{{ dept.name }}</h4>
              <p class="text-sm text-gray-500">{{ dept.location }}</p>
            </div>
            <div 
              :class="{
                'bg-green-100 text-green-700': dept?.status === 'Available',
                'bg-amber-100 text-amber-700': dept?.status === 'Limited',
                'bg-red-100 text-red-700': dept?.status === 'Unavailable'
              }"
              class="px-3 py-1 rounded-full text-sm font-medium mt-2 sm:mt-0"
            >
              {{ dept.status }}
            </div>
          </div>
          
          <div class="mt-4">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
              <span>{{ dept?.availableBeds }} available</span>
              <span>{{ dept?.totalBeds }} total</span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                :class="{
                  'bg-green-500': getAvailabilityPercentage(dept) > 30,
                  'bg-amber-500': getAvailabilityPercentage(dept) <= 30 && getAvailabilityPercentage(dept) > 10,
                  'bg-red-500': getAvailabilityPercentage(dept) <= 10
                }"
                :style="`width: ${getAvailabilityPercentage(dept)}%`"
                class="h-full transition-all duration-500 ease-out"
              ></div>
            </div>
          </div>
          
          <div class="mt-3 flex justify-between items-center">
            <div class="flex items-center text-xs text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last updated: {{ formatTime(dept?.lastUpdated) }}
            </div>
            <button @click="router.push('/dashboard/availability-counter')" class="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center transition-colors duration-200">
              View Details
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useHospitalSummary } from "@/composables/modules/bedspace/useHospitalSummary";

// Get data from composable
const { summary, loading, error } = useHospitalSummary();
const router = useRouter()

// Helper functions
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getAvailabilityPercentage = (dept) => {
  return (dept.availableBeds / dept.totalBeds) * 100;
};

const getOccupancyStatus = (rate) => {
  if (rate >= 90) return 'Critical';
  if (rate >= 75) return 'High';
  if (rate >= 50) return 'Moderate';
  return 'Low';
};

const getOccupancyStatusColor = (rate) => {
  if (rate >= 90) return 'bg-red-500';
  if (rate >= 75) return 'bg-amber-500';
  if (rate >= 50) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getOccupancyStatusTextColor = (rate) => {
  if (rate >= 90) return 'text-red-600';
  if (rate >= 75) return 'text-amber-600';
  if (rate >= 50) return 'text-yellow-600';
  return 'text-green-600';
};

// Animation for counters
onMounted(() => {
  if (!loading.value) {
    animateCounters();
  }
});

const animateCounters = () => {
  const counters = document.querySelectorAll('.counter');
  const speed = 200;

  counters.forEach(counter => {
    const target = +counter.textContent;
    const increment = target / speed;
    let count = 0;

    const updateCount = () => {
      count += increment;
      if (count < target) {
        counter.textContent = Math.ceil(count).toString();
        setTimeout(updateCount, 1);
      } else {
        counter.textContent = target.toString();
      }
    };

    updateCount();
  });
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

/* Hover effects */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Counter animation */
.counter {
  transition: all 0.3s ease;
}
</style>