// composables/useBedspace.ts
import { ref } from 'vue';
import { bedspaceApiFactory } from "@/apiFactory/bedspace.ts";

// Create Bedspace
export const useCreateBedspace = () => {
  const loading = ref(false);
  const error = ref(null);
  const bedspaceData = ref({});

  const createBedspace = async (data: any) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await bedspaceApiFactory.create(data);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data || err.message;
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  return { createBedspace, bedspaceData, loading, error };
};
