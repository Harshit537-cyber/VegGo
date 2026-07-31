import apiClient from '../Interceptor/axiosInstance';

// Admin Login API
export const adminLogin = async (credentials) => {
  const response = await apiClient.post('/api/auth/admin/login', credentials);
  return response.data;
};

// Admin Dashboard API
export const getAdminDashboard = async () => {
  const response = await apiClient.get('/api/admin/dashboard');
  return response.data;
};