import apiClient from '../../../api/axiosInstance';
import { AUTH_ENDPOINTS } from '../../../constants/endpoints.constants';

export const adminLogin = async (credentials) => {
  const response = await apiClient.post(
    AUTH_ENDPOINTS.LOGIN,
    credentials
  );

  return response.data;
};
