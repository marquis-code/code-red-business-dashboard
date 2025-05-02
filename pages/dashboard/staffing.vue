<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4 md:p-6">
    <main class="max-w-7xl mx-auto">
      <!-- Hospital Staffing Table -->
      <div class="bg-white shadow-xl rounded-xl overflow-hidden transition-all duration-500 transform hover:shadow-2xl">
        <div class="p-6 border-b border-gray-100">
          <h2 class="text-xl font-bold text-gray-800 mb-2">Hospital Staff Directory</h2>
          <p class="text-gray-500">Manage and view all hospital personnel</p>
          
          <!-- Search and Filter -->
          <div class="mt-6 flex flex-col sm:flex-row gap-4">
            <div class="relative flex-grow">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search staff..." 
                class="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div class="flex-shrink-0">
              <select 
                v-model="departmentFilter"
                class="px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="all">All Departments</option>
                <option value="Radiology">Radiology</option>
                <option value="Surgery">Surgery</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <div class="flex-shrink-0">
              <select 
                v-model="availabilityFilter"
                class="px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <div v-if="loading" class="animate-pulse p-6">
            <!-- Skeleton Loader -->
            <div v-for="i in 4" :key="i" class="flex flex-col sm:flex-row items-start sm:items-center p-4 border-b border-gray-200 gap-4">
              <div class="w-16 h-16 bg-gray-300 rounded-full mr-4"></div>
              <div class="flex-1 space-y-3">
                <div class="h-6 bg-gray-300 rounded-lg w-3/4"></div>
                <div class="h-4 bg-gray-300 rounded-lg w-1/2"></div>
                <div class="h-4 bg-gray-300 rounded-lg w-1/3"></div>
              </div>
              <div class="w-24 h-10 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
          
          <!-- Mobile View (Card Layout) -->
          <div v-else-if="isMobile" class="divide-y divide-gray-100">
            <TransitionGroup 
              name="list" 
              tag="div" 
              class="space-y-4 p-4"
            >
              <div 
                v-for="staff in filteredStaff" 
                :key="staff._id"
                class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div class="p-4">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center">
                      <div class="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl mr-3">
                        {{ getInitials(staff.name) }}
                      </div>
                      <div>
                        <h3 class="font-semibold text-gray-800">{{ staff.name }}</h3>
                        <p class="text-sm text-gray-500">{{ staff.position }}</p>
                      </div>
                    </div>
                    <span
                      :class="{
                        'bg-green-100 text-green-700': staff.availability === 'Available',
                        'bg-red-100 text-red-700': staff.availability === 'Unavailable',
                      }"
                      class="px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {{ staff.availability }}
                    </span>
                  </div>
                  
                  <div class="mt-3 text-sm text-gray-600">
                    <p><span class="font-medium">Department:</span> {{ staff.department }}</p>
                    <p><span class="font-medium">Contact:</span> {{ staff.contactNumber }}</p>
                  </div>
                  
                  <button
                    @click="showDetails(staff)"
                    class="mt-4 w-full text-center bg-teal-600 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-700 transition-colors duration-200"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </TransitionGroup>
            
            <div v-if="filteredStaff.length === 0" class="text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="text-lg font-medium text-gray-700">No staff found</h3>
              <p class="text-gray-500">Try adjusting your search or filters</p>
            </div>
          </div>
          
          <!-- Desktop View (Table Layout) -->
          <table
            v-else
            class="min-w-full bg-white"
          >
            <thead>
              <tr class="bg-gray-50 text-gray-700 border-b border-gray-200">
                <th class="p-4 text-left text-sm font-bold">Staff</th>
                <th class="p-4 text-left text-sm font-bold">Position</th>
                <th class="p-4 text-left text-sm font-bold">Department</th>
                <th class="p-4 text-left text-sm font-bold">Availability</th>
                <th class="p-4 text-left text-sm font-bold">Contact</th>
                <th class="p-4 text-left text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TransitionGroup name="list">
                <tr
                  v-for="staff in filteredStaff"
                  :key="staff._id"
                  class="hover:bg-gray-50 border-b border-gray-100 transition-colors duration-200"
                >
                  <td class="p-4 text-gray-700">
                    <div class="flex items-center">
                      <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold mr-3">
                        {{ getInitials(staff.name) }}
                      </div>
                      <span>{{ staff.name }}</span>
                    </div>
                  </td>
                  <td class="p-4 text-gray-700 text-sm">{{ staff.position }}</td>
                  <td class="p-4 text-gray-700 text-sm">{{ staff.department }}</td>
                  <td class="p-4 text-sm">
                    <span
                      :class="{
                        'bg-green-100 text-green-700': staff.availability === 'Available',
                        'bg-red-100 text-red-700': staff.availability === 'Unavailable',
                      }"
                      class="px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {{ staff.availability }}
                    </span>
                  </td>
                  <td class="p-4 text-gray-700 text-sm">{{ staff.contactNumber }}</td>
                  <td class="p-4">
                    <button
                      @click="showDetails(staff)"
                      class="text-sm bg-teal-600 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-700 transition-colors duration-200"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              </TransitionGroup>
            </tbody>
          </table>
          
          <div v-if="!loading && filteredStaff.length === 0 && !isMobile" class="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-700">No staff found</h3>
            <p class="text-gray-500">Try adjusting your search or filters</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <Transition name="modal">
      <div
        v-if="selectedStaff"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="selectedStaff = null"
      >
        <div class="bg-white rounded-xl shadow-2xl w-11/12 md:w-2/3 lg:w-1/2 max-w-2xl p-6 relative transform transition-all duration-300">
          <!-- Close Button -->
          <button
            @click="selectedStaff = null"
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
          <div class="flex items-center mb-6">
            <div class="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-2xl mr-4">
              {{ getInitials(selectedStaff.name) }}
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-800">{{ selectedStaff.name }}</h3>
              <p class="text-gray-500">{{ selectedStaff.position }} • {{ selectedStaff.department }}</p>
            </div>
          </div>

          <!-- Modal Content -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <p class="text-sm text-gray-500 mb-1">Email</p>
                <p class="font-medium">{{ selectedStaff.email }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">Phone</p>
                <p class="font-medium">{{ selectedStaff.contactNumber }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">Status</p>
                <p>
                  <span
                    :class="{
                      'bg-green-100 text-green-700': selectedStaff.availability === 'Available',
                      'bg-red-100 text-red-700': selectedStaff.availability === 'Unavailable',
                    }"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ selectedStaff.availability }}
                  </span>
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">Active</p>
                <p class="font-medium">{{ selectedStaff.isActive ? 'Yes' : 'No' }}</p>
              </div>
            </div>
          </div>

          <!-- Specializations -->
          <div v-if="selectedStaff.specializations && selectedStaff.specializations.equipment" class="mb-6">
            <h4 class="text-lg font-semibold text-gray-800 mb-3">Equipment Specializations</h4>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="(equipment, index) in selectedStaff.specializations.equipment" 
                :key="index"
                class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                {{ equipment }}
              </span>
            </div>
          </div>

          <!-- Schedule -->
          <div v-if="selectedStaff.schedule && selectedStaff.schedule.length > 0" class="mb-6">
            <h4 class="text-lg font-semibold text-gray-800 mb-3">Recent Schedule</h4>
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div v-for="(item, index) in selectedStaff.schedule" :key="index" class="p-3 border-b last:border-b-0">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-medium">{{ formatDate(item.date) }}</p>
                    <p class="text-sm text-gray-500">{{ item.shift }} Shift</p>
                  </div>
                  <span
                    :class="{
                      'bg-green-100 text-green-700': item.status === 'Present',
                      'bg-red-100 text-red-700': item.status === 'Sick',
                      'bg-yellow-100 text-yellow-700': item.status === 'Leave',
                      'bg-blue-100 text-blue-700': item.status === 'Training',
                    }"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ item.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex justify-end gap-3">
            <button
              @click="selectedStaff = null"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Close
            </button>
            <button
              class="bg-teal-600 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-700 transition-colors duration-200"
            >
              Edit Staff
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useFetchStaffList } from "@/composables/modules/staff/useFetchStaffList";
import { definePageMeta } from '#imports'

definePageMeta({
  layout: "admin-dashboard",
  middleware: "auth",
});

// Get staff data from composable
const { loading, error, staffList } = useFetchStaffList();

// State for search and filtering
const searchQuery = ref('');
const departmentFilter = ref('all');
const availabilityFilter = ref('all');
const selectedStaff = ref(null);
const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value < 768);

// Handle window resize for responsive layout
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

// Filter staff based on search query and filters
const filteredStaff = computed(() => {
  if (!staffList.value) return [];
  
  return staffList.value.filter(staff => {
    // Search filter
    const matchesSearch = 
      staff.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      staff.position.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      staff.department.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // Department filter
    const matchesDepartment = 
      departmentFilter.value === 'all' || 
      staff.department === departmentFilter.value;
    
    // Availability filter
    const matchesAvailability = 
      availabilityFilter.value === 'all' || 
      staff.availability === availabilityFilter.value;
    
    return matchesSearch && matchesDepartment && matchesAvailability;
  });
});

// Helper functions
const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const showDetails = (staff) => {
  selectedStaff.value = staff;
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

/* Hover effects */
.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Pulse animation for unavailable status */
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

/* Card hover effect */
.hover\:-translate-y-1:hover {
  transform: translateY(-4px);
}
</style>