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

export const useFetchStaffSummary = () => {
    const fetchStaffSummary = async (hospitalId: string) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await staffApiFactory.getStaffSummary(hospitalId);
        staffSummary.value = response.data;
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };
  
    return { fetchStaffSummary, loading, error, staffSummary };
  };
  