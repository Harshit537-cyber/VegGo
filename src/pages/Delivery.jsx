import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
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
} from "lucide-react";

import {
  getPendingDeliveryKyc,
  getDeliveryKycDetails,
  approveDeliveryKyc,
  rejectDeliveryKyc,
} from "../Api/deliveryPartnerKyc/deliveryPartnerKycService";

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

  const filteredApplications = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    if (!query) {
      return applications;
    }

    return applications.filter(
      (application) =>
        String(application.name || "")
          .toLowerCase()
          .includes(query) ||
        String(application.phone || "")
          .toLowerCase()
          .includes(query) ||
        String(application.id || "")
          .toLowerCase()
          .includes(query)
    );
  }, [applications, searchQuery]);

  const stats = [
    {
      label: "Pending KYC",
      value: applications.length,
      icon: Clock,
      accent: "bg-emerald-600",
      iconBg: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "API Status",
      value: "Live",
      icon: ShieldCheck,
      accent: "bg-teal-600",
      iconBg: "bg-teal-50 text-teal-700",
    },
    {
      label: "Page Size",
      value: "20",
      icon: FileText,
      accent: "bg-emerald-500",
      iconBg: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Total Records",
      value: applications.length,
      icon: Bike,
      accent: "bg-green-700",
      iconBg: "bg-green-50 text-green-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-18 sm:pt-20 lg:pt-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">
        <motion.header
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="relative overflow-hidden rounded-3xl bg-emerald-950 text-white p-6 sm:p-7 shadow-xl shadow-emerald-950/20 border border-emerald-900"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800">
                  <Bike size={12} />
                  Delivery KYC Management
                </span>

                <span className="inline-flex items-center gap-2 bg-rose-950/80 border border-rose-900/80 px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                  LIVE ADMIN VEG GO
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
                Delivery 
              </h1>

              <p className="text-emerald-200 text-sm">
                Review, approve and reject delivery
                partner KYC applications.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-emerald-900/60 border border-emerald-800 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-semibold">
                <Calendar
                  size={14}
                  className="text-emerald-400"
                />

                {new Date().toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </div>

              <button
                onClick={handleRefresh}
                disabled={
                  isRefreshing || loading
                }
                className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={
                    isRefreshing || loading
                      ? "animate-spin text-emerald-300"
                      : "text-emerald-300"
                  }
                />
              </button>
            </div>
          </div>
        </motion.header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.08,
                }}
                className="relative overflow-hidden bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accent}`}
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-black">
                    {stat.label}
                  </span>

                  <div
                    className={`${stat.iconBg} p-2.5 rounded-2xl`}
                  >
                    <Icon size={18} />
                  </div>
                </div>

                <h3 className="mt-4 text-3xl font-semibold text-black font-mono">
                  {stat.value}
                </h3>

                <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-400">
                  Live API Data
                </div>
              </motion.div>
            );
          })}
        </section>

        <section>
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <Bike size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-black">
                    Delivery Partner Applications
                  </h2>

                  <p className="text-xs font-semibold text-slate-500">
                    Pending delivery KYC submissions
                  </p>
                </div>
              </div>

              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-2.5 text-slate-400"
                  size={15}
                />

                <input
                  type="text"
                  placeholder="Search delivery partners..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
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
                <div className="p-5 bg-emerald-950 text-white flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Delivery KYC Details
                    </h2>

                    <p className="text-xs text-emerald-200 mt-1">
                      User ID:{" "}
                      {selectedPartner.id}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPartner(null);
                      setDetails(null);
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20"
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