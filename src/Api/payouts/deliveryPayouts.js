import apiClient from "../Interceptor/axiosInstance";

export const getPendingDeliveryPayouts = async (page = 0, size = 20) => {
  const response = await apiClient.get(
    `/api/v1/admin/delivery-payouts?status=PENDING&page=${page}&size=${size}`
  );

  return response.data;
};

export const approveDeliveryPayout = async (payoutRequestId) => {
  const response = await apiClient.post(
    `/api/v1/admin/delivery-payouts/${payoutRequestId}/approve`
  );

  return response.data;
};

export const rejectDeliveryPayout = async (payoutRequestId) => {
  const response = await apiClient.post(
    `/api/v1/admin/delivery-payouts/${payoutRequestId}/reject`
  );

  return response.data;
};