<template>
  <div id="app">
    <NuxtLayout class="z-10">
      <NuxtPage class="z-10" />
    </NuxtLayout>
  </div>
</template>

<style lang="css">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  #app {
    @apply min-h-screen font-sans;
  }
</style>