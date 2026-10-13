import apiClient from "../../../api/axiosInstance";
import { VENDOR_ENDPOINTS } from "../../../constants/endpoints.constants";

export const getPendingVendorKyc = async (page = 0, size = 20) => {
  const response = await apiClient.get(
    VENDOR_ENDPOINTS.KYC_PENDING,
    {
      params: {
        page,
        size,
      },
    }
  );

  return response.data;
};

export const getVendorKycDetail = async (vendorShopId) => {
  const response = await apiClient.get(
    VENDOR_ENDPOINTS.KYC_DETAIL(vendorShopId)
  );

  return response.data;
};

export const approveVendorKyc = async (vendorShopId) => {
  const response = await apiClient.put(
    VENDOR_ENDPOINTS.KYC_APPROVE(vendorShopId)
  );

  return response.data;
};

export const rejectVendorKyc = async (
  vendorShopId,
  reason = "Document unclear"
) => {
  const response = await apiClient.put(
    VENDOR_ENDPOINTS.KYC_REJECT(vendorShopId),
    null,
    {
      params: {
        reason,
      },
    }
  );

  return response.data;
};