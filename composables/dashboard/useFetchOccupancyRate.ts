// composables/useOrganizations.ts
import { dashboardApiFactory } from "@/apiFactory/dashboard";
import { useCustomToast } from '@/composables/core/useCustomToast'

export const useFetchOccupancyRates = () => {
  const loading = ref(false);
  const dataObj = ref({})
  const { showToast } = useCustomToast();

  const getOccupancyRates = async () => {
    loading.value = true;
    const response = await dashboardApiFactory.$_fetch_occupancy_rate() as any
    console.log(response, 'res ponse here')
    if(response.type !== 'ERROR'){
        dataObj.value = response.data
    } else {
      showToast({
        title: "Error",
        message: response?.data?.message,
        toastType: "error",
        duration: 3000
      });
    }
    loading.value = false;
  };

  onMounted(() => {
    getOccupancyRates()
  })



  return {
    getOccupancyRates,
    loading,
    dataObj
  };
};
