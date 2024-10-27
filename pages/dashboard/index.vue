<template>
    <main>
    <div class="lg:flex lg:p-6 space-y-4 lg:space-y-0 lg:space-x-5 p-3">
      <RealTimeStat />  
      <EmbededMap />
    </div>
   <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:p-6 p-4">
      <BedSpaceUtilization  />
      <PatientAdmissionTrends />
      <BedOccupancyRates />
      <BedTurnoverRate  />
   </section>
  </main>
</template>

<script setup lang="ts">
 definePageMeta({
    layout: 'admin-dashboard'
 })
</script>
