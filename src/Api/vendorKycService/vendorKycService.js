import apiClient from '../Interceptor/axiosInstance';

export const getPendingVendorKyc = async (params = {}) => {
  const response = await apiClient.get(
    '/api/admin/vendors/kyc/pending',
    { params }
  );

  return response.data;
};

export const getVendorKycDetails = async (shopId) => {
  const response = await apiClient.get(
    `/api/admin/vendors/kyc/${shopId}`
  );

  return response.data;
};

export const approveVendorKyc = async (shopId) => {
  const response = await apiClient.put(
    `/api/admin/vendors/kyc/${shopId}/approve`
  );

  return response.data;
};

export const rejectVendorKyc = async (shopId, reason) => {
  const response = await apiClient.put(
    `/api/admin/vendors/kyc/${shopId}/reject`,
    null,
    {
      params: {
        reason
      }
    }
  );

  return response.data;
};