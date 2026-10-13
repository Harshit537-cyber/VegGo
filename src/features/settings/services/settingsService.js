import apiClient from '../../../api/axiosInstance';
import { SETTINGS_ENDPOINTS } from '../../../constants/endpoints.constants';

export const getPlatformSettings = async () => {
  const response = await apiClient.get(SETTINGS_ENDPOINTS.SETTINGS);
  return response.data;
};

export const updatePlatformSettings = async (payload) => {
  const response = await apiClient.put(SETTINGS_ENDPOINTS.SETTINGS, payload);
  return response.data;
};