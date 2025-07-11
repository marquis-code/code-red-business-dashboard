import { axiosInstance } from './axios.config';

export const surgeApiFactory = {
  // Create a new surge
  createSurge(data: {
    hospitalId: string;
    latitude: number;
    longitude: number;
    address?: string;
    emergencyType?: string;
    description?: string;
    metadata?: Record<string, any>;
  }) {
    return axiosInstance.post('/surges', data);
  },

  // Update surge status
  updateSurgeStatus(id: string, data: { status: string; metadata?: Record<string, any> }) {
    return axiosInstance.patch(`/surges/${id}/status`, data);
  },

  // Get surges by hospital
  getSurgesByHospital(hospitalId: string, status?: string[]) {
    const params: { status?: string } = {};
    if (status && status.length > 0) {
      params.status = status.join(',');
    }
    return axiosInstance.get(`/surges/hospital/${hospitalId}`, { params });
  },

  // Get surges in region
  getSurgesInRegion(latitude: number, longitude: number, radius: number, status?: string[]) {
    const params: {
      lat: number;
      lng: number;
      radius: number;
      status?: string;
    } = {
      lat: latitude,
      lng: longitude,
      radius: radius || 10,
    };
    
    if (status && status.length > 0) {
      params.status = status.join(',');
    }
    
    return axiosInstance.get('/surges/region', { params });
  },

  // Get surge by ID
  getSurgeById(id: string) {
    return axiosInstance.get(`/surges/${id}`);
  }
};