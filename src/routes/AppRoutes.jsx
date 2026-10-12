import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Auth Feature
const Login = lazy(() => import('../features/auth/pages/Login'));

// Dashboard Feature
const Dashboard = lazy(() => import('../features/dashboard/pages/Dashboard'));

// Orders Feature
const Orders = lazy(() => import('../features/orders/pages/Orders'));
const OrderMonitoring = lazy(() => import('../features/orders/pages/OrderMonitoring'));
const OrderStatistics = lazy(() => import('../features/orders/pages/OrderStatistics'));

// Products Feature
const Products = lazy(() => import('../features/products/pages/Products'));
const Categories = lazy(() => import('../features/products/pages/Categories'));
const Subcategories = lazy(() => import('../features/products/pages/Subcategories'));

// Customers Feature
const Customer = lazy(() => import('../features/customers/pages/Customer'));

// Vendors Feature
const Vendor = lazy(() => import('../features/vendors/pages/Vendor'));
const VendorStatistics = lazy(() => import('../features/vendors/pages/VendorStatistics'));
const VendorReports = lazy(() => import('../features/vendors/pages/VendorReports'));

// Delivery Feature
const Delivery = lazy(() => import('../features/delivery/pages/Delivery'));
const DeliveryReports = lazy(() => import('../features/delivery/pages/DeliveryReports'));

// Payouts Feature
const Payouts = lazy(() => import('../features/payouts/pages/Payouts'));
const Wallet = lazy(() => import('../features/payouts/pages/Wallet'));

// Revenue Feature
const RevenueOverview = lazy(() => import('../features/revenue/pages/RevenueOverview'));
const RevenueReports = lazy(() => import('../features/revenue/pages/RevenueReports'));

// Logistics Feature
const ColdChain = lazy(() => import('../features/logistics/pages/ColdChain'));

// Analytics Feature
const MarketMetrics = lazy(() => import('../features/analytics/pages/MarketMetrics'));

// Notifications Feature
const Notifications = lazy(() => import('../features/notifications/pages/Notifications'));
const PushNotifications = lazy(() => import('../features/notifications/pages/PushNotifications'));
const PromotionalNotifications = lazy(() => import('../features/notifications/pages/PromotionalNotifications'));

// Team Feature
const OperatorRoles = lazy(() => import('../features/team/pages/OperatorRoles'));

// Settings Feature
const Settings = lazy(() => import('../features/settings/pages/Settings'));

export function PageLoader() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-slate-100/70">
      <div className="h-10 w-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/revenue" element={<RevenueOverview />} />
          <Route path="/dashboard/orders" element={<OrderStatistics />} />
          <Route path="/dashboard/vendors" element={<VendorStatistics />} />

          <Route path="/management/customers" element={<Customer />} />
          <Route path="/management/delivery" element={<Delivery />} />
          <Route path="/management/vendors" element={<Vendor />} />

          <Route path="/payouts/wallet" element={<Wallet />} />
          <Route path="/payouts/vendors" element={<Payouts />} />

          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/monitoring" element={<OrderMonitoring />} />
          <Route path="/dashboard/orders-monitoring" element={<Navigate to="/orders" replace />} />

          <Route path="/reports/revenue" element={<RevenueReports />} />
          <Route path="/reports/vendors" element={<VendorReports />} />
          <Route path="/reports/delivery" element={<DeliveryReports />} />

          <Route path="/notifications" element={<Notifications />} />
          <Route path="/notifications/push" element={<PushNotifications />} />
          <Route path="/notifications/promotional" element={<PromotionalNotifications />} />

          <Route path="/products/categories" element={<Categories />} />
          <Route path="/products/subcategories" element={<Subcategories />} />
          <Route path="/products/list" element={<Products />} />

          <Route path="/logistics" element={<ColdChain />} />
          <Route path="/analytics" element={<MarketMetrics />} />
          <Route path="/team" element={<OperatorRoles />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
