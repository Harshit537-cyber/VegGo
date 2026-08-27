import apiClient from '../Interceptor/axiosInstance';

// ===============================
// ADMIN PROFILE
// ===============================

export const getAdminProfile = async () => {
  const response = await apiClient.get(
    '/api/admin/profile'
  );

  return response.data;
};

export const updateAdminProfile = async (data) => {
  const response = await apiClient.put(
    '/api/admin/profile',
    data
  );

  return response.data;
};

// ===============================
// NOTIFICATION PREFERENCES
// ===============================

export const getNotificationPreferences = async () => {
  const response = await apiClient.get(
    '/api/admin/notification-preferences'
  );

  return response.data;
};

export const updateNotificationPreferences = async (
  data
) => {
  const response = await apiClient.put(
    '/api/admin/notification-preferences',
    data
  );

  return response.data;
};

// ===============================
// CHANGE PASSWORD
// ===============================

export const changeAdminPassword = async (data) => {
  const response = await apiClient.post(
    '/api/admin/change-password',
    data
  );

  return response.data;
};

// ===============================
// ACTIVE SESSIONS
// ===============================

export const getActiveSessions = async () => {
  const response = await apiClient.get(
    '/api/admin/sessions'
  );

  return response.data;
};

export const revokeSession = async (sessionId) => {
  const response = await apiClient.delete(
    `/api/admin/sessions/${sessionId}`
  );

  return response.data;
};

// ===============================
// PLATFORM SETTINGS
// ===============================

export const getPlatformSettings = async () => {
  const response = await apiClient.get(
    '/api/admin/settings'
  );

  return response.data;
};

export const updatePlatformSettings = async (
  data
) => {
  const response = await apiClient.put(
    '/api/admin/settings',
    data
  );

  return response.data;
};