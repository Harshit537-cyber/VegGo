import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../layouts/Sidebar";
import PageHeader from "../../../components/common/PageHeader";
import SegmentedTabs from "../../../components/common/SegmentedTabs";
import StatusFilterPills from "../../../components/common/StatusFilterPills";
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
  Users,
  Plus,
  Send,
  Navigation,
  MapPin,
  Truck,
} from "lucide-react";

import {
  getPendingDeliveryKyc,
  getDeliveryKycDetails,
  approveDeliveryKyc,
  rejectDeliveryKyc,
} from "../services/deliveryPartnerKycService";

const getValue = (obj, keys, fallback = "-") => {
  for (const key of keys) {
    const value = key
      .split(".")
      .reduce((acc, part) => acc?.[part], obj);

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return fallback;
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const extractList = (response) => {
  const possibleLists = [
    response?.data?.content,
    response?.data?.items,
    response?.data?.deliveryPartners,
    response?.data?.applications,
    response?.content,
    response?.items,
    response?.deliveryPartners,
    response?.applications,
  ];

  for (const list of possibleLists) {
    if (Array.isArray(list)) {
      return list;
    }
  }

  return [];
};

const normalizeDeliveryPartner = (item) => {
  const userId = getValue(
    item,
    [
      "deliveryPartnerUserId",
      "userId",
      "deliveryUserId",
      "id",
      "deliveryPartnerId",
    ],
    ""
  );

  const name = getValue(item, [
    "name",
    "fullName",
    "deliveryPartnerName",
    "userName",
    "username",
  ]);

  const phone = getValue(item, [
    "phone",
    "phoneNumber",
    "mobile",
    "mobileNumber",
    "user.phone",
  ]);

  const status = getValue(
    item,
    [
      "status",
      "kycStatus",
      "applicationStatus",
    ],
    "PENDING"
  );

  const submittedAt = getValue(
    item,
    [
      "submittedAt",
      "createdAt",
      "appliedAt",
      "applicationDate",
      "date",
    ],
    null
  );

  return {
    ...item,
    id: String(userId),
    deliveryPartnerUserId: userId,
    name,
    phone,
    status:
      String(status).toUpperCase() === "PENDING"
        ? "Pending"
        : status,
    date: formatDate(submittedAt),
  };
};

export default function Delivery() {
  const [currentTab, setCurrentTab] = useState("delivery");

  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [selectedPartner, setSelectedPartner] =
    useState(null);

  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionError, setActionError] = useState("");

  const [showRejectModal, setShowRejectModal] =
    useState(false);

  const [rejectReason, setRejectReason] = useState(
    "License number does not match uploaded document"
  );

  const fetchPendingDeliveryKyc = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getPendingDeliveryKyc({
          page: 0,
          size: 20,
        });

      const list = extractList(response);

      const normalized = list.map(
        normalizeDeliveryPartner
      );

      setApplications(normalized);
    } catch (err) {
      console.error(
        "Delivery KYC Pending List Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to load pending delivery KYC applications."
      );

      setApplications([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingDeliveryKyc();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPendingDeliveryKyc();
  };

  const handleViewDetails = async (partner) => {
    const userId =
      partner.deliveryPartnerUserId ||
      partner.id;

    if (!userId) {
      setActionError(
        "Delivery partner user ID is missing."
      );
      return;
    }

    try {
      setSelectedPartner(partner);
      setDetails(null);
      setActionError("");
      setDetailsLoading(true);

      const response =
        await getDeliveryKycDetails(userId);

      setDetails(
        response?.data ||
          response?.data?.data ||
          response
      );
    } catch (err) {
      console.error(
        "Delivery KYC Details Error:",
        err
      );

      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to load delivery KYC details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApprove = async (partner) => {
    const userId =
      partner.deliveryPartnerUserId ||
      partner.id;

    if (!userId) {
      setActionError(
        "Delivery partner user ID is missing."
      );
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      await approveDeliveryKyc(userId);

      setSelectedPartner(null);
      setDetails(null);

      await fetchPendingDeliveryKyc();
    } catch (err) {
      console.error(
        "Delivery KYC Approve Error:",
        err
      );

      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to approve delivery KYC."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (partner) => {
    setSelectedPartner(partner);
    setActionError("");
    setRejectReason(
      "License number does not match uploaded document"
    );
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedPartner) return;

    const userId =
      selectedPartner.deliveryPartnerUserId ||
      selectedPartner.id;

    if (!userId) {
      setActionError(
        "Delivery partner user ID is missing."
      );
      return;
    }

    if (!rejectReason.trim()) {
      setActionError(
        "Please enter a rejection reason."
      );
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      await rejectDeliveryKyc(
        userId,
        rejectReason.trim()
      );

      setShowRejectModal(false);
      setSelectedPartner(null);
      setDetails(null);

      await fetchPendingDeliveryKyc();
    } catch (err) {
      console.error(
        "Delivery KYC Reject Error:",
        err
      );

      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to reject delivery KYC."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const [activeFleetTab, setActiveFleetTab] = useState("roster");
  const [activeFilterTab, setActiveFilterTab] = useState("all");

  const fleetTabs = [
    { id: "roster", label: "Fleet Roster", icon: Users },
    { id: "onboard", label: "Onboard Rider", icon: Plus },
    { id: "shifts", label: "Active Shift Map", icon: MapPin },
    { id: "trips", label: "Live & Past Trips", icon: Truck },
  ];

  const pendingCount = applications.filter((a) => a.status?.toLowerCase().includes("pending")).length;
  const approvedCount = applications.filter((a) => a.status?.toLowerCase().includes("approved")).length;
  const rejectedCount = applications.filter((a) => a.status?.toLowerCase().includes("reject")).length;

  const deliveryFilterPills = [
    { id: "all", label: "All Riders", count: applications.length },
    { id: "pending", label: "Registered (Awaiting Docs)", count: Math.max(0, pendingCount - 1) },
    { id: "review", label: "Docs Uploaded (Needs Review)", count: Math.min(pendingCount, 1) },
    { id: "approved", label: "Approved Riders", count: approvedCount },
    { id: "rejected", label: "Rejected", count: rejectedCount },
  ];

  const filteredApplications = useMemo(() => {
    let list = applications;

    if (activeFilterTab === "pending") {
      list = list.filter((a) => a.status?.toLowerCase().includes("pending"));
    } else if (activeFilterTab === "approved") {
      list = list.filter((a) => a.status?.toLowerCase().includes("approved"));
    } else if (activeFilterTab === "rejected") {
      list = list.filter((a) => a.status?.toLowerCase().includes("reject"));
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return list;
    }

    return list.filter(
      (application) =>
        String(application.name || "").toLowerCase().includes(query) ||
        String(application.phone || "").toLowerCase().includes(query) ||
        String(application.id || "").toLowerCase().includes(query)
    );
  }, [applications, searchQuery, activeFilterTab]);

  return (
    <div className="min-h-dvh bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto max-h-dvh w-full space-y-5 sm:space-y-6">
        {/* Top Executive Header */}
        <PageHeader
          icon={Bike}
          title="Delivery Administration"
          subtitle="Manage rider onboarding lifecycle, document approvals, vehicle verification, and payouts."
          stats={[
            { label: "Total Riders", value: applications.length },
            { label: "Need Review", value: pendingCount, alert: pendingCount > 0 },
          ]}
          actionButtonText="Broadcast to Fleet"
          actionButtonIcon={Send}
          onActionClick={() => alert("Broadcast notification to all active delivery partners")}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing || loading}
        />

        {/* Multi-Color Executive KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fleet Partners</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Bike size={17} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">{applications.length}</div>
            <span className="text-[11px] font-semibold text-emerald-700">Enrolled Delivery Fleet</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending KYC</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Clock size={17} />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-700 font-mono">{pendingCount}</div>
            <span className="text-[11px] font-semibold text-amber-700">Licence & RC Verifications</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-500" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">On-Duty Telemetry</span>
              <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                <Navigation size={17} />
              </div>
            </div>
            <div className="text-2xl font-black text-sky-700 font-mono">{approvedCount}</div>
            <span className="text-[11px] font-semibold text-sky-700">Active Live Dispatchers</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Safety & Coverage</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <ShieldCheck size={17} />
              </div>
            </div>
            <div className="text-2xl font-black text-indigo-700 font-mono">100%</div>
            <span className="text-[11px] font-semibold text-indigo-700">Insurance & Gear Checked</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center gap-3 text-xs sm:text-sm font-semibold text-amber-900 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Segmented Tabs Navigation */}
        <SegmentedTabs
          tabs={fleetTabs}
          activeTab={activeFleetTab}
          onTabChange={setActiveFleetTab}
        />

        {/* Secondary Status Filter Pills */}
        <StatusFilterPills
          filters={deliveryFilterPills}
          activeFilter={activeFilterTab}
          onFilterChange={setActiveFilterTab}
        />

        {/* Workflow Rules Information Bar */}
        <WorkflowRulesBar
          rulesText="All delivery partners across every onboarding phase with search, status filters, and one-click inspection."
          showingCount={filteredApplications.length}
          itemLabel="riders"
        />

        {/* Unified Full-Width Search Input Bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search delivery partners by name, phone number, partner ID, vehicle, or city..."
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
                Loading delivery partner records...
              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <EmptyState
              icon={Bike}
              title="No delivery partners found"
              description={`There are currently no delivery partners in the selected "${deliveryFilterPills.find(f => f.id === activeFilterTab)?.label || 'All'}" category.`}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-5 sm:p-6"
            >
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[760px] text-left border-collapse">
                  <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">
                    <th className="py-3.5 px-4 rounded-l-xl">
                      User ID
                    </th>

                    <th className="py-3.5 px-4">
                      Delivery Partner
                    </th>

                    <th className="py-3.5 px-4">
                      Phone
                    </th>

                    <th className="py-3.5 px-4">
                      Applied Date
                    </th>

                    <th className="py-3.5 px-4">
                      Status
                    </th>

                    <th className="py-3.5 px-4 text-center rounded-r-xl">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-12 text-center text-slate-400 text-xs"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw
                            size={15}
                            className="animate-spin text-emerald-600"
                          />
                          Loading delivery KYC...
                        </div>
                      </td>
                    </tr>
                  ) : filteredApplications.length > 0 ? (
                    filteredApplications.map(
                      (application, index) => (
                        <motion.tr
                          key={
                            application.deliveryPartnerUserId ||
                            application.id ||
                            index
                          }
                          initial={{
                            opacity: 0,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors"
                        >
                          <td className="py-4 px-4 font-mono">
                            {application.id}
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                <User size={16} />
                              </div>

                              <div>
                                <p className="font-semibold">
                                  {application.name}
                                </p>

                                <p className="text-[10px] text-slate-400">
                                  Delivery Partner
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-slate-600">
                            {application.phone}
                          </td>

                          <td className="py-4 px-4 text-slate-500">
                            {application.date}
                          </td>

                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                              <Clock size={11} />
                              {application.status}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  handleViewDetails(
                                    application
                                  )
                                }
                                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                                title="View Details"
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                onClick={() =>
                                  handleApprove(
                                    application
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                                className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                                title="Approve"
                              >
                                <CheckCircle2
                                  size={15}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  openRejectModal(
                                    application
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                                className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle size={15} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-12 text-center text-slate-400 text-xs"
                      >
                        {searchQuery
                          ? "No matching delivery partners found."
                          : "No pending delivery KYC applications."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <RefreshCw
                    size={15}
                    className="animate-spin mx-auto mb-2 text-emerald-600"
                  />
                  Loading delivery KYC...
                </div>
              ) : filteredApplications.length > 0 ? (
                filteredApplications.map(
                  (application, index) => (
                    <div
                      key={
                        application.deliveryPartnerUserId ||
                        application.id ||
                        index
                      }
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold">
                          {application.id}
                        </span>

                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                          {application.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm">
                          {application.name}
                        </h4>

                        <p className="text-xs text-slate-500">
                          {application.phone}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={() =>
                            handleViewDetails(
                              application
                            )
                          }
                          className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <Eye size={14} />
                          View
                        </button>

                        <button
                          onClick={() =>
                            handleApprove(
                              application
                            )
                          }
                          className="flex-1 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 size={14} />
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            openRejectModal(
                              application
                            )
                          }
                          className="flex-1 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="py-10 text-center text-xs text-slate-400">
                  No pending delivery KYC applications.
                </div>
              )}
            </div>
          </motion.div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {selectedPartner &&
          !showRejectModal && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => {
                setSelectedPartner(null);
                setDetails(null);
                setActionError("");
              }}
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
                }}
                onClick={(e) =>
                  e.stopPropagation()
                }
                className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-5 bg-white text-slate-900 border-b border-slate-100 flex items-center justify-between relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Delivery KYC Details
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                      User ID:{" "}
                      {selectedPartner.id}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPartner(null);
                      setDetails(null);
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-5 max-h-[70vh] overflow-y-auto">
                  {detailsLoading ? (
                    <div className="py-16 flex items-center justify-center gap-2 text-sm text-slate-500">
                      <RefreshCw
                        size={16}
                        className="animate-spin text-emerald-600"
                      />
                      Loading details...
                    </div>
                  ) : actionError ? (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                      {actionError}
                    </div>
                  ) : details ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(
                          details
                        ).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="p-4 rounded-2xl bg-slate-50 border border-slate-200"
                            >
                              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                                {key.replace(
                                  /([A-Z])/g,
                                  " $1"
                                )}
                              </p>

                              <p className="text-sm font-semibold text-slate-800 break-words">
                                {typeof value ===
                                "object"
                                  ? JSON.stringify(
                                      value
                                    )
                                  : String(
                                      value ?? "-"
                                    )}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-sm">
                      No KYC details available.
                    </div>
                  )}
                </div>

                <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() =>
                      handleApprove(
                        selectedPartner
                      )
                    }
                    disabled={
                      actionLoading ||
                      detailsLoading
                    }
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    {actionLoading
                      ? "Processing..."
                      : "Approve KYC"}
                  </button>

                  <button
                    onClick={() =>
                      openRejectModal(
                        selectedPartner
                      )
                    }
                    disabled={actionLoading}
                    className="flex-1 py-3 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-sm font-semibold hover:bg-rose-100 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    Reject KYC
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal &&
          selectedPartner && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-semibold text-black">
                      Reject Delivery KYC
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                      User ID:{" "}
                      {selectedPartner.id}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setShowRejectModal(false)
                    }
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200"
                  >
                    <X size={17} />
                  </button>
                </div>

                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Rejection Reason
                </label>

                <textarea
                  value={rejectReason}
                  onChange={(e) =>
                    setRejectReason(
                      e.target.value
                    )
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-black focus:outline-none focus:border-emerald-500 focus:bg-white resize-none"
                  placeholder="Enter rejection reason..."
                />

                {actionError && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {actionError}
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() =>
                      setShowRejectModal(false)
                    }
                    disabled={actionLoading}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="flex-1 py-3 rounded-2xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-50"
                  >
                    {actionLoading
                      ? "Rejecting..."
                      : "Reject KYC"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}