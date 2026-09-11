// Payment Lifecycle API Service
// Covers the full Razorpay Hold → Capture → Release flow
// as defined in the "VegGoFresh — Payment Lifecycle" Postman collection.
//
// Base: /api/payment/...  and  /api/v1/...

import apiClient from '../Interceptor/axiosInstance';

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT ORDERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Phase 4.1 — Verify Payment
 * After the customer pays on Razorpay, submit the payment ID + signature here
 * to authorise the hold.
 * POST /api/payment/orders/verify
 */
export const verifyPayment = async ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const response = await apiClient.post('/api/payment/orders/verify', {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });
  return response.data;
};

/**
 * Phase 4.2 / 7.1 — Get Payment Order Status
 * Returns status (AUTHORIZED → CAPTURED) and breakdown lines.
 * GET /api/payment/orders/:paymentOrderId
 */
export const getPaymentOrder = async (paymentOrderId) => {
  const response = await apiClient.get(
    `/api/payment/orders/${paymentOrderId}`
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// WALLET
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/payment/wallet/balance
 * Works for Customer, Vendor, and Delivery tokens.
 */
export const getWalletBalance = async () => {
  const response = await apiClient.get('/api/payment/wallet/balance');
  return response.data;
};

/**
 * GET /api/payment/wallet/transactions
 * @param {Object} opts
 * @param {string|null} opts.type   - 'CREDIT' | 'DEBIT' | null (all)
 * @param {number}      opts.page
 * @param {number}      opts.size
 */
export const getWalletTransactions = async ({
  type = null,
  page = 0,
  size = 20,
} = {}) => {
  const params = new URLSearchParams({ page, size });
  if (type) params.set('type', type);

  const response = await apiClient.get(
    `/api/payment/wallet/transactions?${params.toString()}`
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// BANK ACCOUNT (Vendor / Delivery)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/bank-account
 * Save or update bank account details for the current user (Vendor / Delivery).
 * @param {{ accountHolderName, accountNumber, ifscCode, bankName }} payload
 */
export const saveBankAccount = async (payload) => {
  const response = await apiClient.post('/api/v1/bank-account', payload);
  return response.data;
};

/**
 * GET /api/v1/bank-account
 * Fetch the saved bank account for the current user.
 */
export const getBankAccount = async () => {
  const response = await apiClient.get('/api/v1/bank-account');
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYOUTS — Vendor / Delivery (self-service)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/payouts/request
 * Vendor / Delivery submits a withdrawal payout request.
 * @param {number} amount
 */
export const requestPayout = async (amount) => {
  const response = await apiClient.post('/api/v1/payouts/request', {
    amount,
  });
  return response.data;
};

/**
 * GET /api/v1/payouts/my-requests
 * List the current user's own payout requests.
 */
export const getMyPayoutRequests = async (page = 0, size = 20) => {
  const response = await apiClient.get(
    `/api/v1/payouts/my-requests?page=${page}&size=${size}`
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYOUTS — Admin queue
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/payouts
 * List all payout requests, optionally filtered by status.
 * @param {string} status - 'PENDING' | 'APPROVED' | 'REJECTED' | omit for all
 */
export const getAdminPayouts = async ({
  status = 'PENDING',
  page = 0,
  size = 20,
} = {}) => {
  const params = new URLSearchParams({ page, size });
  if (status) params.set('status', status);

  const response = await apiClient.get(
    `/api/v1/admin/payouts?${params.toString()}`
  );
  return response.data;
};

/**
 * POST /api/v1/admin/payouts/:payoutRequestId/approve
 * Admin approves a payout — triggers RazorpayX transfer.
 */
export const adminApprovePayout = async (payoutRequestId, notes = '') => {
  const response = await apiClient.post(
    `/api/v1/admin/payouts/${payoutRequestId}/approve`,
    { notes }
  );
  return response.data;
};

/**
 * POST /api/v1/admin/payouts/:payoutRequestId/reject
 * Admin rejects a payout — funds are restored to the user's wallet.
 */
export const adminRejectPayout = async (
  payoutRequestId,
  rejectionReason = '',
  notes = ''
) => {
  const response = await apiClient.post(
    `/api/v1/admin/payouts/${payoutRequestId}/reject`,
    { rejectionReason, notes }
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// WEBHOOKS (Simulation / Testing)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/webhooks/razorpayx
 * Simulate a RazorpayX webhook callback (payout.processed etc.)
 * Only needed during local testing — not used in production UI.
 */
export const simulateRazorpayXWebhook = async (payload) => {
  const response = await apiClient.post(
    '/api/v1/webhooks/razorpayx',
    payload
  );
  return response.data;
};
