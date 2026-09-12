import apiClient from '../Interceptor/axiosInstance';

export const getCustomerStats = async () => {
  const response = await apiClient.get(
    '/api/admin/customers/stats'
  );

  return response.data;
};

export const getCustomers = async (params = {}) => {
  const response = await apiClient.get(
    '/api/admin/customers',
    {
      params,
    }
  );

  return response.data;
};

export const searchCustomers = async (search, params = {}) => {
  const response = await apiClient.get(
    '/api/admin/customers',
    {
      params: {
        search,
        ...params,
      },
    }
  );

  return response.data;
};

export const getCustomerDetails = async (customerUserId) => {
  const response = await apiClient.get(
    `/api/admin/customers/${customerUserId}`
  );

  return response.data;
};

export const deleteCustomer = async (customerUserId) => {
  const response = await apiClient.delete(
    `/api/admin/customers/${customerUserId}`
  );

  return response.data;
};

export const blockCustomer = async (customerUserId) => {
  const response = await apiClient.put(
    `/api/admin/customers/${customerUserId}/block`
  );

  return response.data;
};

export const unblockCustomer = async (customerUserId) => {
  const response = await apiClient.put(
    `/api/admin/customers/${customerUserId}/unblock`
  );

  return response.data;
};

export const getModerationStats = async () => {
  const response = await apiClient.get(
    '/api/admin/customers/moderation/stats'
  );

  return response.data;
};

export const getModerationCustomers = async (params = {}) => {
  const response = await apiClient.get(
    '/api/admin/customers/moderation',
    {
      params,
    }
  );

  return response.data;
};

export const searchModerationCustomers = async (search, params = {}) => {
  const response = await apiClient.get(
    '/api/admin/customers/moderation',
    {
      params: {
        search,
        ...params,
      },
    }
  );

  return response.data;
};