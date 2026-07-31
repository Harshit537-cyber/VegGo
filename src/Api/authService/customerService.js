import apiClient from '../Interceptor/axiosInstance';

export const getCustomerStats = async () => {
  const response = await apiClient.get('/api/admin/customers/stats');
  return response.data;
};