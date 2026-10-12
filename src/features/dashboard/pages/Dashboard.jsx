import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../layouts/Sidebar';
import PageHeader from '../../../components/common/PageHeader';
import { fetchComprehensiveDashboardData } from '../services/dashboardService';
import { motion } from 'framer-motion';
import {
  Users,
  UserRound,
  Store,
  Package,
  IndianRupee,
  ShieldCheck,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowUpRight
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
  const [approvalTab, setApprovalTab] = useState('vendors'); // 'vendors' | 'delivery'

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

  const isHealthy = adminDashboard.systemStatus?.toLowerCase() === 'healthy' || adminDashboard.systemStatus?.toLowerCase() === 'operational';
  const totalPendingApprovals = pendingVendors.total + pendingDeliveries.total;

  // Key KPI Cards using existing VegGo palette
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
      title: 'Total Users',
      value: adminDashboard.totalUsers,
      subtitle: 'Platform registered accounts',
      icon: UserRound,
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      accentBar: 'bg-gradient-to-r from-indigo-500 to-blue-500',
      badge: 'Verified',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      title: 'Produce Catalog',
      value: catalog.totalProducts,
      subtitle: `${catalog.totalCategories} active taxonomies`,
      icon: Package,
      iconBg: 'bg-teal-50 text-teal-700 border-teal-100',
      accentBar: 'bg-gradient-to-r from-teal-500 to-emerald-500',
      badge: 'Live Stock',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      title: 'Pending Onboarding',
      value: totalPendingApprovals,
      subtitle: `${pendingVendors.total} vendors • ${pendingDeliveries.total} drivers`,
      icon: Store,
      iconBg: 'bg-amber-50 text-amber-700 border-amber-100',
      accentBar: 'bg-gradient-to-r from-amber-500 to-orange-500',
      badge: totalPendingApprovals > 0 ? 'Action Needed' : 'All Clear',
      badgeColor: totalPendingApprovals > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'
    }
  ];

  return (
    <div className="min-h-dvh bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto max-h-dvh space-y-6 sm:space-y-8">
        {/* Page Header */}
        <PageHeader
          badge="Executive Console"
          badgeIcon={Activity}
          title="VegGo Operations Center"
          subtitle="Real-time multi-service telemetry, onboarding pipeline, and agricultural commerce overview."
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

        {/* 2. Middle Row: Operational Approval Queues & Catalog Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column (7 cols): Onboarding Queue & Financial Settlements */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 min-w-0">
            {/* Onboarding Pipeline Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 shrink-0">
                    <Store size={18} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Onboarding Verification Queue
                    </h2>
                    <p className="text-xs text-slate-400">
                      Pending vendor shops and delivery partner KYC reviews
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl self-start sm:self-auto border border-slate-200/60">
                  <button
                    onClick={() => setApprovalTab('vendors')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      approvalTab === 'vendors'
                        ? 'bg-white text-emerald-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Vendors ({pendingVendors.total})
                  </button>
                  <button
                    onClick={() => setApprovalTab('delivery')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      approvalTab === 'delivery'
                        ? 'bg-white text-emerald-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Delivery ({pendingDeliveries.total})
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="p-5 sm:p-6 divide-y divide-slate-100">
                {approvalTab === 'vendors' ? (
                  pendingVendors.items.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 space-y-2">
                      <CheckCircle2 size={32} className="mx-auto text-emerald-500 opacity-80" />
                      <p className="text-xs font-semibold text-slate-600">No pending vendor applications</p>
                      <p className="text-[11px] text-slate-400">All registered shop vendors have been processed.</p>
                    </div>
                  ) : (
                    pendingVendors.items.map((vendor, idx) => (
                      <div key={vendor.shopId || vendor.id || idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center font-bold text-xs shrink-0">
                            {(vendor.shopName || vendor.name || 'V').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {vendor.shopName || vendor.name || `Vendor #${vendor.shopId || idx + 1}`}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span className="truncate">{vendor.ownerName || vendor.phone || 'Pending Details'}</span>
                              <span>•</span>
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-semibold shrink-0">
                                {vendor.category || 'Vendor Shop'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate('/vendors')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                        >
                          <span>Review</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    ))
                  )
                ) : (
                  pendingDeliveries.items.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 space-y-2">
                      <CheckCircle2 size={32} className="mx-auto text-emerald-500 opacity-80" />
                      <p className="text-xs font-semibold text-slate-600">No pending delivery partner applications</p>
                      <p className="text-[11px] text-slate-400">All courier drivers and fleets are verified.</p>
                    </div>
                  ) : (
                    pendingDeliveries.items.map((partner, idx) => (
                      <div key={partner.deliveryPartnerUserId || partner.id || idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center font-bold text-xs shrink-0">
                            {(partner.name || 'DP').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {partner.name || `Partner #${partner.id || idx + 1}`}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span className="truncate">{partner.phone || 'Courier Driver'}</span>
                              <span>•</span>
                              <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-semibold shrink-0">
                                {partner.vehicleType || 'Fleet'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate('/delivery')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                        >
                          <span>Verify</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    ))
                  )
                )}
              </div>

              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {approvalTab === 'vendors' ? `${pendingVendors.total} pending vendor requests` : `${pendingDeliveries.total} pending driver requests`}
                </span>
                <button
                  onClick={() => navigate(approvalTab === 'vendors' ? '/vendors' : '/delivery')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Queue</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Financial Settlement Standing */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 shrink-0">
                    <IndianRupee size={18} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Financial Settlements & Payouts
                    </h2>
                    <p className="text-xs text-slate-400">
                      Vendor disbursement queue and wallet balances
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/payouts')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Payouts</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pending Disbursals
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-900">
                    <AnimatedValue value={finances.pendingPayoutsTotal} suffix=" Requests" />
                  </h4>
                  <p className="text-xs text-slate-500 pt-1">
                    Awaiting admin bank settlement authorization
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Platform Wallet Standing
                  </span>
                  <h4 className="text-xl font-extrabold text-emerald-700">
                    {finances.walletBalance !== null ? (
                      `₹${Number(finances.walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    ) : (
                      'Active & Synced'
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 pt-1">
                    System balance for automated transfers
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Produce Catalog & Telemetry */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8 min-w-0">
            {/* Catalog Produce Snapshot */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl border border-teal-100 shrink-0">
                    <Package size={18} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Produce Catalog Snapshot
                    </h2>
                    <p className="text-xs text-slate-400">
                      Recently updated fresh inventory
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/products')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="p-5 sm:p-6 divide-y divide-slate-100">
                {catalog.recentProducts.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <Package size={30} className="mx-auto text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">Catalog loaded</p>
                    <p className="text-[11px] text-slate-400">Manage categories and crop items from the catalog console.</p>
                  </div>
                ) : (
                  catalog.recentProducts.map((prod, idx) => (
                    <div key={prod.id || prod.productId || idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {prod.name || `Produce #${prod.id || idx + 1}`}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>Unit: {prod.unit || 'Kg'}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">
                            ₹{Number(prod.price ?? 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                        In Stock
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Platform Infrastructure Telemetry */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      System Telemetry
                    </h2>
                    <p className="text-xs text-slate-400">
                      Core platform server & gateway status
                    </p>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold shrink-0 ${
                  isHealthy ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  {adminDashboard.systemStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Environment
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">
                    {adminDashboard.environment}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    API Gateway
                  </span>
                  <span className="text-xs font-bold text-emerald-700 mt-1 block">
                    Operational (15s sync)
                  </span>
                </div>
              </div>

              {/* Quick Jump Shortcuts */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Administrative Shortcuts
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate('/customers')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span>Customers</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>
                  <button
                    onClick={() => navigate('/operator-roles')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span>Security Roles</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>
                  <button
                    onClick={() => navigate('/settings')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span>Settings</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>
                  <button
                    onClick={() => navigate('/categories')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span>Categories</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}