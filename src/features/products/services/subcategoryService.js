import apiClient from '../../../api/axiosInstance';
import { CATALOG_ENDPOINTS } from '../../../constants/endpoints.constants';

export const getSubcategories = async (params = {}) => {
  const response = await apiClient.get(
    CATALOG_ENDPOINTS.SUBCATEGORIES,
    {
      params
    }
  );

  return response.data;
};

export const createSubcategory = async (subcategoryData) => {
  const response = await apiClient.post(
    CATALOG_ENDPOINTS.SUBCATEGORIES,
    subcategoryData
  );

  return response.data;
};

export const getSubcategoryById = async (subcategoryId) => {
  const response = await apiClient.get(
    CATALOG_ENDPOINTS.SUBCATEGORY_BY_ID(subcategoryId)
  );

  return response.data;
};

export const updateSubcategory = async (
  subcategoryId,
  subcategoryData
) => {
  const response = await apiClient.put(
    CATALOG_ENDPOINTS.SUBCATEGORY_BY_ID(subcategoryId),
    subcategoryData
  );

  return response.data;
};

export const deactivateSubcategory = async (subcategoryId) => {
  const response = await apiClient.patch(
    CATALOG_ENDPOINTS.SUBCATEGORY_STATUS(subcategoryId),
    null,
    {
      params: {
        active: false
      }
    }
  );

  return response.data;
};

export const activateSubcategory = async (subcategoryId) => {
  const response = await apiClient.patch(
    CATALOG_ENDPOINTS.SUBCATEGORY_STATUS(subcategoryId),
    null,
    {
      params: {
        active: true
      }
    }
  );

  return response.data;
};