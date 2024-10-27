// composables/useOrganizations.ts
import { authApiFactory } from "@/apiFactory/auth";

export const useLogin = () => {
  const loading = ref(false);
  const refreshPayload = ref({
    refreshToken: ""
  });

  const handleRefresh = async () => {
    loading.value = true;
    try {
      const response = await authApiFactory.refresh(refreshPayload);
      return response.data;
    } catch (error) {
      return error
    } finally {
      loading.value = false;
    }
  };

  return { handleRefresh, refreshPayload, loading };
};
