import { axiosInstance } from './axios.config'

export const dashboardApiFactory = {
  $_fetch_bedspace_utilization() {
    return axiosInstance.get('/corporate/bed-space-utilization');
  },
  $_fetch_occupancy_rate() {
    return axiosInstance.get('/corporate/occupancy-rates');
  },
  $_fetch_admission_trends() {
    return axiosInstance.get('/corporate/admission-trends');
  },
  $_fetch_turnover_rate() {
    return axiosInstance.get('/corporate/turnover-rates');
  }
};
