import axios from 'axios';
import { clearAuthSession, getAuthToken } from '../utils/auth';
import { API_CONFIG } from '../constants/api.constants';

const getBaseUrl = () => {
  if (
    typeof process !== 'undefined' &&
    process.env?.REACT_APP_API_URL
  ) {
    return process.env.REACT_APP_API_URL;
  }

  if (
    typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_API_URL
  ) {
    return import.meta.env.VITE_API_URL;
  }

  return API_CONFIG.DEFAULT_BASE_URL;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: API_CONFIG.DEFAULT_TIMEOUT,
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
