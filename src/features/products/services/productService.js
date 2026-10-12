
import apiClient from '../../../api/axiosInstance'

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
  )

  return response.data
}

export const createProduct = async (
  productData,
  images = []
) => {
  const formData = new FormData()

  formData.append('name', productData.name || '')
  formData.append('description', productData.description || '')
  formData.append('categoryId', productData.categoryId || '')
  formData.append('subcategoryId', productData.subcategoryId || '')
  formData.append('price', String(productData.price ?? ''))
  formData.append(
    'originalPrice',
    String(productData.originalPrice ?? '')
  )
  formData.append('unit', productData.unit || '')

  if (
    productData.discountPercent !== undefined &&
    productData.discountPercent !== null &&
    productData.discountPercent !== ''
  ) {
    formData.append(
      'discountPercent',
      String(productData.discountPercent)
    )
  }

  formData.append(
    'active',
    String(productData.active ?? true)
  )

  const imageFiles = Array.isArray(images)
    ? images
    : images
      ? [images]
      : []

  imageFiles.forEach((image) => {
    if (image instanceof File || image instanceof Blob) {
      formData.append('images', image)
    }
  })

  const response = await apiClient.post(
    '/api/admin/catalog/products',
    formData
  )

  return response.data
}

export const getProductById = async (productId) => {
  const response = await apiClient.get(
    `/api/admin/catalog/products/${productId}`
  )

  return response.data
}

export const updateProduct = async (
  productId,
  productData
) => {
  const response = await apiClient.put(
    `/api/admin/catalog/products/${productId}`,
    productData
  )

  return response.data
}

export const deactivateProduct = async (productId) => {
  const response = await apiClient.patch(
    `/api/admin/catalog/products/${productId}/status`,
    null,
    {
      params: {
        active: false,
      },
    }
  )

  return response.data
}

export const activateProduct = async (productId) => {
  const response = await apiClient.patch(
    `/api/admin/catalog/products/${productId}/status`,
    null,
    {
      params: {
        active: true,
      },
    }
  )

  return response.data
}

export const addProductImages = async (
  productId,
  images
) => {
  const formData = new FormData()

  const imageFiles = Array.isArray(images)
    ? images
    : images
      ? [images]
      : []

  imageFiles.forEach((image) => {
    if (image instanceof File || image instanceof Blob) {
      formData.append('images', image)
    }
  })

  const response = await apiClient.post(
    `/api/admin/catalog/products/${productId}/images`,
    formData
  )

  return response.data
}

export const getProductImages = async (productId) => {
  const response = await apiClient.get(
    `/api/admin/catalog/products/${productId}/images`
  )

  return response.data
}

export const deleteProductImage = async (
  productId,
  productImageId
) => {
  const response = await apiClient.delete(
    `/api/admin/catalog/products/${productId}/images/${productImageId}`
  )

  return response.data
}

export const reorderProductImages = async (
  productId,
  imageIds
) => {
  const response = await apiClient.put(
    `/api/admin/catalog/products/${productId}/images/reorder`,
    {
      imageIds,
    }
  )

  return response.data
}

export const getCategories = async () => {
  const response = await apiClient.get(
    '/api/admin/catalog/categories'
  )

  return response.data
}

export const getSubcategories = async (categoryId) => {
  const response = await apiClient.get(
    '/api/admin/catalog/subcategories',
    {
      params: {
        categoryId,
      },
    }
  )

  return response.data
}


