import axios, { AxiosResponse } from "axios";
import { useCustomToast } from '@/composables/core/useCustomToast'
const { showToast } = useCustomToast();

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL+'/api/v1'
});

export interface CustomAxiosResponse extends AxiosResponse {
  value?: any;
  type?: string;
}

axiosInstance.interceptors.request.use((config: any) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response: CustomAxiosResponse) => {
    return response;
  },
  (err: any) => {
    if (typeof err.response === "undefined") {
      showToast({
        title: "Error",
        message: "kindly check your network connection",
        toastType: "error",
        duration: 3000
      });
      return {
        type: "ERROR",
        ...err.response,
      };
    }
    if (err.response.status === 401) {
      console.log(err.response.data.error)
      showToast({
        title: "Error",
        message: err?.response?.data?.message || err?.response?.data?.error || "An error occured",
        toastType: "error",
        duration: 3000
      });
      return {
        type: "ERROR",
        ...err.response,
      };
    } else if (statusCodeStartsWith(err.response.status, 4)) {
      if (err.response.data.message) {
        showToast({
          title: "Error",
          message: err?.response?.data?.message || err?.response?.data?.error || "An error occured",
          toastType: "error",
          duration: 3000
        });
      }
      return {
        type: "ERROR",
        ...err.response,
      };
    } else if (err.response.status === 500) {
      showToast({
        title: "Error",
        message: err?.response?.data?.message || err?.response?.data?.error || "An error occured",
        toastType: "error",
        duration: 3000
      });
      return {
        type: "ERROR",
        ...err.response,
      };
    } else if (err.response.status === 409) {
      showToast({
        title: "Error",
        message: err?.response?.data?.message || err?.response?.data?.error || "An error occured",
        toastType: "error",
        duration: 3000
      });
    }
  }
);

// axiosInstance.interceptors.response.use(
//   (response: any) => {
//     return response;
//   },
//   (error) => {
//     if (typeof error.response === "undefined") {
//       useNuxtApp().$toast.error("kindly check your network connection", {
//         autoClose: 5000,
//         dangerouslyHTMLString: true,
//       });
//     } else {
//       useNuxtApp().$toast.error(error.response.data.message, {
//         autoClose: 5000,
//         dangerouslyHTMLString: true,
//       });
//     }
//   }
// );

const statusCodeStartsWith = (
  statusCode: number,
  startNumber: number
): boolean => {
  const statusCodeString = statusCode.toString();
  const startNumberString = startNumber.toString();

  return statusCodeString.startsWith(startNumberString);
};