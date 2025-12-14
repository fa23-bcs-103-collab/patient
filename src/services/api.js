import axios from "axios";

const API_BASE = "https://aliroohan179-patients.hf.space/api";

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
});
export const getPatients = () => api.get(`/patients/`);
export const getPatient = (id) => api.get(`/patients/${id}`);
export const createPatient = (data) => api.post(`/patients/`, data);
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);
export const deletePatient = (id) => api.delete(`/patients/${id}`);
export const getSummary = (id, query) =>
  api.get(`/patients/${id}/summary?query=${encodeURIComponent(query)}`);
