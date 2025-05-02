// composables/useBedspace.ts
import { ref } from 'vue';
import { bedspaceApiFactory } from "@/apiFactory/bedspace.ts";

export const useDeleteBedspace = () => {
    const loading = ref(false);
    const error = ref(null);
  
    const deleteBedspace = async (id: string) => {
      loading.value = true;
      error.value = null;
      
      try {
        await bedspaceApiFactory.remove(id);
        return true;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };
  
    return { deleteBedspace, loading, error };
  };