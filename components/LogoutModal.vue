<template>
  <div>
    <!-- Logout Modal Overlay -->
    <div
        v-if="show"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
          class="bg-white w-11/12 max-w-sm rounded-lg shadow-lg p-6 relative"
      >
        <!-- Close Button -->
        <button
            @click="closeModal"
            class="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
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

        <!-- Modal Content -->
        <div class="text-center ">
          <h2 class="text-xl font-semibold text-gray-800">Logout</h2>
          <p class="text-gray-600 mt-2">Are you sure you want to logout?</p>

          <!-- Icons -->
          <div class="my-4 flex justify-center items-center py-6">
            <img src="@/assets/icons/cry.svg" alt="cry" class="h-10 w-10" />
          </div>

          <!-- Actions -->
          <div class="flex justify-between gap-x-4 mt-6 w-full">
            <button
                @click="closeModal"
                class="bg-gray-200 w-full text-gray-700 px-4 py-3 text-sm rounded-lg shadow hover:bg-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition"
            >
              Nah, Just Kidding
            </button>
            <button
                @click="logout"
                class="bg-red-500 w-full text-white px-4 py-3 text-sm rounded-lg shadow hover:bg-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { useCustomToast } from '@/composables/core/useCustomToast'
const { showToast } = useCustomToast();
import { ref } from "vue";

const props = defineProps({
  show: {
    type: Boolean
  }
})

const router = useRouter()

const emit = defineEmits(['close', 'open'])

// Function to close the modal
const closeModal = () => {
  emit('close')
};

// Function to handle logout
const logout = () => {
  closeModal(); // Close the modal
  // Simulate logout logic (e.g., clear tokens, redirect to login page)
  console.log("User logged out!");
  router.push('/')
  showToast({
    title: "Success",
    message: "Logout successful!",
    toastType: "success",
    duration: 3000
  });
};

// Simulate opening the modal (for demo purposes)
// onMounted(() => {
//   showLogoutModal.value = true;
// });
</script>

<style scoped>
/* Smooth transition effects */
button {
  transition: all 0.2s ease-in-out;
}

svg {
  transition: transform 0.2s ease-in-out;
}

button:hover svg {
  transform: scale(1.1);
}
</style>

