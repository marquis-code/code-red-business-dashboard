<template>
    <main>
    <div class="lg:flex lg:p-6 space-y-4 lg:space-y-0 lg:space-x-5 p-3">
      <RealTimeStat />  
      <!-- <EmbededMap /> -->
    </div>
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:p-6 p-4">
        <template v-if="loading">
          <div
              v-for="i in 4"
              :key="i"
              class="bg-gray-200 animate-pulse rounded-lg h-60"
          ></div>
        </template>

        <template v-else>
          <BedSpaceUtilization />
          <PatientAdmissionTrends />
          <BedOccupancyRates />
          <BedTurnoverRate />
        </template>
      </section> 
    <!-- <EmbededMap /> -->
      <!-- <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:p-6 p-4">
        <template v-if="loading">
          <div
              v-for="i in 4"
              :key="i"
              class="bg-gray-200 animate-pulse rounded-lg h-60"
          ></div>
        </template>

        <template v-else>
          <BedSpaceUtilization />
          <PatientAdmissionTrends />
          <BedOccupancyRates />
          <BedTurnoverRate />
        </template>
      </section> -->
    </main>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";

definePageMeta({
    layout: 'admin-dashboard',
    middleware: 'auth'
 })

 const loading = ref(true);

 onMounted(() => {
   // Simulate loading time
   setTimeout(() => {
     loading.value = false;
   }, 2000); // Adjust time as necessary
 });
</script>
