import { ref } from 'vue';
import { surgeApiFactory } from "@/apiFactory/surge.ts";
import { useUser } from "@/composables/auth/user"

// Get Surges by Hospital
export const useHospitalSurges = () => {
    const loading = ref(false);
    const error = ref(null);
    const surges = ref([]);
    const { user } = useUser()
  
    const fetchSurgesByHospital = async (status?: string[]) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await surgeApiFactory.getSurgesByHospital(user.value.id, status);
        surges.value = response.data;
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchSurgesByHospital()
    })
  
    return { fetchSurgesByHospital, surges, loading, error };
  };
  