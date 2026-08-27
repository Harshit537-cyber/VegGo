import React, { useEffect, useState } from 'react';
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
  Calendar,
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
  Clock,
  Layers3,
  Zap,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
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

    const duration = 900;
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
          response?.message ||
            'Failed to fetch subcategories'
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

    const subcategoryId =
      getSubcategoryId(subcategory);

    if (!subcategoryId) {
      setErrorMessage('Subcategory ID not found');
      return;
    }

    try {
      setSaving(true);

      const response =
        await getSubcategoryById(subcategoryId);

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
      setErrorMessage(
        'Subcategory name is required'
      );
      return;
    }

    if (!categoryId) {
      setErrorMessage(
        'Category ID is required'
      );
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
          response?.message ||
            'Failed to save subcategory'
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

    const subcategoryId =
      getSubcategoryId(subcategory);

    if (!subcategoryId) {
      setErrorMessage(
        'Subcategory ID not found'
      );
      return;
    }

    try {
      setIsRefreshing(true);

      const isActive =
        getSubcategoryStatus(subcategory) ===
        'Active';

      const response = isActive
        ? await deactivateSubcategory(
            subcategoryId
          )
        : await activateSubcategory(
            subcategoryId
          );

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
     Filters
  ========================================================= */

  const filteredSubcategories =
    subcategories.filter((subcategory) => {
      const name =
        getSubcategoryName(
          subcategory
        ).toLowerCase();

      const category =
        getCategoryName(
          subcategory
        ).toLowerCase();

      const id =
        String(
          getSubcategoryId(
            subcategory
          ) || ''
        ).toLowerCase();

      const query =
        searchQuery.toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        category.includes(query) ||
        id.includes(query);

      const matchesStatus =
        statusFilter === 'All' ||
        getSubcategoryStatus(
          subcategory
        ) === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  const activeCount =
    subcategories.filter(
      (subcategory) =>
        getSubcategoryStatus(
          subcategory
        ) === 'Active'
    ).length;

  const inactiveCount =
    subcategories.length -
    activeCount;

  const totalCategories =
    new Set(
      subcategories
        .map((item) =>
          getCategoryId(item)
        )
        .filter(Boolean)
    ).size;

  /* =========================================================
     Stats
  ========================================================= */

  const stats = [
    {
      label: 'Total Subcategories',
      value: subcategories.length,
      change: 'Catalog',
      up: true,
      accent: 'bg-emerald-600',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      icon: Layers3
    },
    {
      label: 'Active Subcategories',
      value: activeCount,
      change: 'Live',
      up: true,
      accent: 'bg-teal-600',
      iconBg:
        'bg-teal-50 text-teal-700',
      icon: CheckCircle2
    },
    {
      label: 'Inactive Subcategories',
      value: inactiveCount,
      change: 'Paused',
      up: false,
      accent: 'bg-amber-500',
      iconBg:
        'bg-amber-50 text-amber-700',
      icon: Clock
    },
    {
      label: 'Linked Categories',
      value: totalCategories,
      change: 'Connected',
      up: true,
      accent: 'bg-emerald-500',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      icon: FolderTree
    }
  ];

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">

      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <motion.header
          initial={{
            opacity: 0,
            y: -20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.5,
            ease: 'easeOut'
          }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900 relative overflow-hidden group"
        >

          {/* Ambient Lights */}

          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 z-10">

            <div className="flex flex-wrap items-center gap-2.5">

              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm backdrop-blur-md">

                <Zap
                  size={12}
                  className="text-emerald-400 animate-bounce"
                />

                Taxonomy Catalog
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

              Subcategory Directory

              <Sparkles className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            </h1>

            <p className="text-xs sm:text-sm text-emerald-200 font-medium">
              Organize and manage product subcategories across your catalog.
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center z-10">

            <motion.button
              whileHover={{
                scale: 1.03
              }}
              whileTap={{
                scale: 0.97
              }}
              onClick={openAddPanel}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-950/30 transition-all"
            >
              <Plus size={15} />

              New Subcategory
            </motion.button>

            <div className="bg-emerald-900/60 border border-emerald-800 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-100 shadow-inner backdrop-blur-sm">

              <Calendar
                size={14}
                className="text-emerald-400"
              />

              <span>
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
              whileHover={{
                scale: 1.05
              }}
              whileTap={{
                scale: 0.95
              }}
              onClick={fetchSubcategories}
              disabled={isRefreshing}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              title="Refresh Data"
            >

              <RefreshCw
                size={15}
                className={
                  isRefreshing
                    ? 'animate-spin text-emerald-300'
                    : 'text-emerald-300'
                }
              />

            </motion.button>

          </div>

        </motion.header>

        {/* =====================================================
            ALERTS
        ===================================================== */}

        <AnimatePresence>

          {(errorMessage ||
            successMessage) && (

            <motion.div
              initial={{
                opacity: 0,
                y: -10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -10
              }}
              className={`px-5 py-4 rounded-2xl border text-xs font-semibold ${
                errorMessage
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              {errorMessage ||
                successMessage}
            </motion.div>

          )}

        </AnimatePresence>

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

          {stats.map((stat, index) => {

            const IconComponent =
              stat.icon;

            return (

              <motion.div
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1
                }}
                whileHover={{
                  y: -6,
                  transition: {
                    duration: 0.2
                  }
                }}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
              >

                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accent} transition-all duration-300 group-hover:h-2`}
                />

                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:scale-125" />

                <div className="relative z-10">

                  <div className="flex items-center justify-between mb-4">

                    <span className="text-[11px] font-semibold text-black uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
                      {stat.label}
                    </span>

                    <motion.div
                      whileHover={{
                        rotate: 12,
                        scale: 1.1
                      }}
                      className={`${stat.iconBg} p-2.5 rounded-2xl transition-all shadow-sm`}
                    >
                      <IconComponent size={18} />
                    </motion.div>

                  </div>

                  <h3 className="text-2xl sm:text-3xl font-semibold text-black tracking-tight font-mono group-hover:text-emerald-800 transition-colors">

                    {loading ? (
                      '...'
                    ) : (
                      <AnimatedValue
                        value={stat.value}
                      />
                    )}

                  </h3>

                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between relative z-10">

                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      stat.up
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}
                  >

                    {stat.up ? (
                      <ArrowUpRight size={13} />
                    ) : (
                      <ArrowDownRight size={13} />
                    )}

                    {stat.change}

                  </span>

                  <span className="text-[10px] text-black font-semibold uppercase tracking-wider">
                    Current
                  </span>

                </div>

              </motion.div>
            );
          })}

        </section>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <section className="w-full">

          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.5,
              delay: 0.3
            }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
          >

            {/* Table Header */}

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">

                  <Tag size={18} />

                </div>

                <div>

                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Subcategory Records
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Manage your product taxonomy structure
                  </p>

                </div>

              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">

                {/* Search */}

                <div className="relative sm:w-64">

                  <Search
                    className="absolute left-3 top-2.5 text-slate-400"
                    size={15}
                  />

                  <input
                    type="text"
                    placeholder="Search subcategories..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(
                        e.target.value
                      )
                    }
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />

                </div>

                {/* Filter */}

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">

                  <Filter
                    size={14}
                    className="text-slate-400 ml-1"
                  />

                  {[
                    'All',
                    'Active',
                    'Inactive'
                  ].map((status) => (

                    <button
                      key={status}
                      onClick={() =>
                        setStatusFilter(
                          status
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        statusFilter ===
                        status
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-500 hover:bg-white hover:text-emerald-700'
                      }`}
                    >
                      {status}
                    </button>

                  ))}

                </div>

              </div>

            </div>

            {/* =================================================
                Desktop Table
            ================================================= */}

            <div className="hidden md:block overflow-x-auto">

              <table className="w-full text-left border-collapse">

                <thead>

                  <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">

                    <th className="py-3.5 px-4 rounded-l-xl">
                      Subcategory
                    </th>

                    <th className="py-3.5 px-4">
                      Category
                    </th>

                    <th className="py-3.5 px-4">
                      Subcategory ID
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
                        className="py-14 text-center"
                      >

                        <div className="flex flex-col items-center gap-3">

                          <RefreshCw
                            size={24}
                            className="text-emerald-500 animate-spin"
                          />

                          <span className="text-xs font-semibold text-slate-400">
                            Loading subcategories...
                          </span>

                        </div>

                      </td>

                    </tr>

                  ) : filteredSubcategories.length >
                    0 ? (

                    filteredSubcategories.map(
                      (
                        subcategory,
                        index
                      ) => {

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
                            key={
                              id ||
                              index
                            }
                            initial={{
                              opacity: 0,
                              y: 10
                            }}
                            animate={{
                              opacity: 1,
                              y: 0
                            }}
                            transition={{
                              duration: 0.3,
                              delay:
                                index *
                                0.04
                            }}
                            className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group"
                          >

                            {/* Name */}

                            <td className="py-4 px-4">

                              <div className="flex items-center gap-3">

                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">

                                  <Tag
                                    size={
                                      17
                                    }
                                  />

                                </div>

                                <div className="flex flex-col">

                                  <span className="font-semibold text-black group-hover:text-emerald-700 transition-colors">
                                    {getSubcategoryName(
                                      subcategory
                                    ) ||
                                      'Unnamed Subcategory'}
                                  </span>

                                  <span className="text-[10px] text-slate-400">
                                    Product Subcategory
                                  </span>

                                </div>

                              </div>

                            </td>

                            {/* Category */}

                            <td className="py-4 px-4">

                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">

                                <FolderTree
                                  size={
                                    13
                                  }
                                  className="text-emerald-600"
                                />

                                <span className="text-xs font-semibold text-black">
                                  {getCategoryName(
                                    subcategory
                                  ) ||
                                    'N/A'}
                                </span>

                              </div>

                            </td>

                            {/* ID */}

                            <td className="py-4 px-4">

                              <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">

                                {id ||
                                  'N/A'}

                              </span>

                            </td>

                            {/* Status */}

                            <td className="py-4 px-4 text-center">

                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all duration-300 group-hover:scale-105 ${
                                  status ===
                                  'Active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                    : 'bg-slate-100 text-slate-600 border-slate-200/80'
                                }`}
                              >

                                {status ===
                                'Active' ? (
                                  <CheckCircle2
                                    size={
                                      11
                                    }
                                    className="text-emerald-600"
                                  />
                                ) : (
                                  <Clock
                                    size={
                                      11
                                    }
                                    className="text-slate-500"
                                  />
                                )}

                                {status}

                              </span>

                            </td>

                            {/* Actions */}

                            <td className="py-4 px-4 text-right">

                              <div className="flex items-center justify-end gap-1">

                                <button
                                  onClick={() =>
                                    openEditPanel(
                                      subcategory
                                    )
                                  }
                                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Edit Subcategory"
                                >
                                  <Edit3
                                    size={
                                      15
                                    }
                                  />
                                </button>

                                <button
                                  onClick={() =>
                                    handleToggleStatus(
                                      subcategory
                                    )
                                  }
                                  disabled={
                                    isRefreshing
                                  }
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-40"
                                  title={
                                    status ===
                                    'Active'
                                      ? 'Deactivate'
                                      : 'Activate'
                                  }
                                >
                                  <Power
                                    size={
                                      15
                                    }
                                  />
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
                        className="py-14 text-center"
                      >

                        <div className="flex flex-col items-center">

                          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">

                            <Tag
                              size={
                                24
                              }
                              className="text-slate-300"
                            />

                          </div>

                          <p className="text-xs font-semibold text-slate-500">
                            No matching subcategories found.
                          </p>

                          <p className="text-[10px] text-slate-400 mt-1">
                            Try changing your search or filter.
                          </p>

                        </div>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                Mobile Cards
            ================================================= */}

            <div className="md:hidden space-y-3">

              {loading ? (

                <div className="py-12 text-center">

                  <RefreshCw
                    size={22}
                    className="mx-auto text-emerald-500 animate-spin mb-3"
                  />

                  <p className="text-xs font-semibold text-slate-400">
                    Loading subcategories...
                  </p>

                </div>

              ) : filteredSubcategories.length >
                0 ? (

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
                          y: 10
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3"
                      >

                        <div className="flex items-center justify-between">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">

                              <Tag
                                size={
                                  17
                                }
                              />

                            </div>

                            <div>

                              <h4 className="font-semibold text-sm text-black">
                                {getSubcategoryName(
                                  subcategory
                                ) ||
                                  'Unnamed'}
                              </h4>

                              <p className="text-[10px] text-slate-400">
                                {id ||
                                  'No ID'}
                              </p>

                            </div>

                          </div>

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              status ===
                              'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {status}
                          </span>

                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200/60">

                          <div>

                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                              Category
                            </span>

                            <span className="text-xs font-semibold text-black">
                              {getCategoryName(
                                subcategory
                              ) ||
                                'N/A'}
                            </span>

                          </div>

                          <div className="flex items-end justify-end gap-1">

                            <button
                              onClick={() =>
                                openEditPanel(
                                  subcategory
                                )
                              }
                              className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                            >
                              <Edit3
                                size={
                                  15
                                }
                              />
                            </button>

                            <button
                              onClick={() =>
                                handleToggleStatus(
                                  subcategory
                                )
                              }
                              disabled={
                                isRefreshing
                              }
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl"
                            >
                              <Power
                                size={
                                  15
                                }
                              />
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
                    size={28}
                    className="mx-auto text-slate-300 mb-3"
                  />

                  <p className="text-xs font-semibold text-slate-500">
                    No subcategories found.
                  </p>

                </div>

              )}

            </div>

            {/* Footer */}

            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">

              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">

                Showing{' '}
                <span className="text-emerald-700">
                  {filteredSubcategories.length}
                </span>{' '}
                of{' '}
                <span className="text-black">
                  {subcategories.length}
                </span>{' '}
                subcategories

              </span>

              <span className="text-[10px] font-semibold text-slate-400">
                Catalog Management
              </span>

            </div>

          </motion.div>

        </section>

      </main>

      {/* =======================================================
          CREATE / EDIT MODAL
      ======================================================= */}

      <AnimatePresence>

        {isPanelOpen && (

          <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => {
              if (!saving) {
                setIsPanelOpen(false);
                setEditingSubcategory(null);
              }
            }}
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 20
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                y: 20
              }}
              transition={{
                duration: 0.25
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden"
            >

              {/* Modal Header */}

              <div className="relative p-6 bg-emerald-950 text-white overflow-hidden">

                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl" />

                <div className="relative flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center">

                      {editingSubcategory ? (
                        <Edit3
                          size={18}
                          className="text-emerald-300"
                        />
                      ) : (
                        <Plus
                          size={18}
                          className="text-emerald-300"
                        />
                      )}

                    </div>

                    <div>

                      <p className="text-[10px] uppercase tracking-widest font-semibold text-emerald-300">
                        Taxonomy
                      </p>

                      <h3 className="text-lg font-semibold">
                        {editingSubcategory
                          ? 'Update Subcategory'
                          : 'Create Subcategory'}
                      </h3>

                    </div>

                  </div>

                  <button
                    onClick={() => {
                      if (!saving) {
                        setIsPanelOpen(
                          false
                        );
                        setEditingSubcategory(
                          null
                        );
                      }
                    }}
                    disabled={saving}
                    className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-40"
                  >
                    <X size={18} />
                  </button>

                </div>

              </div>

              {/* Form */}

              <form
                onSubmit={handleSave}
                className="p-6 space-y-5"
              >

                {/* Category */}

                <div>

                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    Category ID
                  </label>

                  <div className="relative">

                    <FolderTree
                      size={16}
                      className="absolute left-3.5 top-3.5 text-slate-400"
                    />

                    <input
                      required
                      type="text"
                      placeholder="Enter category ID"
                      value={
                        formData.categoryId
                      }
                      onChange={(e) =>
                        setFormData(
                          (prev) => ({
                            ...prev,
                            categoryId:
                              e.target
                                .value
                          })
                        )
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />

                  </div>

                </div>

                {/* Name */}

                <div>

                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    Subcategory Name
                  </label>

                  <div className="relative">

                    <Tag
                      size={16}
                      className="absolute left-3.5 top-3.5 text-slate-400"
                    />

                    <input
                      required
                      type="text"
                      placeholder="Enter subcategory name"
                      value={
                        formData.name
                      }
                      onChange={(e) =>
                        setFormData(
                          (prev) => ({
                            ...prev,
                            name: e.target
                              .value
                          })
                        )
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />

                  </div>

                </div>

                {/* Buttons */}

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">

                  <button
                    type="button"
                    onClick={() => {
                      setIsPanelOpen(
                        false
                      );
                      setEditingSubcategory(
                        null
                      );
                    }}
                    disabled={saving}
                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <motion.button
                    whileHover={{
                      scale: 1.02
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
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl flex items-center gap-2 text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
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