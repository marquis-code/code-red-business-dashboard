// composables/useBedspace.ts
import { ref } from 'vue';
import { bedspaceApiFactory } from "@/apiFactory/bedspace.ts";

export const useBedspaceDetails = () => {
    const loading = ref(false);
    const error = ref(null);
    const bedspace = ref(null);
  
    const fetchBedspace = async (id: string) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await bedspaceApiFactory.findOne(id);
        bedspace.value = response.data;
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };
  
    return { fetchBedspace, bedspace, loading, error };
  };