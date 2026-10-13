import apiClient from "../../../api/axiosInstance";
import { PAYOUT_ENDPOINTS } from "../../../constants/endpoints.constants";

export const getPayouts = async (status = "ALL", page = 0, size = 20) => {
  const params = { page, size };

  if (status && status.toUpperCase() !== "ALL") {
    params.status = status.toUpperCase();
  }

  const response = await apiClient.get(PAYOUT_ENDPOINTS.PAYOUTS, { params });
  return response.data;
};

export const getPendingPayouts = async (page = 0, size = 20) => {
  return getPayouts("PENDING", page, size);
};

export const approvePayout = async (payoutRequestId) => {
  const response = await apiClient.post(
    PAYOUT_ENDPOINTS.APPROVE(payoutRequestId)
  );
  return response.data;
};

export const rejectPayout = async (payoutRequestId) => {
  const response = await apiClient.post(
    PAYOUT_ENDPOINTS.REJECT(payoutRequestId)
  );
  return response.data;
};