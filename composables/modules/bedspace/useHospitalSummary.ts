// composables/useBedspace.ts
import { ref } from 'vue';
import { bedspaceApiFactory } from "@/apiFactory/bedspace.ts";

const jsonData = localStorage.getItem('user') as any
const parsed = JSON.parse(jsonData)

export const useHospitalSummary = () => {
    const loading = ref(false);
    const error = ref(null);
    const summary = ref(null);
  
    const fetchHospitalSummary = async (hospitalId?: string) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await bedspaceApiFactory.getHospitalSummary(parsed.id);
        console.log(response, 'herrrr')
        summary.value = response.data;
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };

    onMounted(() =>{
        fetchHospitalSummary()
    })
  
    return { fetchHospitalSummary, summary, loading, error };
  };