/**
 * Feature-Based Application Route Paths
 * Centralizes all internal routing paths for navigation, redirects, and sidebar menus
 */

export const ROUTES = Object.freeze({
  // Auth
  LOGIN: '/login',

  // Dashboard
  DASHBOARD: '/dashboard',
  DASHBOARD_REVENUE: '/dashboard/revenue',
  DASHBOARD_ORDERS: '/dashboard/orders',
  DASHBOARD_VENDORS: '/dashboard/vendors',

  // Management
  MANAGEMENT: '/management',
  CUSTOMERS: '/management/customers',
  DELIVERY: '/management/delivery',
  VENDORS: '/management/vendors',

  // Payouts & Finance
  WALLET: '/payouts/wallet',
  PAYOUTS: '/payouts/vendors',

  // Orders
  ORDERS: '/orders',
  ORDERS_MONITORING: '/orders/monitoring',

  // Reports
  REPORTS_REVENUE: '/reports/revenue',
  REPORTS_VENDORS: '/reports/vendors',
  REPORTS_DELIVERY: '/reports/delivery',

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_PUSH: '/notifications/push',
  NOTIFICATIONS_PROMOTIONAL: '/notifications/promotional',

  // Products & Catalog
  PRODUCTS: '/products/list',
  CATEGORIES: '/products/categories',
  SUBCATEGORIES: '/products/subcategories',

  // Other Modules
  LOGISTICS: '/logistics',
  ANALYTICS: '/analytics',
  TEAM: '/team',
  SETTINGS: '/settings',
});

export default ROUTES;
