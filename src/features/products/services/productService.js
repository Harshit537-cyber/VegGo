import apiClient from '../../../api/axiosInstance';
import { CATALOG_ENDPOINTS } from '../../../constants/endpoints.constants';

export const getProducts = async (params = {}) => {
  const response = await apiClient.get(
    CATALOG_ENDPOINTS.PRODUCTS,
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

export const createProduct = async (
  productData,
  images = []
) => {
  const formData = new FormData();

  formData.append('name', productData.name || '');
  formData.append('description', productData.description || '');
  formData.append('categoryId', productData.categoryId || '');
  formData.append('subcategoryId', productData.subcategoryId || '');
  formData.append('price', String(productData.price ?? ''));
  formData.append('originalPrice', String(productData.originalPrice ?? ''));
  formData.append('unit', productData.unit || 'Kg');
  formData.append('stockQuantity', String(productData.stockQuantity ?? '0'));
  formData.append('sku', productData.sku || '');
  formData.append('barcode', productData.barcode || '');
  formData.append('shelfLifeDays', String(productData.shelfLifeDays ?? ''));
  formData.append('storageTip', productData.storageTip || '');
  formData.append('origin', productData.origin || '');
  formData.append('nutritionalInfo', productData.nutritionalInfo || '');

  formData.append('active', String(productData.active ?? true));
  formData.append('fresh', String(productData.fresh ?? true));
  formData.append('organic', String(productData.organic ?? false));
  formData.append('seasonal', String(productData.seasonal ?? false));
  formData.append('tags', Array.isArray(productData.tags) ? productData.tags.join(',') : '');

  const imageFiles = Array.isArray(images)
    ? images
    : images
      ? [images]
      : [];

  imageFiles.forEach((image) => {
    if (image instanceof File || image instanceof Blob) {
      formData.append('images', image);
    }
  });

  const response = await apiClient.post(
    CATALOG_ENDPOINTS.PRODUCTS,
    formData
  );

  return response.data;
};

export const getProductById = async (productId) => {
  const response = await apiClient.get(
    CATALOG_ENDPOINTS.PRODUCT_BY_ID(productId)
  );

  return response.data;
};

export const updateProduct = async (
  productId,
  productData
) => {
  const response = await apiClient.put(
    CATALOG_ENDPOINTS.PRODUCT_BY_ID(productId),
    productData
  );

  return response.data;
};

export const deactivateProduct = async (productId) => {
  const response = await apiClient.patch(
    CATALOG_ENDPOINTS.PRODUCT_STATUS(productId),
    null,
    {
      params: {
        active: false,
      },
    }
  );

  return response.data;
};

export const activateProduct = async (productId) => {
  const response = await apiClient.patch(
    CATALOG_ENDPOINTS.PRODUCT_STATUS(productId),
    null,
    {
      params: {
        active: true,
      },
    }
  );

  return response.data;
};

export const addProductImages = async (
  productId,
  images
) => {
  const formData = new FormData();

  const imageFiles = Array.isArray(images)
    ? images
    : images
      ? [images]
      : [];

  imageFiles.forEach((image) => {
    if (image instanceof File || image instanceof Blob) {
      formData.append('images', image);
    }
  });

  const response = await apiClient.post(
    CATALOG_ENDPOINTS.PRODUCT_IMAGES(productId),
    formData
  );

  return response.data;
};

export const getProductImages = async (productId) => {
  const response = await apiClient.get(
    CATALOG_ENDPOINTS.PRODUCT_IMAGES(productId)
  );

  return response.data;
};

export const deleteProductImage = async (
  productId,
  productImageId
) => {
  const response = await apiClient.delete(
    CATALOG_ENDPOINTS.PRODUCT_IMAGE_DELETE(productId, productImageId)
  );

  return response.data;
};

export const reorderProductImages = async (
  productId,
  imageIds
) => {
  const response = await apiClient.put(
    CATALOG_ENDPOINTS.PRODUCT_IMAGES_REORDER(productId),
    {
      imageIds,
    }
  );

  return response.data;
};

export const getCategories = async () => {
  const response = await apiClient.get(
    CATALOG_ENDPOINTS.CATEGORIES
  );

  return response.data;
};

export const getSubcategories = async (categoryId) => {
  const response = await apiClient.get(
    CATALOG_ENDPOINTS.SUBCATEGORIES,
    {
      params: {
        categoryId,
      },
    }
  );

  return response.data;
};
