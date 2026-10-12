import apiClient from "../../../api/axiosInstance";

export const getPendingPayouts = async (page = 0, size = 20) => {
  const response = await apiClient.get(
    `/api/v1/admin/payouts?status=PENDING&page=${page}&size=${size}`
  );

  return response.data;
};

export const approvePayout = async (payoutRequestId) => {
  const response = await apiClient.post(
    `/api/v1/admin/payouts/${payoutRequestId}/approve`
  );

  return response.data;
};

export const rejectPayout = async (payoutRequestId) => {
  const response = await apiClient.post(
    `/api/v1/admin/payouts/${payoutRequestId}/reject`
  );

  return response.data;
};