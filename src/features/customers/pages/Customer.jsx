import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../../layouts/Sidebar";
import ConfirmModal from "../../../components/common/ConfirmModal";
import PageHeader from "../../../components/common/PageHeader";
import SegmentedTabs from "../../../components/common/SegmentedTabs";
import StatusFilterPills from "../../../components/common/StatusFilterPills";
import WorkflowRulesBar from "../../../components/common/WorkflowRulesBar";
import EmptyState from "../../../components/common/EmptyState";

import {
  getCustomerStats,
  getCustomers,
  searchCustomers,
  getCustomerDetails,
  deleteCustomer,
  blockCustomer,
  unblockCustomer,
  getModerationStats,
  getModerationCustomers,
  searchModerationCustomers,
} from "../services/customerService";

import {
  Calendar,
  RefreshCw,
  UserX,
  Search,
  ShieldCheck,
  Users,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  Flag,
  ShieldAlert,
  Eye,
  Trash2,
  X,
  Plus,
  Send,
  Wallet,
  ShoppingBag,
} from "lucide-react";

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (value === undefined || value === null) {
      setDisplayValue("0");
      return;
    }

    const stringValue = String(value);
    const match = stringValue.match(/([\d,.]+)\s*(.*)/);

    if (!match) {
      setDisplayValue(stringValue);
      return;
    }

    const rawNumber = match[1].replace(/,/g, "");
    const targetNumber = Number(rawNumber);
    const suffix = match[2] || "";

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
        ? Math.floor(current).toLocaleString("en-IN")
        : current.toFixed(2);

      setDisplayValue(`${formatted}${suffix ? ` ${suffix}` : ""}`);

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

function UserCheckIcon(props) {
  return <CheckCircle2 {...props} />;
}

function CrownIcon(props) {
  return <Sparkles {...props} />;
}

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Customer() {
  const [currentTab, setCurrentTab] = useState("block-unblock");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    account: null,
    action: null,
  });

  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [moderationStats, setModerationStats] = useState(null);
  const [accounts, setAccounts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCustomerData = async (search = "") => {
    setIsRefreshing(true);
    setErrorMessage("");

    try {
      const [
        customerStatsResponse,
        moderationStatsResponse,
        moderationLedgerResponse,
      ] = await Promise.all([
        getCustomerStats(),
        getModerationStats(),
        search.trim()
          ? searchModerationCustomers(search.trim(), { page: 0, size: 20 })
          : getModerationCustomers({ page: 0, size: 20 }),
      ]);

      setCustomerStats(customerStatsResponse?.data ?? null);
      setModerationStats(moderationStatsResponse?.data ?? null);

      const moderationData = moderationLedgerResponse?.data;

      let customerList = [];

      if (Array.isArray(moderationData?.content)) {
        customerList = moderationData.content;
      } else if (Array.isArray(moderationData)) {
        customerList = moderationData;
      }

      setAccounts(customerList);
    } catch (error) {
      console.error("Failed to fetch customer data:", error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch customer data"
      );
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomerData(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRefresh = () => {
    fetchCustomerData(searchQuery);
  };

  const getCustomerId = (customer) =>
    customer?.customerId ?? customer?.id ?? customer?._id;

  const getCustomerUserId = (customer) =>
    customer?.userId ?? customer?.customerId ?? customer?.id ?? customer?._id ?? null;

  const isCustomerBlocked = (customer) => customer?.blocked === true;

  const getStatus = (customer) => {
    if (isCustomerBlocked(customer)) return "Blocked";
    return customer?.accountState || "Active";
  };

  const getCustomerName = (account) =>
    account?.fullName ??
    account?.name ??
    account?.customerName ??
    account?.user?.name ??
    account?.customerId ??
    "Unknown Customer";

  const getCustomerEmail = (account) =>
    account?.email ?? account?.user?.email ?? "";

  const getFlagsRaised = (account) => Number(account?.flagsRaised ?? 0);

  const getPrimaryInfraction = (account) =>
    account?.primaryInfraction ?? "None";

  const handleViewCustomer = async (account) => {
    const customerUserId = getCustomerUserId(account);

    if (!customerUserId) {
      setErrorMessage("Customer User ID not found");
      return;
    }

    try {
      setDetailsLoading(true);
      setErrorMessage("");

      const response = await getCustomerDetails(customerUserId);

      if (response?.success === false) {
        setErrorMessage(response?.message || "Failed to fetch customer details");
        return;
      }

      setCustomerDetails(response?.data ?? null);
    } catch (error) {
      console.error("Failed to fetch customer details:", error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch customer details"
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setCustomerDetails(null);
  };

  const initiateToggleStatus = (account) => {
    setModalConfig({
      isOpen: true,
      account,
      action: isCustomerBlocked(account) ? "unblock" : "block",
    });
  };

  const initiateDelete = (account) => {
    setModalConfig({
      isOpen: true,
      account,
      action: "delete",
    });
  };

  const closeModal = () => {
    setModalConfig({
      isOpen: false,
      account: null,
      action: null,
    });
  };

  const handleConfirmAction = async () => {
    const account = modalConfig.account;
    const action = modalConfig.action;

    if (!account) return;

    const customerUserId = getCustomerUserId(account);

    if (!customerUserId) {
      setErrorMessage("Customer User ID not found");
      closeModal();
      return;
    }

    try {
      setIsRefreshing(true);
      setErrorMessage("");

      let response;

      if (action === "block") {
        response = await blockCustomer(customerUserId);
      }

      if (action === "unblock") {
        response = await unblockCustomer(customerUserId);
      }

      if (action === "delete") {
        setDeleteLoading(true);
        response = await deleteCustomer(customerUserId);
      }

      if (response?.success === false) {
        setErrorMessage(response?.message || `Failed to ${action} customer`);
        return;
      }

      closeModal();
      setCustomerDetails(null);

      await fetchCustomerData(searchQuery);
    } catch (error) {
      console.error("Failed to update customer:", error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          `Failed to ${action} customer`
      );
    } finally {
      setIsRefreshing(false);
      setDeleteLoading(false);
    }
  };

  const totalCustomers =
    customerStats?.totalCustomers ?? moderationStats?.unrestrictedUsers ?? 0;

  const activeThisMonth = customerStats?.activeThisMonth ?? 0;

  const premiumSubscribers = customerStats?.premiumSubscribers ?? 0;

  const suspendedOrBlocked =
    moderationStats?.suspendedOrBlocked ??
    customerStats?.suspendedAccounts ??
    0;

  const moderationCards = [
    {
      label: "Total Customers",
      value: `${totalCustomers} Users`,
      accentColor: "bg-emerald-600",
      iconBg: "bg-emerald-50 text-emerald-700",
      icon: Users,
    },
    {
      label: "Active This Month",
      value: `${activeThisMonth} Users`,
      accentColor: "bg-teal-600",
      iconBg: "bg-teal-50 text-teal-700",
      icon: UserCheckIcon,
    },
    {
      label: "Premium Subscribers",
      value: `${premiumSubscribers} Accounts`,
      accentColor: "bg-emerald-500",
      iconBg: "bg-emerald-50 text-emerald-700",
      icon: CrownIcon,
    },
    {
      label: "Suspended / Blocked",
      value: `${suspendedOrBlocked} Accounts`,
      accentColor: "bg-green-700",
      iconBg: "bg-green-50 text-green-700",
      icon: UserX,
    },
  ];

  const detailFields = customerDetails
    ? [
        { label: "Customer ID", value: customerDetails.customerId || "-", breakAll: true },
        { label: "User ID", value: customerDetails.userId || "-", small: true, breakAll: true },
        { label: "Full Name", value: customerDetails.fullName || "-" },
        { label: "Email", value: customerDetails.email || "-", breakAll: true },
        { label: "Phone", value: customerDetails.phone || "-" },
        { label: "Account State", value: customerDetails.accountState || "-" },
        {
          label: "Registration Date",
          value: formatDate(customerDetails.registrationDate),
        },
        {
          label: "Completed Purchases",
          value: customerDetails.completedPurchases ?? 0,
        },
        {
          label: "Lifetime Outlay",
          value: `₹${Number(customerDetails.lifetimeOutlay ?? 0).toFixed(2)}`,
        },
      ]
    : [];

  const [activeCustomerTab, setActiveCustomerTab] = useState("roster");
  const [activeFilterTab, setActiveFilterTab] = useState("all");

  const customerTabs = [
    { id: "roster", label: "Customers Roster", icon: Users },
    { id: "wallet", label: "Wallet & Balances", icon: Wallet },
    { id: "orders", label: "Order Histories", icon: ShoppingBag },
    { id: "moderation", label: "Moderation & Flags", icon: Flag },
  ];

  const blockedCount = accounts.filter((a) => isCustomerBlocked(a)).length;
  const activeCount = Math.max(0, accounts.length - blockedCount);
  const flaggedCount = accounts.filter((a) => Number(getFlagsRaised(a)) > 0).length;

  const customerFilterPills = [
    { id: "all", label: "All Customers", count: accounts.length },
    { id: "active", label: "Verified Active", count: activeCount },
    { id: "flagged", label: "Flagged Accounts (Needs Review)", count: flaggedCount },
    { id: "blocked", label: "Suspended / Blocked", count: blockedCount },
  ];

  const filteredAccounts = useMemo(() => {
    let list = accounts;

    if (activeFilterTab === "active") {
      list = list.filter((a) => !isCustomerBlocked(a));
    } else if (activeFilterTab === "flagged") {
      list = list.filter((a) => Number(getFlagsRaised(a)) > 0);
    } else if (activeFilterTab === "blocked") {
      list = list.filter((a) => isCustomerBlocked(a));
    }

    return list;
  }, [accounts, activeFilterTab]);

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800">
      <Sidebar />

      <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 lg:overflow-y-auto lg:max-h-dvh space-y-4 sm:space-y-5">
        {/* Top Executive Page Header */}
        <PageHeader
          icon={Users}
          title="Customer Administration"
          subtitle="Manage customer profiles, verify consumer accounts, monitor spending, and regulate access."
          stats={[
            { label: "Total Customers", value: accounts.length },
            { label: "Need Review", value: flaggedCount, alert: flaggedCount > 0 },
          ]}
          actionButtonText="Broadcast to Customers"
          actionButtonIcon={Send}
          onActionClick={() => alert("Broadcast notification to active customers")}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Multi-Color Executive KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Consumers</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Users size={17} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">{accounts.length}</div>
            <span className="text-[11px] font-semibold text-emerald-700">All Registered Accounts</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-500" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Verified</span>
              <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                <CheckCircle2 size={17} />
              </div>
            </div>
            <div className="text-2xl font-black text-sky-700 font-mono">{activeCount}</div>
            <span className="text-[11px] font-semibold text-sky-700">Good Standing Consumers</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Flagged & In Review</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <AlertCircle size={17} />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-700 font-mono">{flaggedCount}</div>
            <span className="text-[11px] font-semibold text-amber-700">Moderation Watchlist</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-500" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Suspended Access</span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
                <ShieldAlert size={17} />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-700 font-mono">{blockedCount}</div>
            <span className="text-[11px] font-semibold text-rose-700">Blocked / Restricted</span>
          </div>
        </div>

        {/* Global Error Banner */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-4 py-3.5 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-2xs"
            >
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <span className="min-w-0 break-words">{errorMessage}</span>
              <button
                onClick={() => setErrorMessage("")}
                className="ml-auto p-1 rounded-lg hover:bg-amber-100 shrink-0 cursor-pointer"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Segmented Tabs Navigation */}
        <SegmentedTabs
          tabs={customerTabs}
          activeTab={activeCustomerTab}
          onTabChange={setActiveCustomerTab}
        />

        {/* Secondary Status Filter Pills */}
        <StatusFilterPills
          filters={customerFilterPills}
          activeFilter={activeFilterTab}
          onFilterChange={setActiveFilterTab}
        />

        {/* Workflow Rules Information Bar */}
        <WorkflowRulesBar
          rulesText="All consumer accounts across registration, moderation, wallet standing, and access permissions."
          showingCount={filteredAccounts.length}
          itemLabel="customers"
        />

        {/* Unified Full-Width Search Input Bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search customers by name, phone, email, customer ID, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        {/* Main Data Section / Table or Empty State */}
        <section className="w-full">
          {loading ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                <RefreshCw size={16} className="animate-spin text-emerald-600" />
                Loading customer records...
              </div>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers found"
              description={`There are currently no customers in the selected "${customerFilterPills.find(f => f.id === activeFilterTab)?.label || 'All'}" category.`}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 overflow-hidden"
            >
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[760px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase font-bold tracking-wider text-slate-500 bg-slate-50/80">
                      <th className="py-3.5 px-4 rounded-l-xl">Customer Details</th>
                      <th className="py-3.5 px-4">Flags</th>
                      <th className="py-3.5 px-4">Primary Infraction</th>
                      <th className="py-3.5 px-4 text-center">Current Status</th>
                      <th className="py-3.5 px-4 text-center rounded-r-xl">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredAccounts.length > 0 ? (
                      filteredAccounts.map((account, index) => {
                      const name = getCustomerName(account);
                      const email = getCustomerEmail(account);
                      const flags = getFlagsRaised(account);
                      const infraction = getPrimaryInfraction(account);
                      const status = getStatus(account);
                      const blocked = isCustomerBlocked(account);

                      return (
                        <motion.tr
                          key={getCustomerId(account) || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          className="text-xs font-semibold text-slate-800 hover:bg-emerald-50/40 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                <Users size={16} />
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold truncate max-w-[230px]">
                                  {name}
                                </p>

                                {email && (
                                  <p className="text-[10px] text-slate-400 truncate max-w-[230px]">
                                    {email}
                                  </p>
                                )}

                                <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                                  {getCustomerId(account)}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                                flags > 0
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}
                            >
                              <Flag size={11} />
                              {flags}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 max-w-[240px]">
                              <span
                                className={`p-1.5 rounded-lg shrink-0 ${
                                  flags > 0
                                    ? "bg-rose-50 text-rose-600"
                                    : "bg-slate-50 text-slate-400"
                                }`}
                              >
                                <ShieldAlert size={13} />
                              </span>

                              <span className="truncate text-slate-700">
                                {infraction}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                                blocked
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {blocked ? (
                                <Clock size={11} />
                              ) : (
                                <CheckCircle2 size={11} />
                              )}
                              {status}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewCustomer(account)}
                                disabled={isRefreshing || detailsLoading}
                                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all disabled:opacity-50"
                                title="View Details"
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                onClick={() => initiateToggleStatus(account)}
                                disabled={isRefreshing}
                                className={`p-2 rounded-xl transition-all disabled:opacity-50 ${
                                  blocked
                                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                                }`}
                                title={
                                  blocked ? "Restore Access" : "Block Account"
                                }
                              >
                                {blocked ? (
                                  <ShieldCheck size={15} />
                                ) : (
                                  <UserX size={15} />
                                )}
                              </button>

                              <button
                                onClick={() => initiateDelete(account)}
                                disabled={isRefreshing}
                                className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-12 text-center text-slate-400 text-xs"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Users size={19} />
                          </div>

                          <span>
                            {searchQuery
                              ? "No customer records matching your search."
                              : "No customer moderation records found."}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden">
              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <RefreshCw
                    size={15}
                    className="animate-spin mx-auto mb-2 text-emerald-600"
                  />
                  Loading customer records...
                </div>
              ) : filteredAccounts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredAccounts.map((account, index) => {
                    const name = getCustomerName(account);
                    const email = getCustomerEmail(account);
                    const flags = getFlagsRaised(account);
                    const infraction = getPrimaryInfraction(account);
                    const status = getStatus(account);
                    const blocked = isCustomerBlocked(account);

                    return (
                      <motion.div
                        key={getCustomerId(account) || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        className="min-w-0 p-3 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                              <Users size={16} />
                            </div>

                            <div className="min-w-0">
                              <h4 className="font-semibold text-sm truncate">
                                {name}
                              </h4>

                              {email && (
                                <p className="text-xs text-slate-500 truncate">
                                  {email}
                                </p>
                              )}

                              <p className="text-[9px] text-slate-400 font-mono mt-1 truncate">
                                {getCustomerId(account)}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                              blocked
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                              Flags
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${
                                flags > 0
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}
                            >
                              <Flag size={11} />
                              {flags}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                              Infraction
                            </span>

                            <span className="font-semibold text-slate-600 text-xs truncate block">
                              {infraction}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <button
                            onClick={() => handleViewCustomer(account)}
                            disabled={isRefreshing || detailsLoading}
                            className="py-2 rounded-xl bg-slate-100 text-slate-700 text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50"
                          >
                            <Eye size={14} />
                            View
                          </button>

                          <button
                            onClick={() => initiateToggleStatus(account)}
                            disabled={isRefreshing}
                            className={`py-2 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 border disabled:opacity-50 ${
                              blocked
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {blocked ? (
                              <ShieldCheck size={14} />
                            ) : (
                              <UserX size={14} />
                            )}
                            {blocked ? "Restore" : "Block"}
                          </button>

                          <button
                            onClick={() => initiateDelete(account)}
                            disabled={isRefreshing}
                            className="py-2 rounded-xl bg-rose-50 text-rose-700 text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 border border-rose-200 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-slate-400">
                  {searchQuery
                    ? "No customer records matching your search."
                    : "No customer moderation records found."}
                </div>
              )}
            </div>
          </motion.div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {modalConfig.isOpen && modalConfig.account && (
          <ConfirmModal
            isOpen={modalConfig.isOpen}
            onClose={closeModal}
            onConfirm={handleConfirmAction}
            type={modalConfig.action === "unblock" ? "success" : "danger"}
            title={
              modalConfig.action === "delete"
                ? "Delete Customer Account"
                : modalConfig.action === "unblock"
                ? "Restore Account Access"
                : "Restrict Account Access"
            }
            message={
              modalConfig.action === "delete"
                ? `Are you sure you want to delete ${getCustomerName(
                    modalConfig.account
                  )}?`
                : modalConfig.action === "unblock"
                ? `Are you sure you want to restore access for ${getCustomerName(
                    modalConfig.account
                  )}?`
                : `Are you sure you want to block access for ${getCustomerName(
                    modalConfig.account
                  )}?`
            }
            confirmText={
              modalConfig.action === "delete"
                ? deleteLoading
                  ? "Deleting..."
                  : "Yes, Delete Account"
                : modalConfig.action === "unblock"
                ? "Yes, Restore Access"
                : "Yes, Block Account"
            }
            cancelText="Cancel Action"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {customerDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={closeDetails}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-4 sm:p-5 bg-white text-slate-900 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                      <Users size={17} className="shrink-0" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Customer Details
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    Account profile and activity metrics
                  </p>
                </div>

                <button
                  onClick={closeDetails}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
                {detailsLoading ? (
                  <div className="py-16 flex items-center justify-center gap-2 text-sm text-slate-500">
                    <RefreshCw
                      size={16}
                      className="animate-spin text-emerald-600"
                    />
                    Loading customer details...
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {detailFields.map((field) => (
                        <div
                          key={field.label}
                          className="min-w-0 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200"
                        >
                          <span className="text-[10px] uppercase font-semibold text-slate-400">
                            {field.label}
                          </span>

                          <p
                            className={`mt-1 font-semibold text-black ${
                              field.small ? "text-xs" : "text-sm"
                            } ${
                              field.breakAll ? "break-all" : "break-words"
                            }`}
                          >
                            {field.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          customerDetails.blocked
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {customerDetails.blocked ? "Blocked" : "Active"}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          customerDetails.verified
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {customerDetails.verified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-5 border-t border-slate-100 shrink-0">
                <button
                  onClick={closeDetails}
                  className="w-full py-3 rounded-2xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}