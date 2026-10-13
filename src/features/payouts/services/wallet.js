import apiClient from '../../../api/axiosInstance';
import { PAYOUT_ENDPOINTS } from '../../../constants/endpoints.constants';

export const getWalletBalance = async () => {
  const response = await apiClient.get(PAYOUT_ENDPOINTS.WALLET_BALANCE);
  return response.data;
};

export const getWalletTransactions = async (page = 0, size = 20) => {
  const response = await apiClient.get(
    PAYOUT_ENDPOINTS.WALLET_TRANSACTIONS,
    {
      params: {
        page,
        size,
      },
    }
  );
  return response.data;
};

export const getCreditTransactions = async (page = 0, size = 20) => {
  const response = await apiClient.get(
    PAYOUT_ENDPOINTS.WALLET_TRANSACTIONS,
    {
      params: {
        type: 'CREDIT',
        page,
        size,
      },
    }
  );
  return response.data;
};

export const getDebitTransactions = async (page = 0, size = 20) => {
  const response = await apiClient.get(
    PAYOUT_ENDPOINTS.WALLET_TRANSACTIONS,
    {
      params: {
        type: 'DEBIT',
        page,
        size,
      },
    }
  );
  return response.data;
};