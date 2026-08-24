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

export const getCustomerDetails = async (customerId) => {
  const response = await apiClient.get(
    `/api/admin/customers/${customerId}`
  );

  return response.data;
};

export const deleteCustomer = async (customerId) => {
  const response = await apiClient.delete(
    `/api/admin/customers/${customerId}`
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

export const blockCustomer = async (customerId) => {
  const response = await apiClient.put(
    `/api/admin/customers/${customerId}/block`
  );

  return response.data;
};

export const unblockCustomer = async (customerId) => {
  const response = await apiClient.put(
    `/api/admin/customers/${customerId}/unblock`
  );

  return response.data;
};