<!--<template>-->
<!--    <div class="flex items-center justify-center lg:w-4/12">-->
<!--      <div class="bg-white rounded-2xl shadow-md w-full p-6">-->
<!--        &lt;!&ndash; Title &ndash;&gt;-->
<!--        <h2 class="text-sm lg:text-lg text-[#05004E] font-semibold pb-4">-->
<!--          Surge Prediction and Response Map-->
<!--        </h2>-->
<!--        -->
<!--        &lt;!&ndash; Embedded Google Map &ndash;&gt;-->
<!--        <div class="overflow-hidden rounded-lg" style="padding-top: 56.25%; position: relative;">-->
<!--            <iframe-->
<!--            class="absolute top-0 left-0 w-full h-full"-->
<!--            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3171.789719604792!2d3.359100915316526!3d6.51631719526465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf4fba2998d8d%3A0x5c2f58f73693b7bc!2sLagos%20University%20Teaching%20Hospital%20(LUTH)!5e0!3m2!1sen!2sng!4v1698738492837!5m2!1sen!2sng"-->
<!--            width="600"-->
<!--            height="450"-->
<!--            style="border:0;"-->
<!--            allowfullscreen=""-->
<!--            loading="lazy"-->
<!--            referrerpolicy="no-referrer-when-downgrade"-->
<!--          ></iframe>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--  </template>-->
<!--  -->
<!--  <script setup lang="ts">-->
<!--  // No additional script needed-->
<!--  </script>-->
<!--  -->
<!--  <style scoped>-->
<!--  /* Additional styles can be added here */-->
<!--  </style>-->
<!-- -->

<template>
  <div class="flex items-center justify-center lg:w-4/12">
    <div class="bg-white rounded-2xl shadow-md w-full p-6">
      <!-- Conditional Rendering -->
      <template v-if="loading">
        <!-- Skeleton Card -->
        <div class="animate-pulse">
          <!-- Skeleton Title -->
          <div class="h-6 bg-gray-300 rounded mb-4 w-2/3"></div>
          <!-- Skeleton Map Placeholder -->
          <div class="bg-gray-200 rounded-lg w-full h-64"></div>
        </div>
      </template>

      <template v-else>
        <!-- Title -->
        <h2 class="text-sm lg:text-lg text-[#05004E] font-semibold pb-4">
          Surge Prediction and Response Map
        </h2>

        <!-- Embedded Google Map -->
        <div
            class="overflow-hidden rounded-lg"
            style="padding-top: 56.25%; position: relative;"
        >
          <iframe
              class="absolute top-0 left-0 w-full h-full"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3171.789719604792!2d3.359100915316526!3d6.51631719526465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf4fba2998d8d%3A0x5c2f58f73693b7bc!2sLagos%20University%20Teaching%20Hospital%20(LUTH)!5e0!3m2!1sen!2sng!4v1698738492837!5m2!1sen!2sng"
              width="600"
              height="450"
              style="border:0;"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const loading = ref(true);

onMounted(() => {
  // Simulate a loading delay (e.g., for data fetching)
  setTimeout(() => {
    loading.value = false;
  }, 2000); // Adjust duration as needed
});
</script>

<style scoped>
/* Add styles as necessary */
</style>
