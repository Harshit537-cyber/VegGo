import apiClient from '../Interceptor/axiosInstance';

export const adminLogin = async (credentials) => {
  const response = await apiClient.post(
    '/api/auth/admin/login',
    credentials
  );

  return response.data;
};