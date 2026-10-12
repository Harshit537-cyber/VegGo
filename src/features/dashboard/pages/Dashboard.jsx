import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../layouts/Sidebar';
import PageHeader from '../../../components/common/PageHeader';
import SegmentedTabs from '../../../components/common/SegmentedTabs';
import StatusFilterPills from '../../../components/common/StatusFilterPills';
import WorkflowRulesBar from '../../../components/common/WorkflowRulesBar';
import EmptyState from '../../../components/common/EmptyState';
import { fetchComprehensiveDashboardData } from '../services/dashboardService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserRound,
  Store,
  Package,
  IndianRupee,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  ChevronRight,
  Loader2,
  Tag,
  Layers,
  Truck,
  Wallet,
  ShieldAlert,
  Server,
  Eye,
  X,
  Info
} from 'lucide-react';

function AnimatedValue({ value, prefix = '', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === null || value === undefined || value === '') {
      setDisplayValue('0');
      return;
    }

    const targetNum = Number(value);
    if (Number.isNaN(targetNum)) {
      setDisplayValue(String(value));
      return;
    }

    const duration = 800;
    const startTime = performance.now();
    let animationFrameId;

    const updateCount = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = Math.floor(easeProgress * targetNum);

      setDisplayValue(currentValue.toLocaleString('en-IN'));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(targetNum.toLocaleString('en-IN'));
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{prefix}{displayValue}{suffix}</span>;
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recently';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Navigation Tabs matching Product Page Architecture
  const [currentTab, setCurrentTab] = useState('onboarding'); // 'onboarding' | 'catalog' | 'payouts' | 'telemetry'
  const [subFilter, setSubFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedItem, setInspectedItem] = useState(null);

  const [dashboardState, setDashboardState] = useState({
    adminDashboard: {
      totalCustomers: 0,
      totalUsers: 0,
      systemStatus: 'Operational',
      environment: 'Production'
    },
    customerStats: {
      totalCustomers: 0,
      activeThisMonth: 0,
      premiumSubscribers: 0,
      suspendedAccounts: 0
    },
    pendingVendors: { total: 0, items: [] },
    pendingDeliveries: { total: 0, items: [] },
    catalog: { totalProducts: 0, recentProducts: [], totalCategories: 0 },
    finances: { pendingPayoutsTotal: 0, recentPayouts: [], walletBalance: null, currency: 'INR' },
    errors: {}
  });

  const loadDashboardData = async () => {
    setIsRefreshing(true);
    const startTime = Date.now();
    try {
      const data = await fetchComprehensiveDashboardData();
      setDashboardState(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load comprehensive dashboard data:', err);
    } finally {
      const elapsed = Date.now() - startTime;
      const minDuration = 600;
      if (elapsed < minDuration) {
        await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed));
      }
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const { adminDashboard, customerStats, pendingVendors, pendingDeliveries, catalog, finances } = dashboardState;

  const totalPendingApprovals = pendingVendors.total + pendingDeliveries.total;
  const isHealthy = adminDashboard.systemStatus?.toLowerCase() === 'healthy' || adminDashboard.systemStatus?.toLowerCase() === 'operational';

  // Primary Segmented Tabs
  const dashboardTabs = [
    { id: 'onboarding', label: `Pending Approvals (${totalPendingApprovals})`, icon: Store },
    { id: 'catalog', label: `Produce Catalog (${catalog.totalProducts})`, icon: Package },
    { id: 'payouts', label: `Financial Settlements (${finances.pendingPayoutsTotal})`, icon: IndianRupee },
    { id: 'telemetry', label: 'Platform Telemetry', icon: ShieldCheck }
  ];

  // Secondary Filter Pills based on active tab
  const getFilterPills = () => {
    if (currentTab === 'onboarding') {
      return [
        { id: 'ALL', label: 'All Onboarding', count: totalPendingApprovals },
        { id: 'VENDORS', label: 'Vendor Shops', count: pendingVendors.total },
        { id: 'DELIVERY', label: 'Courier Fleets', count: pendingDeliveries.total }
      ];
    }
    if (currentTab === 'catalog') {
      return [
        { id: 'ALL', label: 'All Inventory', count: catalog.totalProducts },
        { id: 'CATEGORIES', label: 'Produce Taxonomies', count: catalog.totalCategories }
      ];
    }
    if (currentTab === 'payouts') {
      return [
        { id: 'ALL', label: 'Pending Payouts', count: finances.pendingPayoutsTotal },
        { id: 'WALLET', label: 'Wallet Standing', count: finances.walletBalance !== null ? 1 : 0 }
      ];
    }
    return [
      { id: 'ALL', label: 'System Health', count: 1 },
      { id: 'CUSTOMERS', label: 'Active Users', count: customerStats.activeThisMonth }
    ];
  };

  // KPI Metric Cards
  const kpiCards = [
    {
      title: 'Total Customers',
      value: customerStats.totalCustomers || adminDashboard.totalCustomers,
      subtitle: `${customerStats.activeThisMonth.toLocaleString('en-IN')} active this month`,
      icon: Users,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      accentBar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      badge: `${customerStats.premiumSubscribers} VIP`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      title: 'Total Platform Users',
      value: adminDashboard.totalUsers,
      subtitle: 'Registered user credentials',
      icon: UserRound,
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      accentBar: 'bg-gradient-to-r from-indigo-500 to-blue-500',
      badge: 'Active Hub',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      title: 'Live Produce Catalog',
      value: catalog.totalProducts,
      subtitle: `${catalog.totalCategories} active taxonomies`,
      icon: Package,
      iconBg: 'bg-teal-50 text-teal-700 border-teal-100',
      accentBar: 'bg-gradient-to-r from-teal-500 to-emerald-500',
      badge: 'In Stock',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      title: 'Pending Onboarding',
      value: totalPendingApprovals,
      subtitle: `${pendingVendors.total} vendors • ${pendingDeliveries.total} drivers`,
      icon: Store,
      iconBg: 'bg-amber-50 text-amber-700 border-amber-100',
      accentBar: 'bg-gradient-to-r from-amber-500 to-orange-500',
      badge: totalPendingApprovals > 0 ? 'Requires Action' : 'All Clear',
      badgeColor: totalPendingApprovals > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'
    }
  ];

  // Unified items list for active tab
  const getTabItems = () => {
    if (currentTab === 'onboarding') {
      const vendorItems = pendingVendors.items.map((v) => ({
        ...v,
        itemType: 'VENDOR',
        typeLabel: 'Vendor Shop',
        title: v.shopName || v.name || `Vendor #${v.shopId}`,
        subtitle: v.ownerName || v.phone || 'Pending Review',
        tag: v.category || 'Retailer',
        date: v.createdAt,
        rawId: v.shopId || v.id,
        statusTone: 'pending',
        statusLabel: 'Pending Review',
        link: '/vendors'
      }));

      const deliveryItems = pendingDeliveries.items.map((d) => ({
        ...d,
        itemType: 'DELIVERY',
        typeLabel: 'Courier Driver',
        title: d.name || `Partner #${d.deliveryPartnerUserId}`,
        subtitle: d.phone || 'Fleet Associate',
        tag: d.vehicleType || 'Courier',
        date: d.createdAt,
        rawId: d.deliveryPartnerUserId || d.id,
        statusTone: 'pending',
        statusLabel: 'Pending Review',
        link: '/delivery'
      }));

      let list = [];
      if (subFilter === 'VENDORS') list = vendorItems;
      else if (subFilter === 'DELIVERY') list = deliveryItems;
      else list = [...vendorItems, ...deliveryItems];

      if (!searchQuery.trim()) return list;
      return list.filter((item) =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tag?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (currentTab === 'catalog') {
      let list = catalog.recentProducts.map((p) => {
        const isActive =
          p.active === true ||
          p.status === 'Active' ||
          p.status === 'ACTIVE' ||
          (p.active !== false && p.status !== 'Inactive' && p.status !== 'INACTIVE');

        return {
          ...p,
          itemType: 'PRODUCT',
          typeLabel: p.categoryName || p.category || 'Catalog Item',
          title: p.name || p.productName || `Produce #${p.id || p.productId}`,
          subtitle: `Price: ₹${Number(p.price ?? 0).toLocaleString('en-IN')}${
            p.originalPrice ? ` (MRP: ₹${Number(p.originalPrice).toLocaleString('en-IN')})` : ''
          }`,
          tag: p.unit || 'Kg',
          unit: p.unit || 'Kg',
          date: p.createdAt || p.updatedAt,
          rawId: p.id || p.productId,
          price: p.price,
          originalPrice: p.originalPrice,
          categoryName: p.categoryName || p.category,
          subcategoryName: p.subcategoryName,
          description: p.description,
          imageUrl: p.imageUrl,
          statusTone: isActive ? 'active' : 'inactive',
          statusLabel: isActive ? 'In Stock' : 'Inactive',
          link: '/products'
        };
      });

      if (!searchQuery.trim()) return list;
      return list.filter((item) =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.typeLabel?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (currentTab === 'payouts') {
      let list = finances.recentPayouts.map((p) => ({
        ...p,
        itemType: 'PAYOUT',
        typeLabel: 'Vendor Payout',
        title: `Disbursement #${p.payoutRequestId || p.id}`,
        subtitle: `Amount: ₹${Number(p.amount ?? 0).toLocaleString('en-IN')}`,
        tag: p.status || 'PENDING',
        date: p.requestedAt || p.createdAt,
        rawId: p.payoutRequestId || p.id,
        amount: p.amount,
        statusTone: p.status === 'PROCESSED' || p.status === 'COMPLETED' ? 'active' : 'pending',
        statusLabel: p.status || 'Pending Payout',
        link: '/payouts'
      }));

      if (!searchQuery.trim()) return list;
      return list.filter((item) =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tag?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (currentTab === 'telemetry') {
      return [
        {
          itemType: 'TELEMETRY',
          typeLabel: 'Infrastructure Core',
          title: `Environment: ${adminDashboard.environment}`,
          subtitle: `Telemetry Status: ${adminDashboard.systemStatus}`,
          tag: 'Production Node',
          date: new Date().toISOString(),
          rawId: 'SYS-CORE-01',
          statusTone: isHealthy ? 'active' : 'pending',
          statusLabel: adminDashboard.systemStatus || 'Operational',
          link: '/dashboard'
        }
      ];
    }

    return [];
  };

  const renderStatusBadge = (item) => {
    if (item.statusTone === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {item.statusLabel || 'In Stock'}
        </span>
      );
    }
    if (item.statusTone === 'inactive') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          {item.statusLabel || 'Inactive'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        {item.statusLabel || 'Pending Review'}
      </span>
    );
  };

  const activeItems = getTabItems();

  return (
    <div className="min-h-dvh bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto max-h-dvh space-y-6">
        {/* Page Header */}
        <PageHeader
          badge="Platform Overview"
          badgeIcon={Activity}
          title="Admin Dashboard"
          subtitle="Track daily operations, review pending approvals, and monitor catalog inventory."
          onRefresh={loadDashboardData}
          isRefreshing={isRefreshing}
          actions={
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-500 shadow-2xs">
              <Clock size={13} className={isRefreshing ? 'text-emerald-500 animate-spin' : 'text-slate-400'} />
              {isRefreshing ? (
                <span className="text-emerald-600">Syncing live data...</span>
              ) : (
                <span>Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              )}
            </span>
          }
        />

        {/* 1. Core Key Performance Indicators (KPIs) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
                className="relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${kpi.accentBar}`} />

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
                      {kpi.title}
                    </span>
                    <div className={`p-2.5 rounded-xl border ${kpi.iconBg} shrink-0`}>
                      <Icon size={17} />
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {loading ? (
                        <span className="text-slate-300 animate-pulse">...</span>
                      ) : (
                        <AnimatedValue value={kpi.value} />
                      )}
                    </h3>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 font-medium truncate text-[11px]">
                    {kpi.subtitle}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold shrink-0 ${kpi.badgeColor}`}>
                    {kpi.badge}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* 2. Primary Segmented Tabs Navigation (Product Page Architecture) */}
        <SegmentedTabs
          tabs={dashboardTabs}
          activeTab={currentTab}
          onTabChange={(tabId) => {
            setCurrentTab(tabId);
            setSubFilter('ALL');
            setSearchQuery('');
          }}
        />

        {/* 3. Secondary Status Filter Pills */}
        <StatusFilterPills
          filters={getFilterPills()}
          activeFilter={subFilter}
          onFilterChange={setSubFilter}
        />

        {/* 4. Workflow Rules Information Bar */}
        <WorkflowRulesBar
          rulesText={
            currentTab === 'onboarding'
              ? 'Review and verify pending KYC documents for vendor shops and delivery partners.'
              : currentTab === 'catalog'
              ? 'Browse fresh produce items, live selling prices, and available stock units.'
              : currentTab === 'payouts'
              ? 'Monitor vendor payout requests and wallet balances awaiting settlement.'
              : 'Live system status, deployment environment, and active customer overview.'
          }
          showingCount={currentTab === 'telemetry' ? 1 : activeItems.length}
          itemLabel={currentTab === 'telemetry' ? 'system telemetry status' : 'active records'}
        />

        {/* 5. Unified Search Input Bar (Except for Telemetry tab) */}
        {currentTab !== 'telemetry' && (
          <div className="relative w-full">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={`Search ${currentTab === 'onboarding' ? 'by vendor shop, owner name, or driver...' : currentTab === 'catalog' ? 'by produce name or unit...' : 'by payout ID or amount...'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 shadow-2xs"
            />
          </div>
        )}

        {/* 6. Master Table Card (Product Page Architecture) */}
        {currentTab === 'telemetry' ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">System Status & Health</h3>
                  <p className="text-xs text-slate-400">Live server status and runtime environment details</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${
                isHealthy ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                {adminDashboard.systemStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Environment</span>
                <p className="text-base font-extrabold text-slate-900 mt-1">{adminDashboard.environment}</p>
                <p className="text-xs text-slate-500 mt-0.5">Active deployment environment</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Active Users</span>
                <p className="text-base font-extrabold text-emerald-700 mt-1">{customerStats.activeThisMonth.toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-500 mt-0.5">Active customers this month</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Wallet Balance</span>
                <p className="text-base font-extrabold text-slate-900 mt-1">
                  {finances.walletBalance !== null ? `₹${Number(finances.walletBalance).toLocaleString('en-IN')}` : 'Active'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Disbursement escrow holding</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/customers')}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition cursor-pointer"
              >
                Customers Directory
              </button>
              <button
                onClick={() => navigate('/operator-roles')}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition cursor-pointer"
              >
                Security Roles
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition cursor-pointer"
              >
                System Settings
              </button>
            </div>
          </div>
        ) : activeItems.length === 0 && !loading ? (
          <EmptyState
            icon={currentTab === 'onboarding' ? Store : currentTab === 'catalog' ? Package : IndianRupee}
            title={currentTab === 'onboarding' ? 'No pending onboarding applications' : currentTab === 'catalog' ? 'No produce items found' : 'No pending payouts found'}
            description={`There are currently no records matching your current filter "${subFilter}" or search.`}
            actionText={currentTab === 'onboarding' ? 'Manage Vendors' : currentTab === 'catalog' ? 'Open Catalog' : 'Review Payouts'}
            onAction={() => navigate(currentTab === 'onboarding' ? '/vendors' : currentTab === 'catalog' ? '/products' : '/payouts')}
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase font-semibold tracking-wider text-slate-600 bg-slate-50/80">
                    <th className="py-4 px-5">Entity / Item Details</th>
                    <th className="py-4 px-5">Classification / Domain</th>
                    <th className="py-4 px-5">Identifier / Code</th>
                    <th className="py-4 px-5">Submission / Updated</th>
                    <th className="py-4 px-5 text-center">Lifecycle Status</th>
                    <th className="py-4 px-5 text-right min-w-[140px]">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Loader2 size={32} className="animate-spin text-emerald-600" />
                          <span className="text-xs font-semibold">Loading platform operational data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    activeItems.map((item, idx) => (
                      <motion.tr
                        key={item.rawId || idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, delay: idx * 0.02 }}
                        className="text-xs font-semibold text-slate-800 hover:bg-emerald-50/40 transition-colors group"
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                              {item.title.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-sm truncate">{item.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5 truncate">{item.subtitle}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {item.tag}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-1">{item.typeLabel}</span>
                        </td>

                        <td className="py-4 px-5 font-mono text-slate-500 text-xs">
                          {item.rawId || 'N/A'}
                        </td>

                        <td className="py-4 px-5 text-slate-500">
                          {formatDate(item.date)}
                        </td>

                        <td className="py-4 px-5 text-center">
                          {renderStatusBadge(item)}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => setInspectedItem(item)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                          >
                            <Eye size={12} />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Product Page Architecture) */}
            <div className="md:hidden divide-y divide-slate-100">
              {activeItems.map((item, idx) => (
                <div key={item.rawId || idx} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {item.title.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{item.title}</p>
                        <p className="text-xs text-slate-400">{item.subtitle}</p>
                      </div>
                    </div>
                    {renderStatusBadge(item)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">{item.tag}</span>
                    <span>{formatDate(item.date)}</span>
                  </div>

                  <button
                    onClick={() => setInspectedItem(item)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Eye size={13} />
                    <span>Inspect Record</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Record Inspector Modal */}
        <AnimatePresence>
          {inspectedItem && (
            <div
              className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setInspectedItem(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col my-8"
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shadow-2xs">
                      {inspectedItem.itemType === 'PRODUCT' && <Package size={20} />}
                      {inspectedItem.itemType === 'VENDOR' && <Store size={20} />}
                      {inspectedItem.itemType === 'DELIVERY' && <Truck size={20} />}
                      {inspectedItem.itemType === 'PAYOUT' && <IndianRupee size={20} />}
                      {inspectedItem.itemType === 'TELEMETRY' && <ShieldCheck size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        Inspect {inspectedItem.typeLabel}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Operational specifications & lifecycle state
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectedItem(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                  {/* Entity Summary Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {inspectedItem.imageUrl ? (
                        <img
                          src={inspectedItem.imageUrl}
                          alt={inspectedItem.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                          {inspectedItem.title.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{inspectedItem.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{inspectedItem.subtitle}</p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {renderStatusBadge(inspectedItem)}
                    </div>
                  </div>

                  {/* Technical / Operational Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Record ID</span>
                      <p className="font-mono font-bold text-slate-800 truncate">{inspectedItem.rawId || 'N/A'}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Classification</span>
                      <p className="font-bold text-slate-800 truncate">{inspectedItem.tag || inspectedItem.typeLabel}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1 col-span-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Submission / Log Timestamp</span>
                      <p className="font-semibold text-slate-700">{formatDate(inspectedItem.date)}</p>
                    </div>

                    {inspectedItem.itemType === 'PRODUCT' && (
                      <>
                        <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Selling Price</span>
                          <p className="font-bold text-emerald-900 text-sm">
                            ₹{Number(inspectedItem.price ?? 0).toLocaleString('en-IN')}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Measurement Unit</span>
                          <p className="font-bold text-slate-800">
                            {inspectedItem.unit || inspectedItem.tag || 'Kg'}
                          </p>
                        </div>

                        {inspectedItem.originalPrice ? (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">MRP / Reference</span>
                            <p className="font-semibold text-slate-600 line-through">
                              ₹{Number(inspectedItem.originalPrice).toLocaleString('en-IN')}
                            </p>
                          </div>
                        ) : null}

                        {inspectedItem.categoryName ? (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Produce Taxonomy</span>
                            <p className="font-bold text-slate-800 truncate">{inspectedItem.categoryName}</p>
                          </div>
                        ) : null}

                        {inspectedItem.description ? (
                          <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1 col-span-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</span>
                            <p className="text-slate-600 leading-relaxed text-xs">{inspectedItem.description}</p>
                          </div>
                        ) : null}
                      </>
                    )}

                    {inspectedItem.itemType === 'VENDOR' && (
                      <>
                        <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Owner Name</span>
                          <p className="font-bold text-slate-800">{inspectedItem.ownerName || 'N/A'}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Contact</span>
                          <p className="font-bold text-slate-800">{inspectedItem.phone || 'N/A'}</p>
                        </div>
                      </>
                    )}

                    {inspectedItem.itemType === 'DELIVERY' && (
                      <>
                        <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Associate Name</span>
                          <p className="font-bold text-slate-800">{inspectedItem.name || 'N/A'}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Contact</span>
                          <p className="font-bold text-slate-800">{inspectedItem.phone || 'N/A'}</p>
                        </div>
                      </>
                    )}

                    {inspectedItem.itemType === 'PAYOUT' && (
                      <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1 col-span-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Disbursement Amount</span>
                        <p className="font-bold text-emerald-900 text-base">
                          ₹{Number(inspectedItem.amount ?? 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setInspectedItem(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition cursor-pointer"
                  >
                    Close Inspector
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const link = inspectedItem.link;
                      const id = inspectedItem.rawId;
                      setInspectedItem(null);
                      navigate(link, { state: { productId: id } });
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>
                      {inspectedItem.itemType === 'PRODUCT'
                        ? 'Open in Product Catalog'
                        : inspectedItem.itemType === 'VENDOR'
                        ? 'Open in Vendor Portal'
                        : inspectedItem.itemType === 'DELIVERY'
                        ? 'Open in Delivery Logistics'
                        : 'Open Detailed View'}
                    </span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}