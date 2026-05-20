import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          "http://localhost:8000/api/auth/token/refresh/",
          {
            refresh: refreshToken,
          }
        );

        const newAccessToken = res.data.access;
        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;


export const getPatients = () => api.get("patients/");
export const getDoctors = () => api.get("doctors/");
export const getAppointments = () => api.get("appointments/");
export const getAppointmentById = (id) => api.get(`appointments/${id}/`);
export const createAppointment = (data) => api.post("appointments/", data);
export const updateAppointment = (id, data) => api.patch(`appointments/${id}/`, data);
export const deleteAppointment = (id) => api.delete(`appointments/${id}/`);

export const confirmAppointment = (id) => api.post(`appointments/${id}/confirm/`);
export const cancelAppointment = (id) => api.post(`appointments/${id}/cancel/`);
export const markNoShow = (id) => api.post(`appointments/${id}/mark_no_show/`);

export const getVisitRecords = () => api.get("visit-records/");
export const getDocuments = () => api.get("documents/");
export const getDoctorSchedules = () => api.get("doctor-schedules/");