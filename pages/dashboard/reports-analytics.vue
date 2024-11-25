<template>
  <div class="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
    <!-- Main Content -->
    <main class="flex-1 p-6">
      <!-- Reports & Analytics Section -->
      <div class="bg-white shadow-lg rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">Reports & Analytics</h2>

        <!-- Loader -->
        <div v-if="loading">
          <!-- Metrics Loader -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 animate-pulse">
            <div class="p-4 bg-gray-200 rounded-lg h-24"></div>
            <div class="p-4 bg-gray-200 rounded-lg h-24"></div>
            <div class="p-4 bg-gray-200 rounded-lg h-24"></div>
          </div>

          <!-- Chart Loader -->
          <div class="bg-gray-200 rounded-lg h-64 mb-6 animate-pulse"></div>

          <!-- Table Loader -->
          <div class="bg-gray-200 rounded-lg h-40 animate-pulse"></div>
        </div>

        <!-- Content -->
        <div v-else>
          <!-- Key Metrics -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="p-4 bg-blue-50 rounded-lg shadow hover:shadow-lg transition-shadow">
              <h3 class="text-lg font-semibold text-blue-800">Total Admissions</h3>
              <p class="text-3xl font-bold text-blue-600">{{ metrics.totalAdmissions }}</p>
              <p class="text-sm text-gray-500 mt-2">
                <span class="text-green-600 font-bold">+12%</span> from last month
              </p>
            </div>
            <div class="p-4 bg-green-50 rounded-lg shadow hover:shadow-lg transition-shadow">
              <h3 class="text-lg font-semibold text-green-800">Available Beds</h3>
              <p class="text-3xl font-bold text-green-600">{{ metrics.availableBeds }}</p>
              <p class="text-sm text-gray-500 mt-2">
                <span class="text-green-600 font-bold">+8%</span> from yesterday
              </p>
            </div>
            <div class="p-4 bg-red-50 rounded-lg shadow hover:shadow-lg transition-shadow">
              <h3 class="text-lg font-semibold text-red-800">Critical Alerts</h3>
              <p class="text-3xl font-bold text-red-600">{{ metrics.criticalAlerts }}</p>
              <p class="text-sm text-gray-500 mt-2">
                <span class="text-red-600 font-bold">+20%</span> from last week
              </p>
            </div>
          </div>

          <!-- Charts -->
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Admission Trends</h3>
            <div class="overflow-x-auto">
              <client-only>
                <apexchart
                    type="line"
                    height="300"
                    :options="chartOptions"
                    :series="chartSeries"
                ></apexchart>
              </client-only>
            </div>
          </div>

          <!-- Table for Recent Data -->
          <div class="mt-6 bg-white shadow-md rounded-lg">
            <h3 class="text-lg font-semibold text-gray-800 px-6 pt-6">Recent Reports</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full bg-white border border-gray-200 rounded-lg mt-4">
                <thead>
                <tr class="bg-gray-100 text-gray-800 border-b border-gray-200">
                  <th class="p-4 text-left text-sm font-bold">Date</th>
                  <th class="p-4 text-left text-sm font-bold">Department</th>
                  <th class="p-4 text-left text-sm font-bold">Admissions</th>
                  <th class="p-4 text-left text-sm font-bold">Available Beds</th>
                  <th class="p-4 text-left text-sm font-bold">Occupied Beds</th>
                </tr>
                </thead>
                <tbody>
                <tr
                    v-for="report in recentReports"
                    :key="report.id"
                    class="hover:bg-gray-50 border-b"
                >
                  <td class="p-4 text-gray-700 text-sm">{{ report.date }}</td>
                  <td class="p-4 text-gray-700 text-sm">{{ report.department }}</td>
                  <td class="p-4 text-gray-700 text-sm">{{ report.admissions }}</td>
                  <td class="p-4 text-gray-700 text-sm">{{ report.availableBeds }}</td>
                  <td class="p-4 text-gray-700 text-sm">{{ report.occupiedBeds }}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import "apexcharts";
const apexcharts = useNuxtApp().$apexcharts;

definePageMeta({
  layout: 'admin-dashboard',
  middleware: 'auth'
})
// Loading state
const loading = ref(true);

// Mock Data for Metrics
const metrics = ref({
  totalAdmissions: 540,
  availableBeds: 120,
  criticalAlerts: 15,
});

// Chart Options and Series
const chartOptions = ref({
  chart: {
    type: "line",
    toolbar: { show: false },
  },
  stroke: {
    curve: "smooth",
    width: 2,
  },
  markers: {
    size: 4,
  },
  colors: ["#2E93fA", "#66DA26"],
  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    labels: {
      style: { colors: "#6B7280" },
    },
  },
  grid: { borderColor: "#E5E7EB" },
  fill: {
    type: "gradient",
    gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.2 },
  },
  legend: { position: "bottom", horizontalAlign: "center" },
});

const chartSeries = ref([
  { name: "Admissions", data: [120, 150, 200, 250, 180, 220, 240, 210, 190, 230, 260, 300] },
  { name: "Available Beds", data: [80, 100, 120, 140, 110, 150, 170, 160, 130, 140, 180, 200] },
]);

// Recent Reports
const recentReports = ref([
  {
    id: 1,
    date: "2024-11-20",
    department: "ICU",
    admissions: 50,
    availableBeds: 5,
    occupiedBeds: 45,
  },
  {
    id: 2,
    date: "2024-11-19",
    department: "ER",
    admissions: 80,
    availableBeds: 10,
    occupiedBeds: 70,
  },
  {
    id: 3,
    date: "2024-11-18",
    department: "General Ward",
    admissions: 150,
    availableBeds: 20,
    occupiedBeds: 130,
  },
]);

// Simulate data loading
onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 2000); // Simulated delay
});
</script>

<style scoped>
/* Add additional styles if necessary */
</style>
