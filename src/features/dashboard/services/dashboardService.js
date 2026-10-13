import apiClient from '../../../api/axiosInstance';
import { DASHBOARD_ENDPOINTS } from '../../../constants/endpoints.constants';

/**
 * Fetch core admin dashboard overview & telemetry
 * Primary Endpoint: GET /api/admin/dashboard
 */
export const getAdminDashboard = async () => {
  const response = await apiClient.get(DASHBOARD_ENDPOINTS.OVERVIEW);
  return response.data;
};

export default {
  getAdminDashboard,
};
