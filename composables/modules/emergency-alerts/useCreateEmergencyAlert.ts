import { ref } from 'vue';
import { emergencyAlertsApiFactory } from "@/apiFactory/emergencyAlerts";

// Shared state
const loading = ref(false);
const error = ref(null);
const alert = ref(null);
const alerts = ref([]);
const activeAlertCount = ref(0);
const alertsByType = ref(null);

// State accessor composables
export const useEmergencyAlertsLoading = () => loading;
export const useEmergencyAlertsError = () => error;
export const useEmergencyAlert = () => alert;
export const useEmergencyAlerts = () => alerts;
export const useActiveAlertCount = () => activeAlertCount;
export const useAlertsByType = () => alertsByType;

// Create emergency alert
export const useCreateEmergencyAlert = () => {
  const createAlert = async (alertData: any) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await emergencyAlertsApiFactory.create(alertData);
      alert.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data || err.message;
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  return { createAlert, loading, error, alert };
};