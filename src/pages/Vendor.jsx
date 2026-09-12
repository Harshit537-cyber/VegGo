import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";

import {
  Calendar,
  RefreshCw,
  Search,
  Sparkles,
  Store,
  Zap,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  User,
  FileText,
} from "lucide-react";

import {
  getPendingVendorKyc,
  getVendorKycDetail,
  approveVendorKyc,
  rejectVendorKyc,
} from "../Api/vendorKycService/vendorKycService";

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

const normalizeVendor = (item) => {
  const shopId = getValue(
    item,
    [
      "shopId",
      "vendorShopId",
      "shop.id",
      "vendor.shopId",
      "id",
      "vendorId",
    ],
    ""
  );

  const shopName = getValue(
    item,
    [
      "shopName",
      "storeName",
      "businessName",
      "shop.name",
      "vendor.shopName",
      "name",
      "vendorName",
    ]
  );

  const ownerName = getValue(
    item,
    [
      "ownerName",
      "vendorName",
      "owner.fullName",
      "vendor.fullName",
      "fullName",
      "owner",
      "userName",
      "username",
    ]
  );

  const category = getValue(
    item,
    [
      "categoryName",
      "category.name",
      "category",
      "businessCategory",
      "shopCategory",
    ]
  );

  const createdAt = getValue(
    item,
    [
      "createdAt",
      "appliedAt",
      "submittedAt",
      "applicationDate",
      "date",
    ],
    null
  );

  const status = getValue(
    item,
    [
      "status",
      "kycStatus",
      "applicationStatus",
    ],
    "PENDING"
  );

  return {
    ...item,
    id: String(shopId || ""),
    shopId: shopId || "",
    name: shopName,
    owner: ownerName,
    category,
    date: formatDate(createdAt),
    status:
      String(status).toUpperCase() === "PENDING"
        ? "Pending"
        : status,
  };
};

const extractList = (response) => {
  const possibleLists = [
    response?.data?.content,
    response?.data?.items,
    response?.data?.vendors,
    response?.data?.shops,
    response?.data?.applications,
    response?.content,
    response?.items,
    response?.vendors,
    response?.shops,
    response?.applications,
  ];

  for (const list of possibleLists) {
    if (Array.isArray(list)) {
      return list;
    }
  }

  return [];
};

const extractDetail = (response) => {
  return (
    response?.data?.data ||
    response?.data?.vendor ||
    response?.data?.shop ||
    response?.data ||
    response
  );
};

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    setDisplayValue(String(value ?? 0));
  }, [value]);

  return <span>{displayValue}</span>;
}

export default function Vendor() {
  const [currentTab, setCurrentTab] =
    useState("shop-approval");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedVendor, setSelectedVendor] =
    useState(null);

  const [showDetail, setShowDetail] =
    useState(false);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionError, setActionError] =
    useState("");

  const [rejectReason, setRejectReason] =
    useState("");

  const [showRejectBox, setShowRejectBox] =
    useState(false);

  const fetchPendingVendors = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getPendingVendorKyc();

      const vendors =
        extractList(response);

      const normalizedVendors =
        vendors.map(normalizeVendor);

      setApplications(normalizedVendors);
    } catch (error) {
      console.error(
        "Vendor KYC Pending List Error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to load pending vendor applications."
      );

      setApplications([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    await fetchPendingVendors();
  };

  const handleViewVendor = async (application) => {
    const vendorShopId =
      application?.shopId ||
      application?.vendorShopId ||
      application?.id;

    if (!vendorShopId) {
      setActionError(
        "Vendor Shop ID is missing."
      );
      return;
    }

    try {
      setDetailLoading(true);
      setActionError("");
      setShowDetail(true);
      setSelectedVendor(null);

      const response =
        await getVendorKycDetail(
          vendorShopId
        );

      const detail =
        extractDetail(response);

      setSelectedVendor(detail);
    } catch (error) {
      console.error(
        "Vendor KYC Detail Error:",
        error
      );

      setActionError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to load vendor details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async () => {
    const vendorShopId =
      selectedVendor?.shopId ||
      selectedVendor?.vendorShopId ||
      selectedVendor?.shop?.id ||
      selectedVendor?.id;

    if (!vendorShopId) {
      setActionError(
        "Vendor Shop ID is missing."
      );
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      await approveVendorKyc(
        vendorShopId
      );

      setShowDetail(false);
      setSelectedVendor(null);

      await fetchPendingVendors();
    } catch (error) {
      console.error(
        "Vendor KYC Approve Error:",
        error
      );

      setActionError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to approve vendor."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const vendorShopId =
      selectedVendor?.shopId ||
      selectedVendor?.vendorShopId ||
      selectedVendor?.shop?.id ||
      selectedVendor?.id;

    if (!vendorShopId) {
      setActionError(
        "Vendor Shop ID is missing."
      );
      return;
    }

    const reason =
      rejectReason.trim() ||
      "Document unclear";

    try {
      setActionLoading(true);
      setActionError("");

      await rejectVendorKyc(
        vendorShopId,
        reason
      );

      setShowDetail(false);
      setSelectedVendor(null);
      setRejectReason("");
      setShowRejectBox(false);

      await fetchPendingVendors();
    } catch (error) {
      console.error(
        "Vendor KYC Reject Error:",
        error
      );

      setActionError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to reject vendor."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApplications =
    useMemo(() => {
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
          String(application.owner || "")
            .toLowerCase()
            .includes(query) ||
          String(application.id || "")
            .toLowerCase()
            .includes(query) ||
          String(application.category || "")
            .toLowerCase()
            .includes(query)
      );
    }, [applications, searchQuery]);

  const approvalStats = [
    {
      label: "Pending Applications",
      value: applications.length,
      accentColor: "bg-emerald-600",
      iconBg:
        "bg-emerald-50 text-emerald-700",
      icon: Store,
    },
    {
      label: "API Status",
      value: error ? "Offline" : "Live",
      accentColor: "bg-teal-600",
      iconBg:
        "bg-teal-50 text-teal-700",
      icon: Zap,
    },
    {
      label: "Page Size",
      value: "20",
      accentColor: "bg-emerald-500",
      iconBg:
        "bg-emerald-50 text-emerald-700",
      icon: Clock,
    },
    {
      label: "Total Records",
      value: applications.length,
      accentColor: "bg-green-700",
      iconBg:
        "bg-green-50 text-green-700",
      icon: Store,
    },
  ];

  const detailShopId =
    selectedVendor?.shopId ||
    selectedVendor?.vendorShopId ||
    selectedVendor?.shop?.id ||
    selectedVendor?.id ||
    "-";

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">
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
            ease: "easeOut",
          }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm">
                <Zap
                  size={12}
                  className="text-emerald-400 animate-bounce"
                />
                Vendor Management Directory
              </span>

              <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-900/80 px-3 py-1 rounded-full text-rose-300 shadow-sm">
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
              Vendor
              <Sparkles className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </h1>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center z-10">
            <div className="bg-emerald-900/60 border border-emerald-800 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-100 shadow-inner">
              <Calendar
                size={14}
                className="text-emerald-400"
              />

              <span>
                {new Date().toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </span>
            </div>

            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={handleRefresh}
              disabled={
                isRefreshing || loading
              }
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner group/btn disabled:opacity-60"
              title="Refresh Data"
            >
              <RefreshCw
                size={15}
                className={`text-emerald-300 transition-transform duration-700 ${
                  isRefreshing || loading
                    ? "animate-spin"
                    : "group-hover/btn:rotate-45"
                }`}
              />
            </motion.button>
          </div>
        </motion.header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {approvalStats.map(
            (stat, idx) => {
              const IconComponent =
                stat.icon;

              return (
                <motion.div
                  key={idx}
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
                    delay: idx * 0.1,
                  }}
                  whileHover={{
                    y: -6,
                    transition: {
                      duration: 0.2,
                    },
                  }}
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accentColor}`}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-semibold text-black uppercase tracking-wider">
                        {stat.label}
                      </span>

                      <div
                        className={`${stat.iconBg} p-2.5 rounded-2xl shadow-xs`}
                      >
                        <IconComponent size={18} />
                      </div>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-semibold text-black tracking-tight font-mono">
                      <AnimatedValue
                        value={stat.value}
                        key={refreshKey}
                      />
                    </h3>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between relative z-10">
                    <span className="text-[11px] text-slate-400 font-semibold">
                      Live API Data
                    </span>

                    <span className="text-[11px] text-black font-semibold">
                      Current Period
                    </span>
                  </div>
                </motion.div>
              );
            }
          )}
        </section>

        <section className="w-full">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.3,
            }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <Store size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Shop Applications
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Pending vendor shop approval directory
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
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">
                    <th className="py-3.5 px-4 rounded-l-xl">
                      Request ID
                    </th>

                    <th className="py-3.5 px-4">
                      Shop Details
                    </th>

                    <th className="py-3.5 px-4">
                      Authorized Agent
                    </th>

                    <th className="py-3.5 px-4">
                      Category
                    </th>

                    <th className="py-3.5 px-4">
                      Applied Date
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Status
                    </th>

                    <th className="py-3.5 px-4 text-center rounded-r-xl">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-12 text-center text-slate-400 text-xs"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw
                            size={15}
                            className="animate-spin text-emerald-600"
                          />
                          Loading pending applications...
                        </div>
                      </td>
                    </tr>
                  ) : filteredApplications.length > 0 ? (
                    filteredApplications.map(
                      (
                        application,
                        idx
                      ) => (
                        <motion.tr
                          key={
                            application.shopId ||
                            application.id ||
                            idx
                          }
                          initial={{
                            opacity: 0,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            duration: 0.3,
                            delay:
                              idx * 0.05,
                          }}
                          className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group"
                        >
                          <td className="py-3.5 px-4 font-mono text-black font-semibold group-hover:text-emerald-700">
                            {application.id ||
                              "-"}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-black group-hover:text-emerald-700">
                                {application.name}
                              </span>

                              <span className="text-[10px] text-slate-500">
                                Vendor Shop Application
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            {application.owner}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                              {application.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-500">
                            {application.date}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200/80">
                              <Clock
                                size={11}
                                className="text-amber-600"
                              />
                              {application.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() =>
                                handleViewVendor(
                                  application
                                )
                              }
                              disabled={
                                !application.shopId &&
                                !application.id
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-40"
                            >
                              <Eye size={13} />
                              View
                            </button>
                          </td>
                        </motion.tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-12 text-center text-slate-400 text-xs"
                      >
                        {searchQuery
                          ? "No matching shop applications found."
                          : "No pending applications remaining."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw
                      size={15}
                      className="animate-spin text-emerald-600"
                    />
                    Loading pending applications...
                  </div>
                </div>
              ) : filteredApplications.length > 0 ? (
                filteredApplications.map(
                  (
                    application,
                    idx
                  ) => (
                    <motion.div
                      key={
                        application.shopId ||
                        application.id ||
                        idx
                      }
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-black font-semibold">
                          {application.id ||
                            "-"}
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                          <Clock size={10} />
                          {application.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-black">
                          {application.name}
                        </h4>

                        <p className="text-xs text-slate-500">
                          {application.owner}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Category
                          </span>

                          <span className="font-semibold text-slate-600">
                            {application.category}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Applied Date
                          </span>

                          <span className="font-semibold text-slate-600">
                            {application.date}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handleViewVendor(
                            application
                          )
                        }
                        disabled={
                          !application.shopId &&
                          !application.id
                        }
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all disabled:opacity-40"
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                    </motion.div>
                  )
                )
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  {searchQuery
                    ? "No matching shop applications found."
                    : "No pending applications remaining."}
                </div>
              )}
            </div>
          </motion.div>
        </section>
      </main>

      <AnimatePresence>
        {showDetail && (
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
            className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => {
              if (!actionLoading) {
                setShowDetail(false);
                setSelectedVendor(null);
                setActionError("");
                setShowRejectBox(false);
              }
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
                y: 20,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-emerald-950 text-white border-b border-emerald-900">
                <div>
                  <div className="flex items-center gap-2">
                    <Store
                      size={19}
                      className="text-emerald-400"
                    />
                    <h2 className="text-lg font-semibold">
                      Vendor KYC Details
                    </h2>
                  </div>

                  <p className="text-[11px] text-emerald-300 mt-1">
                    Shop ID: {detailShopId}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (!actionLoading) {
                      setShowDetail(false);
                      setSelectedVendor(null);
                      setActionError("");
                      setShowRejectBox(false);
                    }
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {detailLoading ? (
                <div className="py-20 flex items-center justify-center gap-3 text-sm text-slate-500">
                  <RefreshCw
                    size={18}
                    className="animate-spin text-emerald-600"
                  />
                  Loading vendor details...
                </div>
              ) : selectedVendor ? (
                <div className="p-6 space-y-5">
                  {actionError && (
                    <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                      {actionError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Store size={15} />
                        <span className="text-[10px] uppercase font-semibold">
                          Shop Name
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-black">
                        {getValue(
                          selectedVendor,
                          [
                            "shopName",
                            "storeName",
                            "businessName",
                            "shop.name",
                            "name",
                          ]
                        )}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <User size={15} />
                        <span className="text-[10px] uppercase font-semibold">
                          Owner
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-black">
                        {getValue(
                          selectedVendor,
                          [
                            "ownerName",
                            "vendorName",
                            "fullName",
                            "owner.fullName",
                            "vendor.fullName",
                          ]
                        )}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <FileText size={15} />
                        <span className="text-[10px] uppercase font-semibold">
                          Category
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-black">
                        {getValue(
                          selectedVendor,
                          [
                            "categoryName",
                            "category.name",
                            "category",
                            "businessCategory",
                            "shopCategory",
                          ]
                        )}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Clock size={15} />
                        <span className="text-[10px] uppercase font-semibold">
                          Status
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-amber-700">
                        {getValue(
                          selectedVendor,
                          [
                            "status",
                            "kycStatus",
                            "applicationStatus",
                          ],
                          "PENDING"
                        )}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 sm:col-span-2">
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Calendar size={15} />
                        <span className="text-[10px] uppercase font-semibold">
                          Applied Date
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-black">
                        {formatDate(
                          getValue(
                            selectedVendor,
                            [
                              "createdAt",
                              "appliedAt",
                              "submittedAt",
                              "applicationDate",
                            ],
                            null
                          )
                        )}
                      </p>
                    </div>
                  </div>

                  {showRejectBox && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                      <label className="block text-xs font-semibold text-rose-800 mb-2">
                        Rejection Reason
                      </label>

                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) =>
                          setRejectReason(
                            e.target.value
                          )
                        }
                        placeholder="e.g. Document unclear"
                        className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-white text-sm text-black focus:outline-none focus:border-rose-500"
                      />

                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          onClick={() =>
                            setShowRejectBox(
                              false
                            )
                          }
                          disabled={
                            actionLoading
                          }
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={handleReject}
                          disabled={
                            actionLoading
                          }
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 inline-flex items-center gap-2"
                        >
                          {actionLoading ? (
                            <RefreshCw
                              size={13}
                              className="animate-spin"
                            />
                          ) : (
                            <XCircle size={13} />
                          )}
                          Confirm Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {!showRejectBox && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        onClick={handleApprove}
                        disabled={
                          actionLoading
                        }
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <RefreshCw
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <CheckCircle2
                            size={16}
                          />
                        )}
                        Approve Vendor
                      </button>

                      <button
                        onClick={() =>
                          setShowRejectBox(
                            true
                          )
                        }
                        disabled={
                          actionLoading
                        }
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-sm font-semibold hover:bg-rose-100 transition-all disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Reject Vendor
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  Unable to load vendor details.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}