// Get all emergency alerts
import { ref } from 'vue';
import { emergencyAlertsApiFactory } from "@/apiFactory/emergencyAlerts";

// Shared state
const loading = ref(false);
const error = ref(null);
const alert = ref(null);
const alerts = ref([]);
const activeAlertCount = ref(0);
const alertsByType = ref(null);

const jsonData = localStorage.getItem('user') as any
const parsed = JSON.parse(jsonData)

export const useFetchEmergencyAlerts = () => {
    const fetchAlerts = async (hospitalId?: string, status?: string) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await emergencyAlertsApiFactory.findAll(hospitalId, status);
        alerts.value = response.data;
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };

    onMounted(() =>{
        fetchAlerts(parsed.id)
    })
  
    return { fetchAlerts, loading, error, alerts };
  };