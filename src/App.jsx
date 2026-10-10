import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
const Dashboard = lazy(() => import("./components/Dashboard"));

import Login from "./pages/Login";
const Orders = lazy(() => import("./pages/Orders"));
const ColdChain = lazy(() => import("./pages/ColdChain"));
const MarketMetrics = lazy(() => import("./pages/MarketMetrics"));
const OperatorRoles = lazy(() => import("./pages/OperatorRoles"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));
const RevenueOverview = lazy(() => import("./pages/RevenueOverview"));
const OrderStatistics = lazy(() => import("./pages/OrderStatistics"));
const VendorStatistics = lazy(() => import("./pages/VendorStatistics"));

const Customer = lazy(() => import("./pages/Customer"));
const Delivery = lazy(() => import("./pages/Delivery"));
const Vendor = lazy(() => import("./pages/Vendor"));

const PushNotifications = lazy(() => import("./pages/PushNotifications"));
const PromotionalNotifications = lazy(() => import("./pages/PromotionalNotifications"));

const Categories = lazy(() => import("./pages/Categories"));
const Subcategories = lazy(() => import("./pages/Subcategories"));
const Products = lazy(() => import("./pages/Products"));

const OrderMonitoring = lazy(() => import("./pages/OrderMonitoring"));

const RevenueReports = lazy(() => import("./pages/RevenueReports"));
const VendorReports = lazy(() => import("./pages/VendorReports"));
const DeliveryReports = lazy(() => import("./pages/DeliveryReports"));

const Wallet = lazy(() => import("./pages/Wallet"));
const Payouts = lazy(() => import("./pages/Payouts"));

function PageLoader() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-slate-100/70">
      <div className="h-10 w-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/dashboard/revenue"
            element={<RevenueOverview />}
          />

          <Route
            path="/dashboard/orders"
            element={<OrderStatistics />}
          />

          <Route
            path="/dashboard/vendors"
            element={<VendorStatistics />}
          />

          <Route
            path="/management/customers"
            element={<Customer />}
          />

          <Route
            path="/management/delivery"
            element={<Delivery />}
          />

          <Route
            path="/management/vendors"
            element={<Vendor />}
          />

          <Route
            path="/payouts/wallet"
            element={<Wallet />}
          />

          <Route
            path="/payouts/vendors"
            element={<Payouts />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/orders/monitoring"
            element={<OrderMonitoring />}
          />

          <Route
            path="/reports/revenue"
            element={<RevenueReports />}
          />

          <Route
            path="/reports/vendors"
            element={<VendorReports />}
          />

          <Route
            path="/reports/delivery"
            element={<DeliveryReports />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route
            path="/notifications/push"
            element={<PushNotifications />}
          />

          <Route
            path="/notifications/promotional"
            element={<PromotionalNotifications />}
          />

          <Route
            path="/products/categories"
            element={<Categories />}
          />

          <Route
            path="/products/subcategories"
            element={<Subcategories />}
          />

          <Route
            path="/products/list"
            element={<Products />}
          />

          <Route
            path="/logistics"
            element={<ColdChain />}
          />

          <Route
            path="/analytics"
            element={<MarketMetrics />}
          />

          <Route
            path="/team"
            element={<OperatorRoles />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
      </Suspense>
    </Router>
  );
}