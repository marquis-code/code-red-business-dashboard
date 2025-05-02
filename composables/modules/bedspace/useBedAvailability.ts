// composables/useBedspace.ts
import { ref } from 'vue';
import { bedspaceApiFactory } from "@/apiFactory/bedspace.ts";

export const useUpdateBedAvailability = () => {
    const loading = ref(false);
    const error = ref(null);
  
    const updateAvailability = async (id: string, action: 'admit' | 'discharge') => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await bedspaceApiFactory.updateBedAvailability(id, action);
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };
  
    return { updateAvailability, loading, error };
  };