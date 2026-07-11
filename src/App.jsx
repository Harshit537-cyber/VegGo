import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../src/pages/Login';
import Dashboard from '../src/components/Dashboard';
import OrderStatus from '../src/pages/Orders';
import ColdChain from '../src/pages/ColdChain';
import MarketMetrics from '../src/pages/MarketMetrics';
import OperatorRoles from '../src/pages/OperatorRoles';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import RevenueOverview from './pages/RevenueOverview';
import OrderStatistics from './pages/OrderStatistics';
import VendorStatistics from './pages/VendorStatistics';
import ViewCustomers from './pages/ViewCustomers';
import CustomerModeration from './pages/CustomerModeration';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/revenue" element={<RevenueOverview />} />
        <Route path="/dashboard/orders" element={<OrderStatistics />} />
        <Route path="/dashboard/vendors" element={<VendorStatistics />} />
         <Route path="/customers/view" element={<ViewCustomers />} />
          <Route path="/customers/moderation" element={<CustomerModeration />} />
        <Route path="/orders" element={<OrderStatus />} />
        <Route path="/logistics" element={<ColdChain />} />
        <Route path="/analytics" element={<MarketMetrics />} />
        <Route path="/team" element={<OperatorRoles />} />
         <Route path="/notifications" element={<Notifications />} />
         <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}