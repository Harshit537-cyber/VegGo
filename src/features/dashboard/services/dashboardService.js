import apiClient from '../../../api/axiosInstance';
import { getCustomerStats } from '../../customers/services/customerService';
import { getPendingVendorKyc } from '../../vendors/services/vendorKycService';
import { getPendingDeliveryKyc } from '../../delivery/services/deliveryPartnerKycService';
import { getProducts } from '../../products/services/productService';
import { getCategories } from '../../products/services/categoryService';
import { getPendingPayouts } from '../../payouts/services/vendorPayouts';
import { getWalletBalance } from '../../payouts/services/wallet';

// 1. Direct Core Admin Dashboard API
export const getAdminDashboard = async () => {
  const response = await apiClient.get('/api/admin/dashboard');
  return response.data;
};

// 2. Comprehensive Aggregated Metrics for the Executive Dashboard
export const fetchComprehensiveDashboardData = async () => {
  const results = await Promise.allSettled([
    getAdminDashboard(),
    getCustomerStats(),
    getPendingVendorKyc(),
    getPendingDeliveryKyc(),
    getProducts({ page: 0, size: 5 }),
    getCategories(),
    getPendingPayouts(0, 5),
    getWalletBalance()
  ]);

  const [
    adminDashboardRes,
    customerStatsRes,
    vendorKycRes,
    deliveryKycRes,
    productsRes,
    categoriesRes,
    payoutsRes,
    walletRes
  ] = results;

  // Safe parsing helper
  const getData = (res) => (res.status === 'fulfilled' && res.value?.data ? res.value.data : null);

  const adminDashboard = getData(adminDashboardRes) || (adminDashboardRes.status === 'fulfilled' ? adminDashboardRes.value : null);
  const customerStats = getData(customerStatsRes);
  const vendorKyc = getData(vendorKycRes);
  const deliveryKyc = getData(deliveryKycRes);
  const products = getData(productsRes);
  const categories = getData(categoriesRes);
  const payouts = getData(payoutsRes);
  const wallet = getData(walletRes);

  // Extract arrays safely
  const vendorList = Array.isArray(vendorKyc?.content)
    ? vendorKyc.content
    : Array.isArray(vendorKyc)
    ? vendorKyc
    : [];

  const deliveryList = Array.isArray(deliveryKyc?.content)
    ? deliveryKyc.content
    : Array.isArray(deliveryKyc)
    ? deliveryKyc
    : [];

  const productList = Array.isArray(products?.content)
    ? products.content
    : Array.isArray(products)
    ? products
    : [];

  const categoryList = Array.isArray(categories)
    ? categories
    : Array.isArray(categories?.content)
    ? categories.content
    : [];

  const payoutList = Array.isArray(payouts?.content)
    ? payouts.content
    : Array.isArray(payouts)
    ? payouts
    : [];

  return {
    // Platform Core
    adminDashboard: {
      totalCustomers: adminDashboard?.totalCustomers ?? 0,
      totalUsers: adminDashboard?.totalUsers ?? 0,
      systemStatus: adminDashboard?.systemStatus || 'Operational',
      environment: adminDashboard?.environment || 'Production'
    },
    // Customer Metrics
    customerStats: {
      totalCustomers: customerStats?.totalCustomers ?? adminDashboard?.totalCustomers ?? 0,
      activeThisMonth: customerStats?.activeThisMonth ?? 0,
      premiumSubscribers: customerStats?.premiumSubscribers ?? 0,
      suspendedAccounts: customerStats?.suspendedAccounts ?? customerStats?.suspendedOrBlocked ?? 0
    },
    // Pending Approvals & Operations Queue
    pendingVendors: {
      total: vendorKyc?.totalElements ?? vendorList.length,
      items: vendorList.slice(0, 5)
    },
    pendingDeliveries: {
      total: deliveryKyc?.totalElements ?? deliveryList.length,
      items: deliveryList.slice(0, 5)
    },
    // Catalog & Produce
    catalog: {
      totalProducts: products?.totalElements ?? productList.length,
      recentProducts: productList.slice(0, 5),
      totalCategories: categoryList.length
    },
    // Financials
    finances: {
      pendingPayoutsTotal: payouts?.totalElements ?? payoutList.length,
      recentPayouts: payoutList.slice(0, 5),
      walletBalance: wallet?.balance ?? wallet?.currentBalance ?? null,
      currency: wallet?.currency || 'INR'
    },
    errors: {
      adminDashboard: adminDashboardRes.status === 'rejected' ? adminDashboardRes.reason?.message : null,
      customerStats: customerStatsRes.status === 'rejected' ? customerStatsRes.reason?.message : null,
      vendorKyc: vendorKycRes.status === 'rejected' ? vendorKycRes.reason?.message : null,
      deliveryKyc: deliveryKycRes.status === 'rejected' ? deliveryKycRes.reason?.message : null,
      products: productsRes.status === 'rejected' ? productsRes.reason?.message : null,
      categories: categoriesRes.status === 'rejected' ? categoriesRes.reason?.message : null,
      payouts: payoutsRes.status === 'rejected' ? payoutsRes.reason?.message : null,
      wallet: walletRes.status === 'rejected' ? walletRes.reason?.message : null
    }
  };
};
