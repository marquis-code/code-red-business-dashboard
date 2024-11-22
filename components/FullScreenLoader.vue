<template>
    <div
      v-if="visible"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50"
    >
      <div class="relative">
        <!-- Spinner -->
        <div
          class="w-24 h-24 rounded-full border-4 border-t-[#E11D48] border-white animate-spin"
        ></div>
  
        <!-- Logo at center of spinner -->
        <img
          :src="logoImage"
          alt="Loader Logo"
          class="absolute inset-0 p-2 m-auto"
        />
      </div>
      <!-- Text below the loader -->
      <p
        v-if="text"
        class="absolute bottom-16 text-white text-center text-sm sm:text-base mt-6"
      >
        {{ text }}
      </p>
    </div>
  </template>
  
  <script lang="ts" setup>
  import logoImage from '@/assets/img/logo-white.png'
  defineProps({
    visible: {
      type: Boolean,
      default: false, // Controls whether the loader is visible
    },
    text: {
      type: String,
      default: 'Authenticating...', // Text to display below the spinner
    },
    logo: {
      type: String,
      default: logoImage, // Default logo (replace with your logo path)
    },
  });
  </script>
  
  <style scoped>
  /* No additional styles are required; Tailwind CSS handles the layout and animation. */
  </style>
