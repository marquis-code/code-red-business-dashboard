<template>
    <div class="bg-white p-6 rounded-2xl shadow-md space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-sm lg:text-lg text-[#05004E] font-semibold">Patient Admission Trends</h1>
        <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.723 11.4956H7.9258M7.9258 11.4956C7.9258 12.1868 7.66819 12.8496 7.21164 13.3383C6.75509 13.827 6.13587 14.1016 5.4902 14.1016C4.84454 14.1016 4.22532 13.827 3.76877 13.3383C3.31222 12.8496 3.05573 12.1868 3.05573 11.4956M7.9258 11.4956C7.9258 10.8045 7.66819 10.1416 7.21164 9.65293C6.75509 9.16422 6.13587 8.88966 5.4902 8.88966C4.84454 8.88966 4.22532 9.16422 3.76877 9.65293C3.31222 10.1416 3.05573 10.8045 3.05573 11.4956M3.05573 11.4956H1.06348M21.723 19.3936H15.304M15.304 19.3936C15.304 20.0849 15.0469 20.7485 14.5903 21.2373C14.1336 21.7261 13.5143 22.0007 12.8685 22.0007C12.2228 22.0007 11.6036 21.725 11.147 21.2363C10.6905 20.7476 10.434 20.0847 10.434 19.3936M15.304 19.3936C15.304 18.7023 15.0469 18.0399 14.5903 17.5511C14.1336 17.0622 13.5143 16.7876 12.8685 16.7876C12.2228 16.7876 11.6036 17.0622 11.147 17.5509C10.6905 18.0396 10.434 18.7024 10.434 19.3936M10.434 19.3936H1.06348M21.723 3.59766H18.2556M18.2556 3.59766C18.2556 3.93988 18.1915 4.27875 18.0691 4.59491C17.9468 4.91108 17.7675 5.19836 17.5414 5.44035C17.3154 5.68233 17.047 5.87429 16.7516 6.00525C16.4562 6.13621 16.1397 6.20362 15.82 6.20362C15.1743 6.20362 14.5551 5.92906 14.0985 5.44035C13.642 4.95164 13.3855 4.2888 13.3855 3.59766M18.2556 3.59766C18.2556 3.25544 18.1915 2.91657 18.0691 2.6004C17.9468 2.28423 17.7675 1.99695 17.5414 1.75497C17.3154 1.51298 17.047 1.32103 16.7516 1.19007C16.4562 1.0591 16.1397 0.991699 15.82 0.991699C15.1743 0.991699 14.5551 1.26625 14.0985 1.75497C13.642 2.24368 13.3855 2.90651 13.3855 3.59766M13.3855 3.59766H1.06348" stroke="black" stroke-opacity="0.8" stroke-width="1.19539" stroke-miterlimit="10" stroke-linecap="round"/>
          </svg>
          
      </div>
      <client-only>
        <div class="chart-wrapper md:w-full overflow-x-auto">
          <apexchart class="md:w-full overflow-x-auto" type="line" height="300" :options="chartOptions" :series="series"></apexchart>
        </div>
      </client-only>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  const chartOptions = ref({
    chart: { type: "line", toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 2 },
    markers: { size: 4 },
    colors: ['#EF4444'], // Tailwind Red
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: { style: { colors: '#6B7280' } },
    },
    grid: { borderColor: '#E5E7EB' },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.2 },
    },
    legend: { position: 'bottom', horizontalAlign: 'center' },
  });
  
  const series = ref([
    { name: 'Admissions', data: [100, 150, 200, 180, 160, 140, 170, 190, 180, 200, 220, 240] },
  ]);
  </script>
  
  <style scoped></style>
  