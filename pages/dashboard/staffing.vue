<template>
  <div class="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
    <main class="flex-1 p-6">
      <!-- Hospital Staffing Table -->
      <div class="bg-white shadow-lg rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">
          Hospital Staffing
        </h2>
        <div class="overflow-x-auto">
          <div v-if="loading" class="animate-pulse">
            <!-- Skeleton Loader -->
            <div v-for="i in 4" :key="i" class="flex items-center p-4 border-b border-gray-200">
              <div class="w-1/4 h-6 bg-gray-300 rounded-lg mr-4"></div>
              <div class="w-1/4 h-6 bg-gray-300 rounded-lg mr-4"></div>
              <div class="w-1/4 h-6 bg-gray-300 rounded-lg mr-4"></div>
              <div class="w-1/6 h-6 bg-gray-300 rounded-lg mr-4"></div>
              <div class="w-1/6 h-8 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
          <table
              v-else
              class="min-w-full bg-white border border-gray-200 rounded-lg"
          >
            <thead>
            <tr class="bg-blue-100 text-blue-900 border-b border-gray-200">
              <th class="p-4 text-left text-sm font-bold">Name</th>
              <th class="p-4 text-left text-sm font-bold">Position</th>
              <th class="p-4 text-left text-sm font-bold">Department</th>
              <th class="p-4 text-left text-sm font-bold">Availability</th>
              <th class="p-4 text-left text-sm font-bold">Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="staff in staffData"
                :key="staff.id"
                class="hover:bg-gray-50 border-b"
            >
              <td class="p-4 text-gray-700 text-sm">{{ staff.name }}</td>
              <td class="p-4 text-gray-700 text-sm">{{ staff.position }}</td>
              <td class="p-4 text-gray-700 text-sm">{{ staff.department }}</td>
              <td class="p-4 text-sm">
                  <span
                      :class="{
                      'bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium':
                        staff.availability === 'Available',
                      'bg-red-100 text-red-700 px-2 py-1 rounded-lg font-medium':
                        staff.availability === 'Unavailable',
                    }"
                  >
                    {{ staff.availability }}
                  </span>
              </td>
              <td class="p-4">
                <button
                    @click="showDetails(staff)"
                    class="text-sm bg-[#CC1100] text-white px-4 py-2 rounded-lg shadow hover:bg-bg-[#CC1100]"
                >
                  Details
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <div
        v-if="selectedStaff"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl w-11/12 md:w-2/3 lg:w-1/2 p-6 relative">
        <!-- Close Button -->
        <button
            @click="selectedStaff = null"
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
        <h3 class="text-2xl font-semibold text-gray-800 mb-4">
          Staff Details
        </h3>

        <!-- Modal Content -->
        <div class="text-gray-700 text-sm space-y-4">
          <p><strong>Name:</strong> {{ selectedStaff.name }}</p>
          <p><strong>Position:</strong> {{ selectedStaff.position }}</p>
          <p><strong>Department:</strong> {{ selectedStaff.department }}</p>
          <p><strong>Availability:</strong> {{ selectedStaff.availability }}</p>
          <p><strong>Email:</strong> {{ selectedStaff.email }}</p>
          <p><strong>Phone:</strong> {{ selectedStaff.phone }}</p>
          <p><strong>Shift:</strong> {{ selectedStaff.shift }}</p>
          <p><strong>Years of Experience:</strong> {{ selectedStaff.experience }}</p>
        </div>

        <!-- Modal Footer -->
        <div class="mt-6 flex justify-end">
          <button
              @click="selectedStaff = null"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

definePageMeta({
  layout: "admin-dashboard",
  middleware: "auth",
});

// State to track loading
const loading = ref(true);

// Mock data for hospital staffing
const staffData = ref([
  {
    id: 1,
    name: "Dr. Jane Doe",
    position: "Surgeon",
    department: "Surgery",
    availability: "Available",
    email: "jane.doe@hospital.com",
    phone: "+1-202-555-0176",
    shift: "Morning",
    experience: "12 years",
  },
  {
    id: 2,
    name: "Nurse John Smith",
    position: "Nurse",
    department: "Pediatrics",
    availability: "Unavailable",
    email: "john.smith@hospital.com",
    phone: "+1-202-555-0198",
    shift: "Night",
    experience: "8 years",
  },
  {
    id: 3,
    name: "Dr. Emily White",
    position: "Physician",
    department: "Internal Medicine",
    availability: "Available",
    email: "emily.white@hospital.com",
    phone: "+1-202-555-0113",
    shift: "Evening",
    experience: "10 years",
  },
  {
    id: 4,
    name: "Dr. Mike Brown",
    position: "Radiologist",
    department: "Radiology",
    availability: "Unavailable",
    email: "mike.brown@hospital.com",
    phone: "+1-202-555-0154",
    shift: "Afternoon",
    experience: "15 years",
  },
]);

// State to handle selected staff for the modal
const selectedStaff = ref(null);

const showDetails = (staff: any) => {
  selectedStaff.value = staff;
};

// Simulate data loading
onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 2000); // Simulate loading time
});
</script>
