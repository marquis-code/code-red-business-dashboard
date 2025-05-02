
import { ref } from 'vue';
import { emergencyAlertsApiFactory } from "@/apiFactory/emergencyAlerts";

// Shared state
const loading = ref(false);
const error = ref(null);
const alert = ref(null);

export const useRemoveEmergencyAlert = () => {
    const removeAlert = async (id: string) => {
      loading.value = true;
      error.value = null;
      
      try {
        await emergencyAlertsApiFactory.remove(id);
        alert.value = null;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };
  
    return { removeAlert, loading, error };
  };
  