import { useUser } from "@/composables/auth/user";
export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn } = useUser();
  console.log(isLoggedIn.value, 'loged in status')
  // if (!isLoggedIn.value && to.path !== "/login") {
  //   return navigateTo("/");
  // }
});
