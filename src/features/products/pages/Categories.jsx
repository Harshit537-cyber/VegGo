import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../../layouts/Sidebar";
import PageHeader from "../../../components/common/PageHeader";
import { motion, AnimatePresence } from "framer-motion";

import {
  searchCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  moveCategory,
  deactivateCategory,
  activateCategory,
} from "../services/categoryService";

import PaginationBar from "../components/PaginationBar";
import OrderControls from "../components/OrderControls";

import {
  Calendar,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit3,
  X,
  Save,
  CheckCircle2,
  FolderTree,
  Eye,
  Upload,
  Loader2,
  Power,
  PowerOff,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Image as ImageIcon,
} from "lucide-react";

const PAGE_SIZE = 20;

// UI filter label -> API `status` query value
const STATUS_PARAM = {
  All: "all",
  Active: "active",
  Inactive: "inactive",
};

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    const targetNum = Number(value);

    if (Number.isNaN(targetNum)) {
      setDisplayValue(String(value ?? ""));
      return;
    }

    const duration = 1000;
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

  return <span>{displayValue}</span>;
}

function ImageLightbox({ url, onClose }) {
  if (!url) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X size={20} />
      </button>

      <motion.img
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        src={url}
        alt="Preview"
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
      />
    </div>
  );
}

export default function Categories({ embedded = false }) {
  const [currentTab, setCurrentTab] = useState("categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [movingId, setMovingId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const fetchRequestId = useRef(0);
  const isFirstLoad = useRef(true);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  // true = read-only "View" panel opened from the listing, false = normal edit
  const [isViewMode, setIsViewMode] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    imageUrl: "",
    imageFile: null,
    active: true,
  });

  const normalizeImageUrl = (value) => {
    if (!value) return "";
    return String(value).trim();
  };

  const normalizeCategory = (category) => ({
    id: category?.id || "",
    name: category?.name?.trim() || "",
    description: category?.description || "",
    imageUrl: normalizeImageUrl(category?.imageUrl),
    displayOrder: Number(category?.displayOrder ?? 0),
    active: category?.active === true,
  });

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      description: "",
      imageUrl: "",
      imageFile: null,
      active: true,
    });
  };

  // Server-side search + status filter + pagination
  // (GET /api/admin/catalog/categories/search)
  const fetchCategories = async ({
    page: pageToLoad = page,
    status = statusFilter,
    search = debouncedSearch,
    showLoader = false,
  } = {}) => {
    const requestId = ++fetchRequestId.current;

    try {
      if (showLoader) {
        setLoading(true);
      }
      setIsRefreshing(true);
      setErrorMessage("");

      const response = await searchCategories({
        search,
        status: STATUS_PARAM[status] || "all",
        page: pageToLoad,
        size: PAGE_SIZE,
      });

      // a newer request has been fired - ignore this stale response
      if (requestId !== fetchRequestId.current) return;

      if (response?.success) {
        const pageData = response?.data || {};
        const content = Array.isArray(pageData.content) ? pageData.content : [];
        const pages = Math.max(1, Number(pageData.totalPages) || 1);

        // The page we asked for no longer exists (e.g. the last row on it was
        // just disabled while filtering) - step back, the effect re-fetches.
        if (content.length === 0 && pageToLoad > 0 && pageToLoad >= pages) {
          setPage(pages - 1);
          return;
        }

        setCategories(content.map((category) => normalizeCategory(category)));
        setTotalElements(Number(pageData.totalElements) || content.length);
        setTotalPages(pages);
        setRefreshKey((prev) => prev + 1);
      } else {
        setCategories([]);
        setTotalElements(0);
        setTotalPages(1);
        setErrorMessage(response?.message || "Failed to fetch categories");
      }
    } catch (error) {
      if (requestId !== fetchRequestId.current) return;

      setCategories([]);
      setTotalElements(0);
      setTotalPages(1);
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch categories"
      );
    } finally {
      if (requestId === fetchRequestId.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  // Debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(0);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // (Re)load whenever search / status / page change (also does the first load)
  useEffect(() => {
    fetchCategories({ showLoader: isFirstLoad.current });
    isFirstLoad.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, page]);

  const handleStatusFilter = (status) => {
    if (status === statusFilter) return;

    setStatusFilter(status);
    setPage(0);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 0 || nextPage > totalPages - 1) return;

    setPage(nextPage);
  };

  // Reordering is only meaningful on the full, unfiltered list
  const canReorder =
    statusFilter === "All" && !debouncedSearch && !searchQuery.trim();

  // Move a category. body = { position } or { afterId }
  // (PATCH /api/admin/catalog/categories/{id}/move)
  const handleMove = async (category, body) => {
    if (!category?.id || movingId) return;

    clearMessages();
    setMovingId(category.id);

    try {
      const response = await moveCategory(category.id, body);

      if (response?.success) {
        setSuccessMessage(
          response?.message || `"${category.name}" moved successfully`
        );
        await fetchCategories();
      } else {
        setErrorMessage(response?.message || "Failed to move category");
      }
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to move category"
      );
    } finally {
      setMovingId(null);
    }
  };

  const handleMoveUp = (category, index) => {
    const previous = categories[index - 1];

    handleMove(category, {
      position: previous
        ? previous.displayOrder
        : Math.max(1, category.displayOrder - 1),
    });
  };

  const handleMoveDown = (category, index) => {
    const next = categories[index + 1];

    handleMove(
      category,
      next ? { afterId: next.id } : { position: category.displayOrder + 1 }
    );
  };

  const handleDrop = (target) => {
    const dragged = categories.find((item) => item.id === dragId);

    setDragId(null);
    setDragOverId(null);

    if (!canReorder || !dragged || !target || dragged.id === target.id) return;

    if (dragged.displayOrder < target.displayOrder) {
      handleMove(dragged, { afterId: target.id });
    } else {
      handleMove(dragged, { position: target.displayOrder });
    }
  };

  const getDragHandleProps = (category) => ({
    onDragStart: (e) => {
      setDragId(category.id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(category.id));

      const row = e.currentTarget.closest("tr");
      if (row) e.dataTransfer.setDragImage(row, 0, 0);
    },
    onDragEnd: () => {
      setDragId(null);
      setDragOverId(null);
    },
  });

  const openAddPanel = () => {
    clearMessages();
    setEditingCategory(null);
    setIsViewMode(false);
    resetForm();
    setIsPanelOpen(true);
  };

  // Shared loader for both "Edit" and read-only "View" — viewOnly=true opens
  // the same panel but disabled, with no Save button.
  const openCategoryPanel = async (category, viewOnly = false) => {
    clearMessages();

    if (!category?.id) {
      setErrorMessage("Category ID not found");
      return;
    }

    setActionLoading(category.id);
    setIsViewMode(viewOnly);

    try {
      setEditingCategory(category.id);
      setIsPanelOpen(true);

      const response = await getCategoryById(category.id);

      if (!response?.success) {
        setErrorMessage(
          response?.message || "Failed to fetch category details"
        );
        return;
      }

      const categoryData =
        response?.data?.category || response?.data || category;

      const normalized = normalizeCategory(categoryData);

      setFormData({
        id: normalized.id,
        name: normalized.name,
        description: normalized.description,
        imageUrl: normalized.imageUrl,
        imageFile: null,
        active: normalized.active,
      });
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch category details"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const openEditPanel = (category) => openCategoryPanel(category, false);
  const openViewPanel = (category) => openCategoryPanel(category, true);

  const handleImageChange = (e) => {
    if (isViewMode) return;

    const file = e.target.files?.[0];

    if (!file) return;

    clearMessages();

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: previewUrl,
    }));
  };

  const removeImage = () => {
    if (isViewMode) return;

    if (formData.imageUrl && formData.imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(formData.imageUrl);
    }

    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imageUrl: "",
    }));
  };

  const handleToggleStatus = async (category) => {
    clearMessages();

    if (!category?.id) {
      setErrorMessage("Category ID not found");
      return;
    }

    setActionLoading(category.id);

    try {
      const response =
        category.active === true
          ? await deactivateCategory(category.id)
          : await activateCategory(category.id);

      if (response?.success) {
        setSuccessMessage(
          response?.message ||
            (category.active
              ? "Category deactivated successfully"
              : "Category activated successfully")
        );

        await fetchCategories();

        if (editingCategory === category.id) {
          closePanel();
        }
      } else {
        setErrorMessage(response?.message || "Failed to update category status");
      }
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update category status"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleSave = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isViewMode) return;

    clearMessages();

    if (!formData.name.trim()) {
      setErrorMessage("Category name is required");
      return;
    }

    setSaving(true);

    try {
      const payload = new FormData();

      payload.append("name", formData.name.trim());
      payload.append("description", formData.description.trim());
      // NOTE: displayOrder is no longer sent - the server appends new
      // categories at the bottom and only the /move endpoint changes order.

      const oldCategory = editingCategory
        ? categories.find(
            (item) => String(item.id) === String(editingCategory)
          )
        : null;

      const hadImage = Boolean(oldCategory?.imageUrl);
      const isImageRemoved = hadImage && !formData.imageUrl && !formData.imageFile;

      if (formData.imageFile) {
        payload.append("image", formData.imageFile);
      } else if (isImageRemoved) {
        payload.append("removeImage", "true");
        payload.append("deleteImage", "true");
        payload.append("imageUrl", "");
      }

      let response;

      if (editingCategory) {
        response = await updateCategory(editingCategory, payload);
      } else {
        response = await createCategory(payload);
      }

      if (!response?.success) {
        setErrorMessage(response?.message || "Failed to save category");
        return;
      }

      if (editingCategory) {
        const oldCategory = categories.find(
          (item) => String(item.id) === String(editingCategory)
        );

        const oldStatus = oldCategory?.active === true;

        if (oldStatus !== formData.active) {
          const statusResponse = formData.active
            ? await activateCategory(editingCategory)
            : await deactivateCategory(editingCategory);

          if (!statusResponse?.success) {
            setErrorMessage(
              statusResponse?.message ||
                "Category updated but status update failed"
            );
            return;
          }
        }

        // Optimistically update category in local state for instantaneous response
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory
              ? {
                  ...c,
                  name: formData.name.trim(),
                  description: formData.description.trim(),
                  active: formData.active,
                  imageUrl: formData.imageFile
                    ? formData.imageUrl
                    : isImageRemoved
                    ? ''
                    : c.imageUrl
                }
              : c
          )
        );
      }

      setSuccessMessage(
        response?.message ||
          (editingCategory
            ? "Category updated successfully"
            : "Category created successfully")
      );

      if (formData.imageUrl && formData.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(formData.imageUrl);
      }

      // Close panel immediately for snappy feel
      setIsPanelOpen(false);
      setEditingCategory(null);
      setIsViewMode(false);
      resetForm();

      // Background re-fetch without destroying the table layout
      fetchCategories();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save category"
      );
    } finally {
      setSaving(false);
    }
  };

  const closePanel = () => {
    if (saving) return;

    if (formData.imageUrl && formData.imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(formData.imageUrl);
    }

    setIsPanelOpen(false);
    setEditingCategory(null);
    setIsViewMode(false);
    resetForm();
  };

  const activeCategories = categories.filter((category) => category.active);
  const inactiveCategories = categories.filter((category) => !category.active);

  const categoryStats = [
    {
      label: "Total Categories",
      value: categories.length,
      accentColor: "bg-emerald-600",
      iconBg: "bg-emerald-50 text-emerald-700",
      icon: FolderTree,
      suffix: " Categories",
      subLabel: `${activeCategories.length} Active • ${inactiveCategories.length} Inactive`,
      statusTag: "Catalog Taxonomy",
      tagColor: "text-emerald-700 bg-emerald-50/80 border-emerald-200/80",
    },
    {
      label: "Active Categories",
      value: activeCategories.length,
      accentColor: "bg-teal-600",
      iconBg: "bg-teal-50 text-teal-700",
      icon: CheckCircle2,
      suffix: " Active",
      subLabel: "Visible on Storefront",
      statusTag: "In Stock & Live",
      tagColor: "text-teal-700 bg-teal-50/80 border-teal-200/80",
    },
    {
      label: "Inactive Categories",
      value: inactiveCategories.length,
      accentColor: "bg-slate-500",
      iconBg: "bg-slate-50 text-slate-700",
      icon: FolderTree,
      suffix: " Inactive",
      subLabel: "Hidden from Storefront",
      statusTag: "Delisted / Hidden",
      tagColor: "text-slate-700 bg-slate-50/80 border-slate-200/80",
    },
  ];

  return (
    <div
      className={
        embedded
          ? "w-full space-y-6 sm:space-y-8"
          : "min-h-dvh bg-[#f6f9f7] flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-100 selection:text-emerald-900"
      }
    >
      <style>{`
        input.no-spinner::-webkit-outer-spin-button,
        input.no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input.no-spinner {
          -moz-appearance: textfield;
        }
      `}</style>

      {!embedded && <Sidebar />}

      <div
        className={
          embedded
            ? "w-full space-y-6 sm:space-y-8"
            : "flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto max-h-dvh w-full space-y-6 sm:space-y-8"
        }
      >
        <PageHeader
          icon={FolderTree}
          badge="Product Management"
          badgeIcon={FolderTree}
          title="Category Directory"
          subtitle="Manage product categories and visibility status."
          onRefresh={() => fetchCategories()}
          isRefreshing={isRefreshing}
          actionButtonText="Add Category"
          actionButtonIcon={Plus}
          onActionClick={openAddPanel}
        />

        <AnimatePresence>
          {(errorMessage || successMessage) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`px-5 py-3.5 rounded-2xl border text-xs font-semibold ${
                errorMessage
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              {errorMessage || successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <section className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <FolderTree size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Category Records
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Category catalog management directory
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />

                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                  <Filter size={13} className="text-slate-400 ml-2" />

                  {["All", "Active", "Inactive"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusFilter(status)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                        statusFilter === status
                          ? "bg-white text-emerald-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openAddPanel}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
                >
                  <Plus size={14} />
                  <span>Add Category</span>
                </motion.button>
              </div>
            </div>

            <p className="text-[10px] font-semibold text-slate-400 mb-3">
              {canReorder
                ? "Use the arrows (or drag the handle on desktop) to change the display order."
                : "Reordering is available when status is All and the search box is empty."}
            </p>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">
                    <th className="py-3.5 px-4 rounded-l-xl">Category</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4 text-center">Display Order</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right rounded-r-xl min-w-[220px]">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Loader2 size={28} className="animate-spin text-emerald-600" />
                          <span className="text-xs font-semibold">Loading categories...</span>
                        </div>
                      </td>
                    </tr>
                  ) : categories.length > 0 ? (
                    categories.map((category, idx) => (
                      <motion.tr
                        key={category.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + idx * 0.05 }}
                        onDragOver={(e) => {
                          if (canReorder && dragId) {
                            e.preventDefault();
                            setDragOverId(category.id);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleDrop(category);
                        }}
                        className={`text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group ${
                          dragOverId === category.id && dragId !== category.id
                            ? "bg-emerald-50"
                            : ""
                        } ${dragId === category.id ? "opacity-50" : ""}`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:border-emerald-300 transition-colors overflow-hidden">
                              {category.imageUrl ? (
                                <img
                                  src={category.imageUrl}
                                  alt={category.name || "Category"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <FolderTree size={17} className="text-emerald-600" />
                              )}
                            </div>

                            <div className="flex flex-col">
                              <span className="font-semibold text-black group-hover:text-emerald-700 transition-colors">
                                {category.name || "-"}
                              </span>

                              <span className="text-[10px] text-slate-500">Category</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-[10px] text-slate-500 line-clamp-2 max-w-[280px] block">
                            {category.description || "No description available"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <OrderControls
                            order={category.displayOrder}
                            canReorder={canReorder}
                            busy={Boolean(movingId)}
                            upDisabled={page === 0 && idx === 0}
                            downDisabled={
                              page >= totalPages - 1 &&
                              idx === categories.length - 1
                            }
                            onUp={() => handleMoveUp(category, idx)}
                            onDown={() => handleMoveDown(category, idx)}
                            dragHandleProps={getDragHandleProps(category)}
                          />
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all duration-300 group-hover:scale-105 ${
                              category.active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                                : "bg-rose-50 text-rose-700 border-rose-200/80"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                category.active ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                            {category.active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openViewPanel(category)}
                              disabled={actionLoading === category.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-40"
                              title="View Category"
                            >
                              {actionLoading === category.id ? (
                                <Loader2 size={13} className="animate-spin text-emerald-600" />
                              ) : (
                                <Eye size={13} className="text-slate-500" />
                              )}
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditPanel(category)}
                              disabled={actionLoading === category.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200/90 hover:border-emerald-600 text-xs font-bold shadow-2xs hover:shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-40"
                              title="Edit Category"
                            >
                              {actionLoading === category.id ? (
                                <Loader2 size={13} className="animate-spin text-emerald-600" />
                              ) : (
                                <Edit3 size={13} />
                              )}
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(category)}
                              disabled={actionLoading === category.id}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-2xs cursor-pointer disabled:opacity-40 ${
                                category.active
                                  ? 'bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border-rose-200/90 hover:border-rose-600 hover:shadow-rose-600/20'
                                  : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border-emerald-200/90 hover:border-emerald-600 hover:shadow-emerald-600/20'
                              }`}
                              title={category.active ? 'Deactivate Category' : 'Activate Category'}
                            >
                              {actionLoading === category.id ? (
                                <Loader2 size={13} className="animate-spin text-emerald-600" />
                              ) : category.active ? (
                                <>
                                  <PowerOff size={13} />
                                  <span>Disable</span>
                                </>
                              ) : (
                                <>
                                  <Power size={13} />
                                  <span>Enable</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center">
                        <FolderTree size={35} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-xs font-semibold text-slate-400">
                          No matching category records found.
                        </p>
                        <button
                          type="button"
                          onClick={openAddPanel}
                          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Add New Category</span>
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {loading ? (
                <div className="py-10 text-center text-xs font-semibold text-slate-400">
                  Loading categories...
                </div>
              ) : categories.length > 0 ? (
                categories.map((category, idx) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center overflow-hidden">
                          {category.imageUrl ? (
                            <img
                              src={category.imageUrl}
                              alt={category.name || "Category"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FolderTree size={16} />
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700 transition-colors">
                            {category.name || "-"}
                          </h4>

                          <p className="text-[10px] text-slate-400">Category</p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          category.active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            category.active ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        {category.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">
                          Display Order
                        </span>
                        <OrderControls
                          order={category.displayOrder}
                          canReorder={canReorder}
                          busy={Boolean(movingId)}
                          upDisabled={page === 0 && idx === 0}
                          downDisabled={
                            page >= totalPages - 1 &&
                            idx === categories.length - 1
                          }
                          onUp={() => handleMoveUp(category, idx)}
                          onDown={() => handleMoveDown(category, idx)}
                        />
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">
                          Status
                        </span>
                        <span className="text-slate-500 font-semibold">
                          {category.active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span className="text-[10px] uppercase font-semibold text-black block">
                          Description
                        </span>
                        <span className="text-slate-500 font-semibold line-clamp-2">
                          {category.description || "No description available"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => openViewPanel(category)}
                        disabled={actionLoading === category.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-40"
                        title="View Category"
                      >
                        {actionLoading === category.id ? (
                          <Loader2 size={13} className="animate-spin text-emerald-600" />
                        ) : (
                          <Eye size={13} className="text-slate-500" />
                        )}
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditPanel(category)}
                        disabled={actionLoading === category.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-40"
                        title="Edit Category"
                      >
                        {actionLoading === category.id ? (
                          <Loader2 size={13} className="animate-spin text-emerald-600" />
                        ) : (
                          <Edit3 size={13} />
                        )}
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(category)}
                        disabled={actionLoading === category.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-2xs cursor-pointer disabled:opacity-40 ${
                          category.active
                            ? "bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border-rose-200"
                            : "bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border-emerald-200"
                        }`}
                        title={category.active ? "Deactivate Category" : "Activate Category"}
                      >
                        {actionLoading === category.id ? (
                          <Loader2 size={13} className="animate-spin text-emerald-600" />
                        ) : category.active ? (
                          <>
                            <PowerOff size={13} />
                            <span>Disable</span>
                          </>
                        ) : (
                          <>
                            <Power size={13} />
                            <span>Enable</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <FolderTree size={35} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-xs font-semibold text-slate-400">No categories found.</p>
                  <button
                    type="button"
                    onClick={openAddPanel}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add New Category</span>
                  </button>
                </div>
              )}
            </div>

            <PaginationBar
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={PAGE_SIZE}
              itemsOnPage={categories.length}
              disabled={loading || isRefreshing}
              label="categories"
              onPageChange={handlePageChange}
            />
          </motion.div>
        </section>
      </div>

      <AnimatePresence>
        {isPanelOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 relative"
            >
              <button
                type="button"
                onClick={closePanel}
                disabled={saving}
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 z-10"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5 mb-6 pr-8">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-2xl flex items-center justify-center">
                  {isViewMode ? (
                    <Eye size={20} />
                  ) : editingCategory ? (
                    <Edit3 size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                    Category Management
                  </span>

                  <h3 className="text-lg font-bold text-black">
                    {isViewMode
                      ? "View Category"
                      : editingCategory
                      ? "Update Category"
                      : "Create Category"}
                  </h3>
                </div>
              </div>

              <form
                action="javascript:void(0);"
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSave(e);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Category Name
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="e.g. Fresh Vegetables"
                    value={formData.name}
                    disabled={isViewMode}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full h-[38px] px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    placeholder="Category description"
                    value={formData.description}
                    disabled={isViewMode}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-black uppercase tracking-wider block">
                      Category Status
                    </span>

                    <span className="text-[10px] text-slate-400">
                      {formData.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isViewMode}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, active: !prev.active }))
                    }
                    className={`relative w-11 h-6 rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                      formData.active ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        formData.active ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-black uppercase tracking-wider">
                      Category Image
                    </label>

                    {!isViewMode && formData.imageUrl && (
                      <label
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          saving
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                        }`}
                      >
                        <Upload size={13} />
                        Change Image

                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          disabled={saving}
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/60">
                    {formData.imageUrl ? (
                      <div className="relative">
                        <div className="w-full h-48 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                          <img
                            src={formData.imageUrl}
                            alt={formData.name || "Category preview"}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewImageUrl(formData.imageUrl)}
                            className="p-1.5 rounded-md bg-white/90 text-slate-700 shadow"
                            title="View"
                          >
                            <Eye size={13} />
                          </button>

                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={removeImage}
                              disabled={saving}
                              className="p-1.5 rounded-md bg-rose-500 text-white shadow disabled:opacity-50"
                              title="Remove"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>

                        {formData.imageFile && (
                          <p className="text-[10px] font-semibold text-emerald-700 truncate mt-2">
                            {formData.imageFile.name}
                          </p>
                        )}
                      </div>
                    ) : isViewMode ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2">
                        <ImageIcon size={24} className="text-slate-300" />
                        <span className="text-[10px] font-semibold text-slate-400">
                          No category image
                        </span>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer py-5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                          <Upload size={22} />
                        </div>

                        <span className="text-xs font-bold text-slate-700">
                          Upload Category Image
                        </span>

                        <span className="text-[10px] text-slate-400 mt-1">
                          PNG, JPG, JPEG or WEBP
                        </span>

                        <span className="text-[10px] text-slate-400">Maximum size 5MB</span>

                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closePanel}
                    disabled={saving}
                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {isViewMode ? "Close" : "Cancel"}
                  </button>

                  {!isViewMode && (
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || !formData.name.trim()}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      {saving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      {saving ? "Saving..." : editingCategory ? "Update Category" : "Save Category"}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewImageUrl && (
          <ImageLightbox url={viewImageUrl} onClose={() => setViewImageUrl("")} />
        )}
      </AnimatePresence>
    </div>
  );
}