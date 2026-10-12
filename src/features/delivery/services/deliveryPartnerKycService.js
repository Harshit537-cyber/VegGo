import apiClient from "../../../api/axiosInstance";

// Get Pending Delivery Partner KYC
export const getPendingDeliveryKyc = async (params = {}) => {
  const response = await apiClient.get(
    "/api/admin/delivery-partners/kyc/pending",
    {
      params: {
        page: 0,
        size: 20,
        ...params,
      },
    }
  );

  return response.data;
};

// Get Delivery Partner KYC Details
export const getDeliveryKycDetails = async (
  deliveryPartnerUserId
) => {
  const response = await apiClient.get(
    `/api/admin/delivery-partners/kyc/${deliveryPartnerUserId}`
  );

  return response.data;
};

// Approve Delivery Partner KYC
export const approveDeliveryKyc = async (
  deliveryPartnerUserId
) => {
  const response = await apiClient.put(
    `/api/admin/delivery-partners/kyc/${deliveryPartnerUserId}/approve`
  );

  return response.data;
};

// Reject Delivery Partner KYC
export const rejectDeliveryKyc = async (
  deliveryPartnerUserId,
  reason = "License number does not match uploaded document"
) => {
  const response = await apiClient.put(
    `/api/admin/delivery-partners/kyc/${deliveryPartnerUserId}/reject`,
    null,
    {
      params: {
        reason,
      },
    }
  );

  return response.data;
};