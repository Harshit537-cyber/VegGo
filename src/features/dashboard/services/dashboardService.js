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

// Helper to safely extract list regardless of Spring Pageable or direct array response
const extractList = (raw) => {
  if (!raw) return [];
  const candidates = [
    raw?.content,
    raw?.items,
    raw?.data?.content,
    raw?.data?.items,
    raw?.data?.vendors,
    raw?.data?.shops,
    raw?.data?.applications,
    raw?.data?.products,
    raw?.data,
    raw
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
};

const extractTotal = (raw, list) => {
  if (typeof raw?.totalElements === 'number') return raw.totalElements;
  if (typeof raw?.data?.totalElements === 'number') return raw.data.totalElements;
  if (typeof raw?.total === 'number') return raw.total;
  if (typeof raw?.count === 'number') return raw.count;
  return list.length;
};

// 2. Comprehensive Aggregated Metrics for the Executive Dashboard
export const fetchComprehensiveDashboardData = async () => {
  const results = await Promise.allSettled([
    getAdminDashboard(),
    getCustomerStats(),
    getPendingVendorKyc(),
    getPendingDeliveryKyc(),
    getProducts({ page: 0, size: 20 }),
    getCategories(),
    getPendingPayouts(0, 20),
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

  // Safe parsing helper that handles both axios wrappers and direct payloads
  const getData = (res) => {
    if (res.status !== 'fulfilled') return null;
    if (res.value?.data !== undefined) return res.value.data;
    return res.value;
  };

  const adminDashboard = getData(adminDashboardRes);
  const customerStats = getData(customerStatsRes);
  const vendorKyc = getData(vendorKycRes);
  const deliveryKyc = getData(deliveryKycRes);
  const products = getData(productsRes);
  const categories = getData(categoriesRes);
  const payouts = getData(payoutsRes);
  const wallet = getData(walletRes);

  // Extract arrays robustly
  const vendorList = extractList(vendorKyc);
  const deliveryList = extractList(deliveryKyc);
  const productList = extractList(products);
  const categoryList = extractList(categories);
  const payoutList = extractList(payouts);

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
      total: extractTotal(vendorKyc, vendorList),
      items: vendorList
    },
    pendingDeliveries: {
      total: extractTotal(deliveryKyc, deliveryList),
      items: deliveryList
    },
    // Catalog & Produce
    catalog: {
      totalProducts: extractTotal(products, productList),
      recentProducts: productList,
      totalCategories: extractTotal(categories, categoryList)
    },
    // Financials
    finances: {
      pendingPayoutsTotal: extractTotal(payouts, payoutList),
      recentPayouts: payoutList,
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
