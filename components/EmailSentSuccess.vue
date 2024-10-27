<template>
  <main
    class="flex h-screen w-full items-center justify-center bg-[#0BA9B9] px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
    <div class="flex w-full max-w-xl items-center justify-center lg:max-w-2xl">
      <form class="mt-8 w-full space-y-6">
        <div class="space-y-3">
          <h1 class="text-4xl font-semibold text-white">Email Sent</h1>
          <p class="max-w-sm text-white">
            We sent you a magic link to reset your password, please go to your email and proceed.
          </p>
        </div>
        <div class="w-full space-y-4 pt-10">
          <button
            class="flex w-full shrink-0 items-center justify-center gap-x-3 rounded-md border border-white bg-white px-12 py-4 text-sm font-medium text-black transition"
            @click="navigateToLogin">
            Finish
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (event: 'redirectLogin'): void
}>()

const navigateToLogin = () => {
  emit('redirectLogin')
}
</script>
