import apiClient from "../Interceptor/axiosInstance";

export const getCategories = async (
  includeInactive = false
) => {
  const response = await apiClient.get(
    "/api/admin/catalog/categories",
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
    "/api/admin/catalog/categories",
    categoryData
  );

  return response.data;
};

export const getCategoryById = async (categoryId) => {
  const response = await apiClient.get(
    `/api/admin/catalog/categories/${categoryId}`
  );

  return response.data;
};

export const updateCategory = async (
  categoryId,
  categoryData
) => {
  const response = await apiClient.put(
    `/api/admin/catalog/categories/${categoryId}`,
    categoryData
  );

  return response.data;
};

export const deactivateCategory = async (
  categoryId
) => {
  const response = await apiClient.patch(
    `/api/admin/catalog/categories/${categoryId}/status`,
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
    `/api/admin/catalog/categories/${categoryId}/status`,
    null,
    {
      params: {
        active: true,
      },
    }
  );

  return response.data;
};