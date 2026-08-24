import apiClient from '../Interceptor/axiosInstance';

export const getProducts = async (params = {}) => {
  const response = await apiClient.get(
    '/api/admin/catalog/products',
    {
      params: {
        search: '',
        page: 0,
        size: 20,
        ...params,
      },
    }
  );

  return response.data;
};

export const createProduct = async (productData) => {
  const response = await apiClient.post(
    '/api/admin/catalog/products',
    productData
  );

  return response.data;
};

export const getProductById = async (productId) => {
  const response = await apiClient.get(
    `/api/admin/catalog/products/${productId}`
  );

  return response.data;
};

export const updateProduct = async (
  productId,
  productData
) => {
  const response = await apiClient.put(
    `/api/admin/catalog/products/${productId}`,
    productData
  );

  return response.data;
};

export const deactivateProduct = async (
  productId
) => {
  const response = await apiClient.patch(
    `/api/admin/catalog/products/${productId}/status`,
    null,
    {
      params: {
        active: false,
      },
    }
  );

  return response.data;
};

export const activateProduct = async (
  productId
) => {
  const response = await apiClient.patch(
    `/api/admin/catalog/products/${productId}/status`,
    null,
    {
      params: {
        active: true,
      },
    }
  );

  return response.data;
};