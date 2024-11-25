<template>
  <div class="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
    <main class="flex-1 p-6">
      <!-- Bed Availability Section -->
      <div class="bg-white shadow-lg rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">
          Bed Availability for {{ hospitalName }}
        </h2>

        <div class="overflow-x-auto">
          <!-- Loader -->
          <div v-if="loading" class="animate-pulse">
            <div v-for="i in 4" :key="i" class="flex items-center p-4 border-b border-gray-200">
              <div class="w-1/4 h-6 bg-gray-300 rounded-lg mr-4"></div>
              <div class="w-1/4 h-6 bg-gray-300 rounded-lg mr-4"></div>
              <div class="w-1/4 h-6 bg-gray-300 rounded-lg mr-4"></div>
              <div class="w-1/6 h-6 bg-gray-300 rounded-lg mr-4"></div>
              <div class="w-1/6 h-8 bg-gray-300 rounded-lg"></div>
            </div>
          </div>

          <!-- Table -->
          <table
              v-else
              class="min-w-full bg-white border border-gray-200 rounded-lg"
          >
            <thead>
            <tr class="bg-blue-100 text-blue-900 border-b border-gray-200">
              <th class="p-4 text-left text-sm font-bold">Unit</th>
              <th class="p-4 text-left text-sm font-bold">Total Beds</th>
              <th class="p-4 text-left text-sm font-bold">Available Beds</th>
              <th class="p-4 text-left text-sm font-bold">Occupied Beds</th>
              <th class="p-4 text-left text-sm font-bold">Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="unit in hospitalUnits"
                :key="unit.id"
                class="hover:bg-gray-50 border-b"
            >
              <td class="p-4 text-gray-700 text-sm">{{ unit.name }}</td>
              <td class="p-4 text-gray-700 text-sm">{{ unit.totalBeds }}</td>
              <td class="p-4 text-sm">
                  <span
                      class="bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium"
                  >
                    {{ unit.availableBeds }}
                  </span>
              </td>
              <td class="p-4 text-sm">
                  <span
                      class="bg-red-100 text-red-700 px-2 py-1 rounded-lg font-medium"
                  >
                    {{ unit.occupiedBeds }}
                  </span>
              </td>
              <td class="p-4">
                <button
                    @click="updateBedCount(unit)"
                    class="text-sm bg-[#CC1100] text-white px-4 py-2 rounded-lg shadow hover:bg-[#CC1100]"
                >
                  Update Beds
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Update Modal -->
      <div
          v-if="selectedUnit"
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
          <h3 class="text-xl font-semibold text-gray-800 mb-4">
            Update Bed Count for {{ selectedUnit.name }}
          </h3>

          <!-- Modal Content -->
          <form @submit.prevent="saveChanges">
            <div class="space-y-4">
              <div>
                <label
                    class="block text-sm font-medium text-gray-700 mb-2"
                    for="totalBeds"
                >
                  Total Beds
                </label>
                <input
                    id="totalBeds"
                    v-model.number="form.totalBeds"
                    type="number"
                    class="w-full p-2 border rounded-lg"
                    required
                />
              </div>
              <div>
                <label
                    class="block text-sm font-medium text-gray-700 mb-2"
                    for="availableBeds"
                >
                  Available Beds
                </label>
                <input
                    id="availableBeds"
                    v-model.number="form.availableBeds"
                    type="number"
                    class="w-full p-2 border rounded-lg"
                    required
                />
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="mt-6 flex justify-end">
              <button
                  type="submit"
                  class="bg-[#CC1100] text-white px-4 py-2 rounded-lg shadow hover:bg-[#CC1100]"
              >
                Save
              </button>
              <button
                  type="button"
                  @click="closeModal"
                  class="ml-2 bg-gray-400 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

// Hospital Name
const hospitalName = ref("Lagos University Teaching Hospital")

definePageMeta({
  layout: 'admin-dashboard',
  middleware: 'auth'
})

// State for loading
const loading = ref(true);

// Mock data for hospital units
const hospitalUnits = ref([
  {
    id: 1,
    name: "ICU",
    totalBeds: 20,
    availableBeds: 5,
    occupiedBeds: 15,
  },
  {
    id: 2,
    name: "ER",
    totalBeds: 30,
    availableBeds: 8,
    occupiedBeds: 22,
  },
  {
    id: 3,
    name: "Pediatrics",
    totalBeds: 25,
    availableBeds: 10,
    occupiedBeds: 15,
  },
  {
    id: 4,
    name: "General Ward",
    totalBeds: 40,
    availableBeds: 12,
    occupiedBeds: 28,
  },
]);

// State for selected unit and form data
const selectedUnit = ref(null);
const form = ref({
  totalBeds: 0,
  availableBeds: 0,
});

// Simulate data loading
onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 2000); // Simulate a delay
});

// Open modal to update bed count
const updateBedCount = (unit: any) => {
  selectedUnit.value = unit;
  form.value.totalBeds = unit.totalBeds;
  form.value.availableBeds = unit.availableBeds;
};

// Save changes to the selected unit
const saveChanges = () => {
  if (selectedUnit.value) {
    const { totalBeds, availableBeds } = form.value;
    selectedUnit.value.totalBeds = totalBeds;
    selectedUnit.value.availableBeds = availableBeds;
    selectedUnit.value.occupiedBeds = totalBeds - availableBeds;
    closeModal();
  }
};

// Close the modal
const closeModal = () => {
  selectedUnit.value = null;
  form.value.totalBeds = 0;
  form.value.availableBeds = 0;
};
</script>
