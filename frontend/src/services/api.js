import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor to add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (username, password) => api.post('/auth/login', { username, password });

export const verifyCertificate = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('certificate', file);
  return api.post('/verify', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};

export const getTaskStatus = (taskId) => api.get(`/tasks/${taskId}`);
export const getRecords = () => api.get('/admin/records');
export const getRecord = (id) => api.get(`/admin/records/${id}`);
export const getStats = () => api.get('/admin/stats');

export default api;
