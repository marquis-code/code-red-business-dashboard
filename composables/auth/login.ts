// composables/useOrganizations.ts
import { authApiFactory } from "@/apiFactory/auth";
import { useCustomToast } from '@/composables/core/useCustomToast'
import { useUser } from '@/composables/auth/user'
import Swal from "sweetalert2";

const loginPayload = ref({
  username: "",
  password: "",
});
export const useLogin = () => {
  const { createUser } = useUser()
  const { showToast } = useCustomToast();
  const loading = ref(false);
  const handleLogin = async () => {
    loading.value = true;
    const payloadObj = {
      usernameOrEmail: loginPayload.value.username,
      password: loginPayload.value.password
    }

    const response = await authApiFactory.login(payloadObj) as any
    console.log(response.data)
    if(response.type !== 'ERROR'){
      createUser(response.data)
      showToast({
        title: "Success",
        message: "Welcome back!",
        toastType: "success",
        duration: 3000
      });
      useRouter().push(`/dashboard`);
    } else {
      showToast({
        title: "Error",
        message: response?.data?.message,
        toastType: "error",
        duration: 3000
      });
    }
    loading.value = false;
  };

  const isFormEmpty = computed(() => {
    return !!(loginPayload.value.username && loginPayload.value.password);
  });

  return {
    handleLogin,
    loginPayload,
    loading,
    isFormEmpty
  };
};
