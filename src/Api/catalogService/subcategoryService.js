import apiClient from '../Interceptor/axiosInstance';

export const getSubcategories = async (params = {}) => {
  const response = await apiClient.get(
    '/api/admin/catalog/subcategories',
    {
      params,
    }
  );

  return response.data;
};

export const createSubcategory = async (subcategoryData) => {
  const response = await apiClient.post(
    '/api/admin/catalog/subcategories',
    subcategoryData
  );

  return response.data;
};

export const getSubcategoryById = async (subcategoryId) => {
  const response = await apiClient.get(
    `/api/admin/catalog/subcategories/${subcategoryId}`
  );

  return response.data;
};

export const updateSubcategory = async (
  subcategoryId,
  subcategoryData
) => {
  const response = await apiClient.put(
    `/api/admin/catalog/subcategories/${subcategoryId}`,
    subcategoryData
  );

  return response.data;
};

export const deactivateSubcategory = async (subcategoryId) => {
  const response = await apiClient.patch(
    `/api/admin/catalog/subcategories/${subcategoryId}/status`,
    null,
    {
      params: {
        active: false,
      },
    }
  );

  return response.data;
};

export const activateSubcategory = async (subcategoryId) => {
  const response = await apiClient.patch(
    `/api/admin/catalog/subcategories/${subcategoryId}/status`,
    null,
    {
      params: {
        active: true,
      },
    }
  );

  return response.data;
};