<template>
    <div class="p-6 bg-white rounded-lg shadow-lg">
      <h2 class="text-lg font-bold mb-4 text-indigo-900">Real Time Operation Overview</h2>
      <div class="text-gray-500 mb-6">Key Data</div>
  
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <!-- Available beds -->
        <div class="flex flex-col items-center bg-red-100 p-6 rounded-lg shadow-md">
          <div class="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <!-- Bed icon -->
            <span class="text-white text-2xl">🛏️</span>
          </div>
          <h3 class="text-4xl font-bold text-red-700">18</h3>
          <p class="text-sm text-gray-600">Available beds</p>
          <p class="text-sm text-red-600 mt-2">+8% from yesterday</p>
        </div>
  
        <!-- Occupied beds -->
        <div class="flex flex-col items-center bg-yellow-100 p-6 rounded-lg shadow-md">
          <div class="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
            <!-- Bed icon -->
            <span class="text-white text-2xl">🛏️</span>
          </div>
          <h3 class="text-4xl font-bold text-yellow-600">42</h3>
          <p class="text-sm text-gray-600">Occupied beds</p>
          <p class="text-sm text-yellow-500 mt-2">+5% from yesterday</p>
        </div>
  
        <!-- Admissions -->
        <div class="flex flex-col items-center bg-green-100 p-6 rounded-lg shadow-md">
          <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <!-- Admissions icon -->
            <span class="text-white text-2xl">👤</span>
          </div>
          <h3 class="text-4xl font-bold text-green-600">55</h3>
          <p class="text-sm text-gray-600">Admissions</p>
          <p class="text-sm text-green-500 mt-2">+12% from yesterday</p>
        </div>
  
        <!-- Staffs on-ground -->
        <div class="flex flex-col items-center bg-blue-100 p-6 rounded-lg shadow-md">
          <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <!-- Staffs icon -->
            <span class="text-white text-2xl">👥</span>
          </div>
          <h3 class="text-4xl font-bold text-blue-600">10</h3>
          <p class="text-sm text-gray-600">Staffs on-ground</p>
          <p class="text-sm text-blue-500 mt-2">0.5% from yesterday</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  // No specific functionality here yet, purely UI.
  </script>
  
  <style scoped>
  /* Custom styles can be added if needed, but Tailwind should suffice */
  </style>
  