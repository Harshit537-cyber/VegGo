import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../layouts/Sidebar";
import ConfirmModal from "../../../components/common/ConfirmModal";
import PageHeader from "../../../components/common/PageHeader";
import SegmentedTabs from "../../../components/common/SegmentedTabs";
import StatusFilterPills from "../../../components/common/StatusFilterPills";
import WorkflowRulesBar from "../../../components/common/WorkflowRulesBar";
import EmptyState from "../../../components/common/EmptyState";
import { ROUTES } from "../../../constants/routes.constants";

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
  Wallet,
  ShoppingBag,
  Phone,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Check,
  X,
} from "lucide-react";

/**
 * Animated number counter component for executive stats
 */
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

    const duration = 800;
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

const formatCurrency = (val) => {
  const num = Number(val || 0);
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Helper to normalize disparate backend customer DTO shapes
 */
const normalizeCustomer = (item) => {
  if (!item) return {};
  const userId =
    item.userId ||
    item.customerUserId ||
    item.id ||
    item._id ||
    item.customerId ||
    "";
  const customerId = item.customerId || item.id || item._id || userId || "-";
  const fullName =
    item.fullName ||
    item.name ||
    item.customerName ||
    item.user?.name ||
    "Customer";
  const email = item.email || item.user?.email || "";
  const phone =
    item.phone ||
    item.mobileNumber ||
    item.phoneNumber ||
    item.user?.phone ||
    "-";
  const blocked = Boolean(
    item.blocked === true ||
    item.isBlocked === true ||
    item.accountState === "BLOCKED" ||
    item.accountState === "SUSPENDED"
  );
  const accountState =
    item.accountState || (blocked ? "Blocked" : "Active");
  const verified = Boolean(
    item.verified ||
    item.isVerified ||
    item.phoneVerified ||
    item.emailVerified
  );
  const registrationDate =
    item.registrationDate || item.registeredAt || item.createdAt || null;
  const completedPurchases = Number(
    item.completedPurchases ??
    item.totalOrders ??
    item.ordersCount ??
    item.orders ??
    0
  );
  const lifetimeOutlay = Number(
    item.lifetimeOutlay ??
    item.totalSpent ??
    item.totalAmount ??
    item.outlay ??
    0
  );
  const walletBalance = Number(
    item.walletBalance ??
    item.balance ??
    item.wallet?.balance ??
    0
  );
  const flagsRaised = Number(
    item.flagsRaised ?? item.flags ?? item.reportCount ?? 0
  );
  const primaryInfraction =
    item.primaryInfraction ||
    item.infractionReason ||
    item.reason ||
    (flagsRaised > 0 ? "Under Review" : "None");
  const city =
    item.city ||
    item.cityOfOperation ||
    item.address?.city ||
    item.primaryAddress?.city ||
    "-";

  return {
    ...item,
    userId,
    customerId,
    fullName,
    email,
    phone,
    accountState,
    blocked,
    verified,
    registrationDate,
    completedPurchases,
    lifetimeOutlay,
    walletBalance,
    flagsRaised,
    primaryInfraction,
    city,
  };
};

export default function Customer({ embedded = false }) {
  const navigate = useNavigate();

  // Navigation & View Tabs
  const [activeCustomerTab, setActiveCustomerTab] = useState("roster");
  const [activeFilterTab, setActiveFilterTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  // Data States
  const [accounts, setAccounts] = useState([]);
  const [customerStats, setCustomerStats] = useState(null);
  const [moderationStats, setModerationStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Customer Details Modal State
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Confirm Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    account: null,
    action: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const customerTabs = [
    { id: "roster", label: "Customer Directory", icon: Users },
    { id: "wallet", label: "Customer Wallets", icon: Wallet },
    { id: "orders", label: "Order History", icon: ShoppingBag },
    { id: "moderation", label: "Account Moderation", icon: Flag },
  ];

  /**
   * Fetch customer data according to the active tab and search query
   */
  const fetchCustomerData = useCallback(
    async (tab = activeCustomerTab, page = 0, search = searchQuery) => {
      setIsRefreshing(true);
      setErrorMessage("");

      try {
        // Fetch real KPIs concurrently
        const [customerStatsResponse, moderationStatsResponse] =
          await Promise.allSettled([
            getCustomerStats(),
            getModerationStats(),
          ]);

        if (customerStatsResponse.status === "fulfilled") {
          setCustomerStats(
            customerStatsResponse.value?.data ??
            customerStatsResponse.value ??
            null
          );
        }

        if (moderationStatsResponse.status === "fulfilled") {
          setModerationStats(
            moderationStatsResponse.value?.data ??
            moderationStatsResponse.value ??
            null
          );
        }

        // Fetch customer list based on tab
        const isModerationTab = tab === "moderation";
        const trimmedSearch = search.trim();
        let listResponse;

        if (isModerationTab) {
          listResponse = trimmedSearch
            ? await searchModerationCustomers(trimmedSearch, {
              page,
              size: pageSize,
            })
            : await getModerationCustomers({ page, size: pageSize });
        } else {
          // Standard customer roster, wallet, or order views
          try {
            listResponse = trimmedSearch
              ? await searchCustomers(trimmedSearch, {
                page,
                size: pageSize,
              })
              : await getCustomers({ page, size: pageSize });
          } catch (customerFetchErr) {
            console.warn(
              "Regular customers endpoint fallback to moderation list:",
              customerFetchErr
            );
            // Fallback gracefully to moderation list if base endpoint not ready
            listResponse = trimmedSearch
              ? await searchModerationCustomers(trimmedSearch, {
                page,
                size: pageSize,
              })
              : await getModerationCustomers({ page, size: pageSize });
          }
        }

        const rawData = listResponse?.data ?? listResponse ?? {};
        let rawList = [];

        if (Array.isArray(rawData?.content)) {
          rawList = rawData.content;
        } else if (Array.isArray(rawData?.items)) {
          rawList = rawData.items;
        } else if (Array.isArray(rawData?.customers)) {
          rawList = rawData.customers;
        } else if (Array.isArray(rawData)) {
          rawList = rawData;
        }

        const normalizedList = rawList.map(normalizeCustomer);
        setAccounts(normalizedList);

        const totalPagesCount =
          rawData?.totalPages ?? rawData?.pages ?? 1;
        const totalElementsCount =
          rawData?.totalElements ??
          rawData?.totalCount ??
          normalizedList.length;

        setTotalPages(Math.max(1, totalPagesCount));
        setTotalElements(totalElementsCount);
        setCurrentPage(page);
      } catch (error) {
        console.error("Failed to fetch customer data:", error);
        setErrorMessage(
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch customer data."
        );
      } finally {
        setIsRefreshing(false);
        setLoading(false);
      }
    },
    [activeCustomerTab, searchQuery, pageSize]
  );

  // Debounced search query watcher
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomerData(activeCustomerTab, 0, searchQuery);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, activeCustomerTab, fetchCustomerData]);

  // Tab switch handler
  const handleTabChange = (tabId) => {
    setActiveCustomerTab(tabId);
    setCurrentPage(0);
    fetchCustomerData(tabId, 0, searchQuery);
  };

  const handleRefresh = () => {
    fetchCustomerData(activeCustomerTab, currentPage, searchQuery);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages || loading) return;
    fetchCustomerData(activeCustomerTab, newPage, searchQuery);
  };

  // Inspect customer detail
  const handleViewCustomer = async (account) => {
    const userId = account?.userId || account?.customerId;
    if (!userId) {
      setErrorMessage("Customer User ID not found.");
      return;
    }

    try {
      setDetailsLoading(true);
      setErrorMessage("");
      const response = await getCustomerDetails(userId);
      const data = response?.data ?? response ?? account;
      setCustomerDetails(normalizeCustomer({ ...account, ...data }));
    } catch (error) {
      console.warn("Could not fetch full details, showing current record:", error);
      setCustomerDetails(normalizeCustomer(account));
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setCustomerDetails(null);
  };

  // Initiate status or delete actions
  const initiateToggleStatus = (account) => {
    setModalConfig({
      isOpen: true,
      account,
      action: account.blocked ? "unblock" : "block",
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

    const customerUserId = account.userId || account.customerId;
    if (!customerUserId) {
      setErrorMessage("Customer User ID is missing.");
      closeModal();
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage("");

      if (action === "block") {
        await blockCustomer(customerUserId);
      } else if (action === "unblock") {
        await unblockCustomer(customerUserId);
      } else if (action === "delete") {
        await deleteCustomer(customerUserId);
      }

      closeModal();
      if (customerDetails?.userId === customerUserId) {
        setCustomerDetails(null);
      }
      await fetchCustomerData(activeCustomerTab, currentPage, searchQuery);
    } catch (error) {
      console.error(`Failed to ${action} customer:`, error);
      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        `Failed to ${action} customer.`
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Real KPI stats computation
  const totalCustomersStat =
    customerStats?.totalCustomers ??
    customerStats?.totalUsers ??
    totalElements ??
    accounts.length;

  const activeThisMonthStat =
    customerStats?.activeThisMonth ??
    customerStats?.activeUsers ??
    Math.max(0, totalCustomersStat - (moderationStats?.suspendedOrBlocked ?? 0));

  const premiumSubscribersStat =
    customerStats?.premiumSubscribers ??
    customerStats?.highValueCustomers ??
    accounts.filter((a) => a.lifetimeOutlay >= 1000).length;

  const suspendedOrBlockedStat =
    moderationStats?.suspendedOrBlocked ??
    customerStats?.suspendedAccounts ??
    accounts.filter((a) => a.blocked).length;

  // Client filtering
  const blockedCount = accounts.filter((a) => a.blocked).length;
  const activeCount = Math.max(0, accounts.length - blockedCount);
  const flaggedCount = accounts.filter((a) => a.flagsRaised > 0).length;

  const customerFilterPills = [
    { id: "all", label: "All Records", count: accounts.length },
    { id: "active", label: "Active & Verified", count: activeCount },
    { id: "flagged", label: "Flagged / Review", count: flaggedCount },
    { id: "blocked", label: "Suspended / Blocked", count: blockedCount },
  ];

  const filteredAccounts = useMemo(() => {
    let list = accounts;
    if (activeFilterTab === "active") {
      list = list.filter((a) => !a.blocked);
    } else if (activeFilterTab === "flagged") {
      list = list.filter((a) => a.flagsRaised > 0);
    } else if (activeFilterTab === "blocked") {
      list = list.filter((a) => a.blocked);
    }
    return list;
  }, [accounts, activeFilterTab]);

  return (
    <div
      className={
        embedded
          ? "w-full space-y-4 sm:space-y-5"
          : "min-h-dvh w-full overflow-x-hidden bg-[#f6f9f7] flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-100 selection:text-emerald-900"
      }
    >
      {!embedded && <Sidebar />}

      <div
        className={
          embedded
            ? "w-full space-y-4 sm:space-y-5"
            : "flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 lg:overflow-y-auto lg:max-h-dvh space-y-4 sm:space-y-5"
        }
      >
        {/* Top Executive Page Header */}
        <PageHeader
          icon={Users}
          title="Customer Management"
          subtitle="View and manage customer accounts, orders, and wallet balances."
          stats={[
            { label: "Total Customers", value: totalCustomersStat },
            {
              label: "Need Review",
              value: flaggedCount,
              alert: flaggedCount > 0,
            },
          ]}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Global Error Banner */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-4 py-3.5 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-2xs"
            >
              <AlertCircle size={18} className="text-amber-600 shrink-0" />
              <span className="min-w-0 break-words flex-1">
                {errorMessage}
              </span>
              <button
                onClick={() => setErrorMessage("")}
                className="p-1 rounded-lg hover:bg-amber-100 shrink-0 cursor-pointer text-amber-700"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Segmented View Tabs Navigation */}
        <div className="bg-white p-2 rounded-2xl border border-emerald-100/80 shadow-2xs">
          <SegmentedTabs
            tabs={customerTabs}
            activeTab={activeCustomerTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Status Filter Pills */}
        <StatusFilterPills
          filters={customerFilterPills}
          activeFilter={activeFilterTab}
          onFilterChange={setActiveFilterTab}
        />

        {/* Workflow Rules Information Bar */}
        <WorkflowRulesBar
          rulesText={
            activeCustomerTab === "moderation"
              ? "Review customer infractions, reported flags, and security actions."
              : activeCustomerTab === "wallet"
                ? "Monitor customer prepaid balances, refunds, and lifetime platform purchases."
                : activeCustomerTab === "orders"
                  ? "Analyze consumer ordering patterns, frequencies, and lifetime outlay."
                  : "Complete consumer directory across registrations, contact information, and account access."
          }
          showingCount={filteredAccounts.length}
          itemLabel={
            activeCustomerTab === "moderation"
              ? "moderated accounts"
              : "customers"
          }
        />

        {/* Search Bar */}
        <div className="relative w-full">
          <Search
            className="absolute left-4 top-3.5 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder={
              activeCustomerTab === "moderation"
                ? "Search flagged customers by name, phone, or infraction..."
                : "Search customers by name, phone, or email..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        {/* Main Content Section */}
        <section className="w-full">
          {loading ? (
            <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80">
              <div className="flex flex-col items-center justify-center gap-3 text-xs font-semibold text-slate-500">
                <RefreshCw
                  size={22}
                  className="animate-spin text-emerald-600"
                />
                Loading customer records...
              </div>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <EmptyState
              icon={
                activeCustomerTab === "moderation"
                  ? Flag
                  : activeCustomerTab === "wallet"
                    ? Wallet
                    : activeCustomerTab === "orders"
                      ? ShoppingBag
                      : Users
              }
              title={`No ${activeCustomerTab === "moderation" ? "flagged accounts" : "customers"} found`}
              description={
                searchQuery
                  ? `No records matched "${searchQuery}". Try searching with a different name, phone, or ID.`
                  : `There are currently no records in the "${customerFilterPills.find((f) => f.id === activeFilterTab)?.label || "Selected"}" filter.`
              }
            />
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[900px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase font-bold tracking-wider text-slate-500 bg-slate-50/60">
                      <th className="py-3.5 px-5">Customer Profile</th>

                      {/* Tab-Specific Columns */}
                      {activeCustomerTab === "roster" && (
                        <>
                          <th className="py-3.5 px-5">Phone Number</th>
                          <th className="py-3.5 px-5">Orders & Outlay</th>
                          <th className="py-3.5 px-5">Joined Date</th>
                        </>
                      )}

                      {activeCustomerTab === "wallet" && (
                        <>
                          <th className="py-3.5 px-5">Wallet Balance</th>
                          <th className="py-3.5 px-5">Lifetime Outlay</th>
                          <th className="py-3.5 px-5">Completed Orders</th>
                        </>
                      )}

                      {activeCustomerTab === "orders" && (
                        <>
                          <th className="py-3.5 px-5">Completed Orders</th>
                          <th className="py-3.5 px-5">Lifetime Outlay</th>
                          <th className="py-3.5 px-5">Avg Order Value</th>
                          <th className="py-3.5 px-5">Joined Date</th>
                        </>
                      )}

                      {activeCustomerTab === "moderation" && (
                        <>
                          <th className="py-3.5 px-5">Flags Raised</th>
                          <th className="py-3.5 px-5">Primary Infraction</th>
                        </>
                      )}

                      <th className="py-3.5 px-5 text-center">Status</th>
                      <th className="py-3.5 px-5 text-center min-w-[230px]">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredAccounts.map((account, index) => {
                      const avgOrderValue =
                        account.completedPurchases > 0
                          ? account.lifetimeOutlay / account.completedPurchases
                          : 0;

                      return (
                        <tr
                          key={account.customerId || account.userId || index}
                          className="text-xs font-semibold text-slate-800 hover:bg-emerald-50/30 transition-colors"
                        >
                          {/* Common Profile Column */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                                {account.fullName?.charAt(0)?.toUpperCase() || "C"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 truncate max-w-[200px]">
                                  {account.fullName}
                                </p>
                                {account.email && (
                                  <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                    {account.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Roster Tab Columns */}
                          {activeCustomerTab === "roster" && (
                            <>
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-1.5 text-slate-700">
                                  <Phone size={13} className="text-slate-400" />
                                  <span>{account.phone}</span>
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                <span className="font-bold text-slate-900 block">
                                  {formatCurrency(account.lifetimeOutlay)}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {account.completedPurchases} orders
                                </span>
                              </td>
                              <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">
                                {formatDate(account.registrationDate)}
                              </td>
                            </>
                          )}

                          {/* Wallet Tab Columns */}
                          {activeCustomerTab === "wallet" && (
                            <>
                              <td className="py-4 px-5">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Wallet size={12} />
                                  {formatCurrency(account.walletBalance)}
                                </span>
                              </td>
                              <td className="py-4 px-5 font-bold text-slate-900">
                                {formatCurrency(account.lifetimeOutlay)}
                              </td>
                              <td className="py-4 px-5 text-slate-600">
                                {account.completedPurchases} purchases
                              </td>
                            </>
                          )}

                          {/* Orders Tab Columns */}
                          {activeCustomerTab === "orders" && (
                            <>
                              <td className="py-4 px-5">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold">
                                  <ShoppingBag size={12} className="text-emerald-600" />
                                  {account.completedPurchases} Orders
                                </span>
                              </td>
                              <td className="py-4 px-5 font-bold text-slate-900">
                                {formatCurrency(account.lifetimeOutlay)}
                              </td>
                              <td className="py-4 px-5 text-slate-600">
                                {formatCurrency(avgOrderValue)}
                              </td>
                              <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">
                                {formatDate(account.registrationDate)}
                              </td>
                            </>
                          )}

                          {/* Moderation Tab Columns */}
                          {activeCustomerTab === "moderation" && (
                            <>
                              <td className="py-4 px-5">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${account.flagsRaised > 0
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-slate-50 text-slate-600 border-slate-200"
                                    }`}
                                >
                                  <Flag size={11} />
                                  {account.flagsRaised} Flags
                                </span>
                              </td>
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-2 max-w-[220px]">
                                  <span
                                    className={`p-1.5 rounded-lg shrink-0 ${account.flagsRaised > 0
                                        ? "bg-rose-50 text-rose-600"
                                        : "bg-slate-50 text-slate-400"
                                      }`}
                                  >
                                    <ShieldAlert size={13} />
                                  </span>
                                  <span className="truncate text-slate-700">
                                    {account.primaryInfraction}
                                  </span>
                                </div>
                              </td>
                            </>
                          )}

                          {/* Status Column */}
                          <td className="py-4 px-5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${account.blocked
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                            >
                              {account.blocked ? (
                                <Clock size={11} />
                              ) : (
                                <CheckCircle2 size={11} />
                              )}
                              {account.blocked ? "Blocked" : "Active"}
                            </span>
                          </td>

                          {/* Actions Column */}
                          <td className="py-4 px-5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleViewCustomer(account)}
                                disabled={isRefreshing || detailsLoading}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-40"
                                title="View Customer Details"
                              >
                                <Eye size={13} className="text-slate-500" />
                                <span>View</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => initiateToggleStatus(account)}
                                disabled={isRefreshing}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-2xs cursor-pointer disabled:opacity-40 ${
                                  account.blocked
                                    ? "bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border-emerald-200/90 hover:border-emerald-600 hover:shadow-emerald-600/20"
                                    : "bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white border-amber-200/90 hover:border-amber-600 hover:shadow-amber-600/20"
                                }`}
                                title={
                                  account.blocked
                                    ? "Restore Access"
                                    : "Block Customer"
                                }
                              >
                                {account.blocked ? (
                                  <>
                                    <ShieldCheck size={13} />
                                    <span>Restore</span>
                                  </>
                                ) : (
                                  <>
                                    <UserX size={13} />
                                    <span>Block</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => initiateDelete(account)}
                                disabled={isRefreshing}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200/90 hover:border-rose-600 text-xs font-bold shadow-2xs hover:shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-40"
                                title="Delete Customer Account"
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Responsive Cards */}
              <div className="lg:hidden p-3 sm:p-4 divide-y divide-slate-100">
                {filteredAccounts.map((account, index) => (
                  <div
                    key={account.customerId || account.userId || index}
                    className="py-4 first:pt-0 last:pb-0 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {account.fullName?.charAt(0)?.toUpperCase() || "C"}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {account.fullName}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">
                            {account.phone || account.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${account.blocked
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                      >
                        {account.blocked ? "Blocked" : "Active"}
                      </span>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                          Lifetime Outlay
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(account.lifetimeOutlay)}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                          Wallet Balance
                        </span>
                        <span className="font-bold text-emerald-700">
                          {formatCurrency(account.walletBalance)}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Actions */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() => handleViewCustomer(account)}
                        disabled={isRefreshing || detailsLoading}
                        className="py-2 px-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        <Eye size={14} />
                        View
                      </button>

                      <button
                        onClick={() => initiateToggleStatus(account)}
                        disabled={isRefreshing}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border cursor-pointer disabled:opacity-40 ${account.blocked
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                      >
                        {account.blocked ? (
                          <ShieldCheck size={14} />
                        ) : (
                          <UserX size={14} />
                        )}
                        {account.blocked ? "Restore" : "Block"}
                      </button>

                      <button
                        onClick={() => initiateDelete(account)}
                        disabled={isRefreshing}
                        className="py-2 px-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-rose-200 cursor-pointer disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Footer with Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                  <span>
                    Showing Page {currentPage + 1} of {totalPages} (
                    {totalElements} total entries)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 0 || loading}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 font-mono">
                      {currentPage + 1}
                    </span>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages - 1 || loading}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Confirmation Modal for Block / Unblock / Delete */}
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
                ? `Are you sure you want to permanently delete the account of ${modalConfig.account.fullName}? This cannot be undone.`
                : modalConfig.action === "unblock"
                  ? `Restore full platform privileges and ordering capability for ${modalConfig.account.fullName}?`
                  : `Block and suspend access for ${modalConfig.account.fullName}? They will not be able to log in or checkout.`
            }
            confirmText={
              modalConfig.action === "delete"
                ? actionLoading
                  ? "Deleting..."
                  : "Yes, Delete Account"
                : modalConfig.action === "unblock"
                  ? actionLoading
                    ? "Restoring..."
                    : "Yes, Restore Access"
                  : actionLoading
                    ? "Blocking..."
                    : "Yes, Block Account"
            }
            cancelText="Cancel"
          />
        )}
      </AnimatePresence>

      {/* Complete Customer Details Modal */}
      <AnimatePresence>
        {customerDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={closeDetails}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 bg-white text-slate-900 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base shrink-0">
                    {customerDetails.fullName?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                      {customerDetails.fullName}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={closeDetails}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5">
                {detailsLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-2 text-sm text-slate-500">
                    <RefreshCw
                      size={20}
                      className="animate-spin text-emerald-600"
                    />
                    Loading customer dossier...
                  </div>
                ) : (
                  <>
                    {/* Financial Summary Banner */}
                    <div className="grid grid-cols-3 gap-3 p-3.5 bg-gradient-to-r from-emerald-50/70 to-teal-50/50 rounded-2xl border border-emerald-100/80">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Lifetime Outlay
                        </span>
                        <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                          {formatCurrency(customerDetails.lifetimeOutlay)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Wallet Balance
                        </span>
                        <span className="text-sm sm:text-base font-black text-emerald-700 font-mono">
                          {formatCurrency(customerDetails.walletBalance)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Total Orders
                        </span>
                        <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                          {customerDetails.completedPurchases}
                        </span>
                      </div>
                    </div>

                    {/* Detailed Fields Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Phone Number
                        </span>
                        <p className="mt-1 font-semibold text-sm text-slate-800">
                          {customerDetails.phone || "-"}
                        </p>
                      </div>

                      <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Registration Date
                        </span>
                        <p className="mt-1 font-semibold text-sm text-slate-800 font-mono">
                          {formatDate(customerDetails.registrationDate)}
                        </p>
                      </div>

                      <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Flags Raised
                        </span>
                        <p className="mt-1 font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                          <Flag size={14} className="text-amber-500" />
                          {customerDetails.flagsRaised} reports
                        </p>
                      </div>

                      <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Primary Infraction
                        </span>
                        <p className="mt-1 font-semibold text-sm text-slate-800 truncate">
                          {customerDetails.primaryInfraction}
                        </p>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${customerDetails.blocked
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                      >
                        {customerDetails.blocked ? (
                          <ShieldAlert size={13} />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        {customerDetails.blocked ? "Account Blocked" : "Active Account"}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${customerDetails.verified
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                      >
                        {customerDetails.verified ? (
                          <ShieldCheck size={13} />
                        ) : (
                          <Clock size={13} />
                        )}
                        {customerDetails.verified
                          ? "Verified Identity"
                          : "Standard Profile"}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => initiateToggleStatus(customerDetails)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border cursor-pointer transition-all ${customerDetails.blocked
                        ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                        : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                      }`}
                  >
                    {customerDetails.blocked ? (
                      <ShieldCheck size={15} />
                    ) : (
                      <UserX size={15} />
                    )}
                    {customerDetails.blocked
                      ? "Restore Access"
                      : "Block Access"}
                  </button>

                  <button
                    onClick={() => initiateDelete(customerDetails)}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Trash2 size={15} />
                    Delete Account
                  </button>
                </div>

                <button
                  onClick={closeDetails}
                  className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}