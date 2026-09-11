
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock3,
  Wallet,
  IndianRupee,
  Eye,
  X,
  Calendar,
  Store,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import {
  getPendingPayouts,
  approvePayout,
  rejectPayout,
} from "../Api/payouts/vendorPayouts";

const VendorPayouts = () => {
  const [currentTab, setCurrentTab] = useState("vendor-payouts");

  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  const loadPayouts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPendingPayouts(page, 20);
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
      }

      setPayouts(list);

      const pages =
        root?.totalPages ??
        root?.pagination?.totalPages ??
        root?.data?.totalPages ??
        1;

      setTotalPages(Number(pages) || 1);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load vendor payouts"
      );
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, [page]);

  const getId = (item) =>
    item?.id || item?.payoutRequestId || item?._id || "";

  const getAmount = (item) =>
    Number(
      item?.amount ??
        item?.payoutAmount ??
        item?.requestedAmount ??
        0
    );

  const getStatus = (item) =>
    String(item?.status || "PENDING").toUpperCase();

  const getVendorName = (item) =>
    item?.vendorName ||
    item?.vendor?.name ||
    item?.vendor?.businessName ||
    "Unknown Vendor";

  const getVendorEmail = (item) =>
    item?.vendorEmail ||
    item?.vendor?.email ||
    "-";

  const getRequestedAt = (item) =>
    item?.createdAt ||
    item?.requestedAt ||
    item?.createdDate ||
    item?.date ||
    null;

  const formatAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

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

  const filteredPayouts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payouts.filter((item) => {
      const vendor = getVendorName(item).toLowerCase();
      const email = getVendorEmail(item).toLowerCase();
      const id = getId(item).toLowerCase();
      const status = getStatus(item);

      const matchesSearch =
        !query ||
        vendor.includes(query) ||
        email.includes(query) ||
        id.includes(query) ||
        status.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payouts, search, statusFilter]);

  const totalAmount = payouts.reduce(
    (sum, item) => sum + getAmount(item),
    0
  );

  const pendingCount = payouts.filter(
    (item) => getStatus(item) === "PENDING"
  ).length;

  const approvedCount = payouts.filter(
    (item) => getStatus(item) === "APPROVED"
  ).length;

  const rejectedCount = payouts.filter(
    (item) => getStatus(item) === "REJECTED"
  ).length;

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const getStatusClasses = (status) => {
    if (status === "APPROVED") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (status === "REJECTED") {
      return "bg-rose-50 text-rose-700 border-rose-100";
    }

    return "bg-amber-50 text-amber-700 border-amber-100";
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

      await approvePayout(id);

      setPayouts((prev) =>
        prev.filter((item) => getId(item) !== id)
      );

      setSelectedPayout(null);
      setShowDetails(false);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to approve payout"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!id) return;

    try {
      setActionLoading(id);

      await rejectPayout(id);

      setPayouts((prev) =>
        prev.filter((item) => getId(item) !== id)
      );

      setSelectedPayout(null);
      setShowDetails(false);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to reject payout"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const openDetails = (item) => {
    setSelectedPayout(item);
    setShowDetails(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 min-h-screen w-full min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 md:max-h-screen md:overflow-y-auto">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -left-16 -bottom-20 w-56 h-56 rounded-full bg-teal-400/10 blur-3xl" />

          <div className="relative z-10 p-5 sm:p-6 lg:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900 border border-emerald-800 text-[10px] font-bold uppercase tracking-widest text-emerald-100">
                  <Wallet size={12} />
                  Payout Control
                </span>

                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/80 border border-rose-900 text-[10px] font-bold uppercase tracking-widest text-rose-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE ADMIN VEG GO
                </span>
              </div>

              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Vendor Payouts
                </h1>

                <Sparkles
                  size={19}
                  className="text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-900/80 border border-emerald-800 text-xs font-semibold text-emerald-100">
                <Calendar size={14} />
                {currentDate}
              </div>

              <button
                type="button"
                onClick={loadPayouts}
                disabled={loading}
                className="p-2.5 rounded-2xl bg-emerald-900 border border-emerald-800 text-emerald-100 hover:bg-emerald-800 transition disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </motion.header>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -5 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -5 }}
              className="px-5 py-3.5 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatCard
            label="Pending Requests"
            value={pendingCount}
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-700 border-amber-100"
            status="Awaiting action"
            statusClass="bg-amber-50 text-amber-700"
            sideText="Requests"
          />

          <StatCard
            label="Total Requested"
            value={formatAmount(totalAmount)}
            icon={IndianRupee}
            iconClass="bg-emerald-50 text-emerald-700 border-emerald-100"
            status="Current page"
            statusClass="bg-emerald-50 text-emerald-700"
            sideText="Amount"
          />

          <StatCard
            label="Approved"
            value={approvedCount}
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-700 border-emerald-100"
            status="Processed"
            statusClass="bg-emerald-50 text-emerald-700"
            sideText="Payouts"
          />

          <StatCard
            label="Rejected"
            value={rejectedCount}
            icon={XCircle}
            iconClass="bg-rose-50 text-rose-700 border-rose-100"
            status="Declined"
            statusClass="bg-rose-50 text-rose-700"
            sideText="Payouts"
          />
        </section>

        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                <Wallet size={18} />
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Vendor Payout Records
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vendor payout transaction management directory
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative sm:w-72">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Search vendor, email or ID..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs outline-none focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5 overflow-x-auto">
                <div className="px-2 text-slate-400">
                  <Filter size={13} />
                </div>

                {["ALL", "PENDING", "APPROVED", "REJECTED"].map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setStatusFilter(status);
                        setPage(0);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                        statusFilter === status
                          ? "bg-white text-emerald-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {status === "ALL"
                        ? "All"
                        : status.charAt(0) +
                          status.slice(1).toLowerCase()}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500 rounded-l-xl">
                    Vendor
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Payout ID
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Amount
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Requested
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right rounded-r-xl">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-14 text-center">
                      <RefreshCw
                        size={22}
                        className="mx-auto animate-spin text-emerald-600"
                      />
                      <p className="mt-3 text-xs font-semibold text-slate-500">
                        Loading payouts...
                      </p>
                    </td>
                  </tr>
                ) : filteredPayouts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-14 text-center">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Wallet size={20} />
                      </div>
                      <p className="mt-3 text-sm font-bold text-slate-700">
                        No payout records found
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try changing the search or status filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPayouts.map((item, index) => {
                    const id = getId(item);
                    const status = getStatus(item);
                    const StatusIcon = getStatusIcon(status);

                    return (
                      <motion.tr
                        key={id || index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.025 }}
                        className="border-b border-slate-100 last:border-0 hover:bg-emerald-50/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                              <Store size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate max-w-[190px]">
                                {getVendorName(item)}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[190px] mt-0.5">
                                {getVendorEmail(item)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex max-w-[170px] truncate px-2.5 py-1.5 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500">
                            {id || "-"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-sm font-black text-emerald-700">
                            {formatAmount(getAmount(item))}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold ${getStatusClasses(
                              status
                            )}`}
                          >
                            <StatusIcon size={12} />
                            {status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                            <Calendar size={12} />
                            {formatDate(getRequestedAt(item))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openDetails(item)}
                              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 transition"
                              title="View details"
                            >
                              <Eye size={14} />
                            </button>

                            {status === "PENDING" && (
                              <>
                                <button
                                  type="button"
                                  disabled={actionLoading === id}
                                  onClick={() => handleApprove(id)}
                                  className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                                  title="Approve"
                                >
                                  <CheckCircle2 size={14} />
                                </button>

                                <button
                                  type="button"
                                  disabled={actionLoading === id}
                                  onClick={() => handleReject(id)}
                                  className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                                  title="Reject"
                                >
                                  <XCircle size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="py-12 text-center">
                <RefreshCw
                  size={22}
                  className="mx-auto animate-spin text-emerald-600"
                />
                <p className="mt-3 text-xs font-semibold text-slate-500">
                  Loading payouts...
                </p>
              </div>
            ) : filteredPayouts.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <Wallet size={20} />
                </div>
                <p className="mt-3 text-sm font-bold text-slate-700">
                  No payout records found
                </p>
              </div>
            ) : (
              filteredPayouts.map((item, index) => {
                const id = getId(item);
                const status = getStatus(item);
                const StatusIcon = getStatusIcon(status);

                return (
                  <motion.div
                    key={id || index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.025 }}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                          <Store size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {getVendorName(item)}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {getVendorEmail(item)}
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-black text-emerald-700 whitespace-nowrap">
                        {formatAmount(getAmount(item))}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                        <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                          Payout ID
                        </p>
                        <p className="text-[10px] font-bold text-slate-600 truncate mt-1">
                          {id || "-"}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                        <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                          Requested
                        </p>
                        <p className="text-[10px] font-bold text-slate-600 mt-1">
                          {formatDate(getRequestedAt(item))}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold ${getStatusClasses(
                          status
                        )}`}
                      >
                        <StatusIcon size={12} />
                        {status}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openDetails(item)}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-200 transition"
                        >
                          <Eye size={14} />
                        </button>

                        {status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              disabled={actionLoading === id}
                              onClick={() => handleApprove(id)}
                              className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                            >
                              <CheckCircle2 size={14} />
                            </button>

                            <button
                              type="button"
                              disabled={actionLoading === id}
                              onClick={() => handleReject(id)}
                              className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {!loading && payouts.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-5 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500">
                Showing{" "}
                <span className="text-slate-800">
                  {filteredPayouts.length}
                </span>{" "}
                of{" "}
                <span className="text-slate-800">
                  {payouts.length}
                </span>{" "}
                payouts
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0 || loading}
                  onClick={() =>
                    setPage((prev) => Math.max(prev - 1, 0))
                  }
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-[10px] font-bold text-slate-600 hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={13} />
                  Previous
                </button>

                <span className="min-w-9 h-8 px-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black flex items-center justify-center">
                  {page + 1}
                </span>

                <button
                  type="button"
                  disabled={page + 1 >= totalPages || loading}
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(prev + 1, totalPages - 1)
                    )
                  }
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-[10px] font-bold text-slate-600 hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {showDetails && selectedPayout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 sm:p-6 bg-emerald-950 text-white relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl" />

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-900 border border-emerald-800">
                      <Wallet size={18} />
                    </div>

                    <div>
                      <h3 className="text-lg font-black">
                        Payout Details
                      </h3>
                      <p className="text-[10px] text-emerald-200 mt-0.5">
                        Vendor payout request
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
                    <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">
                      Requested Amount
                    </p>
                    <p className="text-2xl font-black text-emerald-800 mt-1">
                      {formatAmount(getAmount(selectedPayout))}
                    </p>
                  </div>

                  <IndianRupee
                    size={25}
                    className="text-emerald-600"
                  />
                </div>

                <DetailRow
                  label="Vendor"
                  value={getVendorName(selectedPayout)}
                  icon={Store}
                />

                <DetailRow
                  label="Email"
                  value={getVendorEmail(selectedPayout)}
                  icon={Wallet}
                />

                <DetailRow
                  label="Payout ID"
                  value={getId(selectedPayout) || "-"}
                  icon={Wallet}
                />

                <DetailRow
                  label="Requested At"
                  value={formatDate(
                    getRequestedAt(selectedPayout)
                  )}
                  icon={Calendar}
                />

                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500">
                    Status
                  </span>

                  {(() => {
                    const status = getStatus(selectedPayout);
                    const StatusIcon = getStatusIcon(status);

                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold ${getStatusClasses(
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
                        actionLoading === getId(selectedPayout)
                      }
                      onClick={() =>
                        handleReject(getId(selectedPayout))
                      }
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold hover:bg-rose-100 transition disabled:opacity-50"
                    >
                      <XCircle size={15} />
                      Reject
                    </button>

                    <button
                      type="button"
                      disabled={
                        actionLoading === getId(selectedPayout)
                      }
                      onClick={() =>
                        handleApprove(getId(selectedPayout))
                      }
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} />
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
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  iconClass,
  status,
  statusClass,
  sideText,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/80" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`p-2.5 rounded-2xl border ${iconClass}`}
        >
          <Icon size={18} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-slate-100">
        <span
          className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide ${statusClass}`}
        >
          {status}
        </span>

        <span className="text-[10px] font-semibold text-slate-400">
          {sideText}
        </span>
      </div>
    </motion.div>
  );
};

const DetailRow = ({ label, value, icon: Icon }) => {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50">
      <div className="p-2 rounded-xl bg-white border border-slate-200 text-emerald-600">
        <Icon size={14} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
          {label}
        </p>
        <p className="text-xs font-bold text-slate-700 mt-0.5 break-all">
          {value}
        </p>
      </div>
    </div>
  );
};

export default VendorPayouts;


