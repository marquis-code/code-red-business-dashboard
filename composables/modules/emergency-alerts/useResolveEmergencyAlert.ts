import { ref } from 'vue';
import { emergencyAlertsApiFactory } from "@/apiFactory/emergencyAlerts";

// Shared state
const loading = ref(false);
const error = ref(null);
const alert = ref(null);

// Resolve emergency alert
export const useResolveEmergencyAlert = () => {
    const resolveAlert = async (id: string, resolvedBy: string) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await emergencyAlertsApiFactory.resolveAlert(id, resolvedBy);
        alert.value = response.data;
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };
  
    return { resolveAlert, loading, error, alert };
  };