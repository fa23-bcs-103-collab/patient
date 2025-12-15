import axios from "axios";

// Use environment variable or fallback to local development
// CRA uses process.env.REACT_APP_*, Vite uses import.meta.env.VITE_*
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:7860/api";
// const API_BASE = "http://localhost:7860/api";

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
});

// Token management
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
};

export const clearAuthToken = () => {
    delete api.defaults.headers.common['Authorization'];
};

// Initialize token from localStorage on load
const savedToken = localStorage.getItem('auth_token');
if (savedToken) {
    setAuthToken(savedToken);
}

// Response interceptor for handling auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('auth_token');
            clearAuthToken();
            // Optionally redirect to login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API endpoints
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    updateMe: (data) => api.put('/auth/me', data),
    getUsers: () => api.get('/auth/users'),
    deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// Patient API endpoints
export const getPatients = () => api.get('/patients/');
export const getPatient = (id) => api.get(`/patients/${id}`);
export const createPatient = (data) => api.post('/patients/', data);
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);
export const deletePatient = (id) => api.delete(`/patients/${id}`);
export const getSummary = (id, query) =>
    api.get(`/patients/${id}/summary?query=${encodeURIComponent(query)}`);
export const getRagSummary = (id, query) =>
    api.get(`/patients/${id}/rag-summary?query=${encodeURIComponent(query)}`);
export const suggestTreatment = (id, condition) =>
    api.get(`/patients/${id}/suggest-treatment?condition=${encodeURIComponent(condition)}`);
export const analyzeDrugInteractions = (id, medication) =>
    api.get(`/patients/${id}/drug-interactions?new_medication=${encodeURIComponent(medication)}`);
export const semanticSearch = (query, limit = 5) =>
    api.get(`/patients/search/semantic?query=${encodeURIComponent(query)}&limit=${limit}`);

// Warning API endpoints
export const warningApi = {
    getPatientWarnings: (patientId, includeAcknowledged = false) =>
        api.get(`/patients/${patientId}/warnings?include_acknowledged=${includeAcknowledged}`),
    analyzePatient: (patientId, data = {}) =>
        api.post(`/patients/${patientId}/warnings/analyze`, data),
    acknowledgeWarning: (warningId, data = {}) =>
        api.put(`/warnings/${warningId}/acknowledge`, data),
    getUnacknowledgedWarnings: (limit = 50) =>
        api.get(`/warnings/unacknowledged?limit=${limit}`),
    getWarningStats: () =>
        api.get('/warnings/stats'),
    deletePatientWarnings: (patientId) =>
        api.delete(`/patients/${patientId}/warnings`),
};

// Timeline API endpoints
export const timelineApi = {
    getPatientTimeline: (patientId) =>
        api.get(`/patients/${patientId}/timeline`),
    getTimelineSummary: (patientId) =>
        api.get(`/patients/${patientId}/timeline/summary`),
    getTimelineStats: (patientId) =>
        api.get(`/patients/${patientId}/timeline/stats`),
};

// Appointment API endpoints
export const appointmentApi = {
    create: (data) =>
        api.post('/appointments', data),
    list: (params = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });
        return api.get(`/appointments?${queryParams.toString()}`);
    },
    getUpcoming: (limit = 20) =>
        api.get(`/appointments/upcoming?limit=${limit}`),
    get: (id) =>
        api.get(`/appointments/${id}`),
    update: (id, data) =>
        api.put(`/appointments/${id}`, data),
    cancel: (id, reason = null) =>
        api.post(`/appointments/${id}/cancel`, { reason }),
    complete: (id, notes = null) =>
        api.post(`/appointments/${id}/complete?notes=${encodeURIComponent(notes || '')}`),
    getSummary: (id) =>
        api.get(`/appointments/${id}/summary`),
    getPatientAppointments: (patientId, includePast = false) =>
        api.get(`/patients/${patientId}/appointments?include_past=${includePast}`),
    getStats: () =>
        api.get('/appointments/stats'),
};

export default api;

