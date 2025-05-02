import { axiosInstance } from './axios.config';


export const bedspaceApiFactory = {
  // Create a new bedspace
  create(data: any) {
    return axiosInstance.post('/bedspaces', data);
  },

  // Get all bedspaces with optional filter by hospital
  findAll(hospitalId?: string) {
    const params = hospitalId ? { hospitalId } : {};
    return axiosInstance.get('/bedspaces', { params });
  },

  // Get a specific bedspace by ID
  findOne(id: string) {
    return axiosInstance.get(`/bedspaces/${id}`);
  },

  // Update a bedspace
  update(id: string, data: any) {
    return axiosInstance.put(`/bedspaces/${id}`, data);
  },

  // Delete a bedspace
  remove(id: string) {
    return axiosInstance.delete(`/bedspaces/${id}`);
  },

  // Get hospital summary
  getHospitalSummary(hospitalId: string) {
    return axiosInstance.get(`/bedspaces/hospital/${hospitalId}/summary`);
  },

  // Update bed availability (admit/discharge)
  updateBedAvailability(id: string, action: 'admit' | 'discharge') {
    // return axiosInstance.put(`/bedspaces/${id}/availability`, null, {
    //   params: { action }
    // });
    return axiosInstance.put(`/bedspaces/${id}/availability?action=${action}`);
  }
};