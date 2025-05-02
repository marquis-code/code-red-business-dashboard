import { ref } from 'vue';
import { surgeApiFactory } from "@/apiFactory/surge.ts";

export const useCreateSurge = () => {
    const loading = ref(false);
    const error = ref(null);
    const surge = ref(null);
  
    const createSurge = async (data: {
      hospitalId: string;
      latitude: number;
      longitude: number;
      address?: string;
      emergencyType?: string;
      description?: string;
      metadata?: Record<string, any>;
    }) => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await surgeApiFactory.createSurge(data);
        surge.value = response.data;
        return response.data;
      } catch (err: any) {
        error.value = err.response?.data || err.message;
        throw error.value;
      } finally {
        loading.value = false;
      }
    };
  
    return { createSurge, surge, loading, error };
  };
  