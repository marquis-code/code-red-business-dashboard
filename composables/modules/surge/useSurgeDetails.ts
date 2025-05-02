import { ref } from 'vue';
import { surgeApiFactory } from "@/apiFactory/surge.ts";

export const useSurgeDetails = () => {
    const loading = ref(false);
    const error = ref(null);
    const surge = ref(null);
  
    const fetchSurgeById = async (id: string) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await surgeApiFactory.getSurgeById(id);
        surge.value = response.data;
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };
  
    return { fetchSurgeById, surge, loading, error };
  };