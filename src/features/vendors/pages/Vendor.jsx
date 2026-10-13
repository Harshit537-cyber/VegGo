import React, { useEffect, useMemo, useState, useCallback } from "react";
import Sidebar from "../../../layouts/Sidebar";
import PageHeader from "../../../components/common/PageHeader";
import WorkflowRulesBar from "../../../components/common/WorkflowRulesBar";
import EmptyState from "../../../components/common/EmptyState";
import { motion, AnimatePresence } from "framer-motion";

import {
  Calendar,
  RefreshCw,
  Search,
  Store,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Landmark,
  ShieldCheck,
  Check,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileCheck
} from "lucide-react";

import {
  getPendingVendorKyc,
  getVendorKycDetail,
  approveVendorKyc,
  rejectVendorKyc,
} from "../services/vendorKycService";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeVendor = (item) => ({
  ...item,
  shopId: item?.shopId || "",
  ownerUserId: item?.ownerUserId || "",
  ownerFullName: item?.ownerFullName || "-",
  businessPhone: item?.businessPhone || "-",
  loginPhone: item?.loginPhone || "",
  email: item?.email || "-",
  businessName: item?.businessName || "-",
  businessType: item?.businessType || "-",
  submittedAt: item?.submittedAt || null,
  registeredAt: item?.registeredAt || null,
  lastUpdatedAt: item?.lastUpdatedAt || null,
  date: formatDate(item?.submittedAt),
  address: item?.address || null,
  bank: item?.bank || null,
  onboardingProgress: item?.onboardingProgress || null,
  documents: Array.isArray(item?.documents) ? item.documents : [],
  allDocumentsUploaded: Boolean(item?.allDocumentsUploaded),
  status: item?.kycStatus === "PENDING" ? "Pending" : item?.kycStatus || "Pending",
});

export default function Vendor({ embedded = false }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  // Detail Modal State
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Actions State
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);

  const fetchPendingVendors = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      setError("");

      const response = await getPendingVendorKyc(page, pageSize);
      const content = response?.data?.content || response?.content || [];

      // Enrich every pending vendor using /api/admin/vendors/kyc/:vendorShopId to get the complete dossier
      const fullVendors = await Promise.all(
        content.map(async (v) => {
          if (!v?.shopId) return normalizeVendor(v);
          try {
            const detailRes = await getVendorKycDetail(v.shopId);
            const detail = detailRes?.data || detailRes || {};
            return normalizeVendor({ ...v, ...detail });
          } catch {
            return normalizeVendor(v);
          }
        })
      );

      setApplications(fullVendors);
      setTotalPages(response?.data?.totalPages || response?.totalPages || 1);
      setTotalElements(response?.data?.totalElements ?? response?.totalElements ?? fullVendors.length);
      setCurrentPage(page);
    } catch (err) {
      console.error("Vendor KYC Pending List Error:", err);
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to load pending vendor verification requests."
      );
      setApplications([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingVendors(0);
  }, [fetchPendingVendors]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPendingVendors(currentPage);
  };

  const handleViewVendor = async (application) => {
    const shopId = application?.shopId;
    if (!shopId) {
      setActionError("Shop ID is missing.");
      return;
    }

    try {
      setDetailLoading(true);
      setActionError("");
      setShowDetail(true);
      setSelectedVendor(application);
      setShowRejectBox(false);
      setRejectReason("");

      const response = await getVendorKycDetail(shopId);
      const detail = response?.data || response || {};

      setSelectedVendor(
        normalizeVendor({
          ...application,
          ...detail,
        })
      );
    } catch (err) {
      console.error("Vendor KYC Detail Error:", err);
      setSelectedVendor(application);
      setActionError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to load full vendor KYC details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async () => {
    const vendorShopId =
      selectedVendor?.shopId ||
      selectedVendor?.vendorShopId ||
      selectedVendor?.id;

    if (!vendorShopId) {
      setActionError("Vendor Shop ID is missing.");
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      await approveVendorKyc(vendorShopId);
      setShowDetail(false);
      setSelectedVendor(null);
      await fetchPendingVendors(currentPage);
    } catch (err) {
      console.error("Vendor KYC Approve Error:", err);
      setActionError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to approve vendor application."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const vendorShopId =
      selectedVendor?.shopId ||
      selectedVendor?.vendorShopId ||
      selectedVendor?.id;

    if (!vendorShopId) {
      setActionError("Vendor Shop ID is missing.");
      return;
    }

    const reason = rejectReason.trim() || "Documents unclear or verification failed";

    try {
      setActionLoading(true);
      setActionError("");
      await rejectVendorKyc(vendorShopId, reason);
      setShowDetail(false);
      setSelectedVendor(null);
      setRejectReason("");
      setShowRejectBox(false);
      await fetchPendingVendors(currentPage);
    } catch (err) {
      console.error("Vendor KYC Reject Error:", err);
      setActionError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to reject vendor application."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApplications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return applications;

    return applications.filter(
      (app) =>
        String(app.ownerFullName || app.name || "").toLowerCase().includes(query) ||
        String(app.businessPhone || app.phone || "").toLowerCase().includes(query) ||
        String(app.email || "").toLowerCase().includes(query) ||
        String(app.businessName || app.shopName || "").toLowerCase().includes(query) ||
        String(app.businessType || app.category || "").toLowerCase().includes(query)
    );
  }, [applications, searchQuery]);

  // Extract documents array safely
  const vendorDocuments = useMemo(() => {
    if (!selectedVendor) return [];
    const raw =
      selectedVendor?.documents ||
      selectedVendor?.kycDocuments ||
      selectedVendor?.docs ||
      [];
    return Array.isArray(raw) ? raw : [];
  }, [selectedVendor]);

  return (
    <div className={embedded ? "w-full space-y-5 sm:space-y-6" : "min-h-dvh bg-[#f6f9f7] flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-100 selection:text-emerald-900"}>
      {!embedded && <Sidebar />}

      <div className={embedded ? "w-full space-y-5 sm:space-y-6" : "flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto max-h-dvh w-full space-y-5 sm:space-y-6"}>
        {/* Top Header */}
        <PageHeader
          icon={Store}
          title="Vendor Verifications"
          subtitle="Review and process pending merchant shop KYC applications and document credentials."
          stats={[
            { label: "Pending KYC", value: totalElements },
            { label: "On This Page", value: applications.length },
          ]}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing || loading}
        />

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-amber-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Workflow Information Bar */}
        <WorkflowRulesBar
          rulesText="Vendor merchant applications awaiting administrative KYC inspection, document validation, and approval."
          showingCount={filteredApplications.length}
          itemLabel="merchants"
        />

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search pending applications by merchant name, phone, shop name, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        {/* Main Content: Table on Desktop, Cards on Mobile/Tablet */}
        <section className="w-full">
          {loading ? (
            <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80">
              <div className="flex flex-col items-center justify-center gap-3 text-xs font-semibold text-slate-500">
                <RefreshCw size={24} className="animate-spin text-emerald-600" />
                Loading pending vendor applications...
              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No pending vendor applications"
              description={
                searchQuery
                  ? `No applications matched "${searchQuery}". Try a different keyword.`
                  : "All merchant KYC applications have been reviewed and processed."
              }
            />
          ) : (
            <div className="bg-white rounded-3xl border border-emerald-100/90 shadow-2xs overflow-hidden">
              {/* Desktop Table View (md and above) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[900px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase font-bold tracking-wider text-slate-500 bg-slate-50/60">
                      <th className="py-3.5 px-5">Merchant / Owner</th>
                      <th className="py-3.5 px-5">Shop & Location</th>
                      <th className="py-3.5 px-5">Category</th>
                      <th className="py-3.5 px-5">Bank Account</th>
                      <th className="py-3.5 px-5">Documents</th>
                      <th className="py-3.5 px-5">Applied Date</th>
                      <th className="py-3.5 px-5 text-center">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredApplications.map((app, idx) => (
                      <motion.tr
                        key={app.shopId || app.id || idx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: idx * 0.02 }}
                        className="text-xs font-semibold text-slate-800 hover:bg-emerald-50/40 transition-colors group"
                      >
                        {/* 1. Merchant / Owner (Name with Phone Number & Email) */}
                        <td className="py-4 px-5">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                              {app.ownerFullName || "-"}
                            </span>
                            {app.businessPhone && app.businessPhone !== "-" && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                                <Phone size={11} className="text-emerald-600 shrink-0" />
                                <span>{app.businessPhone}</span>
                              </div>
                            )}
                            {app.email && app.email !== "-" && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                                <Mail size={11} className="text-emerald-600 shrink-0" />
                                <span className="truncate max-w-[190px]">{app.email}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 2. Shop Details & Location (NO Shop ID) */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <Store size={16} />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors block truncate">
                                {app.businessName || "-"}
                              </span>
                              {app.address?.city && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-0.5">
                                  <MapPin size={10} className="text-emerald-600 shrink-0" />
                                  <span className="truncate">{app.address.city}, {app.address.state}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 3. Category / Business Type */}
                        <td className="py-4 px-5">
                          <span className="bg-slate-50 text-slate-700 border border-slate-200/80 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                            {app.businessType || "-"}
                          </span>
                        </td>

                        {/* 4. Bank Account Details */}
                        <td className="py-4 px-5">
                          {app.bank?.bankName ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                                <Landmark size={12} className="text-emerald-600 shrink-0" />
                                <span>{app.bank.bankName}</span>
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono block">
                                ••••{app.bank.accountNumber?.slice(-4) || "----"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-normal">-</span>
                          )}
                        </td>

                        {/* 5. Documents Status */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <FileCheck size={11} />
                              {app.documents?.length || 0} Docs
                            </span>
                          </div>
                        </td>

                        {/* 6. Applied Date */}
                        <td className="py-4 px-5 text-slate-500 font-normal">
                          {app.date || "-"}
                        </td>

                        {/* 7. Status */}
                        <td className="py-4 px-5 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={11} className="text-amber-600" />
                            {app.status}
                          </span>
                        </td>

                        {/* 8. Actions */}
                        <td className="py-4 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => handleViewVendor(app)}
                            disabled={!app.shopId && !app.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-40 cursor-pointer font-bold text-xs"
                          >
                            <Eye size={13} />
                            Inspect KYC
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Card View (md:hidden) */}
              <div className="md:hidden p-4 space-y-3">
                {filteredApplications.map((app, idx) => (
                  <div
                    key={app.shopId || app.id || idx}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-sm text-slate-900 block">
                          {app.ownerFullName || "-"}
                        </span>
                        {app.businessPhone && app.businessPhone !== "-" && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Phone size={11} className="text-emerald-600 shrink-0" />
                            <span>{app.businessPhone}</span>
                          </div>
                        )}
                        {app.email && app.email !== "-" && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Mail size={11} className="text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[200px]">{app.email}</span>
                          </div>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                        <Clock size={10} />
                        {app.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                        <Store size={15} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {app.businessName || "-"}
                        </h4>
                        {app.address?.city && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <MapPin size={10} className="text-orange-600 shrink-0" />
                            <span>{app.address.city}, {app.address.state}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {app.bank?.bankName && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Landmark size={12} className="text-emerald-600" />
                          <span>{app.bank.bankName}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ••••{app.bank.accountNumber?.slice(-4) || "----"}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Category
                        </span>
                        <span className="font-semibold text-slate-700">
                          {app.businessType || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Documents
                        </span>
                        <span className="font-semibold text-emerald-700">
                          {app.documents?.length || 0} Attached
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleViewVendor(app)}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
                    >
                      <Eye size={14} />
                      Inspect & Verify Dossier
                    </button>
                  </div>
                ))}
              </div>

              {/* Real Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
                  <span className="text-xs text-slate-500 font-medium">
                    Showing page <strong className="text-slate-800">{currentPage + 1}</strong> of{" "}
                    <strong className="text-slate-800">{totalPages}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fetchPendingVendors(currentPage - 1)}
                      disabled={currentPage === 0 || loading}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchPendingVendors(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1 || loading}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* KYC Inspection & Full Dossier Modal */}
      <AnimatePresence>
        {showDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-200"
            >
              {/* Modal Header */}
              <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50/40 via-emerald-50/30 to-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
                    <Store size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {selectedVendor?.businessName || selectedVendor?.shopName || "Merchant KYC Verification"}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                        <Clock size={10} />
                        {selectedVendor?.status || "Pending"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {selectedVendor?.businessType || "Merchant"} • Applied {formatDate(selectedVendor?.submittedAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!actionLoading) {
                      setShowDetail(false);
                      setSelectedVendor(null);
                      setShowRejectBox(false);
                    }
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={19} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
                {detailLoading ? (
                  <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-3">
                    <RefreshCw size={28} className="animate-spin text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-600">
                      Loading comprehensive merchant KYC dossier...
                    </span>
                  </div>
                ) : (
                  <>
                    {actionError && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0 text-rose-600" />
                        <span>{actionError}</span>
                      </div>
                    )}

                    {/* SECTION 1: Merchant Profile & Contacts */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <User size={14} className="text-emerald-600" />
                        <span>Merchant Profile & Contact Details</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Owner Full Name
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5">
                            {selectedVendor?.ownerFullName || "-"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Phone Number
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {selectedVendor?.businessPhone && selectedVendor?.businessPhone !== "-" ? (
                              <>
                                <Phone size={13} className="text-emerald-600 shrink-0" />
                                <span className="text-xs sm:text-sm font-bold text-slate-900">
                                  {selectedVendor.businessPhone}
                                </span>
                              </>
                            ) : selectedVendor?.loginPhone ? (
                              <>
                                <Phone size={13} className="text-emerald-600 shrink-0" />
                                <span className="text-xs sm:text-sm font-bold text-slate-900">
                                  {selectedVendor.loginPhone}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Email Address
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {selectedVendor?.email && selectedVendor?.email !== "-" ? (
                              <>
                                <Mail size={13} className="text-emerald-600 shrink-0" />
                                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                  {selectedVendor.email}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Shop / Business Name
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5">
                            {selectedVendor?.businessName || selectedVendor?.shopName || "-"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Business Type
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-emerald-800 block mt-0.5">
                            {selectedVendor?.businessType || "-"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Registration Date
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Calendar size={13} className="text-slate-500 shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {formatDate(selectedVendor?.registeredAt || selectedVendor?.submittedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Business Operating Address */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <MapPin size={14} className="text-orange-600" />
                        <span>Operating Business Address</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Full Address
                          </span>
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5 leading-relaxed">
                            {selectedVendor?.address?.fullAddress || selectedVendor?.address?.streetAddress || "No address details provided."}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200/60 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">City</span>
                            <span className="font-bold text-slate-800">{selectedVendor?.address?.city || "-"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">State</span>
                            <span className="font-bold text-slate-800">{selectedVendor?.address?.state || "-"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">PIN / Postal Code</span>
                            <span className="font-bold text-slate-800">{selectedVendor?.address?.zipCode || "-"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">GPS Coordinates</span>
                            {selectedVendor?.address?.latitude && selectedVendor?.address?.longitude ? (
                              <a
                                href={`https://www.google.com/maps?q=${selectedVendor.address.latitude},${selectedVendor.address.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                              >
                                View Map <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span className="font-medium text-slate-400">-</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: Bank & Settlement Details */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <Landmark size={14} className="text-emerald-600" />
                        <span>Payout & Settlement Bank Details</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                            Bank Name
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5">
                            {selectedVendor?.bank?.bankName || "-"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                            Account Holder
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5">
                            {selectedVendor?.bank?.accountHolderName || "-"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                            Account Number
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono block mt-0.5">
                            {selectedVendor?.bank?.accountNumber || "-"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                            IFSC Code
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono block mt-0.5">
                            {selectedVendor?.bank?.ifscCode || "-"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold ${selectedVendor?.bank?.agreedToPayoutTerms ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                          <Check size={12} />
                          {selectedVendor?.bank?.agreedToPayoutTerms ? "Agreed to Payout Terms" : "Payout Terms Not Agreed"}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold ${selectedVendor?.bank?.provided ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"}`}>
                          <Check size={12} />
                          {selectedVendor?.bank?.provided ? "Bank Info Provided" : "Bank Info Pending"}
                        </span>
                      </div>
                    </div>

                    {/* SECTION 4: Onboarding Verification Milestones */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Onboarding Progress Milestones</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700">Basic Info</span>
                          {selectedVendor?.onboardingProgress?.basicInfoCompleted ? (
                            <span className="p-1 rounded-full bg-emerald-100 text-emerald-700"><Check size={12} /></span>
                          ) : (
                            <span className="p-1 rounded-full bg-slate-200 text-slate-500"><Clock size={12} /></span>
                          )}
                        </div>

                        <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700">Location Info</span>
                          {selectedVendor?.onboardingProgress?.businessLocationCompleted ? (
                            <span className="p-1 rounded-full bg-emerald-100 text-emerald-700"><Check size={12} /></span>
                          ) : (
                            <span className="p-1 rounded-full bg-slate-200 text-slate-500"><Clock size={12} /></span>
                          )}
                        </div>

                        <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700">Bank Details</span>
                          {selectedVendor?.onboardingProgress?.bankDetailsCompleted ? (
                            <span className="p-1 rounded-full bg-emerald-100 text-emerald-700"><Check size={12} /></span>
                          ) : (
                            <span className="p-1 rounded-full bg-slate-200 text-slate-500"><Clock size={12} /></span>
                          )}
                        </div>

                        <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700">Payment Settings</span>
                          {selectedVendor?.onboardingProgress?.paymentSettingsConfigured ? (
                            <span className="p-1 rounded-full bg-emerald-100 text-emerald-700"><Check size={12} /></span>
                          ) : (
                            <span className="p-1 rounded-full bg-slate-200 text-slate-500"><Clock size={12} /></span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 5: Submitted KYC Documents with Visual Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                          <FileText size={14} className="text-emerald-600" />
                          <span>Submitted KYC Documents ({vendorDocuments.length})</span>
                        </div>
                        {selectedVendor?.allDocumentsUploaded && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Check size={11} /> All Documents Uploaded
                          </span>
                        )}
                      </div>

                      {vendorDocuments.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
                          No document attachments found for this merchant.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {vendorDocuments.map((doc, dIdx) => {
                            const rawUrl = doc.fileUrl || doc.documentUrl || doc.url || "";
                            // Clean markdown link formatting if URL was enclosed in markdown
                            const docUrl = rawUrl.replace(/^\[?([^\]]+)\]?\(?([^)]*)\)?$/, "$1").replace(/[\[\]]/g, "").trim();
                            const docType = (doc.documentType || doc.type || `Document #${dIdx + 1}`).replace(/_/g, " ");

                            return (
                              <div
                                key={dIdx}
                                className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col hover:border-emerald-300 transition-all shadow-2xs group"
                              >
                                {/* Document Header */}
                                <div className="p-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                                  <div className="min-w-0 pr-2">
                                    <span className="font-bold text-xs text-slate-900 block truncate capitalize">
                                      {docType}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      Uploaded {formatDate(doc.uploadedAt || doc.lastUpdatedAt)}
                                    </span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                    {doc.status || "PENDING"}
                                  </span>
                                </div>

                                {/* Document Visual Preview */}
                                <div className="relative w-full h-40 bg-slate-100 flex items-center justify-center overflow-hidden">
                                  {docUrl ? (
                                    <>
                                      <img
                                        src={docUrl}
                                        alt={docType}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <a
                                          href={docUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md inline-flex items-center gap-1.5 hover:bg-emerald-50 transition-colors"
                                        >
                                          <ExternalLink size={13} />
                                          Open Full Image
                                        </a>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex flex-col items-center gap-1.5 text-slate-400 text-xs font-semibold">
                                      <FileText size={24} />
                                      <span>No preview available</span>
                                    </div>
                                  )}
                                </div>

                                {/* Document Card Footer */}
                                {docUrl && (
                                  <div className="p-2.5 bg-white border-t border-slate-100 flex justify-end">
                                    <a
                                      href={docUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                                    >
                                      View Original File <ExternalLink size={11} />
                                    </a>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Rejection Reason Form */}
                    {showRejectBox && (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                        <label className="block text-xs font-bold text-rose-900">
                          Reason for Application Rejection
                        </label>
                        <textarea
                          rows={3}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Provide the reason for rejecting this KYC application (e.g., Unclear business license image, Tax ID mismatch, incomplete bank proof)..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-rose-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowRejectBox(false)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleReject}
                            disabled={actionLoading}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                          >
                            {actionLoading && <RefreshCw size={12} className="animate-spin" />}
                            Confirm Rejection
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Actions Footer */}
              {!detailLoading && !showRejectBox && (
                <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRejectBox(true)}
                    disabled={actionLoading}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    Reject Application
                  </button>

                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center justify-center gap-2 shadow-sm"
                  >
                    {actionLoading ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    Approve Application
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}