import apiClient from '../../../api/axiosInstance';
import { CATALOG_ENDPOINTS } from '../../../constants/endpoints.constants';

// Server caps `size` at 100.
const MAX_PAGE_SIZE = 100;

/**
 * Paginated subcategory list / search (scoped to ONE category).
 * GET /api/admin/catalog/subcategories/search
 *
 * @param {object} params
 * @param {string} params.categoryId  REQUIRED
 * @param {string} [params.search]    name contains text (blank = no search)
 * @param {'all'|'active'|'inactive'} [params.status] default 'all'
 * @param {number} [params.page]      0-based
 * @param {number} [params.size]      1..100
 *
 * Response: { success, data: { content, page, size, totalElements, totalPages } }
 */
export const searchSubcategories = async ({
  categoryId,
  search = '',
  status = 'all',
  page = 0,
  size = 20
} = {}) => {
  const params = { categoryId, status, page, size };

  if (search && String(search).trim()) {
    params.search = String(search).trim();
  }

  const response = await apiClient.get(
    CATALOG_ENDPOINTS.SUBCATEGORIES_SEARCH,
    {
      params
    }
  );

  return response.data;
};

/**
 * Fetches EVERY subcategory (all pages) of one category, for dropdowns.
 * Resolves to { success: true, data: [...] } so callers get a plain array.
 */
export const getAllSubcategories = async (categoryId, status = 'all') => {
  const items = [];
  let page = 0;
  let totalPages;

  do {
    const response = await searchSubcategories({
      categoryId,
      status,
      page,
      size: MAX_PAGE_SIZE
    });

    if (!response?.success) {
      return response;
    }

    const pageData = response?.data || {};
    const content = Array.isArray(pageData.content) ? pageData.content : [];

    items.push(...content);

    totalPages = Number(pageData.totalPages) || 1;
    page += 1;
  } while (page < totalPages);

  return { success: true, data: items };
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

/**
 * Reorder a subcategory inside its own category.
 * PATCH /api/admin/catalog/subcategories/{id}/move
 * Send exactly ONE of: { position: n } (1 = top, past the end = bottom)
 *                  or: { afterId: '<uuid>' } (a sibling in the same category)
 */
export const moveSubcategory = async (subcategoryId, moveData) => {
  const response = await apiClient.patch(
    CATALOG_ENDPOINTS.SUBCATEGORY_MOVE(subcategoryId),
    moveData
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

// Backwards-compatible alias
export const getSubcategories = async (params = {}) => {
  if (typeof params === 'string') {
    return getAllSubcategories(params, 'all');
  }
  if (params && params.categoryId && !params.page && !params.size) {
    return getAllSubcategories(params.categoryId, params.status || 'all');
  }
  return searchSubcategories(params);
};

