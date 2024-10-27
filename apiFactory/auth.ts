import { axiosInstance } from './axios.config'

export const authApiFactory = {
  login(data: any) {
    return axiosInstance.post('/auth/login', data);
  }
};
