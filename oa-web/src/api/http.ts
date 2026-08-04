import axios from 'axios';
import { ElMessage } from 'element-plus';

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export const http = axios.create({
  baseURL: rawBaseUrl,
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('oa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('oa_token');
      if (location.pathname !== '/login') {
        location.href = '/login';
      }
    }
    ElMessage.error(error.response?.data?.message || '网络请求失败');
    return Promise.reject(error);
  }
);
