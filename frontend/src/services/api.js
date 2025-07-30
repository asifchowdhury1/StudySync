import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const sessionAPI = {
  create: (sessionData) => api.post('/api/sessions', sessionData),
  getAll: (params) => api.get('/api/sessions', { params }),
  getById: (id) => api.get(`/api/sessions/${id}`),
  update: (id, sessionData) => api.put(`/api/sessions/${id}`, sessionData),
  delete: (id) => api.delete(`/api/sessions/${id}`),
  getTodaySummary: () => api.get('/api/sessions/summary/today'),
};

export const subjectAPI = {
  create: (subjectData) => api.post('/api/subjects', subjectData),
  getAll: () => api.get('/api/subjects'),
  getById: (id) => api.get(`/api/subjects/${id}`),
  update: (id, subjectData) => api.put(`/api/subjects/${id}`, subjectData),
  delete: (id, force = false) => api.delete(`/api/subjects/${id}?force=${force}`),
  getSessions: (id, params) => api.get(`/api/subjects/${id}/sessions`, { params }),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/api/analytics/dashboard'),
  getTimeSeries: (params) => api.get('/api/analytics/time-series', { params }),
  getSubjects: (params) => api.get('/api/analytics/subjects', { params }),
  getPatterns: (params) => api.get('/api/analytics/patterns', { params }),
};

export default api;