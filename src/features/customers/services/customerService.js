import apiClient from '../../../api/axiosInstance';
import { CUSTOMER_ENDPOINTS } from '../../../constants/endpoints.constants';

export const getCustomerStats = async () => {
  const response = await apiClient.get(
    CUSTOMER_ENDPOINTS.STATS
  );

  return response.data;
};

export const getCustomers = async (params = {}) => {
  const response = await apiClient.get(
    CUSTOMER_ENDPOINTS.BASE,
    {
      params,
    }
  );

  return response.data;
};

export const searchCustomers = async (search, params = {}) => {
  const response = await apiClient.get(
    CUSTOMER_ENDPOINTS.BASE,
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
    CUSTOMER_ENDPOINTS.DETAILS(customerUserId)
  );

  return response.data;
};

export const deleteCustomer = async (customerUserId) => {
  const response = await apiClient.delete(
    CUSTOMER_ENDPOINTS.DELETE(customerUserId)
  );

  return response.data;
};

export const blockCustomer = async (customerUserId) => {
  const response = await apiClient.put(
    CUSTOMER_ENDPOINTS.BLOCK(customerUserId)
  );

  return response.data;
};

export const unblockCustomer = async (customerUserId) => {
  const response = await apiClient.put(
    CUSTOMER_ENDPOINTS.UNBLOCK(customerUserId)
  );

  return response.data;
};

export const getModerationStats = async () => {
  const response = await apiClient.get(
    CUSTOMER_ENDPOINTS.MODERATION_STATS
  );

  return response.data;
};

export const getModerationCustomers = async (params = {}) => {
  const response = await apiClient.get(
    CUSTOMER_ENDPOINTS.MODERATION_LIST,
    {
      params,
    }
  );

  return response.data;
};

export const searchModerationCustomers = async (search, params = {}) => {
  const response = await apiClient.get(
    CUSTOMER_ENDPOINTS.MODERATION_LIST,
    {
      params: {
        search,
        ...params,
      },
    }
  );

  return response.data;
};