/**
 * API Configuration Constants
 * Centralizes client network parameters and default base URLs
 */

export const API_CONFIG = Object.freeze({
  DEFAULT_BASE_URL: 'https://api.veggofresh.in',
  DEFAULT_TIMEOUT: 15000,
  HEADERS: {
    JSON: 'application/json',
  },
  AUTH_STORAGE_KEY: 'admin_token',
  USER_STORAGE_KEY: 'admin_user',
});

export const { DEFAULT_BASE_URL, DEFAULT_TIMEOUT, API_HEADERS } = API_CONFIG;

export default API_CONFIG;
