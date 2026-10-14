import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES } from '../constants/routes.constants';

// Auth Feature
const Login = lazy(() => import('../features/auth/pages/Login'));

// Dashboard Feature
const Dashboard = lazy(() => import('../features/dashboard/pages/Dashboard'));


// Products Feature
const Products = lazy(() => import('../features/products/pages/Products'));
const Categories = lazy(() => import('../features/products/pages/Categories'));
const Subcategories = lazy(() => import('../features/products/pages/Subcategories'));

// Management Feature
const Management = lazy(() => import('../features/management/pages/Management'));

// Customers Feature
const Customer = lazy(() => import('../features/customers/pages/Customer'));

// Vendors Feature
const Vendor = lazy(() => import('../features/vendors/pages/Vendor'));
const VendorStatistics = lazy(() => import('../features/vendors/pages/VendorStatistics'));
// Delivery Feature
const Delivery = lazy(() => import('../features/delivery/pages/Delivery'));

// Payouts Feature
const Payouts = lazy(() => import('../features/payouts/pages/Payouts'));
const Wallet = lazy(() => import('../features/payouts/pages/Wallet'));

// Complaints Feature
const Complaints = lazy(() => import('../features/complaints/pages/Complaints'));

// Logistics Feature
const ColdChain = lazy(() => import('../features/logistics/pages/ColdChain'));

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
        <Route path={ROUTES.LOGIN} element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.DASHBOARD_REVENUE} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD_ORDERS} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD_VENDORS} element={<VendorStatistics />} />

          <Route path={ROUTES.MANAGEMENT} element={<Management defaultTab="vendors" />} />
          <Route path={ROUTES.CUSTOMERS} element={<Management defaultTab="customers" />} />
          <Route path={ROUTES.DELIVERY} element={<Management defaultTab="delivery" />} />
          <Route path={ROUTES.VENDORS} element={<Management defaultTab="vendors" />} />

          <Route path={ROUTES.WALLET} element={<Payouts defaultTab="wallet" />} />
          <Route path={ROUTES.PAYOUTS} element={<Payouts defaultTab="payouts" />} />

          <Route path={ROUTES.COMPLAINTS} element={<Complaints />} />

          <Route path={ROUTES.ORDERS} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.ORDERS_MONITORING} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path="/dashboard/orders-monitoring" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

          <Route path={ROUTES.REPORTS_REVENUE} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.REPORTS_VENDORS} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.REPORTS_DELIVERY} element={<Navigate to={ROUTES.DASHBOARD} replace />} />

          <Route path={ROUTES.NOTIFICATIONS} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.NOTIFICATIONS_PUSH} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.NOTIFICATIONS_PROMOTIONAL} element={<Navigate to={ROUTES.DASHBOARD} replace />} />

          <Route path={ROUTES.CATEGORIES} element={<Products defaultTab="categories" />} />
          <Route path={ROUTES.SUBCATEGORIES} element={<Products defaultTab="subcategories" />} />
          <Route path={ROUTES.PRODUCTS} element={<Products defaultTab="products" />} />

          <Route path={ROUTES.LOGISTICS} element={<ColdChain />} />
          <Route path={ROUTES.ANALYTICS} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.TEAM} element={<OperatorRoles />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </Suspense>
  );
}
