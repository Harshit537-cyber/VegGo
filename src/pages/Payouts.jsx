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
  Sparkles,
  Zap,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  X,
  IndianRupee,
  Loader2,
  Bike,
  Store,
} from "lucide-react";

import {
  getPendingPayouts,
  approvePayout,
  rejectPayout,
} from "../Api/payouts/vendorPayouts";

import {
  getPendingDeliveryPayouts,
  approveDeliveryPayout,
  rejectDeliveryPayout,
} from "../Api/payouts/deliveryPayouts";

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

function AnimatedValue({ value, prefix = "" }) {
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
        progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setDisplayValue(
        Math.floor(easeProgress * targetNum).toLocaleString("en-IN")
      );

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(targetNum.toLocaleString("en-IN"));
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue}
    </span>
  );
}

const DetailRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50">
    <div className="p-2 rounded-xl bg-white border border-slate-200 text-emerald-600">
      <Icon size={14} />
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
        {label}
      </p>

      <p className="text-xs font-semibold text-slate-700 mt-0.5 break-all">
        {value}
      </p>
    </div>
  </div>
);

export default function Payouts() {
  const [currentTab, setCurrentTab] = useState("payouts");
  const [payoutType, setPayoutType] = useState("vendor");

  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [errorMessage, setErrorMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isVendor = payoutType === "vendor";

  const getId = (item) =>
    String(
      item?.id ||
        item?.payoutRequestId ||
        item?._id ||
        item?.deliveryPayoutId ||
        ""
    );

  const getAmount = (item) =>
    Number(
      item?.amount ??
        item?.payoutAmount ??
        item?.requestedAmount ??
        item?.requestedPayoutAmount ??
        0
    );

  const getStatus = (item) =>
    String(item?.status || "PENDING").toUpperCase();

  const getRequestedAt = (item) =>
    item?.createdAt ||
    item?.requestedAt ||
    item?.createdDate ||
    item?.date ||
    item?.transactionDate ||
    null;

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadPayouts = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      setErrorMessage("");

      const response = isVendor
        ? await getPendingPayouts(page, 20)
        : await getPendingDeliveryPayouts(page, 20);

      const root = response?.data || response;

      let list = [];

      if (Array.isArray(root)) {
        list = root;
      } else if (Array.isArray(root?.content)) {
        list = root.content;
      } else if (Array.isArray(root?.items)) {
        list = root.items;
      } else if (Array.isArray(root?.payouts)) {
        list = root.payouts;
      } else if (Array.isArray(root?.data)) {
        list = root.data;
      } else if (Array.isArray(root?.data?.content)) {
        list = root.data.content;
      } else if (Array.isArray(root?.data?.payouts)) {
        list = root.data.payouts;
      }

      setPayouts(list);

      const pages =
        root?.totalPages ??
        root?.pagination?.totalPages ??
        root?.data?.totalPages ??
        root?.data?.pagination?.totalPages ??
        1;

      setTotalPages(Number(pages) || 1);
    } catch (err) {
      console.error("Payout records error:", err);
      setPayouts([]);
      setErrorMessage(
        getErrorMessage(
          err,
          isVendor
            ? "Failed to load vendor payout records."
            : "Failed to load delivery partner payout records."
        )
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, [page, payoutType]);

  const changePayoutType = (type) => {
    if (type === payoutType) return;

    setPayoutType(type);
    setPage(0);
    setActiveFilter("All");
    setSearchQuery("");
    setSelectedPayout(null);
    setShowDetails(false);
  };

  const handleRefresh = () => {
    loadPayouts();
  };

  const handleFilterChange = (filter) => {
    setPage(0);
    setActiveFilter(filter);
  };

  const filteredPayouts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return payouts.filter((payout) => {
      const id = getId(payout).toLowerCase();
      const status = getStatus(payout).toLowerCase();
      const amount = String(getAmount(payout)).toLowerCase();

      const matchesSearch =
        !query ||
        id.includes(query) ||
        status.includes(query) ||
        amount.includes(query);

      const matchesFilter =
        activeFilter === "All" ||
        getStatus(payout) === activeFilter.toUpperCase();

      return matchesSearch && matchesFilter;
    });
  }, [payouts, searchQuery, activeFilter]);

  const pendingCount = payouts.filter(
    (item) => getStatus(item) === "PENDING"
  ).length;

  const approvedCount = payouts.filter(
    (item) => getStatus(item) === "APPROVED"
  ).length;

  const rejectedCount = payouts.filter(
    (item) => getStatus(item) === "REJECTED"
  ).length;

  const totalAmount = payouts.reduce(
    (total, item) => total + getAmount(item),
    0
  );

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getStatusClasses = (status) => {
    if (status === "APPROVED") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    }

    if (status === "REJECTED") {
      return "bg-rose-50 text-rose-700 border-rose-200/80";
    }

    return "bg-amber-50 text-amber-700 border-amber-200/80";
  };

  const getStatusIcon = (status) => {
    if (status === "APPROVED") return CheckCircle2;
    if (status === "REJECTED") return XCircle;
    return Clock3;
  };

  const handleApprove = async (id) => {
    if (!id) return;

    try {
      setActionLoading(id);
      setErrorMessage("");

      if (isVendor) {
        await approvePayout(id);
      } else {
        await approveDeliveryPayout(id);
      }

      setPayouts((prev) => prev.filter((item) => getId(item) !== id));
      setSelectedPayout(null);
      setShowDetails(false);
    } catch (err) {
      setErrorMessage(
        getErrorMessage(
          err,
          isVendor
            ? "Failed to approve vendor payout."
            : "Failed to approve delivery partner payout."
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!id) return;

    try {
      setActionLoading(id);
      setErrorMessage("");

      if (isVendor) {
        await rejectPayout(id);
      } else {
        await rejectDeliveryPayout(id);
      }

      setPayouts((prev) => prev.filter((item) => getId(item) !== id));
      setSelectedPayout(null);
      setShowDetails(false);
    } catch (err) {
      setErrorMessage(
        getErrorMessage(
          err,
          isVendor
            ? "Failed to reject vendor payout."
            : "Failed to reject delivery partner payout."
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  const openDetails = (payout) => {
    setSelectedPayout(payout);
    setShowDetails(true);
  };

  const stats = [
    {
      label: "Pending Requests",
      value: pendingCount,
      prefix: "",
      accentColor: "bg-emerald-600",
      iconBg: "bg-emerald-50 text-emerald-700",
      tagColor:
        "text-emerald-700 bg-emerald-50/80 border-emerald-200/80",
      icon: Clock3,
      status: "Pending",
      side: "Requests",
    },
    {
      label: "Total Requested",
      value: totalAmount,
      prefix: "₹",
      accentColor: "bg-teal-600",
      iconBg: "bg-teal-50 text-teal-700",
      tagColor: "text-teal-700 bg-teal-50/80 border-teal-200/80",
      icon: IndianRupee,
      status: "Amount",
      side: "Requested",
    },
    {
      label: "Approved Payouts",
      value: approvedCount,
      prefix: "",
      accentColor: "bg-emerald-500",
      iconBg: "bg-emerald-50 text-emerald-700",
      tagColor:
        "text-emerald-700 bg-emerald-50/80 border-emerald-200/80",
      icon: CheckCircle2,
      status: "Approved",
      side: "Payouts",
    },
    {
      label: "Rejected Payouts",
      value: rejectedCount,
      prefix: "",
      accentColor: "bg-green-700",
      iconBg: "bg-rose-50 text-rose-700",
      tagColor: "text-rose-700 bg-rose-50/80 border-rose-200/80",
      icon: XCircle,
      status: "Rejected",
      side: "Payouts",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 w-full space-y-6 sm:space-y-8 md:max-h-screen md:overflow-y-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800">
                <Zap size={12} className="text-emerald-400" />
                Finance Control
              </span>

              <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-900/80 px-3 py-1 rounded-full text-rose-300">
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
              Payout Management
              <Sparkles className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </h1>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center z-10">
            <div className="bg-emerald-900/60 border border-emerald-800 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-100">
              <Calendar size={14} className="text-emerald-400" />
              <span>{currentDate}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white disabled:opacity-50"
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
        </motion.header>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => changePayoutType("vendor")}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                isVendor
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Store size={17} />
              Vendor Payouts
            </button>

            <button
              type="button"
              onClick={() => changePayoutType("delivery")}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                !isVendor
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Bike size={17} />
              Delivery Partner Payouts
            </button>
          </div>
        </div>

        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-5 py-3.5 rounded-2xl border text-xs font-semibold bg-rose-50 border-rose-200 text-rose-700 flex items-center gap-2"
            >
              <AlertCircle size={15} />

              <span className="flex-1">{errorMessage}</span>

              <button
                type="button"
                onClick={() => setErrorMessage("")}
                className="p-1 rounded-lg hover:bg-rose-100"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat, idx) => {
            const IconComponent = stat.icon;

            return (
              <motion.div
                key={`${payoutType}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.08,
                }}
                whileHover={{ y: -5 }}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all relative overflow-hidden flex flex-col justify-between group"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accentColor}`}
                />

                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:scale-125" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-black uppercase tracking-wider">
                      {stat.label}
                    </span>

                    <div
                      className={`${stat.iconBg} p-2.5 rounded-2xl`}
                    >
                      <IconComponent size={18} />
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-semibold text-black tracking-tight font-mono">
                    {loading ? (
                      <span className="text-slate-300">...</span>
                    ) : (
                      <>
                        <AnimatedValue
                          value={stat.value}
                          prefix={stat.prefix}
                        />

                        <span className="text-base ml-1 font-sans">
                          {stat.side}
                        </span>
                      </>
                    )}
                  </h3>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between relative z-10">
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${stat.tagColor}`}
                  >
                    {idx === 0 ? (
                      <Clock3 size={13} />
                    ) : idx === 1 ? (
                      <IndianRupee size={13} />
                    ) : idx === 2 ? (
                      <ArrowDownRight size={13} />
                    ) : (
                      <ArrowUpRight size={13} />
                    )}

                    {stat.status}
                  </span>

                  <span className="text-[11px] text-black font-semibold">
                    {idx === 0
                      ? "Action Required"
                      : idx === 1
                      ? "Current Page"
                      : idx === 2
                      ? "Successful"
                      : "Declined"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </section>

        <section className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  {isVendor ? (
                    <Store size={18} />
                  ) : (
                    <Bike size={18} />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    {isVendor
                      ? "Vendor Payout Records"
                      : "Delivery Partner Payout Records"}
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    {isVendor
                      ? "Vendor payout transaction management directory"
                      : "Delivery partner payout transaction management directory"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 sm:w-72">
                  <Search
                    className="absolute left-3 top-2.5 text-slate-400"
                    size={15}
                  />

                  <input
                    type="text"
                    placeholder={
                      isVendor
                        ? "Search vendor payouts..."
                        : "Search delivery payouts..."
                    }
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                  <Filter
                    size={13}
                    className="text-slate-400 ml-2"
                  />

                  {[
                    "All",
                    "Pending",
                    "Approved",
                    "Rejected",
                  ].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() =>
                        handleFilterChange(filter)
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
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

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">
                    <th className="py-3.5 px-4 rounded-l-xl">
                      Payout
                    </th>

                    <th className="py-3.5 px-4">
                      Status
                    </th>

                    <th className="py-3.5 px-4">
                      Amount
                    </th>

                    <th className="py-3.5 px-4">
                      Requested
                    </th>

                    <th className="py-3.5 px-4">
                      Payout ID
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
                        colSpan={6}
                        className="py-12 text-center"
                      >
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Loader2
                            size={28}
                            className="animate-spin text-emerald-600"
                          />

                          <span className="text-xs font-semibold">
                            Loading payout transactions...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPayouts.length > 0 ? (
                    filteredPayouts.map((payout, index) => {
                      const id = getId(payout);
                      const status = getStatus(payout);
                      const amount = getAmount(payout);
                      const StatusIcon =
                        getStatusIcon(status);
                      const isPending =
                        status === "PENDING";

                      return (
                        <motion.tr
                          key={id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.04,
                          }}
                          className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                  status === "REJECTED"
                                    ? "bg-rose-50 border-rose-100 text-rose-700"
                                    : "bg-emerald-50 border-emerald-100 text-emerald-700"
                                }`}
                              >
                                {isVendor ? (
                                  <Store size={17} />
                                ) : (
                                  <Bike size={17} />
                                )}
                              </div>

                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-black group-hover:text-emerald-700 truncate max-w-[200px]">
                                  {id || "-"}
                                </span>

                                <span className="text-[10px] text-slate-500">
                                  {isVendor
                                    ? "Vendor Payout"
                                    : "Delivery Partner Payout"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusClasses(
                                status
                              )}`}
                            >
                              <StatusIcon size={12} />
                              {status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`font-bold ${
                                status === "REJECTED"
                                  ? "text-rose-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              {formatAmount(amount)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 whitespace-nowrap">
                              <Calendar size={13} />
                              {formatDate(
                                getRequestedAt(payout)
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-block max-w-[170px] truncate bg-slate-100 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-slate-500">
                              {id || "-"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openDetails(payout)
                                }
                                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 transition"
                              >
                                <Eye size={14} />
                              </button>

                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    disabled={
                                      actionLoading === id
                                    }
                                    onClick={() =>
                                      handleApprove(id)
                                    }
                                    className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                                  >
                                    {actionLoading === id ? (
                                      <Loader2
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <CheckCircle2 size={14} />
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    disabled={
                                      actionLoading === id
                                    }
                                    onClick={() =>
                                      handleReject(id)
                                    }
                                    className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                                  >
                                    {actionLoading === id ? (
                                      <Loader2
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <XCircle size={14} />
                                    )}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center"
                      >
                        <WalletIcon
                          size={35}
                          className="mx-auto text-slate-300 mb-3"
                        />

                        <p className="text-xs font-semibold text-slate-400">
                          No matching payout records found.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {loading ? (
                <div className="py-10 text-center text-xs font-semibold text-slate-400">
                  <Loader2
                    size={25}
                    className="animate-spin text-emerald-600 mx-auto mb-3"
                  />
                  Loading payout transactions...
                </div>
              ) : filteredPayouts.length > 0 ? (
                filteredPayouts.map((payout, index) => {
                  const id = getId(payout);
                  const status = getStatus(payout);
                  const StatusIcon =
                    getStatusIcon(status);

                  return (
                    <motion.div
                      key={id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-700">
                            {isVendor ? (
                              <Store size={16} />
                            ) : (
                              <Bike size={16} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm text-black truncate">
                              {id || "-"}
                            </h4>

                            <p className="text-[10px] text-slate-400">
                              {isVendor
                                ? "Vendor Payout"
                                : "Delivery Partner Payout"}
                            </p>
                          </div>
                        </div>

                        <span className="font-bold text-sm text-emerald-600 whitespace-nowrap">
                          {formatAmount(getAmount(payout))}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Status
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border mt-1 ${getStatusClasses(
                              status
                            )}`}
                          >
                            <StatusIcon size={12} />
                            {status}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Requested
                          </span>

                          <span className="text-slate-500 font-semibold">
                            {formatDate(
                              getRequestedAt(payout)
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Payout ID
                          </span>

                          <span className="text-slate-500 font-semibold truncate block">
                            {id || "-"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Amount
                          </span>

                          <span className="text-emerald-600 font-semibold">
                            {formatAmount(getAmount(payout))}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() =>
                            openDetails(payout)
                          }
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 transition"
                        >
                          <Eye size={14} />
                        </button>

                        {status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              disabled={
                                actionLoading === id
                              }
                              onClick={() =>
                                handleApprove(id)
                              }
                              className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                            >
                              {actionLoading === id ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <CheckCircle2 size={14} />
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={
                                actionLoading === id
                              }
                              onClick={() =>
                                handleReject(id)
                              }
                              className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                            >
                              {actionLoading === id ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <XCircle size={14} />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-10 text-center">
                  <WalletIcon
                    size={35}
                    className="mx-auto text-slate-300 mb-3"
                  />

                  <p className="text-xs font-semibold text-slate-400">
                    No payout transactions found.
                  </p>
                </div>
              )}
            </div>

            {!loading && payouts.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-5 pt-4 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-500">
                  Showing{" "}
                  <span className="text-emerald-700">
                    {filteredPayouts.length}
                  </span>{" "}
                  of{" "}
                  <span className="text-slate-700">
                    {payouts.length}
                  </span>{" "}
                  payouts
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPage((prev) => Math.max(0, prev - 1))
                    }
                    disabled={page === 0 || loading}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                  >
                    Previous
                  </button>

                  <span className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
                    {page + 1} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setPage((prev) =>
                        Math.min(totalPages - 1, prev + 1)
                      )
                    }
                    disabled={
                      page >= totalPages - 1 || loading
                    }
                    className="px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </section>
      </main>

      <AnimatePresence>
        {showDetails && selectedPayout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 10,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 10,
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] overflow-y-auto"
            >
              <div className="p-5 sm:p-6 bg-emerald-950 text-white relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl" />

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-900 border border-emerald-800">
                      {isVendor ? (
                        <Store size={18} />
                      ) : (
                        <Bike size={18} />
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">
                        {isVendor
                          ? "Vendor Payout Details"
                          : "Delivery Partner Payout Details"}
                      </h3>

                      <p className="text-[10px] text-emerald-200 mt-0.5">
                        Payout request and settlement information
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDetails(false)}
                    className="p-2 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-100 hover:bg-emerald-800 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600">
                      Requested Amount
                    </p>

                    <p className="text-2xl font-semibold text-emerald-800 mt-1">
                      {formatAmount(
                        getAmount(selectedPayout)
                      )}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-emerald-100">
                    <IndianRupee
                      size={22}
                      className="text-emerald-600"
                    />
                  </div>
                </div>

                <DetailRow
                  label="Payout ID"
                  value={getId(selectedPayout) || "-"}
                  icon={WalletIcon}
                />

                <DetailRow
                  label="Requested At"
                  value={formatDate(
                    getRequestedAt(selectedPayout)
                  )}
                  icon={Calendar}
                />

                <DetailRow
                  label="Payout Type"
                  value={
                    isVendor
                      ? "Vendor Payout"
                      : "Delivery Partner Payout"
                  }
                  icon={isVendor ? Store : Bike}
                />

                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50">
                  <span className="text-xs font-semibold text-slate-500">
                    Status
                  </span>

                  {(() => {
                    const status =
                      getStatus(selectedPayout);

                    const StatusIcon =
                      getStatusIcon(status);

                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-semibold ${getStatusClasses(
                          status
                        )}`}
                      >
                        <StatusIcon size={12} />
                        {status}
                      </span>
                    );
                  })()}
                </div>

                {getStatus(selectedPayout) === "PENDING" && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      disabled={
                        actionLoading ===
                        getId(selectedPayout)
                      }
                      onClick={() =>
                        handleReject(
                          getId(selectedPayout)
                        )
                      }
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition disabled:opacity-50"
                    >
                      {actionLoading ===
                      getId(selectedPayout) ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <XCircle size={15} />
                      )}

                      Reject
                    </button>

                    <button
                      type="button"
                      disabled={
                        actionLoading ===
                        getId(selectedPayout)
                      }
                      onClick={() =>
                        handleApprove(
                          getId(selectedPayout)
                        )
                      }
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      {actionLoading ===
                      getId(selectedPayout) ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <CheckCircle2 size={15} />
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