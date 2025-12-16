import { ref } from 'vue';
import { staffApiFactory } from "@/apiFactory/staff";

// Shared state
const loading = ref(false);
const error = ref(null);
const staff = ref(null);
const staffList = ref([]);
const staffSummary = ref(null);

export const useStaffLoading = () => loading;
export const useStaffError = () => error;
export const useStaffData = () => staff;
export const useStaffList = () => staffList;
export const useStaffSummary = () => staffSummary;

const jsonData = localStorage.getItem('user') as any
const parsed = JSON.parse(jsonData)

export const useFetchStaffList = () => {
    const fetchStaffList = async (hospitalId?: string, department?: string, availability?: string) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await staffApiFactory.findAll(hospitalId, department, availability);
        console.log(response, 'list ooo')
        staffList.value = response.data;
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };

    onMounted(() =>{
      fetchStaffList(parsed.id)
    })
  
    return { fetchStaffList, loading, error, staffList };
  };
  