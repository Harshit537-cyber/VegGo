import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import ConfirmModal from '../Common/ConfirmModal';

import {
  getCustomerStats,
  getModerationStats,
  getModerationCustomers,
  blockCustomer,
  unblockCustomer,
} from '../Api/customerService/customerService';

import {
  Calendar,
  RefreshCw,
  UserCheck,
  UserX,
  Search,
  ShieldCheck,
  Users,
  Crown,
  Sparkles,
  Zap,
  ShieldAlert,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

// Counter animation component for continuous metric syncing view
function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === undefined || value === null) {
      setDisplayValue('0');
      return;
    }

    const stringValue = String(value);
    const match = stringValue.match(/([\d,.]+)\s*(.*)/);

    if (!match) {
      setDisplayValue(stringValue);
      return;
    }

    const rawNumber = match[1].replace(/,/g, '');
    const targetNumber = Number(rawNumber);
    const suffix = match[2] || '';

    if (Number.isNaN(targetNumber)) {
      setDisplayValue(stringValue);
      return;
    }

    const duration = 1000;
    const startTime = performance.now();
    let animationFrame;

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = targetNumber * ease;

      const formatted = Number.isInteger(targetNumber)
        ? Math.floor(current).toLocaleString('en-IN')
        : current.toFixed(2);

      setDisplayValue(`${formatted}${suffix ? ` ${suffix}` : ''}`);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(stringValue);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return <span>{displayValue}</span>;
}

export default function CustomerModeration() {
  const [currentTab, setCurrentTab] = useState('block-unblock');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    account: null,
  });

  const [customerStats, setCustomerStats] = useState(null);
  const [moderationStats, setModerationStats] = useState(null);
  const [accounts, setAccounts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronized API Fetching Logic
  const fetchModerationData = async () => {
    setIsRefreshing(true);
    setErrorMessage('');

    try {
      const [
        customerStatsResponse,
        moderationStatsResponse,
        moderationCustomersResponse,
      ] = await Promise.all([
        getCustomerStats(),
        getModerationStats(),
        getModerationCustomers(),
      ]);

      setCustomerStats(customerStatsResponse?.data ?? null);
      setModerationStats(moderationStatsResponse?.data ?? null);

      const moderationData = moderationCustomersResponse?.data;
      let customerList = [];

      if (Array.isArray(moderationData)) {
        customerList = moderationData;
      } else if (Array.isArray(moderationData?.content)) {
        customerList = moderationData.content;
      } else if (Array.isArray(moderationData?.customers)) {
        customerList = moderationData.customers;
      } else if (Array.isArray(moderationData?.data)) {
        customerList = moderationData.data;
      }

      setAccounts(customerList);
    } catch (error) {
      console.error('Failed to fetch moderation data:', error);
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch moderation data'
      );
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationData();
  }, []);

  const handleRefresh = () => {
    fetchModerationData();
  };

  const getCustomerId = (customer) => {
    return customer?.id ?? customer?._id ?? customer?.customerId;
  };

  const getStatus = (customer) => {
    if (
      customer?.isBlocked === true ||
      customer?.blocked === true ||
      customer?.status === 'BLOCKED' ||
      customer?.status === 'Blocked' ||
      customer?.status === 'blocked'
    ) {
      return 'Blocked';
    }

    return customer?.status || 'Active';
  };

  const initiateToggleStatus = (account) => {
    setModalConfig({
      isOpen: true,
      account,
    });
  };

  const handleConfirmAction = async () => {
    const account = modalConfig.account;
    if (!account) return;

    const customerId = getCustomerId(account);
    if (!customerId) {
      setErrorMessage('Customer ID not found');
      setModalConfig({ isOpen: false, account: null });
      return;
    }

    const currentStatus = getStatus(account);
    const isBlocked = currentStatus === 'Blocked';

    try {
      setIsRefreshing(true);
      setErrorMessage('');

      const response = isBlocked
        ? await unblockCustomer(customerId)
        : await blockCustomer(customerId);

      if (response?.success === false) {
        setErrorMessage(
          response?.message ||
            `Failed to ${isBlocked ? 'unblock' : 'block'} customer`
        );
        return;
      }

      await fetchModerationData();

      setModalConfig({
        isOpen: false,
        account: null,
      });
    } catch (error) {
      console.error('Failed to update customer status:', error);
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          `Failed to ${isBlocked ? 'unblock' : 'block'} customer`
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredAccounts = accounts.filter((account) => {
    const query = searchQuery.toLowerCase();

    return (
      String(
        account?.name ??
          account?.fullName ??
          account?.customerName ??
          ''
      )
        .toLowerCase()
        .includes(query) ||
      String(
        account?.email ??
          account?.user?.email ??
          ''
      )
        .toLowerCase()
        .includes(query)
    );
  });

  const totalCustomers =
    moderationStats?.totalCustomers ??
    customerStats?.totalCustomers ??
    customerStats?.total ??
    0;

  const activeThisMonth =
    moderationStats?.activeThisMonth ??
    customerStats?.activeThisMonth ??
    0;

  const premiumSubscribers =
    moderationStats?.premiumSubscribers ??
    customerStats?.premiumSubscribers ??
    0;

  const suspendedAccounts =
    moderationStats?.suspendedAccounts ??
    moderationStats?.blockedAccounts ??
    customerStats?.suspendedAccounts ??
    customerStats?.blockedAccounts ??
    0;

  const moderationCards = [
    {
      label: 'Total Customers',
      value: `${totalCustomers} Accounts`,
      accentColor: 'bg-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: Users,
    },
    {
      label: 'Active This Month',
      value: `${activeThisMonth} Active`,
      accentColor: 'bg-teal-600',
      iconBg: 'bg-teal-50 text-teal-700 border-teal-100',
      icon: UserCheck,
    },
    {
      label: 'Premium Subscribers',
      value: `${premiumSubscribers} Premium`,
      accentColor: 'bg-amber-500',
      iconBg: 'bg-amber-50 text-amber-700 border-amber-100',
      icon: Crown,
    },
    {
      label: 'Suspended Accounts',
      value: `${suspendedAccounts} Blocked`,
      accentColor: 'bg-rose-600',
      iconBg: 'bg-rose-50 text-rose-700 border-rose-100',
      icon: UserX,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">
        
        {/* Banner Section matching ViewCustomer design (Without LIVE ADMIN VEG GO badge) */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-xs backdrop-blur-md">
                <Zap size={12} className="text-emerald-400 animate-bounce" />
                Security & Policy Controls
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white flex items-center gap-3">
              Customer Moderation
              <Sparkles className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </h1>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center z-10">
            <div className="bg-emerald-900/60 border border-emerald-800 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-100 shadow-inner backdrop-blur-sm">
              <Calendar size={14} className="text-emerald-400" />
              <span>
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner group/btn disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw
                size={15}
                className={`text-emerald-300 transition-transform duration-700 ${
                  isRefreshing ? 'animate-spin scale-110' : 'group-hover/btn:rotate-45'
                }`}
              />
            </motion.button>
          </div>
        </motion.header>

        {/* Dynamic Alert Banner */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-5 py-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-3 shadow-xs"
            >
              <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Metric Cards matching ViewCustomer Layout */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {moderationCards.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accentColor} transition-all duration-300 group-hover:h-2`} />
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:scale-125" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-emerald-700 transition-colors duration-200">
                      {stat.label}
                    </span>
                    <motion.div 
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      className={`${stat.iconBg} p-2.5 rounded-2xl transition-all border shadow-xs`}
                    >
                      <IconComponent size={18} />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight font-mono group-hover:text-emerald-800 transition-colors duration-200">
                    {loading ? (
                      <span className="text-slate-300 animate-pulse">...</span>
                    ) : (
                      <AnimatedValue value={stat.value} />
                    )}
                  </h3>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between relative z-10 text-[11px] font-semibold text-slate-400">
                  <span>Security Metrics</span>
                  <span className="text-emerald-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    View Live <ChevronRight size={12} />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Account Table & List Container */}
        <section className="w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow p-5 sm:p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 shadow-xs">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Customer Access Ledger</h2>
                    <p className="text-xs font-semibold text-slate-400">Account status control and penalty oversight</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                    <input
                      type="text"
                      placeholder="Search flagged accounts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="py-16 text-center text-xs font-semibold text-slate-400">
                  Loading moderation list...
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="py-16 text-center text-xs font-semibold text-slate-400">
                  No accounts matching search criteria
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-slate-500 bg-slate-50/80">
                          <th className="py-3.5 px-4 rounded-l-xl">Customer Details</th>
                          <th className="py-3.5 px-4">Flags Raised</th>
                          <th className="py-3.5 px-4">Primary Infraction</th>
                          <th className="py-3.5 px-4 text-center">Current Status</th>
                          <th className="py-3.5 px-4 text-right rounded-r-xl">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAccounts.map((account, index) => {
                          const name =
                            account?.name ??
                            account?.fullName ??
                            account?.customerName ??
                            account?.user?.name ??
                            'Unknown Customer';

                          const email = account?.email ?? account?.user?.email ?? '';
                          const flags = account?.flags ?? account?.flagCount ?? account?.flagsRaised ?? 0;
                          const reason = account?.reason ?? account?.primaryInfraction ?? 'None reported';
                          const status = getStatus(account);

                          return (
                            <motion.tr
                              key={getCustomerId(account) || index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.05 + index * 0.03 }}
                              className="text-xs font-semibold text-slate-700 hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                            >
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                                    {name.charAt(0)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900 group-hover:translate-x-0.5 group-hover:text-emerald-700 transition-all duration-200">
                                      {name}
                                    </span>
                                    {email && (
                                      <span className="text-[10px] text-slate-400 font-normal">
                                        {email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-slate-50 text-slate-600 border-slate-200/80">
                                  {flags} Flags
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-slate-500 font-medium">
                                {reason}
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all duration-300 group-hover:scale-105 ${
                                    status === 'Active'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                      : 'bg-rose-50 text-rose-700 border-rose-200/80'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}
                                  />
                                  {status}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => initiateToggleStatus(account)}
                                  disabled={isRefreshing}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border disabled:opacity-50 ${
                                    status === 'Active'
                                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                  }`}
                                >
                                  {status === 'Active' ? (
                                    <UserX size={14} />
                                  ) : (
                                    <ShieldCheck size={14} />
                                  )}
                                  {status === 'Active' ? 'Block Account' : 'Restore Access'}
                                </button>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card Layout */}
                  <div className="md:hidden space-y-3">
                    {filteredAccounts.map((account, index) => {
                      const name =
                        account?.name ??
                        account?.fullName ??
                        account?.customerName ??
                        account?.user?.name ??
                        'Unknown Customer';

                      const email = account?.email ?? account?.user?.email ?? '';
                      const flags = account?.flags ?? account?.flagCount ?? account?.flagsRaised ?? 0;
                      const reason = account?.reason ?? account?.primaryInfraction ?? 'None reported';
                      const status = getStatus(account);

                      return (
                        <motion.div
                          key={getCustomerId(account) || index}
                          whileHover={{ scale: 1.01 }}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {name}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {status}
                            </span>
                          </div>

                          {email && <p className="text-xs text-slate-500">{email}</p>}

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Flags Raised</span>
                              <span className="font-semibold text-slate-700">{flags} Flags</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Infraction</span>
                              <span className="font-semibold text-slate-600 truncate block">{reason}</span>
                            </div>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => initiateToggleStatus(account)}
                              disabled={isRefreshing}
                              className={`w-full justify-center inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border disabled:opacity-50 ${
                                status === 'Active'
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {status === 'Active' ? <UserX size={14} /> : <ShieldCheck size={14} />}
                              {status === 'Active' ? 'Block Account' : 'Restore Access'}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </section>
      </main>

      {/* Action Confirmation Modal */}
      <AnimatePresence>
        {modalConfig.isOpen && modalConfig.account && (
          <ConfirmModal
            isOpen={modalConfig.isOpen}
            onClose={() =>
              setModalConfig({
                isOpen: false,
                account: null,
              })
            }
            onConfirm={handleConfirmAction}
            type={getStatus(modalConfig.account) === 'Active' ? 'danger' : 'success'}
            title={
              getStatus(modalConfig.account) === 'Active'
                ? 'Restrict Account Access'
                : 'Restore Account Access'
            }
            message={
              getStatus(modalConfig.account) === 'Active'
                ? `Are you sure you want to block access for ${
                    modalConfig.account?.name ||
                    modalConfig.account?.fullName ||
                    modalConfig.account?.customerName ||
                    'this customer'
                  }?`
                : `Are you sure you want to restore access for ${
                    modalConfig.account?.name ||
                    modalConfig.account?.fullName ||
                    modalConfig.account?.customerName ||
                    'this customer'
                  }?`
            }
            confirmText={
              getStatus(modalConfig.account) === 'Active'
                ? 'Yes, Block Account'
                : 'Yes, Restore Access'
            }
            cancelText="Cancel Action"
          />
        )}
      </AnimatePresence>
    </div>
  );
}