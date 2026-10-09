import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  RefreshCw,
  Search,
  Filter,
  Wallet as WalletIcon,
  CheckCircle2,
  XCircle,
  Clock3,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Truck,
  Store,
  User,
  Sparkles,
  Zap,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  getPendingPayouts,
  approvePayout,
  rejectPayout,
} from "../Api/payouts/vendorPayouts";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.response?.data?.errors?.[0]?.message ||
  error?.message ||
  fallback;

const formatAmount = (amount) => {
  const value = Number(amount) || 0;

  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getId = (item) =>
  String(item?.id || item?.payoutRequestId || item?._id || "");

const getUserId = (item) =>
  String(item?.userId || item?.customerId || "");

const getAmount = (item) =>
  Number(
    item?.amount ??
      item?.payoutAmount ??
      item?.requestedAmount ??
      0
  );

const getStatus = (item) =>
  String(item?.status || "PENDING").toUpperCase();

const getUserRole = (item) =>
  String(item?.userRole || "").toUpperCase();

const getRequestedAt = (item) =>
  item?.createdAt ||
  item?.requestedAt ||
  item?.createdDate ||
  item?.date ||
  null;

const getBankAccount = (item) => item?.bankAccount || {};

const getAccountHolder = (item) =>
  getBankAccount(item)?.accountHolderName || "N/A";

const getBankName = (item) =>
  getBankAccount(item)?.bankName || "N/A";

const getIfsc = (item) =>
  getBankAccount(item)?.ifscCode || "N/A";

const getAccountNumber = (item) =>
  getBankAccount(item)?.accountNumber || "N/A";

const maskAccountNumber = (accountNumber) => {
  if (!accountNumber || accountNumber === "N/A") return "N/A";

  const value = String(accountNumber);

  if (value.length <= 4) return value;

  return `${"*".repeat(value.length - 4)}${value.slice(-4)}`;
};

const isVendor = (item) =>
  getUserRole(item) === "VENDOR";

const isDelivery = (item) => {
  const role = getUserRole(item);

  return (
    role === "DELIVERY_PARTNER" ||
    role === "DELIVERY" ||
    role === "DELIVERYBOY" ||
    role === "DELIVERY_BOY" ||
    role === "RIDER"
  );
};

const AnimatedValue = ({ value, prefix = "" }) => {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    const targetNum = Number(value) || 0;
    const duration = 800;
    const startTime = performance.now();
    let animationFrameId;

    const updateCount = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress =
        progress === 1
          ? 1
          : 1 - Math.pow(2, -10 * progress);

      setDisplayValue(
        Math.floor(
          easeProgress * targetNum
        ).toLocaleString("en-IN")
      );

      if (progress < 1) {
        animationFrameId =
          requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(
          targetNum.toLocaleString("en-IN")
        );
      }
    };

    animationFrameId =
      requestAnimationFrame(updateCount);

    return () =>
      cancelAnimationFrame(animationFrameId);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const normalized = String(
    status || "PENDING"
  ).toUpperCase();

  const config = {
    PENDING: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock3,
    },
    APPROVED: {
      label: "Approved",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },
    REJECTED: {
      label: "Rejected",
      className:
        "bg-rose-50 text-rose-700 border-rose-200",
      icon: XCircle,
    },
  };

  const current =
    config[normalized] || {
      label: normalized,
      className:
        "bg-slate-50 text-slate-600 border-slate-200",
      icon: Clock3,
    };

  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold ${current.className}`}
    >
      <Icon size={12} />
      {current.label}
    </span>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
    <span className="text-xs font-semibold text-slate-400">
      {label}
    </span>

    <span className="max-w-[62%] break-words text-right text-xs font-bold text-slate-800">
      {value || "N/A"}
    </span>
  </div>
);

export default function Payouts() {
  const [currentTab, setCurrentTab] =
    useState("vendor");

  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(null);
  const [searchQuery, setSearchQuery] =
    useState("");
  const [activeFilter, setActiveFilter] =
    useState("All");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [isRefreshing, setIsRefreshing] =
    useState(false);
  const [selectedPayout, setSelectedPayout] =
    useState(null);
  const [showDetails, setShowDetails] =
    useState(false);
  const [refreshKey, setRefreshKey] =
    useState(0);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response =
        await getPendingPayouts(page, 20);

      const root =
        response?.data || response;

      const records = Array.isArray(root)
        ? root
        : Array.isArray(root?.content)
        ? root.content
        : Array.isArray(root?.items)
        ? root.items
        : Array.isArray(root?.payouts)
        ? root.payouts
        : Array.isArray(root?.data)
        ? root.data
        : Array.isArray(
            root?.data?.content
          )
        ? root.data.content
        : Array.isArray(
            root?.data?.payouts
          )
        ? root.data.payouts
        : [];

      setPayouts(records);

      const pages =
        Number(root?.totalPages) ||
        Number(
          root?.pagination?.totalPages
        ) ||
        Number(
          root?.data?.totalPages
        ) ||
        Number(
          root?.data?.pagination
            ?.totalPages
        ) ||
        1;

      setTotalPages(pages);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(
        "Payout API Error:",
        error
      );

      setPayouts([]);

      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to load payout requests."
        )
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, [page]);

  const vendorPayouts = useMemo(
    () => payouts.filter(isVendor),
    [payouts]
  );

  const deliveryPayouts = useMemo(
    () => payouts.filter(isDelivery),
    [payouts]
  );

  const currentPayouts =
    currentTab === "vendor"
      ? vendorPayouts
      : deliveryPayouts;

  const filteredPayouts = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    return currentPayouts.filter((item) => {
      const status = getStatus(item);
      const id = getId(item).toLowerCase();
      const userId =
        getUserId(item).toLowerCase();
      const amount = String(getAmount(item));
      const accountHolder =
        getAccountHolder(item).toLowerCase();
      const bankName =
        getBankName(item).toLowerCase();

      const matchesFilter =
        activeFilter === "All" ||
        status === activeFilter.toUpperCase();

      const matchesSearch =
        !query ||
        id.includes(query) ||
        userId.includes(query) ||
        amount.includes(query) ||
        accountHolder.includes(query) ||
        bankName.includes(query) ||
        status
          .toLowerCase()
          .includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [
    currentPayouts,
    searchQuery,
    activeFilter,
  ]);

  const pendingCount =
    currentPayouts.filter(
      (item) => getStatus(item) === "PENDING"
    ).length;

  const approvedCount =
    currentPayouts.filter(
      (item) => getStatus(item) === "APPROVED"
    ).length;

  const rejectedCount =
    currentPayouts.filter(
      (item) => getStatus(item) === "REJECTED"
    ).length;

  const totalAmount =
    currentPayouts.reduce(
      (total, item) =>
        total + getAmount(item),
      0
    );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPayouts();
  };

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    setSearchQuery("");
    setActiveFilter("All");
  };

  const handleApprove = async (item) => {
    const id = getId(item);

    if (!id) return;

    try {
      setActionLoading(`approve-${id}`);

      await approvePayout(id);

      setPayouts((prev) =>
        prev.filter(
          (payout) => getId(payout) !== id
        )
      );

      setShowDetails(false);
      setSelectedPayout(null);
    } catch (error) {
      alert(
        getErrorMessage(
          error,
          "Unable to approve payout."
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (item) => {
    const id = getId(item);

    if (!id) return;

    try {
      setActionLoading(`reject-${id}`);

      await rejectPayout(id);

      setPayouts((prev) =>
        prev.filter(
          (payout) => getId(payout) !== id
        )
      );

      setShowDetails(false);
      setSelectedPayout(null);
    } catch (error) {
      alert(
        getErrorMessage(
          error,
          "Unable to reject payout."
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  const openDetails = (item) => {
    setSelectedPayout(item);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedPayout(null);
  };

  const stats = [
    {
      label:
        currentTab === "vendor"
          ? "Vendor Pending"
          : "Delivery Pending",
      value: pendingCount,
      accent: "bg-emerald-600",
      iconBg:
        "bg-emerald-50 text-emerald-700",
      tag:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Clock3,
      status: "Pending",
      footer: "Requests",
    },
    {
      label: "Approved",
      value: approvedCount,
      accent: "bg-teal-600",
      iconBg:
        "bg-teal-50 text-teal-700",
      tag:
        "bg-teal-50 text-teal-700 border-teal-200",
      icon: CheckCircle2,
      status: "Approved",
      footer: "Processed",
    },
    {
      label: "Rejected",
      value: rejectedCount,
      accent: "bg-green-700",
      iconBg:
        "bg-rose-50 text-rose-700",
      tag:
        "bg-rose-50 text-rose-700 border-rose-200",
      icon: XCircle,
      status: "Rejected",
      footer: "Processed",
    },
    {
      label: "Total Amount",
      value: totalAmount,
      prefix: "₹",
      accent: "bg-emerald-500",
      iconBg:
        "bg-emerald-50 text-emerald-700",
      tag:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: IndianRupee,
      status: "Value",
      footer: "Current Page",
      amount: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-18 sm:pt-20 lg:pt-8 w-full space-y-6 sm:space-y-8 lg:max-h-screen lg:overflow-y-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="group relative overflow-hidden rounded-3xl border border-emerald-900 bg-emerald-950 p-6 text-white shadow-xl shadow-emerald-950/20 sm:p-7"
        >
          <div className="pointer-events-none absolute -right-10 -top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800 bg-emerald-900/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
                  <Zap
                    size={12}
                    className="text-emerald-400"
                  />
                  Finance Control
                </span>

                <div className="flex items-center gap-2 rounded-full border border-rose-900/80 bg-rose-950/80 px-3 py-1 text-rose-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                  </span>

                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white">
                    LIVE ADMIN VEG GO
                  </span>
                </div>
              </div>

              <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Payout Management

                <Sparkles className="h-6 w-6 text-emerald-400 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </h1>

              <p className="max-w-xl text-xs font-medium text-emerald-200/80 sm:text-sm">
                Manage vendor and delivery
                payout requests from one
                finance control center.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-center">
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-800 bg-emerald-900/60 px-4 py-2 text-xs font-semibold text-emerald-100 shadow-inner backdrop-blur-sm">
                <Calendar
                  size={14}
                  className="text-emerald-400"
                />

                <span>
                  {new Date().toLocaleDateString(
                    "en-IN",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="rounded-2xl border border-emerald-800 bg-emerald-900/60 p-2.5 text-white shadow-inner transition-all hover:bg-emerald-800 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={
                    isRefreshing
                      ? "animate-spin text-emerald-300"
                      : "text-emerald-300"
                  }
                />
              </motion.button>
            </div>
          </div>
        </motion.header>

        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-xs font-semibold text-rose-700"
            >
              <AlertCircle size={15} />
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={`${stat.label}-${refreshKey}`}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.08,
                }}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:border-emerald-300/80 hover:shadow-xl sm:p-6"
              >
                <div
                  className={`absolute left-0 right-0 top-0 h-1.5 ${stat.accent}`}
                />

                <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-emerald-50 opacity-0 transition-all duration-500 group-hover:scale-125 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {stat.label}
                    </span>

                    <div
                      className={`rounded-2xl p-2.5 shadow-sm ${stat.iconBg}`}
                    >
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    {loading ? (
                      <span className="text-slate-300">
                        ...
                      </span>
                    ) : (
                      <>
                        <AnimatedValue
                          value={stat.value}
                          prefix={stat.prefix || ""}
                        />

                        <span className="ml-1 font-sans text-sm text-slate-400">
                          {stat.amount
                            ? ""
                            : "Records"}
                        </span>
                      </>
                    )}
                  </h3>
                </div>

                <div className="relative z-10 mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${stat.tag}`}
                  >
                    <Icon size={12} />
                    {stat.status}
                  </span>

                  <span className="text-[10px] font-semibold text-slate-400">
                    {stat.amount
                      ? formatAmount(
                          stat.value
                        )
                      : stat.footer}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
          <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-2.5 text-emerald-700">
                  <WalletIcon size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                    Payout Records
                  </h2>

                  <p className="text-xs font-semibold text-slate-400">
                    Manage vendor and delivery
                    payout requests
                  </p>
                </div>
              </div>

              <div className="flex w-fit rounded-2xl border border-slate-200 bg-slate-50 p-1">
                <button
                  onClick={() =>
                    handleTabChange("vendor")
                  }
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    currentTab === "vendor"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Store size={14} />
                  Vendor
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                      currentTab === "vendor"
                        ? "bg-white/20"
                        : "bg-white"
                    }`}
                  >
                    {vendorPayouts.length}
                  </span>
                </button>

                <button
                  onClick={() =>
                    handleTabChange("delivery")
                  }
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    currentTab === "delivery"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Truck size={14} />
                  Delivery
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                      currentTab === "delivery"
                        ? "bg-white/20"
                        : "bg-white"
                    }`}
                  >
                    {deliveryPayouts.length}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />

                <input
                  type="text"
                  placeholder={`Search ${
                    currentTab === "vendor"
                      ? "vendor"
                      : "delivery"
                  } payouts...`}
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex shrink-0 items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1">
                <Filter
                  size={14}
                  className="ml-2 shrink-0 text-slate-400"
                />

                {[
                  "All",
                  "Pending",
                  "Approved",
                  "Rejected",
                ].map((filter) => (
                  <button
                    key={filter}
                    onClick={() =>
                      setActiveFilter(
                        filter
                      )
                    }
                    className={`whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-bold transition-all ${
                      activeFilter === filter
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden w-full md:block">
            <table className="w-full table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[20%]" />
                <col className="w-[18%]" />
                <col className="w-[15%]" />
                <col className="w-[10%]" />
                <col className="w-[15%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
              </colgroup>

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="rounded-l-xl px-3 py-3.5">
                    Payout
                  </th>

                  <th className="px-3 py-3.5">
                    User
                  </th>

                  <th className="px-3 py-3.5">
                    Bank Account
                  </th>

                  <th className="px-3 py-3.5">
                    Amount
                  </th>

                  <th className="px-3 py-3.5">
                    Requested
                  </th>

                  <th className="px-3 py-3.5">
                    Status
                  </th>

                  <th className="rounded-r-xl px-3 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-14 text-center"
                    >
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Loader2
                          size={28}
                          className="animate-spin text-emerald-600"
                        />

                        <span className="text-xs font-semibold">
                          Loading payout
                          requests...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPayouts.length > 0 ? (
                  filteredPayouts.map(
                    (item, index) => {
                      const id = getId(item);
                      const status =
                        getStatus(item);
                      const vendor =
                        currentTab ===
                        "vendor";

                      return (
                        <motion.tr
                          key={
                            id || index
                          }
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            duration: 0.25,
                            delay:
                              index * 0.03,
                          }}
                          className="group text-xs font-semibold text-slate-700 transition-colors hover:bg-emerald-50/40"
                        >
                          <td className="overflow-hidden px-3 py-4">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                                  vendor
                                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                    : "border-teal-100 bg-teal-50 text-teal-700"
                                }`}
                              >
                                {vendor ? (
                                  <Store size={16} />
                                ) : (
                                  <Truck size={16} />
                                )}
                              </div>

                              <div className="min-w-0">
                                <div
                                  className="truncate font-bold text-slate-900 group-hover:text-emerald-700"
                                  title={id}
                                >
                                  {id ||
                                    "N/A"}
                                </div>

                                <div className="mt-1 text-[9px] text-slate-400">
                                  Payout
                                  Request
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="overflow-hidden px-3 py-4">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                <User size={14} />
                              </div>

                              <div className="min-w-0">
                                <div
                                  className="truncate font-bold text-slate-800"
                                  title={getAccountHolder(
                                    item
                                  )}
                                >
                                  {getAccountHolder(
                                    item
                                  )}
                                </div>

                                <div
                                  className="mt-1 truncate text-[9px] text-slate-400"
                                  title={getUserId(
                                    item
                                  )}
                                >
                                  {getUserId(
                                    item
                                  ) || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="overflow-hidden px-3 py-4">
                            <div
                              className="truncate font-bold text-slate-800"
                              title={getBankName(
                                item
                              )}
                            >
                              {getBankName(
                                item
                              )}
                            </div>

                            <div className="mt-1 truncate text-[9px] text-slate-500">
                              {maskAccountNumber(
                                getAccountNumber(
                                  item
                                )
                              )}
                            </div>

                            <div className="mt-1 truncate text-[9px] text-slate-400">
                              IFSC:{" "}
                              {getIfsc(item)}
                            </div>
                          </td>

                          <td className="px-3 py-4">
                            <div className="flex items-center gap-0.5 whitespace-nowrap font-bold text-emerald-600">
                              <IndianRupee
                                size={12}
                              />

                              {Number(
                                getAmount(item)
                              ).toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </div>
                          </td>

                          <td className="overflow-hidden px-3 py-4">
                            <div className="flex items-center gap-1.5 whitespace-nowrap text-[9px] text-slate-500">
                              <Calendar
                                size={12}
                                className="shrink-0"
                              />

                              <span className="truncate">
                                {formatDate(
                                  getRequestedAt(
                                    item
                                  )
                                )}
                              </span>
                            </div>
                          </td>

                          <td className="px-3 py-4">
                            <StatusBadge
                              status={status}
                            />
                          </td>

                          <td className="px-2 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() =>
                                  openDetails(
                                    item
                                  )
                                }
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                title="View Details"
                              >
                                <Eye
                                  size={14}
                                />
                              </button>

                              {status ===
                                "PENDING" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleApprove(
                                        item
                                      )
                                    }
                                    disabled={
                                      actionLoading ===
                                      `approve-${id}`
                                    }
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                    title="Approve"
                                  >
                                    {actionLoading ===
                                    `approve-${id}` ? (
                                      <Loader2
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <CheckCircle2
                                        size={14}
                                      />
                                    )}
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleReject(
                                        item
                                      )
                                    }
                                    disabled={
                                      actionLoading ===
                                      `reject-${id}`
                                    }
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white transition hover:bg-rose-700 disabled:opacity-50"
                                    title="Reject"
                                  >
                                    {actionLoading ===
                                    `reject-${id}` ? (
                                      <Loader2
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <XCircle
                                        size={14}
                                      />
                                    )}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-14 text-center"
                    >
                      <WalletIcon
                        size={35}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <p className="text-xs font-semibold text-slate-400">
                        No matching payout
                        records found.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {loading ? (
              <div className="py-12 text-center">
                <Loader2
                  size={26}
                  className="mx-auto mb-3 animate-spin text-emerald-600"
                />

                <p className="text-xs font-semibold text-slate-400">
                  Loading payout
                  requests...
                </p>
              </div>
            ) : filteredPayouts.length > 0 ? (
              filteredPayouts.map(
                (item, index) => {
                  const id = getId(item);
                  const status =
                    getStatus(item);
                  const vendor =
                    currentTab ===
                    "vendor";
                  const amount =
                    getAmount(item);

                  return (
                    <motion.div
                      key={
                        id || index
                      }
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/40 p-4 transition-all hover:bg-white hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              vendor
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-teal-50 text-teal-700"
                            }`}
                          >
                            {vendor ? (
                              <Store size={18} />
                            ) : (
                              <Truck size={18} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-bold text-slate-900">
                              {getAccountHolder(
                                item
                              )}
                            </h4>

                            <p className="mt-1 truncate text-[10px] text-slate-400">
                              {id || "N/A"}
                            </p>
                          </div>
                        </div>

                        <StatusBadge
                          status={status}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-100 bg-white p-3">
                          <span className="text-[10px] font-semibold uppercase text-slate-400">
                            Amount
                          </span>

                          <p className="mt-1 font-bold text-emerald-600">
                            {formatAmount(
                              amount
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-white p-3">
                          <span className="text-[10px] font-semibold uppercase text-slate-400">
                            Bank
                          </span>

                          <p className="mt-1 truncate text-xs font-bold text-slate-800">
                            {getBankName(
                              item
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                            User ID
                          </span>

                          <span className="block truncate font-semibold text-slate-600">
                            {getUserId(
                              item
                            ) || "N/A"}
                          </span>
                        </div>

                        <div>
                          <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                            Requested
                          </span>

                          <span className="block text-[10px] font-semibold text-slate-600">
                            {formatDate(
                              getRequestedAt(
                                item
                              )
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                            Account
                          </span>

                          <span className="block truncate font-semibold text-slate-600">
                            {maskAccountNumber(
                              getAccountNumber(
                                item
                              )
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                            IFSC
                          </span>

                          <span className="block truncate font-semibold text-slate-600">
                            {getIfsc(item)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-slate-200/70 pt-3">
                        <button
                          onClick={() =>
                            openDetails(item)
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
                        >
                          <Eye size={15} />
                          Details
                        </button>

                        {status ===
                          "PENDING" && (
                          <>
                            <button
                              onClick={() =>
                                handleApprove(
                                  item
                                )
                              }
                              disabled={
                                actionLoading ===
                                `approve-${id}`
                              }
                              className="flex items-center justify-center rounded-xl bg-emerald-600 px-3 text-white transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {actionLoading ===
                              `approve-${id}` ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <CheckCircle2
                                  size={17}
                                />
                              )}
                            </button>

                            <button
                              onClick={() =>
                                handleReject(
                                  item
                                )
                              }
                              disabled={
                                actionLoading ===
                                `reject-${id}`
                              }
                              className="flex items-center justify-center rounded-xl bg-rose-600 px-3 text-white transition hover:bg-rose-700 disabled:opacity-50"
                            >
                              {actionLoading ===
                              `reject-${id}` ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <XCircle
                                  size={17}
                                />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                }
              )
            ) : (
              <div className="py-12 text-center">
                <WalletIcon
                  size={35}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="text-xs font-semibold text-slate-400">
                  No payout requests
                  found.
                </p>
              </div>
            )}
          </div>

          {!loading &&
            totalPages > 1 && (
              <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs font-semibold text-slate-500">
                  Showing{" "}
                  <span className="text-emerald-700">
                    {filteredPayouts.length}
                  </span>{" "}
                  payout records
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setPage((prev) =>
                        Math.max(
                          0,
                          prev - 1
                        )
                      )
                    }
                    disabled={page === 0}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft
                      size={14}
                    />
                    Previous
                  </button>

                  <span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                    {page + 1} /{" "}
                    {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setPage((prev) =>
                        Math.min(
                          totalPages - 1,
                          prev + 1
                        )
                      )
                    }
                    disabled={
                      page >=
                      totalPages - 1
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight
                      size={14}
                    />
                  </button>
                </div>
              </div>
            )}
        </section>
      </main>

      <AnimatePresence>
        {showDetails &&
          selectedPayout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/60 p-4 backdrop-blur-sm"
              onClick={closeDetails}
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                transition={{
                  duration: 0.25,
                }}
                onClick={(e) =>
                  e.stopPropagation()
                }
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
              >
                <div className="relative overflow-hidden rounded-t-3xl bg-emerald-950 px-5 py-5 text-white">
                  <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />

                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-300">
                        Finance Control
                      </span>

                      <h3 className="mt-1 text-lg font-bold">
                        Payout Details
                      </h3>

                      <p className="mt-1 text-[10px] font-semibold text-emerald-200/70">
                        {isVendor(
                          selectedPayout
                        )
                          ? "Vendor Payout Request"
                          : "Delivery Payout Request"}
                      </p>
                    </div>

                    <button
                      onClick={closeDetails}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 text-center">
                    <p className="text-xs font-semibold text-slate-400">
                      Requested Amount
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-700">
                      {formatAmount(
                        getAmount(
                          selectedPayout
                        )
                      )}
                    </p>

                    <div className="mt-3">
                      <StatusBadge
                        status={getStatus(
                          selectedPayout
                        )}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white px-4">
                    <DetailRow
                      label="Payout ID"
                      value={getId(
                        selectedPayout
                      )}
                    />

                    <DetailRow
                      label="User ID"
                      value={getUserId(
                        selectedPayout
                      )}
                    />

                    <DetailRow
                      label="User Role"
                      value={getUserRole(
                        selectedPayout
                      )}
                    />

                    <DetailRow
                      label="Amount"
                      value={formatAmount(
                        getAmount(
                          selectedPayout
                        )
                      )}
                    />

                    <DetailRow
                      label="Requested At"
                      value={formatDate(
                        getRequestedAt(
                          selectedPayout
                        )
                      )}
                    />

                    <DetailRow
                      label="Account Holder"
                      value={getAccountHolder(
                        selectedPayout
                      )}
                    />

                    <DetailRow
                      label="Bank Name"
                      value={getBankName(
                        selectedPayout
                      )}
                    />

                    <DetailRow
                      label="Account Number"
                      value={maskAccountNumber(
                        getAccountNumber(
                          selectedPayout
                        )
                      )}
                    />

                    <DetailRow
                      label="IFSC Code"
                      value={getIfsc(
                        selectedPayout
                      )}
                    />

                    <DetailRow
                      label="Status"
                      value={getStatus(
                        selectedPayout
                      )}
                    />
                  </div>

                  {getStatus(
                    selectedPayout
                  ) === "PENDING" && (
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          handleReject(
                            selectedPayout
                          )
                        }
                        disabled={
                          actionLoading ===
                          `reject-${getId(
                            selectedPayout
                          )}`
                        }
                        className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                      >
                        {actionLoading ===
                        `reject-${getId(
                          selectedPayout
                        )}` ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <XCircle size={16} />
                        )}
                        Reject
                      </button>

                      <button
                        onClick={() =>
                          handleApprove(
                            selectedPayout
                          )
                        }
                        disabled={
                          actionLoading ===
                          `approve-${getId(
                            selectedPayout
                          )}`
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {actionLoading ===
                        `approve-${getId(
                          selectedPayout
                        )}` ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}