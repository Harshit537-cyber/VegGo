import apiClient from "../../../api/axiosInstance";
import { CATALOG_ENDPOINTS } from "../../../constants/endpoints.constants";

export const getCategories = async (
  includeInactive = false
) => {
  const response = await apiClient.get(
    CATALOG_ENDPOINTS.CATEGORIES,
    {
      params: {
        includeInactive,
      },
    }
  );

  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await apiClient.post(
    CATALOG_ENDPOINTS.CATEGORIES,
    categoryData
  );

  return response.data;
};

export const getCategoryById = async (categoryId) => {
  const response = await apiClient.get(
    CATALOG_ENDPOINTS.CATEGORY_BY_ID(categoryId)
  );

  return response.data;
};

export const updateCategory = async (
  categoryId,
  categoryData
) => {
  const response = await apiClient.put(
    CATALOG_ENDPOINTS.CATEGORY_BY_ID(categoryId),
    categoryData
  );

  return response.data;
};

export const deactivateCategory = async (
  categoryId
) => {
  const response = await apiClient.patch(
    CATALOG_ENDPOINTS.CATEGORY_STATUS(categoryId),
    null,
    {
      params: {
        active: false,
      },
    }
  );

  return response.data;
};

export const activateCategory = async (
  categoryId
) => {
  const response = await apiClient.patch(
    CATALOG_ENDPOINTS.CATEGORY_STATUS(categoryId),
    null,
    {
      params: {
        active: true,
      },
    }
  );

  return response.data;
};