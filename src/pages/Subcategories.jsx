import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

import {
  getSubcategories,
  createSubcategory,
  getSubcategoryById,
  updateSubcategory,
  deactivateSubcategory,
  activateSubcategory
} from '../Api/catalogService/subcategoryService';

import {
  CalendarDays,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit3,
  Power,
  X,
  Save,
  Tag,
  FolderTree,
  CheckCircle2,
  Clock3,
  Layers3,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronDown,
  Hash,
  LayoutGrid,
  Activity,
  SlidersHorizontal
} from 'lucide-react';

/* =========================================================
   Animated Counter
========================================================= */

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    const target = Number(value) || 0;

    if (target === 0) {
      setDisplayValue('0');
      return;
    }

    const duration = 700;
    const startTime = performance.now();
    let animationFrameId;

    const update = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const ease =
        progress === 1
          ? 1
          : 1 - Math.pow(2, -10 * progress);

      const current = Math.floor(target * ease);

      setDisplayValue(current.toLocaleString('en-IN'));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(update);
      } else {
        setDisplayValue(target.toLocaleString('en-IN'));
      }
    };

    animationFrameId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{displayValue}</span>;
}

/* =========================================================
   Main Component
========================================================= */

export default function Subcategories() {
  const [currentTab, setCurrentTab] = useState('subcategories');

  const [subcategories, setSubcategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);

  const [formData, setFormData] = useState({
    categoryId: '',
    name: ''
  });

  /* =========================================================
     Helpers
  ========================================================= */

  const getSubcategoryId = (subcategory) =>
    subcategory?.id ||
    subcategory?._id ||
    subcategory?.subcategoryId;

  const getSubcategoryName = (subcategory) =>
    subcategory?.name ||
    subcategory?.subcategoryName ||
    subcategory?.title ||
    '';

  const getCategoryId = (subcategory) =>
    subcategory?.categoryId ||
    subcategory?.category?.id ||
    '';

  const getCategoryName = (subcategory) =>
    subcategory?.categoryName ||
    subcategory?.category?.name ||
    '';

  const getSubcategoryStatus = (subcategory) => {
    if (
      subcategory?.active === true ||
      subcategory?.status === 'Active' ||
      subcategory?.status === 'active' ||
      subcategory?.isActive === true
    ) {
      return 'Active';
    }

    return 'Inactive';
  };

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  /* =========================================================
     Fetch
  ========================================================= */

  const fetchSubcategories = async () => {
    try {
      setIsRefreshing(true);
      setErrorMessage('');

      const response = await getSubcategories();

      if (response?.success) {
        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.content)
          ? response.data.content
          : Array.isArray(response?.data?.subcategories)
          ? response.data.subcategories
          : Array.isArray(response?.data?.subCategories)
          ? response.data.subCategories
          : [];

        setSubcategories(data);
      } else {
        setSubcategories([]);

        setErrorMessage(
          response?.message || 'Failed to fetch subcategories'
        );
      }
    } catch (error) {
      setSubcategories([]);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch subcategories'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  /* =========================================================
     Add
  ========================================================= */

  const openAddPanel = () => {
    clearMessages();

    setEditingSubcategory(null);

    setFormData({
      categoryId: '',
      name: ''
    });

    setIsPanelOpen(true);
  };

  /* =========================================================
     Edit
  ========================================================= */

  const openEditPanel = async (subcategory) => {
    clearMessages();

    const subcategoryId = getSubcategoryId(subcategory);

    if (!subcategoryId) {
      setErrorMessage('Subcategory ID not found');
      return;
    }

    try {
      setSaving(true);

      const response = await getSubcategoryById(subcategoryId);

      if (!response?.success) {
        setErrorMessage(
          response?.message ||
            'Failed to fetch subcategory details'
        );
        return;
      }

      const data =
        response?.data?.subcategory ||
        response?.data ||
        subcategory;

      setEditingSubcategory(subcategoryId);

      setFormData({
        categoryId:
          data?.categoryId ||
          data?.category?.id ||
          '',
        name:
          data?.name ||
          data?.subcategoryName ||
          data?.title ||
          ''
      });

      setIsPanelOpen(true);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch subcategory details'
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     Save
  ========================================================= */

  const handleSave = async (e) => {
    e.preventDefault();

    clearMessages();

    const name = formData.name.trim();
    const categoryId = formData.categoryId.trim();

    if (!name) {
      setErrorMessage('Subcategory name is required');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Category ID is required');
      return;
    }

    try {
      setSaving(true);

      let response;

      if (editingSubcategory) {
        response = await updateSubcategory(
          editingSubcategory,
          {
            categoryId,
            name
          }
        );
      } else {
        response = await createSubcategory({
          categoryId,
          name
        });
      }

      if (!response?.success) {
        setErrorMessage(
          response?.message || 'Failed to save subcategory'
        );
        return;
      }

      setSuccessMessage(
        editingSubcategory
          ? 'Subcategory updated successfully'
          : 'Subcategory created successfully'
      );

      setIsPanelOpen(false);
      setEditingSubcategory(null);

      setFormData({
        categoryId: '',
        name: ''
      });

      await fetchSubcategories();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to save subcategory'
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     Toggle Status
  ========================================================= */

  const handleToggleStatus = async (subcategory) => {
    clearMessages();

    const subcategoryId = getSubcategoryId(subcategory);

    if (!subcategoryId) {
      setErrorMessage('Subcategory ID not found');
      return;
    }

    try {
      setIsRefreshing(true);

      const isActive =
        getSubcategoryStatus(subcategory) === 'Active';

      const response = isActive
        ? await deactivateSubcategory(subcategoryId)
        : await activateSubcategory(subcategoryId);

      if (!response?.success) {
        setErrorMessage(
          response?.message ||
            'Failed to update subcategory status'
        );
        return;
      }

      setSuccessMessage(
        isActive
          ? 'Subcategory deactivated successfully'
          : 'Subcategory activated successfully'
      );

      await fetchSubcategories();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update subcategory status'
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  /* =========================================================
     Filter
  ========================================================= */

  const filteredSubcategories = useMemo(() => {
    return subcategories.filter((subcategory) => {
      const name = getSubcategoryName(subcategory).toLowerCase();
      const category = getCategoryName(subcategory).toLowerCase();

      const id = String(
        getSubcategoryId(subcategory) || ''
      ).toLowerCase();

      const query = searchQuery.toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        category.includes(query) ||
        id.includes(query);

      const matchesStatus =
        statusFilter === 'All' ||
        getSubcategoryStatus(subcategory) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subcategories, searchQuery, statusFilter]);

  /* =========================================================
     Stats
  ========================================================= */

  const activeCount = subcategories.filter(
    (subcategory) =>
      getSubcategoryStatus(subcategory) === 'Active'
  ).length;

  const inactiveCount =
    subcategories.length - activeCount;

  const totalCategories = new Set(
    subcategories
      .map((item) => getCategoryId(item))
      .filter(Boolean)
  ).size;

  const activePercentage =
    subcategories.length > 0
      ? Math.round(
          (activeCount / subcategories.length) * 100
        )
      : 0;

  const stats = [
    {
      label: 'Total Subcategories',
      value: subcategories.length,
      description: 'All catalog entries',
      icon: Layers3,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      accent: 'bg-sky-500'
    },
    {
      label: 'Active',
      value: activeCount,
      description: `${activePercentage}% currently live`,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      accent: 'bg-emerald-500'
    },
    {
      label: 'Inactive',
      value: inactiveCount,
      description: 'Currently paused',
      icon: Clock3,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      accent: 'bg-amber-500'
    },
    {
      label: 'Linked Categories',
      value: totalCategories,
      description: 'Connected parent categories',
      icon: FolderTree,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      accent: 'bg-violet-500'
    }
  ];

  /* =========================================================
     Close Modal
  ========================================================= */

  const closePanel = () => {
    if (saving) return;

    setIsPanelOpen(false);
    setEditingSubcategory(null);

    setFormData({
      categoryId: '',
      name: ''
    });
  };

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col md:flex-row font-sans text-slate-800">

      {/* Sidebar */}

      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Main */}

      <main className="flex-1 min-w-0 overflow-y-auto max-h-screen">

        <div className="p-4 sm:p-6 lg:p-8">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-[26px] bg-white border border-slate-200 shadow-sm mb-6"
          >

            {/* Decorative */}

            <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-emerald-100/50 blur-3xl" />

            <div className="absolute -left-16 -bottom-24 w-60 h-60 rounded-full bg-sky-100/40 blur-3xl" />

            <div className="relative p-6 sm:p-7 lg:p-8">

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

                {/* Heading */}

                <div>

                  <div className="flex flex-wrap items-center gap-2 mb-4">

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">

                      <Sparkles size={12} />

                      Catalog

                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">

                      <span className="relative flex h-2 w-2">

                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />

                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />

                      </span>

                      Live Data

                    </span>

                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-slate-950">

                    Subcategory Management

                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">

                    Create, organize and control product
                    subcategories while keeping your catalog
                    structure clean and consistent.

                  </p>

                </div>

                {/* Header Actions */}

                <div className="flex flex-wrap items-center gap-2">

                  <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">

                    <CalendarDays
                      size={15}
                      className="text-emerald-600"
                    />

                    <span className="text-xs font-bold text-slate-600">

                      {new Date().toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }
                      )}

                    </span>

                  </div>

                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={fetchSubcategories}
                    disabled={isRefreshing}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
                  >

                    <RefreshCw
                      size={14}
                      className={
                        isRefreshing
                          ? 'animate-spin'
                          : ''
                      }
                    />

                    Refresh

                  </motion.button>

                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openAddPanel}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                  >

                    <Plus size={15} />

                    Add Subcategory

                  </motion.button>

                </div>

              </div>

            </div>

          </motion.div>

          {/* =================================================
              ALERTS
          ================================================= */}

          <AnimatePresence mode="wait">

            {(errorMessage || successMessage) && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                className="mb-6 overflow-hidden"
              >

                <div
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 ${
                    errorMessage
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >

                  <div className="flex items-center gap-2.5">

                    {errorMessage ? (
                      <X size={16} />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}

                    <span className="text-xs font-bold">
                      {errorMessage || successMessage}
                    </span>

                  </div>

                  <button
                    onClick={clearMessages}
                    className="rounded-lg p-1.5 hover:bg-black/5"
                  >

                    <X size={14} />

                  </button>

                </div>

              </motion.div>
            )}

          </AnimatePresence>

          {/* =================================================
              STAT CARDS
          ================================================= */}

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.div
                  key={stat.label}
                  initial={{
                    opacity: 0,
                    y: 15
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    delay: index * 0.07,
                    duration: 0.4
                  }}
                  whileHover={{
                    y: -3
                  }}
                  className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >

                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${stat.accent}`}
                  />

                  <div className="p-5">

                    <div className="flex items-start justify-between">

                      <div>

                        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                          {stat.label}
                        </p>

                        <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">

                          {loading ? (
                            <span className="text-slate-300">
                              ...
                            </span>
                          ) : (
                            <AnimatedValue
                              value={stat.value}
                            />
                          )}

                        </h3>

                      </div>

                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}
                      >

                        <Icon size={19} />

                      </div>

                    </div>

                    <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3">

                      {index === 2 ? (
                        <ArrowDownRight
                          size={13}
                          className="text-amber-500"
                        />
                      ) : (
                        <ArrowUpRight
                          size={13}
                          className="text-emerald-500"
                        />
                      )}

                      <span className="text-[10px] font-bold text-slate-500">
                        {stat.description}
                      </span>

                    </div>

                  </div>

                </motion.div>
              );
            })}

          </section>

          {/* =================================================
              MAIN RECORD CARD
          ================================================= */}

          <motion.section
            initial={{
              opacity: 0,
              y: 15
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.45,
              delay: 0.25
            }}
            className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
          >

            {/* Card Header */}

            <div className="border-b border-slate-100 p-5 sm:p-6">

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">

                    <LayoutGrid size={19} />

                  </div>

                  <div>

                    <div className="flex items-center gap-2">

                      <h2 className="text-base font-extrabold text-slate-950 sm:text-lg">
                        Subcategory Records
                      </h2>

                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
                        {filteredSubcategories.length}
                      </span>

                    </div>

                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      Manage your product taxonomy
                    </p>

                  </div>

                </div>

                {/* Filters */}

                <div className="flex flex-col sm:flex-row gap-2">

                  {/* Search */}

                  <div className="relative sm:w-72">

                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      placeholder="Search name, category or ID..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />

                  </div>

                  {/* Status */}

                  <div className="relative">

                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">

                      <Filter
                        size={14}
                        className="ml-3 text-slate-400"
                      />

                      <select
                        value={statusFilter}
                        onChange={(e) =>
                          setStatusFilter(
                            e.target.value
                          )
                        }
                        className="appearance-none bg-transparent py-2.5 pl-2 pr-9 text-xs font-bold text-slate-600 outline-none cursor-pointer"
                      >

                        <option value="All">
                          All Status
                        </option>

                        <option value="Active">
                          Active
                        </option>

                        <option value="Inactive">
                          Inactive
                        </option>

                      </select>

                      <ChevronDown
                        size={13}
                        className="pointer-events-none absolute right-3 text-slate-400"
                      />

                    </div>

                  </div>

                  {/* Filter button */}

                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('All');
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                    title="Clear filters"
                  >

                    <SlidersHorizontal size={14} />

                    <span className="sm:hidden">
                      Clear
                    </span>

                  </button>

                </div>

              </div>

            </div>

            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden md:block overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50/80">

                    <th className="px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                      Subcategory
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                      Parent Category
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                      Identifier
                    </th>

                    <th className="px-5 py-4 text-center text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {loading ? (

                    <tr>

                      <td
                        colSpan="5"
                        className="py-20"
                      >

                        <div className="flex flex-col items-center">

                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">

                            <RefreshCw
                              size={21}
                              className="animate-spin text-emerald-600"
                            />

                          </div>

                          <p className="mt-3 text-xs font-bold text-slate-400">
                            Loading subcategories...
                          </p>

                        </div>

                      </td>

                    </tr>

                  ) : filteredSubcategories.length > 0 ? (

                    filteredSubcategories.map(
                      (subcategory, index) => {

                        const id =
                          getSubcategoryId(
                            subcategory
                          );

                        const status =
                          getSubcategoryStatus(
                            subcategory
                          );

                        return (
                          <motion.tr
                            key={id || index}
                            initial={{
                              opacity: 0
                            }}
                            animate={{
                              opacity: 1
                            }}
                            transition={{
                              delay:
                                index * 0.025
                            }}
                            className="group transition-colors hover:bg-emerald-50/25"
                          >

                            {/* Subcategory */}

                            <td className="px-6 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">

                                  <Tag size={16} />

                                </div>

                                <div className="min-w-0">

                                  <p className="truncate text-xs font-extrabold text-slate-800 group-hover:text-emerald-700">

                                    {getSubcategoryName(
                                      subcategory
                                    ) ||
                                      'Unnamed Subcategory'}

                                  </p>

                                  <div className="mt-1 flex items-center gap-1.5">

                                    <Activity
                                      size={10}
                                      className="text-slate-300"
                                    />

                                    <p className="text-[10px] font-medium text-slate-400">
                                      Product Subcategory
                                    </p>

                                  </div>

                                </div>

                              </div>

                            </td>

                            {/* Category */}

                            <td className="px-5 py-4">

                              <div className="inline-flex max-w-[190px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">

                                <FolderTree
                                  size={13}
                                  className="shrink-0 text-emerald-600"
                                />

                                <span className="truncate text-xs font-bold text-slate-700">

                                  {getCategoryName(
                                    subcategory
                                  ) || 'N/A'}

                                </span>

                              </div>

                            </td>

                            {/* ID */}

                            <td className="px-5 py-4">

                              <div className="inline-flex max-w-[200px] items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">

                                <Hash
                                  size={11}
                                  className="shrink-0 text-slate-400"
                                />

                                <span className="truncate font-mono text-[10px] font-bold text-slate-500">

                                  {id || 'N/A'}

                                </span>

                              </div>

                            </td>

                            {/* Status */}

                            <td className="px-5 py-4 text-center">

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-extrabold ${
                                  status === 'Active'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-200 bg-slate-100 text-slate-600'
                                }`}
                              >

                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    status === 'Active'
                                      ? 'bg-emerald-500'
                                      : 'bg-slate-400'
                                  }`}
                                />

                                {status}

                              </span>

                            </td>

                            {/* Actions */}

                            <td className="px-6 py-4">

                              <div className="flex items-center justify-end gap-1">

                                <button
                                  onClick={() =>
                                    openEditPanel(
                                      subcategory
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700"
                                  title="Edit"
                                >

                                  <Edit3 size={15} />

                                </button>

                                <button
                                  onClick={() =>
                                    handleToggleStatus(
                                      subcategory
                                    )
                                  }
                                  disabled={isRefreshing}
                                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition disabled:opacity-40 ${
                                    status === 'Active'
                                      ? 'text-slate-400 hover:bg-amber-50 hover:text-amber-600'
                                      : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                                  }`}
                                  title={
                                    status === 'Active'
                                      ? 'Deactivate'
                                      : 'Activate'
                                  }
                                >

                                  <Power size={15} />

                                </button>

                              </div>

                            </td>

                          </motion.tr>
                        );
                      }
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="5"
                        className="py-20"
                      >

                        <div className="flex flex-col items-center">

                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">

                            <Tag
                              size={24}
                              className="text-slate-300"
                            />

                          </div>

                          <p className="mt-4 text-xs font-extrabold text-slate-500">
                            No matching subcategories
                          </p>

                          <p className="mt-1 text-[10px] font-medium text-slate-400">
                            Try changing your search or
                            status filter.
                          </p>

                        </div>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                MOBILE CARDS
            ================================================= */}

            <div className="md:hidden space-y-3 p-4">

              {loading ? (

                <div className="py-12 text-center">

                  <RefreshCw
                    size={22}
                    className="mx-auto mb-3 animate-spin text-emerald-500"
                  />

                  <p className="text-xs font-bold text-slate-400">
                    Loading subcategories...
                  </p>

                </div>

              ) : filteredSubcategories.length > 0 ? (

                filteredSubcategories.map(
                  (subcategory) => {

                    const id =
                      getSubcategoryId(
                        subcategory
                      );

                    const status =
                      getSubcategoryStatus(
                        subcategory
                      );

                    return (
                      <motion.div
                        key={id}
                        initial={{
                          opacity: 0,
                          y: 8
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                              <Tag size={16} />

                            </div>

                            <div className="min-w-0">

                              <h4 className="truncate text-sm font-extrabold text-slate-800">

                                {getSubcategoryName(
                                  subcategory
                                ) || 'Unnamed'}

                              </h4>

                              <p className="mt-1 truncate font-mono text-[10px] text-slate-400">

                                {id || 'No ID'}

                              </p>

                            </div>

                          </div>

                          <span
                            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${
                              status === 'Active'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-slate-100 text-slate-600'
                            }`}
                          >

                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                status === 'Active'
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-400'
                              }`}
                            />

                            {status}

                          </span>

                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

                          <div className="min-w-0">

                            <span className="block text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                              Category
                            </span>

                            <div className="mt-1 flex items-center gap-1.5">

                              <FolderTree
                                size={12}
                                className="text-emerald-600"
                              />

                              <span className="truncate text-xs font-bold text-slate-700">
                                {getCategoryName(
                                  subcategory
                                ) || 'N/A'}
                              </span>

                            </div>

                          </div>

                          <div className="flex items-center gap-1">

                            <button
                              onClick={() =>
                                openEditPanel(
                                  subcategory
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
                            >

                              <Edit3 size={15} />

                            </button>

                            <button
                              onClick={() =>
                                handleToggleStatus(
                                  subcategory
                                )
                              }
                              disabled={isRefreshing}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-amber-50 hover:text-amber-600 disabled:opacity-40"
                            >

                              <Power size={15} />

                            </button>

                          </div>

                        </div>

                      </motion.div>
                    );
                  }
                )

              ) : (

                <div className="py-12 text-center">

                  <Tag
                    size={26}
                    className="mx-auto mb-3 text-slate-300"
                  />

                  <p className="text-xs font-extrabold text-slate-500">
                    No subcategories found
                  </p>

                </div>

              )}

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

              <div className="flex items-center gap-2">

                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">

                  <Layers3 size={13} />

                </div>

                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">

                  Showing{' '}

                  <span className="text-emerald-600">
                    {filteredSubcategories.length}
                  </span>

                  {' '}of{' '}

                  <span className="text-slate-700">
                    {subcategories.length}
                  </span>

                  {' '}records

                </p>

              </div>

              <p className="text-[10px] font-bold text-slate-400">
                Catalog Management
              </p>

            </div>

          </motion.section>

        </div>

      </main>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      <AnimatePresence>

        {isPanelOpen && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onClick={closePanel}
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 20
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 20
              }}
              transition={{
                duration: 0.25
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-2xl"
            >

              {/* Modal Header */}

              <div className="relative overflow-hidden bg-slate-950 px-6 py-6 text-white">

                <div className="absolute -right-10 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />

                <div className="relative flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10">

                      {editingSubcategory ? (
                        <Edit3
                          size={18}
                          className="text-emerald-400"
                        />
                      ) : (
                        <Plus
                          size={18}
                          className="text-emerald-400"
                        />
                      )}

                    </div>

                    <div>

                      <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-emerald-400">
                        Taxonomy
                      </p>

                      <h3 className="mt-1 text-lg font-extrabold">
                        {editingSubcategory
                          ? 'Update Subcategory'
                          : 'Create Subcategory'}
                      </h3>

                    </div>

                  </div>

                  <button
                    onClick={closePanel}
                    disabled={saving}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                  >

                    <X size={18} />

                  </button>

                </div>

              </div>

              {/* Form */}

              <form
                onSubmit={handleSave}
                className="space-y-5 p-6"
              >

                {/* Info */}

                <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">

                    <FolderTree size={15} />

                  </div>

                  <div>

                    <p className="text-xs font-extrabold text-emerald-800">
                      Subcategory Details
                    </p>

                    <p className="mt-0.5 text-[10px] leading-5 font-medium text-emerald-700/70">
                      Enter the parent category ID and
                      subcategory name to manage the catalog.
                    </p>

                  </div>

                </div>

                {/* Category ID */}

                <div>

                  <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                    Category ID
                  </label>

                  <div className="relative">

                    <FolderTree
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      required
                      type="text"
                      placeholder="Enter category ID"
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          categoryId:
                            e.target.value
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />

                  </div>

                </div>

                {/* Name */}

                <div>

                  <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                    Subcategory Name
                  </label>

                  <div className="relative">

                    <Tag
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      required
                      type="text"
                      placeholder="Enter subcategory name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />

                  </div>

                </div>

                {/* Buttons */}

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">

                  <button
                    type="button"
                    onClick={closePanel}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <motion.button
                    whileHover={{
                      y: -1
                    }}
                    whileTap={{
                      scale: 0.98
                    }}
                    type="submit"
                    disabled={
                      saving ||
                      !formData.name.trim() ||
                      !formData.categoryId.trim()
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
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
                      ? 'Saving...'
                      : editingSubcategory
                      ? 'Update Subcategory'
                      : 'Create Subcategory'}

                  </motion.button>

                </div>

              </form>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>
  );
}