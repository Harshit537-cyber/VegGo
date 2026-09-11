// Wallet API helpers
// These are convenience wrappers used by the Wallet.jsx page.
// The full payment service (paymentService.js) also exports wallet functions;
// these wrappers exist so Wallet.jsx doesn't need to be restructured.
//
// Endpoints: GET /api/payment/wallet/balance
//            GET /api/payment/wallet/transactions

import apiClient from '../Interceptor/axiosInstance';

export const getWalletBalance = async () => {
  const response = await apiClient.get('/api/payment/wallet/balance');
  return response.data;
};

export const getWalletTransactions = async (page = 0, size = 20) => {
  const response = await apiClient.get(
    `/api/payment/wallet/transactions?page=${page}&size=${size}`
  );
  return response.data;
};

export const getCreditTransactions = async (page = 0, size = 20) => {
  const response = await apiClient.get(
    `/api/payment/wallet/transactions?type=CREDIT&page=${page}&size=${size}`
  );
  return response.data;
};

export const getDebitTransactions = async (page = 0, size = 20) => {
  const response = await apiClient.get(
    `/api/payment/wallet/transactions?type=DEBIT&page=${page}&size=${size}`
  );
  return response.data;
};