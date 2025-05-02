// composables/useBedspace.ts
import { ref } from 'vue';
import { bedspaceApiFactory } from "@/apiFactory/bedspace.ts";

const jsonData = localStorage.getItem('user') as any
const parsed = JSON.parse(jsonData)

export const useUpdateBedspace = () => {
    const loading = ref(false);
    const error = ref(null);
  
    const updateBedspace = async (id: string, data: any) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await bedspaceApiFactory.update(parsed.id, data);
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };
  
    return { updateBedspace, loading, error };
  };
  