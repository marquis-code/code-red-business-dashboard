import { ref } from 'vue';
import { emergencyAlertsApiFactory } from "@/apiFactory/emergencyAlerts";

// Shared state
const loading = ref(false);
const error = ref(null);
const alertsByType = ref(null)


export const useFetchAlertsByType = () => {
    const fetchAlertsByType = async (hospitalId: string, startDate?: Date, endDate?: Date) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await emergencyAlertsApiFactory.getAlertsByType(hospitalId, startDate, endDate)as any
        alertsByType.value = response.data;
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };
  
    return { fetchAlertsByType, loading, error, alertsByType };
  };