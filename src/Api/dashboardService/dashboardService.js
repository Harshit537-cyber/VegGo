import apiClient from '../Interceptor/axiosInstance';

export const getAdminDashboard = async () => {
  const response = await apiClient.get('/api/admin/dashboard');

  return response.data;
};