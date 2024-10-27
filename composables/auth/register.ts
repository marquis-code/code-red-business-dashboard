import { authApiFactory } from "@/apiFactory/auth";

export const useRegister = () => {
  const loading = ref(false);
  const registerPayload = ref({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleRegister = async () => {
    loading.value = true;
    try {
      const payload = {
        firstName: registerPayload.value.firstName,
        lastName: registerPayload.value.lastName,
        email: registerPayload.value.email,
        password: registerPayload.value.password,
      };

      const response = await authApiFactory.register(payload);
      useNuxtApp().$toast.success("Account was successfully created.", {
        autoClose: 5000,
        dangerouslyHTMLString: true,
      });
      useRouter().push("/login");
    } catch (error) {
      useNuxtApp().$toast.error(error.message, {
        autoClose: 5000,
        dangerouslyHTMLString: true,
      });
      // return error;
    } finally {
      loading.value = false;
    }
  };

  const isFormEmpty = computed(() => {
    return !!(
      registerPayload.value.firstName &&
      registerPayload.value.lastName &&
      registerPayload.value.email &&
      registerPayload.value.password
    );
  });

  return { registerPayload, handleRegister, loading, isFormEmpty };
};
