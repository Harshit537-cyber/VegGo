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
  Bike,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  User,
  Phone,
  FileText,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Landmark,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  AlertTriangle
} from "lucide-react";

import {
  getPendingDeliveryKyc,
  getDeliveryKycDetails,
  approveDeliveryKyc,
  rejectDeliveryKyc,
} from "../services/deliveryPartnerKycService";

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

const normalizeDeliveryPartner = (item) => ({
  ...item,
  userId: item?.userId || item?.deliveryPartnerUserId || item?.deliveryUserId || item?.id || "",
  fullName: item?.fullName || item?.name || "-",
  phone: item?.phone || "-",
  vehicleType: item?.vehicleType || "-",
  vehicleModel: item?.vehicleModel || "-",
  plateNumber: item?.plateNumber || "-",
  licenseNumber: item?.licenseNumber || "-",
  cityOfOperation: item?.cityOfOperation || "-",
  manufactureYear: item?.manufactureYear || null,
  emergencyContact: item?.emergencyContact || {},
  bank: item?.bank || null,
  onboardingStep: item?.onboardingStep ?? null,
  basicInfoCompleted: Boolean(item?.basicInfoCompleted),
  submittedAt: item?.submittedAt || null,
  registeredAt: item?.registeredAt || null,
  lastUpdatedAt: item?.lastUpdatedAt || null,
  date: formatDate(item?.submittedAt || item?.registeredAt),
  documents: Array.isArray(item?.documents) ? item.documents : [],
  allDocumentsUploaded: Boolean(item?.allDocumentsUploaded),
  missingDocuments: Array.isArray(item?.missingDocuments) ? item.missingDocuments : [],
  status: item?.kycStatus === "PENDING" ? "Pending" : item?.kycStatus || "Pending",
});

export default function Delivery({ embedded = false }) {
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
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Action States
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);

  const fetchPendingDeliveryKyc = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      setError("");

      const response = await getPendingDeliveryKyc(page, pageSize);
      const content =
        response?.data?.content ||
        response?.data?.items ||
        response?.content ||
        response?.data ||
        [];

      // Enrich every pending rider using /api/admin/delivery-partners/kyc/:deliveryUserId to get the complete dossier
      const fullPartners = await Promise.all(
        content.map(async (p) => {
          const uid = p?.userId || p?.deliveryPartnerUserId || p?.deliveryUserId || p?.id;
          if (!uid) return normalizeDeliveryPartner(p);
          try {
            const detailRes = await getDeliveryKycDetails(uid);
            const detail = detailRes?.data || detailRes || {};
            return normalizeDeliveryPartner({ ...p, ...detail });
          } catch {
            return normalizeDeliveryPartner(p);
          }
        })
      );

      setApplications(fullPartners);
      setTotalPages(response?.data?.totalPages || response?.totalPages || 1);
      setTotalElements(response?.data?.totalElements ?? response?.totalElements ?? fullPartners.length);
      setCurrentPage(page);
    } catch (err) {
      console.error("Delivery KYC Pending List Error:", err);
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to load pending delivery partner verification requests."
      );
      setApplications([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingDeliveryKyc(0);
  }, [fetchPendingDeliveryKyc]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPendingDeliveryKyc(currentPage);
  };

  const handleViewPartner = async (partner) => {
    const userId = partner?.userId;
    if (!userId) {
      setActionError("Delivery partner User ID is missing.");
      return;
    }

    try {
      setDetailLoading(true);
      setActionError("");
      setShowDetail(true);
      setSelectedPartner(partner);
      setShowRejectBox(false);
      setRejectReason("");

      const response = await getDeliveryKycDetails(userId);
      const detail = response?.data || response || {};

      setSelectedPartner(
        normalizeDeliveryPartner({
          ...partner,
          ...detail,
        })
      );
    } catch (err) {
      console.error("Delivery KYC Detail Error:", err);
      setSelectedPartner(partner);
      setActionError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to load full delivery partner KYC details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async () => {
    const userId = selectedPartner?.userId;
    if (!userId) {
      setActionError("Delivery Partner User ID is missing.");
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      await approveDeliveryKyc(userId);
      setShowDetail(false);
      setSelectedPartner(null);
      await fetchPendingDeliveryKyc(currentPage);
    } catch (err) {
      console.error("Delivery KYC Approve Error:", err);
      setActionError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to approve delivery partner."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const userId = selectedPartner?.userId;
    if (!userId) {
      setActionError("Delivery Partner User ID is missing.");
      return;
    }

    const reason = rejectReason.trim() || "Documents unclear or verification failed";

    try {
      setActionLoading(true);
      setActionError("");
      await rejectDeliveryKyc(userId, reason);
      setShowDetail(false);
      setSelectedPartner(null);
      setRejectReason("");
      setShowRejectBox(false);
      await fetchPendingDeliveryKyc(currentPage);
    } catch (err) {
      console.error("Delivery KYC Reject Error:", err);
      setActionError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to reject delivery partner application."
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
        String(app.fullName || "").toLowerCase().includes(query) ||
        String(app.phone || "").toLowerCase().includes(query) ||
        String(app.cityOfOperation || "").toLowerCase().includes(query) ||
        String(app.vehicleType || "").toLowerCase().includes(query) ||
        String(app.vehicleModel || "").toLowerCase().includes(query) ||
        String(app.plateNumber || "").toLowerCase().includes(query) ||
        String(app.licenseNumber || "").toLowerCase().includes(query)
    );
  }, [applications, searchQuery]);

  const partnerDocuments = useMemo(() => {
    if (!selectedPartner) return [];
    const list = Array.isArray(selectedPartner.documents) ? selectedPartner.documents : [];
    return list.filter((doc) => {
      const rawUrl = doc?.fileUrl || doc?.documentUrl || doc?.url || "";
      const cleaned = rawUrl.replace(/^\[?([^\]]+)\]?\(?([^)]*)\)?$/, "$1").replace(/[\[\]]/g, "").trim();
      return Boolean(doc.uploaded && cleaned);
    });
  }, [selectedPartner]);

  return (
    <div className={embedded ? "w-full space-y-5 sm:space-y-6" : "min-h-dvh bg-[#f6f9f7] flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-100 selection:text-emerald-900"}>
      {!embedded && <Sidebar />}

      <div className={embedded ? "w-full space-y-5 sm:space-y-6" : "flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto max-h-dvh w-full space-y-5 sm:space-y-6"}>
        {/* Top Header */}
        <PageHeader
          icon={Bike}
          title="Delivery Partner Verification"
          subtitle="Verify delivery partners, vehicle details, and KYC applications."
          stats={[
            { label: "Pending KYC", value: totalElements },
            { label: "On This Page", value: applications.length },
          ]}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing || loading}
        />

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs sm:text-sm font-semibold text-rose-800 shadow-2xs">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Workflow Rules Information Bar */}
        <WorkflowRulesBar
          rulesText="Review rider identity, driving license, vehicle registration, and settlement details before approving."
          showingCount={filteredApplications.length}
          itemLabel="delivery partners"
        />

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search riders by name, phone, city of operation, vehicle model, plate or license number..."
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
                Loading pending delivery partner applications...
              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <EmptyState
              icon={Bike}
              title="No pending delivery partner applications"
              description={
                searchQuery
                  ? `No riders matched "${searchQuery}". Try a different keyword.`
                  : "All delivery partner KYC verification requests have been processed."
              }
            />
          ) : (
            <div className="bg-white rounded-3xl border border-emerald-100/90 shadow-2xs overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[900px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase font-bold tracking-wider text-slate-500 bg-slate-50/60">
                      <th className="py-3.5 px-5">Rider / Delivery Partner</th>
                      <th className="py-3.5 px-5">Vehicle & Credentials</th>
                      <th className="py-3.5 px-5">Operating City</th>
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
                        key={app.userId || idx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: idx * 0.02 }}
                        className="text-xs font-semibold text-slate-800 hover:bg-emerald-50/40 transition-colors group"
                      >
                        {/* 1. Rider Name with Phone Number */}
                        <td className="py-4 px-5">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                              {app.fullName || "-"}
                            </span>
                            {app.phone && app.phone !== "-" && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                                <Phone size={11} className="text-emerald-600 shrink-0" />
                                <span>{app.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 2. Vehicle & Credentials */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <Bike size={16} />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">
                                {app.vehicleType} • {app.vehicleModel}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  {app.plateNumber}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Operating City */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                            <MapPin size={12} className="text-emerald-600 shrink-0" />
                            <span>{app.cityOfOperation || "-"}</span>
                          </div>
                        </td>

                        {/* 4. Bank Account */}
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

                        {/* 5. Documents */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${app.allDocumentsUploaded ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                              <FileCheck size={11} />
                              {app.documents?.filter((d) => d.uploaded)?.length || 0} / {app.documents?.length || 0} Docs
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
                            onClick={() => handleViewPartner(app)}
                            disabled={!app.userId}
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

              {/* Mobile / Tablet Card View */}
              <div className="md:hidden p-4 space-y-3">
                {filteredApplications.map((app, idx) => (
                  <div
                    key={app.userId || idx}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{app.fullName || "-"}</h4>
                        {app.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
                            <Phone size={11} className="text-emerald-600 shrink-0" />
                            <span>{app.phone}</span>
                          </div>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock size={10} />
                        {app.status}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Vehicle</span>
                        <span className="font-bold text-slate-800">{app.vehicleType} • {app.vehicleModel}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Plate / City</span>
                        <span className="font-mono text-[11px] font-bold text-slate-700">{app.plateNumber} • {app.cityOfOperation}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Documents</span>
                        <span className="font-bold text-emerald-700">{app.documents?.filter((d) => d.uploaded)?.length || 0} / {app.documents?.length || 0} Uploaded</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400 font-medium">Applied {app.date}</span>
                      <button
                        type="button"
                        onClick={() => handleViewPartner(app)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xs hover:bg-emerald-700 transition-colors"
                      >
                        <Eye size={12} />
                        Inspect KYC
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Footer with Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>
                    Page {currentPage + 1} of {totalPages} ({totalElements} total riders)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 0 || loading}
                      onClick={() => fetchPendingDeliveryKyc(currentPage - 1)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages - 1 || loading}
                      onClick={() => fetchPendingDeliveryKyc(currentPage + 1)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
              <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/40 via-teal-50/30 to-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
                    <Bike size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {selectedPartner?.fullName || "Delivery Partner Verification"}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                        <Clock size={10} />
                        {selectedPartner?.status || "Pending"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {selectedPartner?.vehicleType} • {selectedPartner?.cityOfOperation} • Applied {formatDate(selectedPartner?.submittedAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!actionLoading) {
                      setShowDetail(false);
                      setSelectedPartner(null);
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
                      Loading comprehensive delivery partner KYC dossier...
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

                    {/* SECTION 1: Rider Profile & Contacts */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <User size={14} className="text-emerald-600" />
                        <span>Rider Identity & Contact Details</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Full Name
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5">
                            {selectedPartner?.fullName || "-"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Phone Number
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {selectedPartner?.phone && selectedPartner?.phone !== "-" ? (
                              <>
                                <Phone size={13} className="text-emerald-600 shrink-0" />
                                <span className="text-xs sm:text-sm font-bold text-slate-900">
                                  {selectedPartner.phone}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            City of Operation
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <MapPin size={13} className="text-orange-600 shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {selectedPartner?.cityOfOperation || "-"}
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Onboarding Progress
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-emerald-800 block mt-0.5">
                            Step {selectedPartner?.onboardingStep ?? "-"} Completed
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Registration Date
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Calendar size={13} className="text-slate-500 shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {formatDate(selectedPartner?.registeredAt)}
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Submission Date
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock size={13} className="text-slate-500 shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {formatDate(selectedPartner?.submittedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Vehicle & Transit Credentials */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <Bike size={14} className="text-emerald-600" />
                        <span>Vehicle & Transit Credentials</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Vehicle Type
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5">
                            {selectedPartner?.vehicleType || "-"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Vehicle Model
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5">
                            {selectedPartner?.vehicleModel || "-"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            License Plate Number
                          </span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 block mt-0.5">
                            {selectedPartner?.plateNumber || "-"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Driving License Number
                          </span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 block mt-0.5">
                            {selectedPartner?.licenseNumber || "-"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Manufacture Year
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5">
                            {selectedPartner?.manufactureYear || "-"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Last Updated
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5">
                            {formatDate(selectedPartner?.lastUpdatedAt)}
                          </span>
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
                            {selectedPartner?.bank?.bankName || "-"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                            Account Holder
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5">
                            {selectedPartner?.bank?.accountHolderName || "-"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                            Account Number
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono block mt-0.5">
                            {selectedPartner?.bank?.accountNumber || "-"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                            IFSC Code
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono block mt-0.5">
                            {selectedPartner?.bank?.ifscCode || "-"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold ${selectedPartner?.bank?.agreedToPayoutTerms ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                          <Check size={12} />
                          {selectedPartner?.bank?.agreedToPayoutTerms ? "Agreed to Payout Terms" : "Payout Terms Not Agreed"}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold ${selectedPartner?.bank?.provided ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"}`}>
                          <Check size={12} />
                          {selectedPartner?.bank?.provided ? "Bank Info Provided" : "Bank Info Pending"}
                        </span>
                      </div>
                    </div>

                    {/* SECTION 4: Onboarding Verification Milestones */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Onboarding Progress Milestones</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">Basic Registration Info</span>
                            <span className="text-[10px] text-slate-500">Profile credentials & vehicle specs</span>
                          </div>
                          {selectedPartner?.basicInfoCompleted ? (
                            <span className="p-1 rounded-full bg-emerald-100 text-emerald-700"><Check size={14} /></span>
                          ) : (
                            <span className="p-1 rounded-full bg-slate-200 text-slate-500"><Clock size={14} /></span>
                          )}
                        </div>

                        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">Document Submissions</span>
                            <span className="text-[10px] text-slate-500">
                              {selectedPartner?.allDocumentsUploaded ? "All documents uploaded" : `${selectedPartner?.missingDocuments?.length || 0} documents missing`}
                            </span>
                          </div>
                          {selectedPartner?.allDocumentsUploaded ? (
                            <span className="p-1 rounded-full bg-emerald-100 text-emerald-700"><Check size={14} /></span>
                          ) : (
                            <span className="p-1 rounded-full bg-amber-100 text-amber-700"><AlertTriangle size={14} /></span>
                          )}
                        </div>
                      </div>

                      {selectedPartner?.missingDocuments?.length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Missing Mandatory Documents:</span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {selectedPartner.missingDocuments.map((mDoc, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-white text-amber-800 border border-amber-300"
                                >
                                  {mDoc.replace(/_/g, " ")}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 5: Submitted KYC Documents with Visual Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                          <FileText size={14} className="text-emerald-600" />
                          <span>Submitted KYC Documents ({partnerDocuments.length})</span>
                        </div>
                        {selectedPartner?.allDocumentsUploaded && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Check size={11} /> All Documents Complete
                          </span>
                        )}
                      </div>

                      {partnerDocuments.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
                          No document attachments uploaded yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {partnerDocuments.map((doc, dIdx) => {
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
                                </div>

                                {/* Document Card Footer */}
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
                          Reason for Delivery Partner Rejection
                        </label>
                        <textarea
                          rows={3}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Provide the reason for rejecting this delivery partner (e.g., Driving license expired, vehicle plate number mismatch, missing background check)..."
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