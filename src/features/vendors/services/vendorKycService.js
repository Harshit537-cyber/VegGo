import apiClient from "../../../api/axiosInstance";

export const getPendingVendorKyc = async () => {
  const response = await apiClient.get(
    "/api/admin/vendors/kyc/pending?page=0&size=20"
  );

  return response.data;
};

export const getVendorKycDetail = async (vendorShopId) => {
  const response = await apiClient.get(
    `/api/admin/vendors/kyc/${vendorShopId}`
  );

  return response.data;
};

export const approveVendorKyc = async (vendorShopId) => {
  const response = await apiClient.put(
    `/api/admin/vendors/kyc/${vendorShopId}/approve`
  );

  return response.data;
};

export const rejectVendorKyc = async (
  vendorShopId,
  reason = "Document unclear"
) => {
  const response = await apiClient.put(
    `/api/admin/vendors/kyc/${vendorShopId}/reject`,
    null,
    {
      params: {
        reason,
      },
    }
  );

  return response.data;
};