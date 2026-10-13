import apiClient from "../../../api/axiosInstance";
import { DELIVERY_ENDPOINTS } from "../../../constants/endpoints.constants";

// Get Pending Delivery Partner KYC
export const getPendingDeliveryKyc = async (page = 0, size = 20) => {
  const queryParams = typeof page === "object" ? page : { page, size };
  const response = await apiClient.get(
    DELIVERY_ENDPOINTS.KYC_PENDING,
    {
      params: {
        page: 0,
        size: 20,
        ...queryParams,
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
    DELIVERY_ENDPOINTS.KYC_DETAIL(deliveryPartnerUserId)
  );

  return response.data;
};

// Approve Delivery Partner KYC
export const approveDeliveryKyc = async (
  deliveryPartnerUserId
) => {
  const response = await apiClient.put(
    DELIVERY_ENDPOINTS.KYC_APPROVE(deliveryPartnerUserId)
  );

  return response.data;
};

// Reject Delivery Partner KYC
export const rejectDeliveryKyc = async (
  deliveryPartnerUserId,
  reason = "License number does not match uploaded document"
) => {
  const response = await apiClient.put(
    DELIVERY_ENDPOINTS.KYC_REJECT(deliveryPartnerUserId),
    null,
    {
      params: {
        reason,
      },
    }
  );

  return response.data;
};