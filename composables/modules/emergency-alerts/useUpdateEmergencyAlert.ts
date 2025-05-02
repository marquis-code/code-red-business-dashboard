import { ref } from 'vue';
import { emergencyAlertsApiFactory } from "@/apiFactory/emergencyAlerts";

// Shared state
const loading = ref(false);
const error = ref(null);
const alert = ref(null);

export const useUpdateEmergencyAlert = () => {
    const updateAlert = async (id: string, alertData: any) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await emergencyAlertsApiFactory.update(id, alertData);
        alert.value = response.data;
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };
  
    return { updateAlert, loading, error, alert };
  };
  