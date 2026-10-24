import apiClient from "../../../api/axiosInstance";
import { CATALOG_ENDPOINTS } from "../../../constants/endpoints.constants";

// Server caps `size` at 100.
const MAX_PAGE_SIZE = 100;

/**
 * Paginated category list / search.
 * GET /api/admin/catalog/categories/search
 *
 * @param {object} params
 * @param {string} [params.search]  name contains text (blank = no search)
 * @param {'all'|'active'|'inactive'} [params.status] default 'all'
 * @param {number} [params.page]    0-based
 * @param {number} [params.size]    1..100
 *
 * Response: { success, data: { content, page, size, totalElements, totalPages } }
 */
export const searchCategories = async ({
  search = "",
  status = "all",
  page = 0,
  size = 20,
} = {}) => {
  const params = { status, page, size };

  if (search && String(search).trim()) {
    params.search = String(search).trim();
  }

  const response = await apiClient.get(
    CATALOG_ENDPOINTS.CATEGORIES_SEARCH,
    { params }
  );

  return response.data;
};

/**
 * Fetches EVERY category (all pages) for dropdowns / selectors.
 * Resolves to { success: true, data: [...] } so callers get a plain array.
 */
export const getAllCategories = async (status = "all") => {
  const items = [];
  let page = 0;
  let totalPages;

  do {
    const response = await searchCategories({
      status,
      page,
      size: MAX_PAGE_SIZE,
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

/**
 * Reorder a category.
 * PATCH /api/admin/catalog/categories/{id}/move
 * Send exactly ONE of: { position: n } (1 = top, past the end = bottom)
 *                  or: { afterId: '<uuid>' } (place right after that category)
 */
export const moveCategory = async (categoryId, moveData) => {
  const response = await apiClient.patch(
    CATALOG_ENDPOINTS.CATEGORY_MOVE(categoryId),
    moveData
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

// Backwards-compatible alias
export const getCategories = async (includeInactive = false) => {
  return getAllCategories(includeInactive ? 'all' : 'active');
};

