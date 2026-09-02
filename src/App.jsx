
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";

import Login from "./pages/Login";
import OrderStatus from "./pages/Orders";
import ColdChain from "./pages/ColdChain";
import MarketMetrics from "./pages/MarketMetrics";
import OperatorRoles from "./pages/OperatorRoles";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import RevenueOverview from "./pages/RevenueOverview";
import OrderStatistics from "./pages/OrderStatistics";
import VendorStatistics from "./pages/VendorStatistics";
import ViewCustomers from "./pages/ViewCustomers";
import CustomerModeration from "./pages/CustomerModeration";
import ShopApproval from "./pages/ShopApproval";
import ShopSuspension from "./pages/ShopSuspension";
import RiderApproval from "./pages/RiderApproval";
import DocumentVerification from "./pages/DocumentVerification";
import PushNotifications from "./pages/PushNotifications";
import PromotionalNotifications from "./pages/PromotionalNotifications";
import Categories from "./pages/Categories";
import Subcategories from "./pages/Subcategories";
import Products from "./pages/Products";
import LiveOrders from "./pages/LiveOrders";
import OrderMonitoring from "./pages/OrderMonitoring";
import RevenueReports from "./pages/RevenueReports";
import VendorReports from "./pages/VendorReports";
import DeliveryReports from "./pages/DeliveryReports";
import PlatformConfiguration from "./pages/PlatformConfiguration";
import PaymentCommissions from "./pages/PaymentCommissions";
import VendorPayouts from "./pages/VendorPayouts";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/revenue" element={<RevenueOverview />} />
          <Route path="/dashboard/orders" element={<OrderStatistics />} />
          <Route path="/dashboard/vendors" element={<VendorStatistics />} />

          <Route path="/payouts/vendors" element={<VendorPayouts />} />
          <Route path="/payouts/delivery" element={<VendorPayouts />} />
          <Route path="/payouts/refunds" element={<VendorPayouts />} />

          <Route path="/customers/view" element={<ViewCustomers />} />
          <Route
            path="/customers/moderation"
            element={<CustomerModeration />}
          />

          <Route path="/vendors/approval" element={<ShopApproval />} />
          <Route path="/vendors/suspension" element={<ShopSuspension />} />

          <Route path="/delivery/approval" element={<RiderApproval />} />
          <Route
            path="/delivery/verification"
            element={<DocumentVerification />}
          />

          <Route path="/orders" element={<OrderStatus />} />
          <Route path="/orders/live" element={<LiveOrders />} />
          <Route path="/orders/monitoring" element={<OrderMonitoring />} />

          <Route path="/reports/revenue" element={<RevenueReports />} />
          <Route path="/reports/vendors" element={<VendorReports />} />
          <Route path="/reports/delivery" element={<DeliveryReports />} />

          <Route path="/notifications" element={<Notifications />} />
          <Route
            path="/notifications/push"
            element={<PushNotifications />}
          />
          <Route
            path="/notifications/promotional"
            element={<PromotionalNotifications />}
          />

          <Route path="/products/categories" element={<Categories />} />
          <Route
            path="/products/subcategories"
            element={<Subcategories />}
          />
          <Route path="/products/list" element={<Products />} />

          <Route path="/logistics" element={<ColdChain />} />
          <Route path="/analytics" element={<MarketMetrics />} />
          <Route path="/team" element={<OperatorRoles />} />

          <Route path="/settings" element={<Settings />} />
          <Route
            path="/settings/general"
            element={<PlatformConfiguration />}
          />
          <Route
            path="/settings/payments"
            element={<PaymentCommissions />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
