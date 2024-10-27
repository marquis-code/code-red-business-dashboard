<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

// Simulate real-time data for different time ranges
const generateRandomPatientData = (range: string) => {
    const data = [];
    let dataPoints = 24; // Default 24 data points for the current day
    if (range === 'week') dataPoints = 7;
    if (range === 'month') dataPoints = 30;
    if (range === 'year') dataPoints = 12; // One data point per month for a year
    
    for (let i = 0; i < dataPoints; i++) {
        data.push(Math.floor(Math.random() * 100));  // Random patient count
    }
    return data;
};

// Date range and filter options
const selectedRange = ref('day'); // Default to 'day'
const startDate = ref(new Date());
const endDate = ref(new Date());

const chartOptions = ref({
    chart: {
        id: "waiting-time-chart",
        type: "area", // Keep as area chart
        animations: {
            enabled: true,
            easing: 'linear',
            dynamicAnimation: {
                speed: 1000 // Real-time update every second
            }
        },
        toolbar: { show: false },
    },
    plotOptions: {
        area: {
            fillOpacity: 0.5,
        }
    },
    dataLabels: {
        enabled: false,
    },
    colors: ["#3b766f", "#f0c669"],
    xaxis: {
        categories: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`), // Time across 24 hours
        labels: {
            style: {
                fontSize: '12px',
                fontWeight: 500
            }
        },
        tickAmount: 24
    },
    yaxis: {
        title: {
            text: 'Patient Count',
            style: {
                fontSize: '14px',
                fontWeight: 600
            }
        },
        labels: {
            formatter: (value) => value.toFixed(0),
            style: {
                fontSize: '14px',
                fontWeight: 500
            }
        },
        min: 0,
        max: 100, // Adjust max value based on patient count
    },
    tooltip: {
        theme: "light",
    },
    legend: {
        position: 'top',
        horizontalAlign: 'center',
        labels: {
            colors: ['#3b766f', '#f0c669'],
            useSeriesColors: true
        }
    },
    grid: {
        show: true,
        borderColor: '#e0e0e0',
    }
});

// Initial series data
const series = ref([
    {
        name: "Waiting Time",
        data: generateRandomPatientData('day'), // Default to daily data
    }
]);

// Handle date range picker change
const onDateChange = (rangeType: string) => {
    selectedRange.value = rangeType;
    const data = generateRandomPatientData(rangeType); // Simulate data for the range type
    updateChartData(data);
};

const updateChartData = (data: number[]) => {
    // Update the chart with new data
    series.value = [
        {
            name: "Waiting Time",
            data: data
        }
    ];
};

// Real-time data update (based on selected date range)
onMounted(() => {
    setInterval(() => {
        // Generate new data every second for the selected range
        const data = generateRandomPatientData(selectedRange.value);
        updateChartData(data);
    }, 1000);  // Update every 1 second
});
</script>

<template>
  <div class="">
<section class="flex justify-between items-center">
    <p class="font-medium pl-8">Patients Waiting Time</p>
    
    <!-- Date range filter -->
    <div class="filters pl-8 mb-4 w-1/2 flex justify-end items-end">
      <select class="rounded-lg outline-none border-[0.5px] border-gray-600" v-model="selectedRange" @change="onDateChange(selectedRange)">
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>
      
      <Datepicker v-model="startDate" />
      <Datepicker v-model="endDate" />
    </div>
</section>

    <apexchart type="area" height="400" :options="chartOptions" :series="series" />
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}
</style>
