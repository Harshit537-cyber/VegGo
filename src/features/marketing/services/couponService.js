import apiClient from '../../../api/axiosInstance';
import { COUPON_ENDPOINTS } from '../../../constants/endpoints.constants';

/**
 * Admin coupons  (role ADMIN)
 * All responses use the standard envelope: { success, message, data, errorCode }
 */

// GET /api/admin/coupons?status=&search=&page=&size=
export const getCoupons = async ({
  status = '',
  search = '',
  page = 0,
  size = 20,
} = {}) => {
  const params = { page, size };

  if (status && status !== 'ALL') params.status = status;
  if (search && String(search).trim()) params.search = String(search).trim();

  const response = await apiClient.get(COUPON_ENDPOINTS.BASE, { params });
  return response.data;
};

// GET /api/admin/coupons/{id}
export const getCouponById = async (couponId) => {
  const response = await apiClient.get(COUPON_ENDPOINTS.BY_ID(couponId));
  return response.data;
};

// POST /api/admin/coupons
export const createCoupon = async (payload) => {
  const response = await apiClient.post(COUPON_ENDPOINTS.BASE, payload);
  return response.data;
};

// PUT /api/admin/coupons/{id}  (full replacement of the rules)
export const updateCoupon = async (couponId, payload) => {
  const response = await apiClient.put(COUPON_ENDPOINTS.BY_ID(couponId), payload);
  return response.data;
};

// PATCH /api/admin/coupons/{id}/status?enabled=true|false
export const setCouponStatus = async (couponId, enabled) => {
  const response = await apiClient.patch(
    COUPON_ENDPOINTS.STATUS(couponId),
    null,
    { params: { enabled } }
  );
  return response.data;
};

// DELETE /api/admin/coupons/{id}  (only if never used)
export const deleteCoupon = async (couponId) => {
  const response = await apiClient.delete(COUPON_ENDPOINTS.BY_ID(couponId));
  return response.data;
};

// GET /api/admin/coupons/{id}/redemptions?page=&size=
export const getCouponRedemptions = async (couponId, { page = 0, size = 20 } = {}) => {
  const response = await apiClient.get(COUPON_ENDPOINTS.REDEMPTIONS(couponId), {
    params: { page, size },
  });
  return response.data;
};
