import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Sparkles,
  Eye,
  Trash2,
  X,
  ShoppingBag,
  CreditCard,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';

import {
  getCustomerStats,
  getCustomers,
  getCustomerDetails,
  deleteCustomer,
  blockCustomer,
  unblockCustomer
} from '../Api/customerService/customerService';

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === null || value === undefined || value === '') {
      setDisplayValue('0');
      return;
    }

    const strVal = String(value);
    const match = strVal.match(/([₹\d,.]+)\s*(.*)/);

    if (!match) {
      setDisplayValue(strVal);
      return;
    }

    const isRupee = strVal.startsWith('₹');
    const rawNumberStr = match[1].replace(/[₹,]/g, '');
    const targetNum = parseFloat(rawNumberStr);
    const suffix = match[2] || '';
    const isDecimal = rawNumberStr.includes('.');
    const hasComma = match[1].includes(',');

    if (isNaN(targetNum)) {
      setDisplayValue(strVal);
      return;
    }

    const duration = 1000;
    const startTime = performance.now();
    let animationFrameId;

    const updateCount = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress =
        progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const currentVal = easeProgress * targetNum;

      let formatted;

      if (isDecimal) {
        formatted = currentVal.toFixed(2);
      } else {
        formatted = Math.floor(currentVal).toString();
      }

      if (hasComma) {
        const parts = formatted.split('.');
        parts[0] = parseInt(parts[0], 10).toLocaleString('en-IN');
        formatted = parts.join('.');
      }

      setDisplayValue(
        `${isRupee ? '₹' : ''}${formatted}${suffix ? ` ${suffix}` : ''}`
      );

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(strVal);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{displayValue}</span>;
}

const getPayload = (response) => {
  if (response?.data?.data !== undefined) return response.data.data;
  if (response?.data !== undefined) return response.data;
  return response;
};

const getList = (response) => {
  const payload = getPayload(response);

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.customers)) return payload.customers;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
};

const getValue = (object, keys, fallback = '') => {
  for (const key of keys) {
    if (
      object?.[key] !== undefined &&
      object?.[key] !== null &&
      object?.[key] !== ''
    ) {
      return object[key];
    }
  }

  return fallback;
};

const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const normalizeCustomer = (customer) => {
  const id = getValue(
    customer,
    ['id', 'userId', 'customerId', 'uuid', 'customerID'],
    '-'
  );

  const name = getValue(
    customer,
    ['name', 'fullName', 'customerName', 'username'],
    'Unknown Customer'
  );

  const email = getValue(
    customer,
    ['email', 'emailAddress'],
    '-'
  );

  const orders = getValue(
    customer,
    ['orders', 'totalOrders', 'orderCount', 'ordersCount'],
    0
  );

  const spent = getValue(
    customer,
    [
      'spent',
      'totalSpent',
      'totalOutlay',
      'totalAmount',
      'totalSpend',
      'amountSpent'
    ],
    0
  );

  const statusValue = getValue(
    customer,
    ['status', 'accountStatus', 'customerStatus'],
    'Active'
  );

  const joined = getValue(
    customer,
    [
      'joined',
      'createdAt',
      'registeredAt',
      'registrationDate',
      'createdDate'
    ],
    null
  );

  return {
    ...customer,
    id: String(id),
    name: String(name),
    email: String(email),
    orders: Number(orders) || 0,
    spent,
    status:
      String(statusValue).toLowerCase() === 'active'
        ? 'Active'
        : String(statusValue).toLowerCase() === 'inactive'
        ? 'Inactive'
        : String(statusValue).toLowerCase() === 'blocked'
        ? 'Suspended'
        : String(statusValue).toLowerCase() === 'suspended'
        ? 'Suspended'
        : String(statusValue),
    joined: formatDate(joined)
  };
};

const getStatValue = (stats, keys, fallback = 0) => {
  const value = getValue(stats, keys, fallback);

  if (typeof value === 'object' && value !== null) {
    return getValue(
      value,
      ['value', 'count', 'total', 'amount', 'percentage'],
      fallback
    );
  }

  return value;
};

export default function ViewCustomers() {
  const [currentTab, setCurrentTab] = useState('view-customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const response = await getCustomerStats();
      setStats(getPayload(response));
    } catch (error) {
      console.error('Customer Stats Error:', error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to load customer statistics'
      );
    }
  }, []);

  const loadCustomers = useCallback(async (search = '') => {
    try {
      setLoading(true);

      const params = {
        page: 0,
        size: 20
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await getCustomers(params);
      const list = getList(response);

      setCustomers(list.map(normalizeCustomer));
    } catch (error) {
      console.error('Customers Error:', error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to load customers'
      );

      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setErrorMessage('');

    await Promise.all([
      loadStats(),
      loadCustomers(searchQuery)
    ]);
  }, [loadStats, loadCustomers, searchQuery]);

  useEffect(() => {
    loadStats();
    loadCustomers();
  }, [loadStats, loadCustomers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, loadCustomers]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    await loadData();
    setIsRefreshing(false);
  };

  const handleViewCustomer = async (customer) => {
    try {
      setActionLoading(true);

      const response = await getCustomerDetails(customer.id);
      const details = getPayload(response);

      if (details) {
        setSelectedCustomer({
          ...customer,
          ...normalizeCustomer(details)
        });
      } else {
        setSelectedCustomer(customer);
      }
    } catch (error) {
      console.error('Customer Details Error:', error);

      setSelectedCustomer(customer);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to load customer details'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this customer?'
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setErrorMessage('');

      await deleteCustomer(id);

      setCustomers((prev) =>
        prev.filter(
          (customer) => String(customer.id) !== String(id)
        )
      );

      if (
        selectedCustomer &&
        String(selectedCustomer.id) === String(id)
      ) {
        setSelectedCustomer(null);
      }

      await loadStats();
    } catch (error) {
      console.error('Delete Customer Error:', error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to delete customer'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async (id) => {
    try {
      setActionLoading(true);
      setErrorMessage('');

      await blockCustomer(id);

      await loadCustomers(searchQuery);
      await loadStats();

      if (
        selectedCustomer &&
        String(selectedCustomer.id) === String(id)
      ) {
        setSelectedCustomer((prev) => ({
          ...prev,
          status: 'Suspended'
        }));
      }
    } catch (error) {
      console.error('Block Customer Error:', error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to block customer'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblock = async (id) => {
    try {
      setActionLoading(true);
      setErrorMessage('');

      await unblockCustomer(id);

      await loadCustomers(searchQuery);
      await loadStats();

      if (
        selectedCustomer &&
        String(selectedCustomer.id) === String(id)
      ) {
        setSelectedCustomer((prev) => ({
          ...prev,
          status: 'Active'
        }));
      }
    } catch (error) {
      console.error('Unblock Customer Error:', error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to unblock customer'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const totalActiveCustomers = getStatValue(
    stats,
    [
      'totalActiveCustomers',
      'activeCustomers',
      'totalActive',
      'activeCustomerCount'
    ],
    0
  );

  const monthlyActiveUsers = getStatValue(
    stats,
    [
      'monthlyActiveUsers',
      'monthlyActive',
      'mau',
      'monthlyActiveCustomerCount'
    ],
    0
  );

  const premiumMembers = getStatValue(
    stats,
    [
      'premiumMembers',
      'premiumCustomers',
      'totalPremiumMembers',
      'premiumMemberCount'
    ],
    0
  );

  const suspendedAccounts = getStatValue(
    stats,
    [
      'suspendedAccounts',
      'suspendedCustomers',
      'totalSuspended',
      'suspendedCustomerCount'
    ],
    0
  );

  const getChange = (keys) =>
    getStatValue(stats, keys, '0%');

  const customerStats = [
    {
      label: 'Total Active Customers',
      value: totalActiveCustomers,
      change: getChange([
        'activeCustomersChange',
        'totalActiveCustomersChange'
      ]),
      up: true,
      accentColor: 'bg-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Users
    },
    {
      label: 'Monthly Active Users',
      value: monthlyActiveUsers,
      change: getChange([
        'monthlyActiveUsersChange',
        'monthlyActiveChange'
      ]),
      up: true,
      accentColor: 'bg-teal-600',
      iconBg: 'bg-teal-50 text-teal-700',
      tagColor:
        'text-teal-700 bg-teal-50/80 border-teal-200/80',
      icon: UserCheck
    },
    {
      label: 'Premium Members',
      value: premiumMembers,
      change: getChange([
        'premiumMembersChange',
        'premiumCustomersChange'
      ]),
      up: true,
      accentColor: 'bg-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Sparkles
    },
    {
      label: 'Suspended Accounts',
      value: suspendedAccounts,
      change: getChange([
        'suspendedAccountsChange',
        'suspendedCustomersChange'
      ]),
      up: false,
      accentColor: 'bg-green-700',
      iconBg: 'bg-green-50 text-green-700',
      tagColor:
        'text-rose-700 bg-rose-50/80 border-rose-200/80',
      icon: UserX
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: 'easeOut'
          }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />

          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm backdrop-blur-md">
                <Zap
                  size={12}
                  className="text-emerald-400 animate-bounce"
                />
                Customer Management Directory
              </span>

              <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-900/80 px-3 py-1 rounded-full text-rose-300 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-widest text-white">
                  LIVE ADMIN VEG GO
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white flex items-center gap-3">
              Customer Directory
              <Sparkles className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </h1>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center z-10">
            <div className="bg-emerald-900/60 border border-emerald-800 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-100 shadow-inner backdrop-blur-sm">
              <Calendar
                size={14}
                className="text-emerald-400"
              />

              <span>
                {new Date().toLocaleDateString('en-IN', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric'
                })}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner group/btn"
              title="Refresh Data"
              disabled={isRefreshing}
            >
              <RefreshCw
                size={15}
                className={`text-emerald-300 transition-transform duration-700 ${
                  isRefreshing
                    ? 'rotate-180 scale-110'
                    : 'group-hover/btn:rotate-45'
                }`}
              />
            </motion.button>
          </div>
        </motion.header>

        {errorMessage && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
            <span>{errorMessage}</span>

            <button
              onClick={() => setErrorMessage('')}
              className="p-1 hover:bg-rose-100 rounded-lg"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {customerStats.map((stat, idx) => {
            const IconComponent = stat.icon;

            return (
              <motion.div
                key={`${idx}-${refreshKey}`}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.1
                }}
                whileHover={{
                  y: -6,
                  transition: {
                    duration: 0.2
                  }
                }}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accentColor} transition-all duration-300 group-hover:h-2`}
                />

                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:scale-125" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-black uppercase tracking-wider group-hover:text-emerald-700 transition-colors duration-200">
                      {stat.label}
                    </span>

                    <motion.div
                      whileHover={{
                        rotate: 12,
                        scale: 1.1
                      }}
                      className={`${stat.iconBg} p-2.5 rounded-2xl transition-all shadow-xs`}
                    >
                      <IconComponent size={18} />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-semibold text-black tracking-tight font-mono group-hover:text-emerald-800 transition-colors duration-200">
                    {loading ? (
                      <span className="text-slate-300">
                        ...
                      </span>
                    ) : (
                      <AnimatedValue
                        value={stat.value}
                        key={refreshKey}
                      />
                    )}
                  </h3>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between relative z-10">
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-transform duration-300 group-hover:scale-105 ${stat.tagColor}`}
                  >
                    {stat.up ? (
                      <ArrowUpRight
                        size={13}
                        className="text-emerald-600"
                      />
                    ) : (
                      <ArrowDownRight
                        size={13}
                        className="text-rose-600"
                      />
                    )}

                    {stat.change}
                  </span>

                  <span className="text-[11px] text-black font-semibold">
                    Monthly Period
                  </span>
                </div>
              </motion.div>
            );
          })}
        </section>

        <section className="w-full">
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.5,
              delay: 0.3
            }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                    <Users size={18} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-black tracking-tight">
                      Customer Records
                    </h2>

                    <p className="text-xs font-semibold text-black">
                      Active customer account directory
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search
                      className="absolute left-3 top-2.5 text-slate-400"
                      size={15}
                    />

                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">
                      <th className="py-3.5 px-4 rounded-l-xl">
                        Customer Details
                      </th>

                      <th className="py-3.5 px-4 text-center">
                        Orders
                      </th>

                      <th className="py-3.5 px-4">
                        Total Outlay
                      </th>

                      <th className="py-3.5 px-4 text-center">
                        Status
                      </th>

                      <th className="py-3.5 px-4 text-right rounded-r-xl">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-12 text-center text-slate-400 text-xs"
                        >
                          Loading customers...
                        </td>
                      </tr>
                    ) : customers.length > 0 ? (
                      customers.map((customer, idx) => (
                        <motion.tr
                          key={customer.id}
                          initial={{
                            opacity: 0,
                            y: 10
                          }}
                          animate={{
                            opacity: 1,
                            y: 0
                          }}
                          transition={{
                            duration: 0.3,
                            delay: idx * 0.05
                          }}
                          className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-black group-hover:text-emerald-700 transition-all duration-200">
                                {customer.name}
                              </span>

                              <span className="text-[10px] text-slate-500">
                                {customer.email}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-center text-black">
                            {Number(
                              customer.orders
                            ).toLocaleString('en-IN')}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold">
                            {typeof customer.spent === 'number'
                              ? `₹${customer.spent.toLocaleString(
                                  'en-IN',
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  }
                                )}`
                              : customer.spent}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all duration-300 ${
                                customer.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                  : customer.status === 'Inactive'
                                  ? 'bg-slate-100 text-slate-600 border-slate-200/80'
                                  : 'bg-rose-50 text-rose-700 border-rose-200/80'
                              }`}
                            >
                              {customer.status === 'Active' ? (
                                <CheckCircle2
                                  size={11}
                                  className="text-emerald-600"
                                />
                              ) : (
                                <Clock
                                  size={11}
                                  className="text-amber-600"
                                />
                              )}

                              {customer.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  handleViewCustomer(customer)
                                }
                                disabled={actionLoading}
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                title="View Info"
                              >
                                <Eye size={15} />
                              </button>

                              {customer.status === 'Suspended' ? (
                                <button
                                  onClick={() =>
                                    handleUnblock(customer.id)
                                  }
                                  disabled={actionLoading}
                                  className="px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  Unblock
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleBlock(customer.id)
                                  }
                                  disabled={actionLoading}
                                  className="px-2 py-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  Block
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  handleDelete(customer.id)
                                }
                                disabled={actionLoading}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Remove User"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-8 text-center text-slate-400 text-xs"
                        >
                          No matching customer profiles found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {loading ? (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    Loading customers...
                  </div>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <motion.div
                      key={customer.id}
                      whileHover={{
                        scale: 1.01
                      }}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group"
                    >
                      <div>
                        <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700 transition-colors duration-200">
                          {customer.name}
                        </h4>

                        <p className="text-xs text-slate-500">
                          {customer.email}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            customer.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : customer.status === 'Inactive'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {customer.status}
                        </span>

                        <span className="text-xs font-semibold text-black">
                          {Number(
                            customer.orders
                          ).toLocaleString('en-IN')}{' '}
                          Orders
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-[10px] uppercase font-semibold text-black block">
                          Total Spent
                        </span>

                        <span className="font-mono font-semibold text-emerald-700">
                          {typeof customer.spent === 'number'
                            ? `₹${customer.spent.toLocaleString(
                                'en-IN',
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }
                              )}`
                            : customer.spent}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() =>
                            handleViewCustomer(customer)
                          }
                          className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                        >
                          <Eye size={15} />
                        </button>

                        {customer.status === 'Suspended' ? (
                          <button
                            onClick={() =>
                              handleUnblock(customer.id)
                            }
                            className="px-3 py-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-lg"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleBlock(customer.id)
                            }
                            className="px-3 py-1.5 text-[10px] font-semibold text-amber-700 bg-amber-50 rounded-lg"
                          >
                            Block
                          </button>
                        )}

                        <button
                          onClick={() =>
                            handleDelete(customer.id)
                          }
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No matching customer profiles found.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 10
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 10
              }}
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 relative"
            >
              <button
                onClick={() => setSelectedCustomer(null)}
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-2xl flex items-center justify-center font-bold text-lg">
                  {selectedCustomer.name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-black">
                    {selectedCustomer.name}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {selectedCustomer.email}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                      <ShoppingBag size={16} />
                    </div>

                    <span className="text-xs font-semibold text-black">
                      Total Orders
                    </span>
                  </div>

                  <span className="font-mono font-bold text-black text-sm">
                    {Number(
                      selectedCustomer.orders || 0
                    ).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                      <CreditCard size={16} />
                    </div>

                    <span className="text-xs font-semibold text-black">
                      Total Outlay
                    </span>
                  </div>

                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {typeof selectedCustomer.spent === 'number'
                      ? `₹${selectedCustomer.spent.toLocaleString(
                          'en-IN',
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }
                        )}`
                      : selectedCustomer.spent}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-0.5">
                    Email
                  </span>

                  <span className="font-semibold text-slate-600 break-all">
                    {selectedCustomer.email}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-0.5">
                    Joined
                  </span>

                  <span className="font-semibold text-slate-600">
                    {selectedCustomer.joined}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border ${
                    selectedCustomer.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {selectedCustomer.status === 'Active' ? (
                    <CheckCircle2 size={11} />
                  ) : (
                    <Clock size={11} />
                  )}

                  {selectedCustomer.status}
                </span>

                {selectedCustomer.status === 'Suspended' ? (
                  <button
                    onClick={() =>
                      handleUnblock(selectedCustomer.id)
                    }
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Unblock
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      handleBlock(selectedCustomer.id)
                    }
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 disabled:opacity-50"
                  >
                    Block
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}