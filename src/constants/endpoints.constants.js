/**
 * Feature-Based API Endpoints
 * Centralizes all backend REST endpoints categorized by module
 */

// Authentication & Session
export const AUTH_ENDPOINTS = Object.freeze({
  LOGIN: '/api/auth/admin/login',
});

// Admin Dashboard & Telemetry
export const DASHBOARD_ENDPOINTS = Object.freeze({
  OVERVIEW: '/api/admin/dashboard',
});

// Customer Management & Moderation
export const CUSTOMER_ENDPOINTS = Object.freeze({
  STATS: '/api/admin/customers/stats',
  BASE: '/api/admin/customers',
  DETAILS: (customerUserId) => `/api/admin/customers/${customerUserId}`,
  DELETE: (customerUserId) => `/api/admin/customers/${customerUserId}`,
  BLOCK: (customerUserId) => `/api/admin/customers/${customerUserId}/block`,
  UNBLOCK: (customerUserId) => `/api/admin/customers/${customerUserId}/unblock`,
  MODERATION_STATS: '/api/admin/customers/moderation/stats',
  MODERATION_LIST: '/api/admin/customers/moderation',
});

// Vendor Partner Verification & KYC
export const VENDOR_ENDPOINTS = Object.freeze({
  KYC_PENDING: '/api/admin/vendors/kyc/pending',
  KYC_DETAIL: (vendorShopId) => `/api/admin/vendors/kyc/${vendorShopId}`,
  KYC_APPROVE: (vendorShopId) => `/api/admin/vendors/kyc/${vendorShopId}/approve`,
  KYC_REJECT: (vendorShopId) => `/api/admin/vendors/kyc/${vendorShopId}/reject`,
});

// Delivery Fleet Verification & KYC
export const DELIVERY_ENDPOINTS = Object.freeze({
  KYC_PENDING: '/api/admin/delivery-partners/kyc/pending',
  KYC_DETAIL: (deliveryPartnerUserId) => `/api/admin/delivery-partners/kyc/${deliveryPartnerUserId}`,
  KYC_APPROVE: (deliveryPartnerUserId) => `/api/admin/delivery-partners/kyc/${deliveryPartnerUserId}/approve`,
  KYC_REJECT: (deliveryPartnerUserId) => `/api/admin/delivery-partners/kyc/${deliveryPartnerUserId}/reject`,
});

// Produce Catalog, Categories, and Subcategories
export const CATALOG_ENDPOINTS = Object.freeze({
  PRODUCTS: '/api/admin/catalog/products',
  PRODUCT_BY_ID: (productId) => `/api/admin/catalog/products/${productId}`,
  PRODUCT_STATUS: (productId) => `/api/admin/catalog/products/${productId}/status`,
  PRODUCT_IMAGES: (productId) => `/api/admin/catalog/products/${productId}/images`,
  PRODUCT_IMAGE_DELETE: (productId, imageId) => `/api/admin/catalog/products/${productId}/images/${imageId}`,
  PRODUCT_IMAGES_REORDER: (productId) => `/api/admin/catalog/products/${productId}/images/reorder`,
  CATEGORIES: '/api/admin/catalog/categories',
  CATEGORY_BY_ID: (categoryId) => `/api/admin/catalog/categories/${categoryId}`,
  CATEGORY_STATUS: (categoryId) => `/api/admin/catalog/categories/${categoryId}/status`,
  SUBCATEGORIES: '/api/admin/catalog/subcategories',
  SUBCATEGORY_BY_ID: (subcategoryId) => `/api/admin/catalog/subcategories/${subcategoryId}`,
  SUBCATEGORY_STATUS: (subcategoryId) => `/api/admin/catalog/subcategories/${subcategoryId}/status`,
});

// Payouts & Platform Wallet
export const PAYOUT_ENDPOINTS = Object.freeze({
  PAYOUTS: '/api/v1/admin/payouts',
  APPROVE: (payoutRequestId) => `/api/v1/admin/payouts/${payoutRequestId}/approve`,
  REJECT: (payoutRequestId) => `/api/v1/admin/payouts/${payoutRequestId}/reject`,
  WALLET_BALANCE: '/api/payment/wallet/balance',
  WALLET_TRANSACTIONS: '/api/payment/wallet/transactions',
});

// Platform Settings
export const SETTINGS_ENDPOINTS = Object.freeze({
  SETTINGS: '/api/admin/settings',
});

// Unified Endpoints Registry
export const ENDPOINTS = Object.freeze({
  AUTH: AUTH_ENDPOINTS,
  DASHBOARD: DASHBOARD_ENDPOINTS,
  CUSTOMERS: CUSTOMER_ENDPOINTS,
  VENDORS: VENDOR_ENDPOINTS,
  DELIVERY: DELIVERY_ENDPOINTS,
  CATALOG: CATALOG_ENDPOINTS,
  PAYOUTS: PAYOUT_ENDPOINTS,
  SETTINGS: SETTINGS_ENDPOINTS,
});

export default ENDPOINTS;
