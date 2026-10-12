import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import PageHeader from "../Common/PageHeader";
import SegmentedTabs from "../Common/SegmentedTabs";
import StatusFilterPills from "../Common/StatusFilterPills";
import WorkflowRulesBar from "../Common/WorkflowRulesBar";
import EmptyState from "../Common/EmptyState";
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
  Users,
  Plus,
  Package,
  Send,
  Tag,
  ShieldCheck,
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

  const [activeRosterTab, setActiveRosterTab] = useState("roster");
  const [activeFilterTab, setActiveFilterTab] = useState("all");

  const rosterTabs = [
    { id: "roster", label: "Vendors Roster", icon: Users },
    { id: "onboard", label: "Onboard Vendor", icon: Plus },
    { id: "stores", label: "Store Outlets", icon: Store },
    { id: "consignments", label: "Live & Past Consignments", icon: Package },
  ];

  const pendingCount = applications.filter(
    (a) => a.status?.toLowerCase().includes("pending") || !a.isApproved
  ).length;

  const approvedCount = applications.filter(
    (a) => a.status?.toLowerCase().includes("approved") || a.isApproved
  ).length;

  const rejectedCount = applications.filter(
    (a) => a.status?.toLowerCase().includes("reject")
  ).length;

  const filterPills = [
    { id: "all", label: "All Vendors", count: applications.length },
    { id: "pending", label: "Registered (Awaiting Docs)", count: Math.max(0, pendingCount - 1) },
    { id: "review", label: "Docs Uploaded (Needs Review)", count: Math.min(pendingCount, 1) },
    { id: "approved", label: "Approved Vendors", count: approvedCount },
    { id: "rejected", label: "Rejected", count: rejectedCount },
  ];

  const filteredApplications = useMemo(() => {
    let list = applications;

    if (activeFilterTab === "pending") {
      list = list.filter((a) => a.status?.toLowerCase().includes("pending"));
    } else if (activeFilterTab === "approved") {
      list = list.filter((a) => a.status?.toLowerCase().includes("approved") || a.isApproved);
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
        String(application.owner || "").toLowerCase().includes(query) ||
        String(application.id || "").toLowerCase().includes(query) ||
        String(application.category || "").toLowerCase().includes(query)
    );
  }, [applications, searchQuery, activeFilterTab]);

  const detailShopId =
    selectedVendor?.shopId ||
    selectedVendor?.vendorShopId ||
    selectedVendor?.shop?.id ||
    selectedVendor?.id ||
    "-";

  return (
    <div className="min-h-dvh bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto max-h-dvh w-full space-y-5 sm:space-y-6">
        {/* Top Executive Header */}
        <PageHeader
          icon={Store}
          title="Vendor Administration"
          subtitle="Manage merchant onboarding lifecycle, document approvals, and platform store payouts."
          stats={[
            { label: "Total Vendors", value: applications.length },
            { label: "Need Review", value: pendingCount, alert: pendingCount > 0 },
          ]}
          actionButtonText="Broadcast to Vendors"
          actionButtonIcon={Send}
          onActionClick={() => alert("Broadcast notification to all active vendors")}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing || loading}
        />

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center gap-3 text-xs sm:text-sm font-semibold text-amber-900 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Segmented Tabs Navigation */}
        <SegmentedTabs
          tabs={rosterTabs}
          activeTab={activeRosterTab}
          onTabChange={setActiveRosterTab}
        />

        {/* Secondary Status Filter Pills */}
        <StatusFilterPills
          filters={filterPills}
          activeFilter={activeFilterTab}
          onFilterChange={setActiveFilterTab}
        />

        {/* Workflow Rules Information Bar */}
        <WorkflowRulesBar
          rulesText="All vendors across every onboarding phase with search, status filters, and one-click inspection."
          showingCount={filteredApplications.length}
          itemLabel="vendors"
        />

        {/* Unified Search Input Bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search vendors by store name, owner, email, phone, category, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        {/* Main Data Container / Table or Empty State */}
        <section className="w-full">
          {loading ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                <RefreshCw size={16} className="animate-spin text-emerald-600" />
                Loading vendor records...
              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No vendors found"
              description={`There are currently no vendors in the selected "${filterPills.find(f => f.id === activeFilterTab)?.label || 'All'}" category.`}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-5 sm:p-6"
            >
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase font-bold tracking-wider text-slate-500 bg-slate-50/80">
                      <th className="py-3.5 px-4 rounded-l-xl">Request ID</th>
                      <th className="py-3.5 px-4">Shop Details</th>
                      <th className="py-3.5 px-4">Authorized Agent</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Applied Date</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center rounded-r-xl">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredApplications.map((application, idx) => (
                      <motion.tr
                        key={application.shopId || application.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        className="text-xs font-semibold text-slate-800 hover:bg-emerald-50/40 transition-colors group"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-emerald-700">
                          {application.id || "-"}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 group-hover:text-emerald-700">
                              {application.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Vendor Shop Application
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {application.owner}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="bg-slate-50 text-slate-700 border border-slate-200/80 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                            {application.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {application.date}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-200">
                            <Clock size={11} className="text-amber-600" />
                            {application.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleViewVendor(application)}
                            disabled={!application.shopId && !application.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-40 cursor-pointer font-bold"
                          >
                            <Eye size={13} />
                            View
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden space-y-3">
                {filteredApplications.map((application, idx) => (
                  <div
                    key={application.shopId || application.id || idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-900 font-bold">
                        {application.id || "-"}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-200">
                        <Clock size={10} />
                        {application.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {application.name}
                      </h4>
                      <p className="text-xs text-slate-500">{application.owner}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Category
                        </span>
                        <span className="font-semibold text-slate-700">
                          {application.category}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Applied Date
                        </span>
                        <span className="font-semibold text-slate-700">
                          {application.date}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewVendor(application)}
                      disabled={!application.shopId && !application.id}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-40 cursor-pointer"
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
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
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white text-slate-900 border-b border-slate-100 relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                      <Store
                        size={19}
                        className="shrink-0"
                      />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Vendor KYC Details
                    </h2>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
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
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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