<template>
  <transition name="fade">
    <div
      class="z-[999999999px]"
      v-if="toastVisible"
      :class="[
        'fixed top-4 right-4 rounded-lg shadow-lg flex items-center p-4 max-w-sm w-full',
        toastData.toastType === 'error' ? 'bg-red-50 border-l-4 border-red-400' : 'bg-green-50 border-l-4 border-green-400'
      ]"
    >
      <div :class="[toastData.toastType === 'error' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500', 'rounded-full p-2']">
        <svg v-if="toastData.toastType === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div class="ml-4">
        <p class="font-semibold text-gray-800">{{ toastData.title }}</p>
        <p class="text-sm text-gray-600">{{ toastData.message }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { inject } from 'vue';

const toastVisible = inject('toastVisible');
const toastData = inject('toastData');
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
