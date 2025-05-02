// composables/useBedspace.ts
import { ref } from 'vue';
import { bedspaceApiFactory } from "@/apiFactory/bedspace.ts";

const jsonData = localStorage.getItem('user') as any
const parsed = JSON.parse(jsonData)

export const useBedspaces = () => {
    const loading = ref(false);
    const error = ref(null);
    const bedspaces = ref([]);
  
    const fetchBedspaces = async (hospitalId?: string) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await bedspaceApiFactory.findAll(parsed.id);
        bedspaces.value = response.data;
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
        fetchBedspaces()
    })
  
    return { fetchBedspaces, bedspaces, loading, error };
  };