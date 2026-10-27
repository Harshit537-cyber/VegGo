import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../../../layouts/Sidebar";
import PageHeader from "../../../components/common/PageHeader";
import StatusFilterPills from "../../../components/common/StatusFilterPills";
import WorkflowRulesBar from "../../../components/common/WorkflowRulesBar";
import EmptyState from "../../../components/common/EmptyState";
import {
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Clock3,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Truck,
  Store,
  User,
  Loader2,
  AlertCircle,
  MessageSquareWarning,
  RotateCcw,
  Paperclip,
  ExternalLink,
} from "lucide-react";

import {
  getComplaintStats,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
} from "../services/complaintService";

const PAGE_SIZE = 20;

/* ----------------------------- helpers ----------------------------- */

const unwrap = (response) => response?.data ?? response ?? {};

const extractList = (root) => {
  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.content)) return root.content;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(root?.complaints)) return root.complaints;
  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(root?.data?.content)) return root.data.content;
  if (Array.isArray(root?.data?.items)) return root.data.items;
  if (Array.isArray(root?.data?.complaints)) return root.data.complaints;
  return [];
};

const extractTotalPages = (root) =>
  Number(root?.totalPages) ||
  Number(root?.pages) ||
  Number(root?.pagination?.totalPages) ||
  Number(root?.data?.totalPages) ||
  Number(root?.data?.pages) ||
  Number(root?.data?.pagination?.totalPages) ||
  1;

const extractTotalElements = (root, fallback) => {
  const value =
    root?.totalElements ??
    root?.totalCount ??
    root?.pagination?.totalElements ??
    root?.data?.totalElements ??
    root?.data?.totalCount ??
    root?.data?.pagination?.totalElements;
  return value !== undefined && value !== null ? Number(value) : fallback;
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

const humanize = (value) =>
  String(value || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getId = (item) => String(item?.id || item?.complaintId || item?._id || item?.ticketId || "");
const getTicket = (item) => item?.ticketNumber || item?.ticketNo || item?.ticket || item?.ticketId || "";
const getStatus = (item) => String(item?.status || "PENDING").toUpperCase();
const getCategory = (item) => item?.category || item?.complaintCategory || item?.type || "";
const getTitle = (item) => item?.title || item?.subject || item?.issue || item?.reason || "Untitled complaint";
const getDescription = (item) => item?.description || item?.message || item?.details || item?.body || "";
const getCreatedAt = (item) => item?.createdAt || item?.createdDate || item?.date || item?.created_at || null;
const getAdminNotes = (item) => item?.adminNotes || item?.resolutionNotes || item?.notes || "";
const getReopenReason = (item) => item?.reopenReason || item?.reopenedReason || "";

const getAttachments = (item) => {
  let list = [];
  if (Array.isArray(item?.attachments)) list = item.attachments;
  else if (Array.isArray(item?.images)) list = item.images;
  else if (Array.isArray(item?.files)) list = item.files;
  else if (item?.attachmentUrl) list = [item.attachmentUrl];
  else if (item?.imageUrl) list = [item.imageUrl];

  return list
    .map((att, i) => {
      if (typeof att === "string") return { url: att, name: `Attachment ${i + 1}` };
      if (att && typeof att === "object") {
        const url = att.url || att.fileUrl || att.imageUrl || att.path || "";
        const name = att.name || att.fileName || att.title || `Attachment ${i + 1}`;
        return url ? { url, name } : null;
      }
      return null;
    })
    .filter(Boolean);
};

const getRole = (item) => {
  const role = String(
    item?.userRole ||
    item?.role ||
    item?.userType ||
    item?.complainantRole ||
    item?.raisedByRole ||
    item?.creatorRole ||
    ""
  ).toUpperCase();
  if (role.includes("DELIVER") || role.includes("RIDER")) return "DELIVERY";
  if (role.includes("VENDOR") || role.includes("MERCHANT") || role.includes("STORE")) return "VENDOR";
  if (role.includes("CUSTOMER") || role.includes("CLIENT") || role.includes("USER")) return "CUSTOMER";
  return role || "CUSTOMER";
};

const getComplainantName = (item) =>
  item?.userName ||
  item?.complainantName ||
  item?.raisedByName ||
  item?.name ||
  item?.user?.name ||
  item?.user?.fullName ||
  item?.customerName ||
  item?.vendorName ||
  "N/A";

const getComplainantId = (item) =>
  String(item?.userId || item?.complainantId || item?.raisedById || item?.user?.id || item?.customerId || item?.vendorId || "");

// Tolerant stat reader: supports { pending }, { pendingCount }, { pendingComplaints }
const readStat = (stats, key) => {
  if (!stats) return 0;
  const source = stats?.data && typeof stats.data === "object" ? stats.data : stats;
  const candidates = [
    key,
    `${key}Count`,
    `${key}Complaints`,
    `total${key.charAt(0).toUpperCase()}${key.slice(1)}`,
  ];
  for (const name of candidates) {
    if (source[name] !== undefined && source[name] !== null) return Number(source[name]) || 0;
  }
  return 0;
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

/* ----------------------------- small UI ----------------------------- */

const StatusBadge = ({ status }) => {
  const normalized = String(status || "PENDING").toUpperCase();

  const config = {
    PENDING: {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock3,
    },
    RESOLVED: {
      label: "Resolved",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },
    UNRESOLVED: {
      label: "Unresolved",
      className: "bg-rose-50 text-rose-700 border-rose-200",
      icon: XCircle,
    },
    REOPENED: {
      label: "Reopened",
      className: "bg-sky-50 text-sky-700 border-sky-200",
      icon: RotateCcw,
    },
  };

  const current = config[normalized] || {
    label: humanize(normalized),
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

const ROLE_META = {
  CUSTOMER: {
    label: "Customer",
    icon: User,
    box: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
  VENDOR: {
    label: "Vendor",
    icon: Store,
    box: "border-teal-100 bg-teal-50 text-teal-700",
  },
  DELIVERY: {
    label: "Delivery Partner",
    icon: Truck,
    box: "border-sky-100 bg-sky-50 text-sky-700",
  },
};

const getRoleMeta = (role) =>
  ROLE_META[role] || {
    label: humanize(role) || "User",
    icon: User,
    box: "border-slate-200 bg-slate-50 text-slate-600",
  };

/* ------------------------------- page ------------------------------- */

export default function Complaints({ embedded = false }) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [notesError, setNotesError] = useState("");

  const requestIdRef = useRef(0);

  /* ---- data loading ---- */

  const loadStats = useCallback(async () => {
    try {
      const response = await getComplaintStats();
      setStats(unwrap(response));
    } catch (error) {
      console.error("Complaint Stats API Error:", error);
    }
  }, []);

  const loadComplaints = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getComplaints({
        status: activeStatus,
        role: roleFilter,
        search: debouncedSearch,
        page,
        size: PAGE_SIZE,
      });

      if (requestId !== requestIdRef.current) return;

      const root = unwrap(response);
      const records = extractList(root);

      setComplaints(records);
      setTotalPages(extractTotalPages(root));
      setTotalElements(extractTotalElements(root, records.length));
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error("Complaints API Error:", error);
      setComplaints([]);
      setErrorMessage(getErrorMessage(error, "Unable to load complaints."));
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [activeStatus, roleFilter, debouncedSearch, page]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Debounce server-side search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadComplaints();
    loadStats();
  };

  /* ---- details modal ---- */

  const openDetails = async (item) => {
    const id = getId(item);
    setSelectedComplaint(item);
    setAdminNotes("");
    setNotesError("");
    setShowDetails(true);

    if (!id) return;

    try {
      setDetailLoading(true);
      const response = await getComplaintById(id);
      const detail = unwrap(response);
      const dataObj = detail?.data && typeof detail.data === "object" ? detail.data : detail;
      if (dataObj && typeof dataObj === "object") {
        setSelectedComplaint((prev) => ({ ...prev, ...dataObj }));
      }
    } catch (error) {
      console.warn("Complaint Detail API Error (using row data):", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedComplaint(null);
    setAdminNotes("");
    setNotesError("");
  };

  /* ---- status update ---- */

  const handleStatusUpdate = async (newStatus) => {
    const id = getId(selectedComplaint);
    if (!id) return;

    const notes = adminNotes.trim();
    if (!notes) {
      setNotesError("Resolution notes are required to update the complaint.");
      return;
    }

    try {
      setActionLoading(newStatus);
      setNotesError("");
      setErrorMessage("");

      await updateComplaintStatus(id, newStatus, notes);

      const ticket = getTicket(selectedComplaint) || `#${id.slice(-8)}`;
      setSuccessMessage(
        `Complaint ${ticket} marked as ${humanize(newStatus)}. The complainant has been notified.`
      );

      closeDetails();
      loadComplaints();
      loadStats();
    } catch (error) {
      setNotesError(getErrorMessage(error, "Unable to update complaint status."));
    } finally {
      setActionLoading(null);
    }
  };

  /* ---- derived ---- */

  const complaintsPending = complaints.filter((c) => getStatus(c) === "PENDING").length;
  const complaintsResolved = complaints.filter((c) => getStatus(c) === "RESOLVED").length;
  const complaintsUnresolved = complaints.filter((c) => getStatus(c) === "UNRESOLVED").length;
  const complaintsReopened = complaints.filter((c) => getStatus(c) === "REOPENED").length;

  const pendingCount = readStat(stats, "pending") || complaintsPending;
  const resolvedCount = readStat(stats, "resolved") || complaintsResolved;
  const unresolvedCount = readStat(stats, "unresolved") || complaintsUnresolved;
  const reopenedCount = readStat(stats, "reopened") || complaintsReopened;
  const totalCount =
    readStat(stats, "total") ||
    totalElements ||
    complaints.length;

  const filterPills = useMemo(() => {
    const pills = [
      { id: "ALL", label: "All Complaints", count: totalCount },
      { id: "PENDING", label: "Pending", count: pendingCount },
      { id: "RESOLVED", label: "Resolved", count: resolvedCount },
      { id: "UNRESOLVED", label: "Unresolved", count: unresolvedCount },
    ];
    // Only show Reopened pill when backend reports such a status or items exist
    if ((stats && reopenedCount > 0) || reopenedCount > 0 || activeStatus === "REOPENED") {
      pills.push({ id: "REOPENED", label: "Reopened", count: reopenedCount });
    }
    return pills;
  }, [stats, totalCount, pendingCount, resolvedCount, unresolvedCount, reopenedCount, activeStatus]);

  const selectedStatus = getStatus(selectedComplaint);
  const canTakeAction = Boolean(selectedComplaint) && selectedStatus !== "RESOLVED";

  /* ---- render ---- */

  const content = (
    <div className="w-full space-y-5 sm:space-y-6">
      <PageHeader
        icon={MessageSquareWarning}
        title="Complaints"
        subtitle="Review complaints raised by customers, vendors, and delivery partners, then resolve them with notes."
        stats={[
          { label: "Total", value: totalCount },
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

      {/* Status Pills + Role Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <StatusFilterPills
          filters={filterPills}
          activeFilter={activeStatus}
          onFilterChange={(status) => {
            setPage(0);
            setActiveStatus(status);
          }}
        />

        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-emerald-100/80 shadow-2xs self-start sm:self-auto">
          {[
            { id: "ALL", label: "All Users" },
            { id: "CUSTOMER", label: "Customers", icon: User },
            { id: "VENDOR", label: "Vendors", icon: Store },
            { id: "DELIVERY", label: "Delivery", icon: Truck },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setPage(0);
                  setRoleFilter(tab.id);
                }}
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

      <WorkflowRulesBar
        rulesText="Open a complaint, add resolution notes, and mark it Resolved or Unresolved. Complainants can reopen resolved tickets."
        showingCount={complaints.length}
        totalCount={totalElements}
        itemLabel="complaints"
      />

      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search complaints by keyword, title, or ticket number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 shadow-2xs"
        />
      </div>

      {/* Data Table */}
      <section className="overflow-hidden rounded-3xl border border-emerald-100/90 bg-white p-5 shadow-2xs sm:p-6">
        <div className="hidden w-full md:block overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed border-collapse text-left">
            <colgroup>
              <col className="w-[15%]" />
              <col className="w-[18%]" />
              <col className="w-[27%]" />
              <col className="w-[14%]" />
              <col className="w-[13%]" />
              <col className="w-[13%]" />
            </colgroup>

            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="rounded-l-xl px-3 py-3.5">Ticket</th>
                <th className="px-3 py-3.5">Complainant</th>
                <th className="px-3 py-3.5">Complaint</th>
                <th className="px-3 py-3.5">Raised On</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="rounded-r-xl px-3 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Loader2 size={28} className="animate-spin text-emerald-600" />
                      <span className="text-xs font-semibold">Loading complaints...</span>
                    </div>
                  </td>
                </tr>
              ) : complaints.length > 0 ? (
                complaints.map((item, index) => {
                  const id = getId(item);
                  const meta = getRoleMeta(getRole(item));
                  const RoleIcon = meta.icon;

                  return (
                    <tr
                      key={id || index}
                      className="group text-xs font-semibold text-slate-700 hover:bg-emerald-50/40"
                    >
                      {/* Ticket */}
                      <td className="overflow-hidden px-3 py-4">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${meta.box}`}
                          >
                            <RoleIcon size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-bold text-slate-900 group-hover:text-emerald-700 font-mono">
                              {getTicket(item) || `#${id.slice(-8) || "N/A"}`}
                            </div>
                            <div className="mt-0.5 text-[10px] text-slate-400 font-medium">
                              {meta.label}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Complainant */}
                      <td className="overflow-hidden px-3 py-4">
                        <div className="min-w-0">
                          <div className="truncate font-bold text-slate-800">
                            {getComplainantName(item)}
                          </div>
                          <div className="mt-0.5 truncate text-[10px] text-slate-400 font-mono">
                            ID: {getComplainantId(item) || "N/A"}
                          </div>
                        </div>
                      </td>

                      {/* Complaint */}
                      <td className="overflow-hidden px-3 py-4">
                        <div className="truncate font-bold text-slate-800">{getTitle(item)}</div>
                        <div className="mt-0.5 truncate text-[10px] text-slate-400 font-medium">
                          {humanize(getCategory(item)) || "General"}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="overflow-hidden px-3 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{formatDate(getCreatedAt(item))}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-4">
                        <StatusBadge status={getStatus(item)} />
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openDetails(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                          title="View & Resolve"
                        >
                          <Eye size={13} className="text-slate-500" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      icon={MessageSquareWarning}
                      title="No complaints found"
                      description="There are currently no complaints matching the selected filters or search keyword."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="py-10 text-center text-xs font-semibold text-slate-400">
              <Loader2 size={24} className="animate-spin text-emerald-600 mx-auto mb-2" />
              Loading complaints...
            </div>
          ) : complaints.length > 0 ? (
            complaints.map((item, idx) => {
              const id = getId(item);
              const meta = getRoleMeta(getRole(item));

              return (
                <div
                  key={id || idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {getTicket(item) || `#${id.slice(-8) || "N/A"}`}
                    </span>
                    <StatusBadge status={getStatus(item)} />
                  </div>

                  <div className="text-xs">
                    <div className="font-bold text-slate-900">{getTitle(item)}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {getComplainantName(item)} • {meta.label} •{" "}
                      {humanize(getCategory(item)) || "General"}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {formatDate(getCreatedAt(item))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => openDetails(item)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center text-xs font-semibold text-slate-400">
              No complaints found.
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
            <span>
              Showing Page {page + 1} of {totalPages} ({totalElements} total records)
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

      {/* Complaint Details & Resolution Modal */}
      {showDetails && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
          <div
            className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 relative max-h-[92vh] overflow-y-auto space-y-5"
          >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                    <MessageSquareWarning size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Complaint Details</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {getTicket(selectedComplaint) || `#${getId(selectedComplaint)}`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeDetails}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {detailLoading && (
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                  <Loader2 size={14} className="animate-spin text-emerald-600" />
                  Loading full details...
                </div>
              )}

              <div className="space-y-3 text-xs">
                {/* Summary */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Current Status</span>
                    <StatusBadge status={selectedStatus} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Complainant</span>
                    <span className="font-bold text-slate-800">
                      {getComplainantName(selectedComplaint)} (
                      {getRoleMeta(getRole(selectedComplaint)).label})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Category</span>
                    <span className="font-bold text-slate-800">
                      {humanize(getCategory(selectedComplaint)) || "General"}
                    </span>
                  </div>
                  {selectedComplaint?.orderId && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Order ID</span>
                      <span className="font-mono font-bold text-slate-800">
                        {String(selectedComplaint.orderId)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Raised On</span>
                    <span className="font-bold text-slate-800">
                      {formatDate(getCreatedAt(selectedComplaint))}
                    </span>
                  </div>
                </div>

                {/* Complaint body */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">
                    {getTitle(selectedComplaint)}
                  </h4>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {getDescription(selectedComplaint) || "No description provided."}
                  </p>
                </div>

                {/* Attachments */}
                {getAttachments(selectedComplaint).length > 0 && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Paperclip size={13} className="text-slate-500" />
                      Attachments ({getAttachments(selectedComplaint).length})
                    </h4>
                    <div className="space-y-1.5">
                      {getAttachments(selectedComplaint).map((att, i) => (
                        <a
                          key={`${att.url}-${i}`}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-200 text-slate-700 transition-colors"
                        >
                          <span className="truncate font-semibold">{att.name}</span>
                          <ExternalLink size={13} className="text-emerald-600 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reopen reason */}
                {getReopenReason(selectedComplaint) && (
                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200/80 space-y-1">
                    <h4 className="font-bold text-sky-800 text-xs flex items-center gap-1.5">
                      <RotateCcw size={13} />
                      Reopen Reason
                    </h4>
                    <p className="text-sky-900/80 leading-relaxed whitespace-pre-wrap">
                      {getReopenReason(selectedComplaint)}
                    </p>
                  </div>
                )}

                {/* Previous admin notes */}
                {getAdminNotes(selectedComplaint) && (
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                    <h4 className="font-bold text-emerald-800 text-xs">Admin Resolution Notes</h4>
                    <p className="text-emerald-900/80 leading-relaxed whitespace-pre-wrap">
                      {getAdminNotes(selectedComplaint)}
                    </p>
                  </div>
                )}

                {/* Admin action */}
                {canTakeAction && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-900 text-xs">
                      Resolution Notes <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={adminNotes}
                      onChange={(e) => {
                        setAdminNotes(e.target.value);
                        if (notesError) setNotesError("");
                      }}
                      placeholder="Describe the action taken or the reason for the decision..."
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 shadow-2xs resize-none"
                    />
                    {notesError && (
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600">
                        <AlertCircle size={12} />
                        {notesError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeDetails}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>

                {canTakeAction && (
                  <>
                    <button
                      type="button"
                      disabled={Boolean(actionLoading)}
                      onClick={() => handleStatusUpdate("UNRESOLVED")}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading === "UNRESOLVED" ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        "Mark Unresolved"
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(actionLoading)}
                      onClick={() => handleStatusUpdate("RESOLVED")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {actionLoading === "RESOLVED" ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        "Mark Resolved"
                      )}
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
