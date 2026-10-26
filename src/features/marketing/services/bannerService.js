import apiClient from '../../../api/axiosInstance';
import { BANNER_ENDPOINTS } from '../../../constants/endpoints.constants';

/**
 * Admin banners  (role ADMIN, multipart/form-data for create + edit)
 */

/**
 * Builds the multipart body shared by create + edit.
 * Edit REPLACES the text fields: an omitted subtitle / couponCode / action /
 * date is cleared by the server, so empty values are simply not appended.
 */
const buildBannerFormData = (data, image) => {
  const formData = new FormData();

  formData.append('title', (data.title || '').trim());

  if (data.subtitle && data.subtitle.trim()) {
    formData.append('subtitle', data.subtitle.trim());
  }

  if (data.couponCode && data.couponCode.trim()) {
    formData.append('couponCode', data.couponCode.trim());
  }

  const actionType = data.actionType || 'NONE';
  formData.append('actionType', actionType);

  if (actionType !== 'NONE' && data.actionTargetId && data.actionTargetId.trim()) {
    formData.append('actionTargetId', data.actionTargetId.trim());
  }

  if (data.startsAt) formData.append('startsAt', data.startsAt);
  if (data.endsAt) formData.append('endsAt', data.endsAt);

  if (data.displayOrder !== '' && data.displayOrder !== undefined && data.displayOrder !== null) {
    formData.append('displayOrder', String(data.displayOrder));
  }

  formData.append('enabled', String(data.enabled ?? true));

  if (image instanceof File || image instanceof Blob) {
    formData.append('image', image);
  }

  return formData;
};

// GET /api/admin/banners?status=&search=&page=&size=
export const getBanners = async ({
  status = '',
  search = '',
  page = 0,
  size = 20,
} = {}) => {
  const params = { page, size };

  if (status && status !== 'ALL') params.status = status;
  if (search && String(search).trim()) params.search = String(search).trim();

  const response = await apiClient.get(BANNER_ENDPOINTS.BASE, { params });
  return response.data;
};

// GET /api/admin/banners/{id}
export const getBannerById = async (bannerId) => {
  const response = await apiClient.get(BANNER_ENDPOINTS.BY_ID(bannerId));
  return response.data;
};

// POST /api/admin/banners
export const createBanner = async (data, image) => {
  const response = await apiClient.post(
    BANNER_ENDPOINTS.BASE,
    buildBannerFormData(data, image)
  );
  return response.data;
};

// PUT /api/admin/banners/{id}   (send `image` only to replace it)
export const updateBanner = async (bannerId, data, image) => {
  const response = await apiClient.put(
    BANNER_ENDPOINTS.BY_ID(bannerId),
    buildBannerFormData(data, image)
  );
  return response.data;
};

// PATCH /api/admin/banners/{id}/status?enabled=true|false
export const setBannerStatus = async (bannerId, enabled) => {
  const response = await apiClient.patch(
    BANNER_ENDPOINTS.STATUS(bannerId),
    null,
    { params: { enabled } }
  );
  return response.data;
};

// DELETE /api/admin/banners/{id}
export const deleteBanner = async (bannerId) => {
  const response = await apiClient.delete(BANNER_ENDPOINTS.BY_ID(bannerId));
  return response.data;
};
