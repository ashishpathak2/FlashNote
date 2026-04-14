import axios from 'axios';
const API = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API, timeout: 60000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mnemo_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mnemo_token');
      localStorage.removeItem('mnemo_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
