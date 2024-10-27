<template>
  <main class="w-full">
    <div
      class="z-0 flex h-screen w-full items-center justify-center bg-[#1C1B1F] px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
      <div class="flex h-full w-full max-w-xl items-center justify-center lg:max-w-2xl">
        <form @submit.prevent="handleLogin" class="mt-8 w-full space-y-10">
          <div class="space-y-4">
            <h1 class="text-2xl font-semibold text-white">Login with CodeRed </h1>
            <p class="text-sm text-white">Enter your credentials to login</p>
          </div>
          <div class="col-span-6 w-full">
            <label for="username" class="block text-sm font-medium text-white">
              username
            </label>

            <input id="username" v-model="loginPayload.username" type="text" name="username"
              placeholder="Enter Your username..."
              class="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-3.5 text-sm text-gray-700 shadow-sm outline-none" />
          </div>

          <div class="relative col-span-6 w-full">
            <label for="Password" class="block text-sm font-medium text-white">
              Password
            </label>

            <input id="Password" v-model="loginPayload.password" :type="showPassword ? 'text' : 'password'"
              name="password" placeholder="Enter Your Password..."
              class="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-3.5 text-sm text-gray-700 shadow-sm outline-none" />
            <img v-if="showPassword" src="@/assets/icons/eye-open.svg" alt=""
              class="absolute right-4 top-10 h-6 w-6 cursor-pointer" @click="showPassword = !showPassword" />
            <img v-if="!showPassword" src="@/assets/icons/eye-close.svg" alt=""
              class="absolute right-4 top-10 h-6 w-6 cursor-pointer" @click="showPassword = !showPassword" />
            <div class="flex items-end justify-end pt-3">
              <button class="text-sm font-medium text-gray-600" @click="setActiveTab">
                Forgot Password?
              </button>
            </div>
          </div>
          <div class="w-full pt-10">
            <button :disabled="!isFormEmpty || loading" type="submit"
              class="flex w-full shrink-0 items-center justify-center gap-x-3 rounded-md border border-white bg-[#1C1B1F] px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-25">
              <img src="@/assets/icons/arrow-right-white.svg" alt="" />
              {{ loading ? "processing..." : "Login" }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <CoreLoadingSpinner :is-loading="loading" />
  </main>
</template>

<script setup lang="ts">
import { useLogin } from '@/composables/auth/login'
const { handleLogin, loginPayload, loading, isLoggedIn } = useLogin()
const emit = defineEmits<{
  (event: 'processLogin'): void,
  (event: 'forgotPassword', value: boolean): void
}>()

const processing = ref(false)
const showPassword = ref(false)
const form = ref({
  username: "",
  password: "",
})

const isFormEmpty = (() => {
  return !!(form.value.username && form.value.password);
})

const setActiveTab = () => {
  emit("forgotPassword");
}

watch(processing, (val) => {
  emit("processLogin", val);
})
</script>
