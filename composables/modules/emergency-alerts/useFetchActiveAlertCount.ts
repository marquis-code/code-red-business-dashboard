import { ref } from 'vue';
import { emergencyAlertsApiFactory } from "@/apiFactory/emergencyAlerts";

// Shared state
const loading = ref(false);
const error = ref(null);
const alerts = ref([]);
const activeAlertCount = ref(0);

export const useFetchActiveAlertCount = () => {
    const fetchActiveAlertCount = async (hospitalId: string) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await emergencyAlertsApiFactory.getActiveAlertCount(hospitalId);
        activeAlertCount.value = response.data.count;
        return response.data.count;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };
  
    return { fetchActiveAlertCount, loading, error, activeAlertCount };
  };