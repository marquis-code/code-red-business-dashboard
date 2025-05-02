import { ref } from 'vue';
import { surgeApiFactory } from "@/apiFactory/surge.ts";

// Update Surge Status
export const useUpdateSurgeStatus = () => {
    const loading = ref(false);
    const error = ref(null);
    const surge = ref(null);
  
    const updateStatus = async (
      id: string, 
      data: { status: string; metadata?: Record<string, any> }
    ) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await surgeApiFactory.updateSurgeStatus(id, data);
        surge.value = response.data;
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };
  
    return { updateStatus, surge, loading, error };
  };