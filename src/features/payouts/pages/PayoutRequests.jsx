import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../layouts/Sidebar";
import PageHeader from "../../../components/common/PageHeader";
import StatusFilterPills from "../../../components/common/StatusFilterPills";
import WorkflowRulesBar from "../../../components/common/WorkflowRulesBar";
import EmptyState from "../../../components/common/EmptyState";
import {
  Calendar,
  Search,
  Filter,
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
  Loader2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

import {
  getPayouts,
  approvePayout,
  rejectPayout,
} from "../services/vendorPayouts";

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
  String(item?.userId || item?.customerId || item?.vendorId || item?.deliveryPartnerId || "");

const getAmount = (item) =>
  Number(
    item?.amount ??
      item?.payoutAmount ??
      item?.requestedAmount ??
      0
  );

const getStatus = (item) =>
  String(item?.status || "PENDING").toUpperCase();

const getUserRole = (item) => {
  const role = String(
    item?.userRole ||
      item?.role ||
      item?.userType ||
      item?.requesterType ||
      (item?.vendorId ? "VENDOR" : "") ||
      (item?.deliveryPartnerId || item?.deliveryBoyId ? "DELIVERY_PARTNER" : "") ||
      ""
  ).toUpperCase();
  return role;
};

const getRequestedAt = (item) =>
  item?.createdAt ||
  item?.requestedAt ||
  item?.createdDate ||
  item?.date ||
  null;

const getBankAccount = (item) =>
  item?.bankAccount || item?.bankDetails || item || {};

const getAccountHolder = (item) => {
  const bank = getBankAccount(item);
  return (
    bank?.accountHolderName ||
    bank?.holderName ||
    bank?.beneficiaryName ||
    item?.accountHolderName ||
    item?.userName ||
    item?.name ||
    "N/A"
  );
};

const getBankName = (item) => {
  const bank = getBankAccount(item);
  return bank?.bankName || item?.bankName || "N/A";
};

const getIfsc = (item) => {
  const bank = getBankAccount(item);
  return bank?.ifscCode || bank?.ifsc || item?.ifscCode || item?.ifsc || "N/A";
};

const getAccountNumber = (item) => {
  const bank = getBankAccount(item);
  return (
    bank?.accountNumber ||
    bank?.accountNo ||
    item?.accountNumber ||
    item?.accountNo ||
    "N/A"
  );
};

const maskAccountNumber = (accountNumber) => {
  if (!accountNumber || accountNumber === "N/A") return "N/A";
  const value = String(accountNumber);
  if (value.length <= 4) return value;
  return `${"*".repeat(value.length - 4)}${value.slice(-4)}`;
};

const StatusBadge = ({ status }) => {
  const normalized = String(status || "PENDING").toUpperCase();

  const config = {
    PENDING: {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock3,
    },
    APPROVED: {
      label: "Approved",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },
    REJECTED: {
      label: "Rejected",
      className: "bg-rose-50 text-rose-700 border-rose-200",
      icon: XCircle,
    },
  };

  const current = config[normalized] || {
    label: normalized,
    className: "bg-slate-50 text-slate-600 border-slate-200",
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

export default function PayoutRequests({ embedded = false }) {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getPayouts(activeStatus, page, 20);

      const root = response?.data || response;

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
        : Array.isArray(root?.data?.content)
        ? root.data.content
        : Array.isArray(root?.data?.payouts)
        ? root.data.payouts
        : [];

      setPayouts(records);

      const pages =
        Number(root?.totalPages) ||
        Number(root?.pagination?.totalPages) ||
        Number(root?.data?.totalPages) ||
        Number(root?.data?.pagination?.totalPages) ||
        1;

      setTotalPages(pages);
    } catch (error) {
      console.error("Payout API Error:", error);
      setPayouts([]);
      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to load payout requests."
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, [page, activeStatus]);

  const filteredPayouts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return payouts.filter((item) => {
      const status = getStatus(item);
      const role = getUserRole(item);
      const id = getId(item).toLowerCase();
      const userId = getUserId(item).toLowerCase();
      const amount = String(getAmount(item));
      const accountHolder = getAccountHolder(item).toLowerCase();
      const bankName = getBankName(item).toLowerCase();

      // Role filter
      let matchesRole = true;
      if (roleFilter === "VENDOR") {
        matchesRole = role === "VENDOR" || (!role && !item?.deliveryPartnerId);
      } else if (roleFilter === "DELIVERY") {
        matchesRole =
          role === "DELIVERY_PARTNER" ||
          role === "DELIVERY" ||
          role === "DELIVERYBOY" ||
          role === "DELIVERY_BOY" ||
          Boolean(item?.deliveryPartnerId);
      }

      // Status filter
      const matchesStatus =
        activeStatus === "All" || status === activeStatus.toUpperCase();

      // Search query
      const matchesSearch =
        !query ||
        id.includes(query) ||
        userId.includes(query) ||
        amount.includes(query) ||
        accountHolder.includes(query) ||
        bankName.includes(query) ||
        status.toLowerCase().includes(query);

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [payouts, searchQuery, activeStatus, roleFilter]);

  const { pendingCount, approvedCount, rejectedCount } = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    for (let i = 0; i < payouts.length; i++) {
      const s = getStatus(payouts[i]);
      if (s === "PENDING") pending++;
      else if (s === "APPROVED") approved++;
      else if (s === "REJECTED") rejected++;
    }
    return { pendingCount: pending, approvedCount: approved, rejectedCount: rejected };
  }, [payouts]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPayouts();
  };

  const handleApprove = async (item) => {
    const id = getId(item);
    if (!id) return;

    try {
      setActionLoading(`approve-${id}`);
      setErrorMessage("");

      await approvePayout(id);

      setSuccessMessage(`Payout request #${id} approved successfully.`);
      setPayouts((prev) =>
        prev.map((payout) =>
          getId(payout) === id ? { ...payout, status: "APPROVED" } : payout
        )
      );

      setShowDetails(false);
      setSelectedPayout(null);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to approve payout request."
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
      setErrorMessage("");

      await rejectPayout(id);

      setSuccessMessage(`Payout request #${id} marked as rejected.`);
      setPayouts((prev) =>
        prev.map((payout) =>
          getId(payout) === id ? { ...payout, status: "REJECTED" } : payout
        )
      );

      setShowDetails(false);
      setSelectedPayout(null);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to reject payout request."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filterPills = [
    { id: "All", label: "All Requests", count: payouts.length },
    { id: "Pending", label: "Pending Review", count: pendingCount },
    { id: "Approved", label: "Approved", count: approvedCount },
    { id: "Rejected", label: "Rejected", count: rejectedCount },
  ];

  const content = (
    <div className="w-full space-y-5 sm:space-y-6">
      {/* Top Header */}
      <PageHeader
        icon={TrendingUp}
        title="Payout Requests"
        subtitle="Review, approve, and track merchant and delivery partner settlement withdrawal requests."
        stats={[
          { label: "Total Requests", value: payouts.length },
          { label: "Pending", value: pendingCount, alert: pendingCount > 0 },
        ]}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing || loading}
      />

      {/* Notification Banners */}
      {errorMessage && (
        <div
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-between text-xs font-semibold text-rose-800 shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage("")}
            className="text-rose-500 hover:text-rose-800 p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {successMessage && (
        <div
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs font-semibold text-emerald-800 shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-emerald-500 hover:text-emerald-800 p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter and Role Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <StatusFilterPills
          filters={filterPills}
          activeFilter={activeStatus}
          onFilterChange={(status) => {
            setPage(0);
            setActiveStatus(status);
          }}
        />

        {/* Partner Role Filter */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-emerald-100/80 shadow-2xs self-start sm:self-auto">
          {[
            { id: "ALL", label: "All Partners" },
            { id: "VENDOR", label: "Vendors", icon: Store },
            { id: "DELIVERY", label: "Delivery", icon: Truck },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {Icon && <Icon size={13} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Workflow Rules Information Bar */}
      <WorkflowRulesBar
        rulesText="Review beneficiary account credentials, verify withdrawal eligibility, and process payout approval."
        showingCount={filteredPayouts.length}
        totalCount={payouts.length}
        itemLabel="payout requests"
      />

      {/* Search Input Bar */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search payout requests by request ID, beneficiary name, bank, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 shadow-2xs"
        />
      </div>

      {/* Data Table */}
      <section className="overflow-hidden rounded-3xl border border-emerald-100/90 bg-white p-5 shadow-2xs sm:p-6">
        <div className="hidden w-full md:block overflow-x-auto">
          <table className="w-full min-w-[850px] table-fixed border-collapse text-left">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
            </colgroup>

            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="rounded-l-xl px-3 py-3.5">Payout ID</th>
                <th className="px-3 py-3.5">Beneficiary / User</th>
                <th className="px-3 py-3.5">Bank Account</th>
                <th className="px-3 py-3.5">Amount</th>
                <th className="px-3 py-3.5">Requested Date</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="rounded-r-xl px-3 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Loader2 size={28} className="animate-spin text-emerald-600" />
                      <span className="text-xs font-semibold">
                        Loading payout requests...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayouts.length > 0 ? (
                filteredPayouts.map((item, index) => {
                  const id = getId(item);
                  const status = getStatus(item);
                  const role = getUserRole(item);
                  const isVendor = role === "VENDOR" || (!role && !item?.deliveryPartnerId);

                  return (
                    <tr
                      key={id || index}
                      className="group text-xs font-semibold text-slate-700 hover:bg-emerald-50/40"
                    >
                      {/* Payout ID & Type */}
                      <td className="overflow-hidden px-3 py-4">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                              isVendor
                                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                : "border-sky-100 bg-sky-50 text-sky-700"
                            }`}
                          >
                            {isVendor ? <Store size={16} /> : <Truck size={16} />}
                          </div>

                          <div className="min-w-0">
                            <div className="truncate font-bold text-slate-900 group-hover:text-emerald-700 font-mono">
                              #{id.slice(-8) || "N/A"}
                            </div>
                            <div className="mt-0.5 text-[10px] text-slate-400 font-medium">
                              {isVendor ? "Merchant" : "Delivery Partner"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Beneficiary */}
                      <td className="overflow-hidden px-3 py-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <User size={14} />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-bold text-slate-800">
                              {getAccountHolder(item)}
                            </div>
                            <div className="mt-0.5 truncate text-[10px] text-slate-400 font-mono">
                              ID: {getUserId(item) || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Bank Details */}
                      <td className="overflow-hidden px-3 py-4">
                        <div className="truncate font-bold text-slate-800">
                          {getBankName(item)}
                        </div>
                        <div className="mt-0.5 truncate text-[10px] text-slate-600 font-mono">
                          {maskAccountNumber(getAccountNumber(item))}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          IFSC: {getIfsc(item)}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-0.5 whitespace-nowrap font-black text-emerald-700 font-mono text-sm">
                          <IndianRupee size={13} />
                          {Number(getAmount(item)).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </td>

                      {/* Requested Date */}
                      <td className="overflow-hidden px-3 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{formatDate(getRequestedAt(item))}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-4">
                        <StatusBadge status={status} />
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPayout(item);
                              setShowDetails(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye size={13} className="text-slate-500" />
                            <span>View</span>
                          </button>

                          {status === "PENDING" && (
                            <>
                              <button
                                type="button"
                                disabled={actionLoading === `approve-${id}`}
                                onClick={() => handleApprove(item)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                                title="Approve Payout"
                              >
                                {actionLoading === `approve-${id}` ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  "Approve"
                                )}
                              </button>

                              <button
                                type="button"
                                disabled={actionLoading === `reject-${id}`}
                                onClick={() => handleReject(item)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                title="Reject Payout"
                              >
                                {actionLoading === `reject-${id}` ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  "Reject"
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12">
                    <EmptyState
                      icon={TrendingUp}
                      title="No payout requests found"
                      description={`There are currently no payout requests matching the "${activeStatus}" filter or search query.`}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="py-10 text-center text-xs font-semibold text-slate-400">
              <Loader2 size={24} className="animate-spin text-emerald-600 mx-auto mb-2" />
              Loading payout requests...
            </div>
          ) : filteredPayouts.length > 0 ? (
            filteredPayouts.map((item, idx) => {
              const id = getId(item);
              const status = getStatus(item);

              return (
                <div
                  key={id || idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      #{id.slice(-8) || "N/A"}
                    </span>
                    <StatusBadge status={status} />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{getAccountHolder(item)}</div>
                      <div className="text-[10px] text-slate-500">{getBankName(item)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-emerald-700 text-sm">
                        {formatAmount(getAmount(item))}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatDate(getRequestedAt(item))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPayout(item);
                        setShowDetails(true);
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    >
                      View
                    </button>

                    {status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          disabled={actionLoading === `approve-${id}`}
                          onClick={() => handleApprove(item)}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading === `reject-${id}`}
                          onClick={() => handleReject(item)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center text-xs font-semibold text-slate-400">
              No payout requests found.
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
            <span>
              Showing Page {page + 1} of {totalPages} ({payouts.length} total records)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page === 0 || loading}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 font-mono">
                {page + 1}
              </span>
              <button
                type="button"
                disabled={page >= totalPages - 1 || loading}
                onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Payout Details Inspection Modal */}
      {showDetails && selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
          <div
            className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 relative max-h-[92vh] overflow-y-auto space-y-5"
          >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Payout Request Inspection
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{getId(selectedPayout)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Requested Amount</span>
                    <span className="text-base font-black text-emerald-700 font-mono">
                      {formatAmount(getAmount(selectedPayout))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Current Status</span>
                    <StatusBadge status={getStatus(selectedPayout)} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Request Date</span>
                    <span className="font-bold text-slate-800">
                      {formatDate(getRequestedAt(selectedPayout))}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs mb-2">
                    Settlement Bank Account
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Holder</span>
                    <span className="font-bold text-slate-800">
                      {getAccountHolder(selectedPayout)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank Name</span>
                    <span className="font-bold text-slate-800">
                      {getBankName(selectedPayout)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Number</span>
                    <span className="font-mono font-bold text-slate-800">
                      {getAccountNumber(selectedPayout)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IFSC Code</span>
                    <span className="font-mono font-bold text-slate-800">
                      {getIfsc(selectedPayout)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>

                {getStatus(selectedPayout) === "PENDING" && (
                  <>
                    <button
                      type="button"
                      disabled={actionLoading === `reject-${getId(selectedPayout)}`}
                      onClick={() => handleReject(selectedPayout)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Reject Request
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading === `approve-${getId(selectedPayout)}`}
                      onClick={() => handleApprove(selectedPayout)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      Approve & Settle
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="min-h-dvh bg-[#f6f9f7] flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 w-full space-y-5 sm:space-y-6 lg:max-h-dvh lg:overflow-y-auto">
        {content}
      </main>
    </div>
  );
}
