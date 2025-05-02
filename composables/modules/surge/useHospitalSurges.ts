import { ref } from 'vue';
import { surgeApiFactory } from "@/apiFactory/surge.ts";

// Get Surges by Hospital
export const useHospitalSurges = () => {
    const loading = ref(false);
    const error = ref(null);
    const surges = ref([]);
  
    const fetchSurgesByHospital = async (hospitalId: string, status?: string[]) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await surgeApiFactory.getSurgesByHospital(hospitalId, status);
        surges.value = response.data;
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };
  
    return { fetchSurgesByHospital, surges, loading, error };
  };
  