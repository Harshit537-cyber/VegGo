import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';

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
      const progress = Math.min(
        (time - startTime) / duration,
        1
      );

      const ease =
        progress === 1
          ? 1
          : 1 - Math.pow(2, -10 * progress);

      const current = targetNumber * ease;

      const formatted = Number.isInteger(targetNumber)
        ? Math.floor(current).toLocaleString('en-IN')
        : current.toFixed(2);

      setDisplayValue(
        `${formatted}${suffix ? ` ${suffix}` : ''}`
      );

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

      setCustomerStats(
        customerStatsResponse?.data ?? null
      );

      setModerationStats(
        moderationStatsResponse?.data ?? null
      );

      const moderationData =
        moderationCustomersResponse?.data;

      let customerList = [];

      if (Array.isArray(moderationData)) {
        customerList = moderationData;
      } else if (
        Array.isArray(moderationData?.content)
      ) {
        customerList = moderationData.content;
      } else if (
        Array.isArray(moderationData?.customers)
      ) {
        customerList = moderationData.customers;
      } else if (
        Array.isArray(moderationData?.data)
      ) {
        customerList = moderationData.data;
      }

      setAccounts(customerList);
    } catch (error) {
      console.error(
        'Failed to fetch moderation data:',
        error
      );

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
    return (
      customer?.id ??
      customer?._id ??
      customer?.customerId
    );
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

      setModalConfig({
        isOpen: false,
        account: null,
      });

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
            `Failed to ${
              isBlocked ? 'unblock' : 'block'
            } customer`
        );

        return;
      }

      await fetchModerationData();

      setModalConfig({
        isOpen: false,
        account: null,
      });
    } catch (error) {
      console.error(
        'Failed to update customer status:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          `Failed to ${
            isBlocked ? 'unblock' : 'block'
          } customer`
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
      bg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-700',
      icon: Users,
    },
    {
      label: 'Active This Month',
      value: `${activeThisMonth} Active`,
      bg: 'bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-transparent',
      border: 'border-teal-500/20',
      iconBg: 'bg-teal-500/15 text-teal-700',
      icon: UserCheck,
    },
    {
      label: 'Premium Subscribers',
      value: `${premiumSubscribers} Premium`,
      bg: 'bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/15 text-amber-700',
      icon: Crown,
    },
    {
      label: 'Suspended Accounts',
      value: `${suspendedAccounts} Blocked`,
      bg: 'bg-gradient-to-br from-rose-500/10 via-rose-400/5 to-transparent',
      border: 'border-rose-500/20',
      iconBg: 'bg-rose-500/15 text-rose-700',
      icon: UserX,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/10 to-teal-50/20 flex font-sans antialiased text-slate-800">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto max-h-screen">
        <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-lg overflow-hidden border border-emerald-700/30">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />

          <div className="space-y-4 z-10 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-100 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15">
                Security & Policy Enforcement
              </span>

              <div className="flex items-center gap-3 bg-rose-950/60 backdrop-blur-md border border-rose-500/30 px-3.5 py-1.5 rounded-full text-rose-300 max-w-[190px] overflow-hidden">
                <span className="relative flex h-3.5 w-3.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border border-white/20" />
                </span>

                <div className="overflow-hidden whitespace-nowrap text-[11px] font-black uppercase tracking-widest text-white w-full">
                  <marquee scrollamount="3.5">
                    LIVE ADMIN VEG GO
                  </marquee>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Moderation Center
            </h1>
          </div>

          <div className="flex items-center gap-3 z-10">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm text-sm font-bold text-emerald-50">
              <Calendar
                size={16}
                className="text-emerald-300"
              />

              <span>
                {new Date().toLocaleDateString(
                  'en-US',
                  {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }
                )}
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl hover:bg-white/20 transition-all duration-300 active:scale-95 shadow-sm text-white disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  isRefreshing
                    ? 'animate-spin text-emerald-300'
                    : 'text-emerald-300'
                }
              />
            </button>
          </div>
        </header>

        {errorMessage && (
          <div className="mb-6 px-5 py-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold">
            {errorMessage}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {moderationCards.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={index}
                className={`${stat.bg} ${stat.border} p-6 rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group relative overflow-hidden`}
              >
                <div>
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </p>

                  <h3 className="text-2xl font-black text-slate-900 mt-2">
                    {loading ? (
                      <span className="text-slate-300 animate-pulse">
                        ...
                      </span>
                    ) : (
                      <AnimatedValue
                        value={stat.value}
                      />
                    )}
                  </h3>
                </div>

                <div
                  className={`${stat.iconBg} p-4 rounded-2xl border border-white/10 shadow-sm`}
                >
                  <Icon size={22} />
                </div>
              </div>
            );
          })}
        </section>

        <section className="bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-xl font-extrabold text-slate-900">
              User Moderation Ledger
            </h2>

            <div className="relative w-full sm:w-80">
              <Search
                className="absolute left-3.5 top-3.5 text-slate-400"
                size={16}
              />

              <input
                type="text"
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-700"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm font-semibold text-slate-400">
              Loading moderation customers...
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="py-16 text-center text-sm font-semibold text-slate-400">
              No moderation customers found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase font-bold tracking-widest text-slate-400">
                    <th className="pb-4">
                      Customer Details
                    </th>

                    <th className="pb-4">
                      Flags Raised
                    </th>

                    <th className="pb-4">
                      Primary Infraction
                    </th>

                    <th className="pb-4">
                      Account State
                    </th>

                    <th className="pb-4 text-right">
                      Moderation Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100/60">
                  {filteredAccounts.map(
                    (account, index) => {
                      const name =
                        account?.name ??
                        account?.fullName ??
                        account?.customerName ??
                        account?.user?.name ??
                        'Unknown Customer';

                      const email =
                        account?.email ??
                        account?.user?.email ??
                        '';

                      const flags =
                        account?.flags ??
                        account?.flagCount ??
                        account?.flagsRaised ??
                        account?.moderationFlags ??
                        0;

                      const reason =
                        account?.reason ??
                        account?.primaryInfraction ??
                        account?.infraction ??
                        account?.moderationReason ??
                        'None';

                      const status =
                        getStatus(account);

                      return (
                        <tr
                          key={
                            getCustomerId(account) ||
                            index
                          }
                          className="text-sm font-semibold text-slate-600 hover:bg-emerald-50/20 transition-colors"
                        >
                          <td className="py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">
                                {name}
                              </span>

                              {email && (
                                <span className="text-xs text-slate-400 font-normal">
                                  {email}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-slate-50 text-slate-600 border-slate-100">
                              {flags} Flags
                            </span>
                          </td>

                          <td className="py-4 text-slate-500 font-medium">
                            {reason}
                          </td>

                          <td className="py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                                status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-100'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  status === 'Active'
                                    ? 'bg-emerald-500'
                                    : 'bg-rose-500'
                                }`}
                              />

                              {status}
                            </span>
                          </td>

                          <td className="py-4 text-right">
                            <button
                              onClick={() =>
                                initiateToggleStatus(
                                  account
                                )
                              }
                              disabled={isRefreshing}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-[11px] font-bold transition-all border disabled:opacity-50 ${
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

                              {status === 'Active'
                                ? 'Block Account'
                                : 'Restore Access'}
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {modalConfig.isOpen &&
          modalConfig.account && (
            <ConfirmModal
              isOpen={modalConfig.isOpen}
              onClose={() =>
                setModalConfig({
                  isOpen: false,
                  account: null,
                })
              }
              onConfirm={handleConfirmAction}
              type={
                getStatus(
                  modalConfig.account
                ) === 'Active'
                  ? 'danger'
                  : 'success'
              }
              title={
                getStatus(
                  modalConfig.account
                ) === 'Active'
                  ? 'Restrict Account Access'
                  : 'Restore Account Access'
              }
              message={
                getStatus(
                  modalConfig.account
                ) === 'Active'
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
                getStatus(
                  modalConfig.account
                ) === 'Active'
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