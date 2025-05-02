import { axiosInstance } from './axios.config';

export const emergencyAlertsApiFactory = {
  // Create a new emergency alert
  create(data: any) {
    return axiosInstance.post('/emergency-alerts', data);
  },

  // Get all emergency alerts with optional filters
  findAll(hospitalId?: string, status?: string) {
    const params = { hospitalId, status };
    // Remove undefined params
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
    return axiosInstance.get('/emergency-alerts', { params });
  },

  // Get an emergency alert by ID
  findOne(id: string) {
    return axiosInstance.get(`/emergency-alerts/${id}`);
  },

  // Update an emergency alert
  update(id: string, data: any) {
    return axiosInstance.patch(`/emergency-alerts/${id}`, data);
  },

  // Delete an emergency alert
  remove(id: string) {
    return axiosInstance.delete(`/emergency-alerts/${id}`);
  },

  // Resolve an emergency alert
  resolveAlert(id: string, resolvedBy: string) {
    return axiosInstance.put(`/emergency-alerts/${id}/resolve`, null, { 
      params: { resolvedBy } 
    });
  },

  // Get count of active alerts for a hospital
  getActiveAlertCount(hospitalId: string) {
    return axiosInstance.get(`/emergency-alerts/count/${hospitalId}`);
  },

  // Get alerts grouped by type for a hospital
  getAlertsByType(hospitalId: string, startDate?: Date, endDate?: Date) {
    const params: any = {};
    
    if (startDate) {
      params.startDate = startDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
    
    if (endDate) {
      params.endDate = endDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
    
    return axiosInstance.get(`/emergency-alerts/by-type/${hospitalId}`, { params });
  }
};