import apiClient from "../Interceptor/axiosInstance";

// NOTE: In this backend, refunds are automatic — they are credited directly
// to the customer's wallet when an order is cancelled (Phase 8 in the
// payment lifecycle). There is NO manual admin refund-approval queue.
//
// This file uses the wallet CREDIT transactions endpoint to surface
// refund entries. Endpoint: GET /api/payment/wallet/transactions?type=CREDIT
//
// The approve / reject functions are kept as stubs pointing to the logical
// URL so the backend can wire them up later without frontend changes.

// ─── GET REFUND TRANSACTIONS (CREDIT entries = auto-refunds) ───────────────
export const getPendingRefunds = async (page = 0, size = 20) => {
  const response = await apiClient.get(
    `/api/payment/wallet/transactions?type=CREDIT&page=${page}&size=${size}`
  );
  return response.data;
};

// ─── APPROVE REFUND (stub — no backend endpoint yet) ──────────────────────
export const approveRefund = async (refundId) => {
  const response = await apiClient.post(
    `/api/v1/admin/refunds/${refundId}/approve`
  );
  return response.data;
};

// ─── REJECT REFUND (stub — no backend endpoint yet) ───────────────────────
export const rejectRefund = async (refundId) => {
  const response = await apiClient.post(
    `/api/v1/admin/refunds/${refundId}/reject`
  );
  return response.data;
};