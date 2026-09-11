import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";

import {
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deactivateCategory,
  activateCategory,
} from "../Api/catalogService/categoryService";

import {
  Calendar,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit3,
  Power,
  X,
  Save,
  CheckCircle2,
  FolderTree,
  Eye,
  ChevronDown,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

export default function Categories() {
  const [currentTab, setCurrentTab] = useState("categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    imageUrl: "",
    imageFile: null,
    displayOrder: 1,
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

  const fetchCategories = async (filter = statusFilter) => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      setErrorMessage("");

      const includeInactive =
        filter === "All" || filter === "Inactive";

      const response = await getCategories(includeInactive);

      if (response?.success) {
        const data = Array.isArray(response?.data)
          ? response.data
          : [];

        const mappedCategories = data.map((category) =>
          normalizeCategory(category)
        );

        setCategories(mappedCategories);
      } else {
        setCategories([]);
        setErrorMessage(
          response?.message || "Failed to fetch categories"
        );
      }
    } catch (error) {
      setCategories([]);
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch categories"
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories("All");
  }, []);

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    fetchCategories(status);
  };

  const openAddPanel = () => {
    clearMessages();
    setEditingCategory(null);
    setIsStatusOpen(false);

    setFormData({
      id: "",
      name: "",
      description: "",
      imageUrl: "",
      imageFile: null,
      displayOrder: 1,
      active: true,
    });

    setIsPanelOpen(true);
  };

  const openEditPanel = async (category) => {
    clearMessages();
    setIsStatusOpen(false);

    if (!category?.id) {
      setErrorMessage("Category ID not found");
      return;
    }

    try {
      setEditingCategory(category.id);
      setIsPanelOpen(true);

      const response = await getCategoryById(category.id);

      if (!response?.success) {
        setErrorMessage(
          response?.message ||
            "Failed to fetch category details"
        );
        return;
      }

      const categoryData =
        response?.data?.category ||
        response?.data ||
        category;

      const normalized = normalizeCategory(categoryData);

      setFormData({
        id: normalized.id,
        name: normalized.name,
        description: normalized.description,
        imageUrl: normalized.imageUrl,
        imageFile: null,
        displayOrder: normalized.displayOrder,
        active: normalized.active,
      });
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch category details"
      );
    }
  };

  const handleImageChange = (e) => {
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
    if (
      formData.imageUrl &&
      formData.imageUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(formData.imageUrl);
    }

    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imageUrl: "",
    }));
  };

  const handleViewCategory = async (category) => {
    clearMessages();

    if (!category?.id) {
      setErrorMessage("Category ID not found");
      return;
    }

    try {
      setIsRefreshing(true);

      const response = await getCategoryById(category.id);

      if (response?.success) {
        const categoryData =
          response?.data?.category ||
          response?.data ||
          category;

        setSelectedCategory(
          normalizeCategory(categoryData)
        );
      } else {
        setErrorMessage(
          response?.message ||
            "Failed to fetch category details"
        );
      }
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch category details"
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleStatus = async (category) => {
    clearMessages();

    if (!category?.id) {
      setErrorMessage("Category ID not found");
      return;
    }

    try {
      setIsRefreshing(true);

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

        await fetchCategories(statusFilter);
      } else {
        setErrorMessage(
          response?.message ||
            "Failed to update category status"
        );
      }
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update category status"
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!formData.name.trim()) {
      setErrorMessage("Category name is required");
      return;
    }

    setSaving(true);

    try {
      const payload = new FormData();

      payload.append("name", formData.name.trim());
      payload.append(
        "description",
        formData.description.trim()
      );
      payload.append(
        "displayOrder",
        String(Number(formData.displayOrder) || 1)
      );

      if (formData.imageFile) {
        payload.append("image", formData.imageFile);
      }

      let response;

      if (editingCategory) {
        response = await updateCategory(
          editingCategory,
          payload
        );
      } else {
        response = await createCategory(payload);
      }

      if (!response?.success) {
        setErrorMessage(
          response?.message || "Failed to save category"
        );
        return;
      }

      if (editingCategory) {
        const oldCategory = categories.find(
          (item) =>
            String(item.id) ===
            String(editingCategory)
        );

        const oldStatus = oldCategory?.active === true;

        if (oldStatus !== formData.active) {
          const statusResponse = formData.active
            ? await activateCategory(editingCategory)
            : await deactivateCategory(
                editingCategory
              );

          if (!statusResponse?.success) {
            setErrorMessage(
              statusResponse?.message ||
                "Category updated but status update failed"
            );
            return;
          }
        }
      }

      setSuccessMessage(
        response?.message ||
          (editingCategory
            ? "Category updated successfully"
            : "Category created successfully")
      );

      if (
        formData.imageUrl &&
        formData.imageUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(formData.imageUrl);
      }

      setIsPanelOpen(false);
      setEditingCategory(null);
      setIsStatusOpen(false);

      await fetchCategories(statusFilter);
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

    if (
      formData.imageUrl &&
      formData.imageUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(formData.imageUrl);
    }

    setIsPanelOpen(false);
    setEditingCategory(null);
    setIsStatusOpen(false);
  };

  const filteredCategories = categories.filter(
    (category) => {
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        category.name
          .toLowerCase()
          .includes(query) ||
        category.description
          .toLowerCase()
          .includes(query);

      const status = category.active
        ? "Active"
        : "Inactive";

      const matchesStatus =
        statusFilter === "All" ||
        statusFilter === status;

      return matchesSearch && matchesStatus;
    }
  );

  const activeCategories = categories.filter(
    (category) => category.active
  );

  const inactiveCategories = categories.filter(
    (category) => !category.active
  );

  const categoryStats = [
    {
      label: "Total Categories",
      value: categories.length,
      suffix: " Categories",
      icon: FolderTree,
      iconBg: "bg-emerald-50 text-emerald-700",
      accentColor: "bg-emerald-600",
    },
    {
      label: "Active Categories",
      value: activeCategories.length,
      suffix: " Active",
      icon: CheckCircle2,
      iconBg: "bg-teal-50 text-teal-700",
      accentColor: "bg-teal-600",
    },
    {
      label: "Inactive Categories",
      value: inactiveCategories.length,
      suffix: " Inactive",
      icon: FolderTree,
      iconBg: "bg-slate-100 text-slate-600",
      accentColor: "bg-slate-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans text-slate-800">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-emerald-950 text-white shadow-xl border border-emerald-900"
        >
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900 px-3 py-1 rounded-full border border-emerald-800">
                <FolderTree size={12} />
                Category Management
              </span>

              <div className="flex items-center gap-2 bg-emerald-900 border border-emerald-800 px-3 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-widest">
                  LIVE ADMIN VEG GO
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              Category Directory
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAddPanel}
              className="px-4 py-2.5 bg-emerald-500/20 border border-emerald-700 rounded-2xl hover:bg-emerald-500/30 text-xs font-semibold text-emerald-100 flex items-center gap-2"
            >
              <Plus size={15} />
              New Category
            </motion.button>

            <div className="bg-emerald-900 border border-emerald-800 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-100">
              <Calendar
                size={14}
                className="text-emerald-400"
              />

              {new Date().toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              )}
            </div>

            <button
              onClick={() =>
                fetchCategories(statusFilter)
              }
              disabled={isRefreshing}
              className="p-2.5 bg-emerald-900 border border-emerald-800 rounded-2xl"
            >
              <RefreshCw
                size={15}
                className={
                  isRefreshing
                    ? "animate-spin"
                    : ""
                }
              />
            </button>
          </div>
        </motion.header>

        <AnimatePresence>
          {(errorMessage || successMessage) && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
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

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {categoryStats.map((stat, index) => {
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
                  delay: index * 0.1,
                }}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accentColor}`}
                />

                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold text-black uppercase tracking-wider">
                    {stat.label}
                  </span>

                  <div
                    className={`${stat.iconBg} p-2.5 rounded-2xl`}
                  >
                    <Icon size={18} />
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-semibold text-black">
                  {loading ? (
                    "..."
                  ) : (
                    <>
                      {stat.value}

                      <span className="text-base ml-1">
                        {stat.suffix}
                      </span>
                    </>
                  )}
                </h3>
              </motion.div>
            );
          })}
        </section>

        <section>
          <motion.div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <FolderTree size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-black">
                    Category Records
                  </h2>

                  <p className="text-xs font-semibold text-slate-500">
                    Categories from catalog API
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 sm:w-60">
                  <Search
                    className="absolute left-3 top-2.5 text-slate-400"
                    size={15}
                  />

                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                  <Filter
                    size={13}
                    className="text-slate-400 ml-2"
                  />

                  {[
                    "All",
                    "Active",
                    "Inactive",
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        handleStatusFilter(status)
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold ${
                        statusFilter === status
                          ? "bg-white text-emerald-700 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50">
                    <th className="py-3.5 px-4 rounded-l-xl">
                      Category
                    </th>

                    <th className="py-3.5 px-4">
                      Description
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Display Order
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Status
                    </th>

                    <th className="py-3.5 px-4 text-right rounded-r-xl">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-12 text-center text-xs font-semibold text-slate-400"
                      >
                        Loading categories...
                      </td>
                    </tr>
                  ) : filteredCategories.length > 0 ? (
                    filteredCategories.map(
                      (category) => (
                        <tr
                          key={category.id}
                          className="text-xs font-semibold text-black hover:bg-emerald-50/40"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                                {category.imageUrl ? (
                                  <img
                                    src={
                                      category.imageUrl
                                    }
                                    alt={
                                      category.name
                                    }
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display =
                                        "none";
                                    }}
                                  />
                                ) : (
                                  <FolderTree
                                    size={18}
                                    className="text-emerald-600"
                                  />
                                )}
                              </div>

                              <span className="font-semibold text-black">
                                {category.name}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-[10px] text-slate-500 line-clamp-2 max-w-[280px]">
                              {category.description ||
                                "No description available"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg font-mono">
                              {category.displayOrder}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                category.active
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  category.active
                                    ? "bg-emerald-500"
                                    : "bg-slate-400"
                                }`}
                              />

                              {category.active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  handleViewCategory(
                                    category
                                  )
                                }
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                onClick={() =>
                                  openEditPanel(
                                    category
                                  )
                                }
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                              >
                                <Edit3 size={15} />
                              </button>

                              <button
                                onClick={() =>
                                  handleToggleStatus(
                                    category
                                  )
                                }
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                              >
                                <Power size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-12 text-center text-xs font-semibold text-slate-400"
                      >
                        No categories found.
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
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map(
                  (category) => (
                    <div
                      key={category.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                            {category.imageUrl ? (
                              <img
                                src={
                                  category.imageUrl
                                }
                                alt={
                                  category.name
                                }
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FolderTree
                                size={18}
                                className="text-emerald-600"
                              />
                            )}
                          </div>

                          <h4 className="font-semibold text-sm text-black truncate">
                            {category.name}
                          </h4>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            category.active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {category.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-3">
                        {category.description ||
                          "No description available"}
                      </p>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200">
                        <span className="text-[10px] font-semibold text-slate-500">
                          Display Order:{" "}
                          {category.displayOrder}
                        </span>

                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              handleViewCategory(
                                category
                              )
                            }
                            className="p-2 text-slate-400 hover:text-emerald-700"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() =>
                              openEditPanel(
                                category
                              )
                            }
                            className="p-2 text-slate-400 hover:text-emerald-700"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            onClick={() =>
                              handleToggleStatus(
                                category
                              )
                            }
                            className="p-2 text-slate-400 hover:text-amber-600"
                          >
                            <Power size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="py-10 text-center text-xs font-semibold text-slate-400">
                  No categories found.
                </div>
              )}
            </div>
          </motion.div>
        </section>
      </main>

      <AnimatePresence>
        {selectedCategory && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() =>
              setSelectedCategory(null)
            }
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
              onClick={(e) =>
                e.stopPropagation()
              }
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative"
            >
              <button
                onClick={() =>
                  setSelectedCategory(null)
                }
                className="absolute right-5 top-5 p-2 text-slate-400 hover:bg-slate-100 rounded-full"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  {selectedCategory.imageUrl ? (
                    <img
                      src={
                        selectedCategory.imageUrl
                      }
                      alt={
                        selectedCategory.name
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FolderTree
                      size={24}
                      className="text-emerald-600"
                    />
                  )}
                </div>

                <h3 className="text-lg font-bold text-black">
                  {selectedCategory.name}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-xs font-semibold">
                    Display Order
                  </span>

                  <span className="font-mono font-bold">
                    {
                      selectedCategory.displayOrder
                    }
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-xs font-semibold">
                    Status
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      selectedCategory.active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {selectedCategory.active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Description
                </span>

                <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-1.5">
                  {selectedCategory.description ||
                    "No description available"}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPanelOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={closePanel}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 10,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 10,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={closePanel}
                disabled={saving}
                className="absolute right-5 top-5 p-2 text-slate-400 hover:bg-slate-100 rounded-full"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl flex items-center justify-center">
                  {editingCategory ? (
                    <Edit3 size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Category Management
                  </span>

                  <h3 className="text-lg font-bold text-black">
                    {editingCategory
                      ? "Update Category"
                      : "Create Category"}
                  </h3>
                </div>
              </div>

              <form
                onSubmit={handleSave}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Category Name
                  </label>

                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Description
                  </label>

                  <textarea
                    rows="4"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description:
                          e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-black focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Category Image
                  </label>

                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50">
                    <label className="flex flex-col items-center justify-center cursor-pointer py-5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                        {formData.imageFile ? (
                          <ImageIcon size={22} />
                        ) : (
                          <Upload size={22} />
                        )}
                      </div>

                      <span className="text-xs font-bold text-slate-700">
                        {formData.imageFile
                          ? "Change Image"
                          : "Upload Category Image"}
                      </span>

                      <span className="text-[10px] text-slate-400 mt-1">
                        PNG, JPG, JPEG or WEBP
                      </span>

                      <span className="text-[10px] text-slate-400">
                        Maximum size 5MB
                      </span>

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {formData.imageUrl && (
                    <div className="relative mt-3">
                      <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-200 bg-white">
                        <img
                          src={
                            formData.imageUrl
                          }
                          alt={
                            formData.name ||
                            "Category preview"
                          }
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md text-rose-500 hover:bg-rose-50"
                      >
                        <X size={15} />
                      </button>

                      {formData.imageFile && (
                        <div className="mt-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <p className="text-[10px] font-semibold text-emerald-700 truncate">
                            {formData.imageFile.name}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        displayOrder:
                          e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Status
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setIsStatusOpen(
                        (prev) => !prev
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          formData.active
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                        }`}
                      />

                      {formData.active
                        ? "Active"
                        : "Inactive"}
                    </span>

                    <ChevronDown
                      size={15}
                      className={
                        isStatusOpen
                          ? "rotate-180"
                          : ""
                      }
                    />
                  </button>

                  <AnimatePresence>
                    {isStatusOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -5,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -5,
                        }}
                        className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(
                              (prev) => ({
                                ...prev,
                                active: true,
                              })
                            );
                            setIsStatusOpen(
                              false
                            );
                          }}
                          className="w-full px-3.5 py-2.5 text-left text-xs font-bold hover:bg-emerald-50 flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Active
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData(
                              (prev) => ({
                                ...prev,
                                active: false,
                              })
                            );
                            setIsStatusOpen(
                              false
                            );
                          }}
                          className="w-full px-3.5 py-2.5 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          Inactive
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closePanel}
                    disabled={saving}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      !formData.name.trim()
                    }
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold"
                  >
                    {saving ? (
                      <RefreshCw
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={14} />
                    )}

                    {saving
                      ? "Saving..."
                      : editingCategory
                        ? "Update Category"
                        : "Create Category"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}