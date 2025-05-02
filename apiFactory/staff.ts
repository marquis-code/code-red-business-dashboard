import { axiosInstance } from './axios.config';

export const staffApiFactory = {
  // Create a new staff member
  create(data: any) {
    return axiosInstance.post('/staff', data);
  },

  // Get all staff members with optional filters
  findAll(hospitalId?: string, department?: string, availability?: string) {
    const params = { hospitalId, department, availability };
    // Remove undefined params
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
    return axiosInstance.get('/staff', { params });
  },

  // Get a staff member by ID
  findOne(id: string) {
    return axiosInstance.get(`/staff/${id}`);
  },

  // Update a staff member
  update(id: string, data: any) {
    return axiosInstance.put(`/staff/${id}`, data);
  },

  // Delete a staff member
  remove(id: string) {
    return axiosInstance.delete(`/staff/${id}`);
  },

  // Update staff availability
  updateAvailability(id: string, availability: string) {
    return axiosInstance.put(`/staff/${id}/availability`, { availability });
  },

  // Get staff summary for a hospital
  getStaffSummary(hospitalId: string) {
    return axiosInstance.get(`/staff/hospital/${hospitalId}/summary`);
  }
};