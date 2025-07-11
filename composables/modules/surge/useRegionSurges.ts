import { ref } from 'vue';
import { surgeApiFactory } from "@/apiFactory/surge.ts";

export const useRegionSurges = () => {
    const loading = ref(false);
    const error = ref(null);
    const surges = ref([]);
  
    const fetchSurgesInRegion = async (
      latitude: number,
      longitude: number,
      radius: number,
      status?: string[]
    ) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await surgeApiFactory.getSurgesInRegion(
          latitude,
          longitude,
          radius,
          status
        );
        console.log(response.data, 'herllp')
        surges.value = response.data;
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };
  
    return { fetchSurgesInRegion, surges, loading, error };
  };
  