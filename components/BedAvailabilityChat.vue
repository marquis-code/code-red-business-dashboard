<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Simulated bed data for different wards and segments (e.g., ICU, ER, General Ward)
const generateBedData = () => {
    return [
        { name: 'ICU', occupied: Math.floor(Math.random() * 5), available: Math.floor(Math.random() * 10) },
        { name: 'ER', occupied: Math.floor(Math.random() * 5), available: Math.floor(Math.random() * 10) },
        { name: 'General Ward', occupied: Math.floor(Math.random() * 5), available: Math.floor(Math.random() * 10) },
        { name: 'Surgical Ward', occupied: Math.floor(Math.random() * 5), available: Math.floor(Math.random() * 10) },
        { name: 'Maternity', occupied: Math.floor(Math.random() * 5), available: Math.floor(Math.random() * 10) }
    ];
};

// Initial bed data
const wardData = ref(generateBedData());

// Chart options for the stacked bar chart
const chartOptions = ref({
    chart: {
        id: "bed-availability-chart",
        type: "bar",
        stacked: true,  // Stacked bar chart
        toolbar: { show: false },
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
        },
    },
    plotOptions: {
        bar: {
            horizontal: true, // Horizontal bar chart
            borderRadius: 4,
            barHeight: '70%',
        },
    },
    colors: ['#1E90FF', '#90EE90'], // Blue for occupied, green for available
    xaxis: {
        categories: wardData.value.map(ward => ward.name),  // Ward names as x-axis labels
        labels: {
            style: {
                fontSize: '14px',
                fontWeight: 500
            }
        },
    },
    yaxis: {
        title: {
            text: 'Bed Availability',
            style: {
                fontSize: '14px',
                fontWeight: 600
            }
        },
        labels: {
            formatter: (value) => {
                if (typeof value === 'number') {
                    return value.toFixed(0);  // Ensure the value is a number before calling toFixed
                }
                return value;  // Return the value as-is if it's not a number
            },
            style: {
                fontSize: '14px',
                fontWeight: 500
            }
        },
        min: 0,
        max: 15,  // Maximum value for availability and occupancy
    },
    tooltip: {
        theme: "light",
        y: {
            formatter: (val: number) => {
                if (typeof val === 'number') {
                    return `${val.toFixed(0)} beds`;  // Ensure the value is a number before calling toFixed
                }
                return `${val} beds`;
            }
        }
    },
    grid: {
        show: true,
        borderColor: '#e0e0e0',
    },
    legend: {
        position: 'top',
        horizontalAlign: 'center',
    }
});

// Series data for occupied and available beds
const series = ref([
    {
        name: "Occupied Beds",
        data: wardData.value.map(ward => ward.occupied)  // Occupied bed data
    },
    {
        name: "Available Beds",
        data: wardData.value.map(ward => ward.available)  // Available bed data
    }
]);

// Real-time data update simulation
onMounted(() => {
    setInterval(() => {
        wardData.value = generateBedData();  // Update bed data randomly
        series.value = [
            {
                name: "Occupied Beds",
                data: wardData.value.map(ward => ward.occupied)
            },
            {
                name: "Available Beds",
                data: wardData.value.map(ward => ward.available)
            }
        ];
    }, 5000);  // Update every 5 seconds
});
</script>

<template>
  <div class="bg-white rounded-2xl shadow-md p-6">
    <p class="font-medium  pl-8 bg-white">Bed Availability in Wards</p>
    <apexchart type="bar" height="400" :options="chartOptions" :series="series" />
  </div>
</template>

<style scoped>
/* Customize your styles here if needed */
</style>
