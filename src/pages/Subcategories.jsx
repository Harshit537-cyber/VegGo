import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

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
  AlertTriangle,
  XCircle,
  Layers3,
  Loader2,
  Power,
  PowerOff,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

import {
  getSubcategories,
  createSubcategory,
  getSubcategoryById,
  updateSubcategory,
  deactivateSubcategory,
  activateSubcategory
} from '../Api/catalogService/subcategoryService';

const CATEGORY_ID = 'f3a88028-bd45-40a4-aef5-4846d5238ac5';

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    const targetNum = Number(value);

    if (Number.isNaN(targetNum)) {
      setDisplayValue(String(value ?? ''));
      return;
    }

    const duration = 1000;
    const startTime = performance.now();
    let animationFrameId;

    const updateCount = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress =
        progress === 1
          ? 1
          : 1 - Math.pow(2, -10 * progress);

      setDisplayValue(
        Math.floor(
          easeProgress * targetNum
        ).toLocaleString('en-IN')
      );

      if (progress < 1) {
        animationFrameId =
          requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(
          targetNum.toLocaleString('en-IN')
        );
      }
    };

    animationFrameId =
      requestAnimationFrame(updateCount);

    return () =>
      cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{displayValue}</span>;
}

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    fallback
  );
};

export default function Subcategories() {
  const [currentTab, setCurrentTab] =
    useState('subcategories');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('All');

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(null);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [subcategories, setSubcategories] =
    useState([]);

  const [isPanelOpen, setIsPanelOpen] =
    useState(false);

  const [editingSubcategory, setEditingSubcategory] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState('');

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    categoryId: CATEGORY_ID,
    status: 'Active',
    imageFile: null,
    imageUrl: ''
  });

  const fetchSubcategories = async () => {
    setIsRefreshing(true);
    setErrorMessage('');

    try {
      const response = await getSubcategories({
        categoryId: CATEGORY_ID
      });

      console.log(
        'SUBCATEGORY API RESPONSE:',
        response
      );

      if (response?.success) {
        const list = Array.isArray(response?.data)
          ? response.data
          : [];

        setSubcategories(list);
        setRefreshKey((prev) => prev + 1);
      } else {
        setSubcategories([]);

        setErrorMessage(
          response?.message ||
            'Failed to load subcategories'
        );
      }
    } catch (error) {
      console.error(
        'Failed to fetch subcategories:',
        error
      );

      setSubcategories([]);

      setErrorMessage(
        getErrorMessage(
          error,
          'Failed to load subcategories'
        )
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const handleRefresh = () => {
    fetchSubcategories();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      categoryId: CATEGORY_ID,
      status: 'Active',
      imageFile: null,
      imageUrl: ''
    });

    setImagePreview('');
  };

  const closePanel = () => {
    if (saving) return;

    setIsPanelOpen(false);
    setEditingSubcategory(null);
    resetForm();
  };

  const openAddPanel = () => {
    setEditingSubcategory(null);
    setErrorMessage('');
    resetForm();
    setIsPanelOpen(true);
  };

  const openEditPanel = async (subcategory) => {
    if (!subcategory?.id) return;

    setActionLoading(subcategory.id);
    setErrorMessage('');

    try {
      const response =
        await getSubcategoryById(
          subcategory.id
        );

      console.log(
        'SUBCATEGORY DETAILS RESPONSE:',
        response
      );

      const data =
        response?.data?.subcategory ||
        response?.data ||
        response?.subcategory ||
        response;

      const existingImage =
        data?.imageUrl ||
        data?.image ||
        subcategory?.imageUrl ||
        subcategory?.image ||
        '';

      setEditingSubcategory(
        data?.id || subcategory.id
      );

      setFormData({
        id: data?.id || subcategory.id || '',
        name: data?.name || '',
        categoryId:
          data?.categoryId ||
          subcategory?.categoryId ||
          CATEGORY_ID,
        status:
          data?.active === true
            ? 'Active'
            : 'Inactive',
        imageFile: null,
        imageUrl: existingImage
      });

      setImagePreview(existingImage);
      setIsPanelOpen(true);
    } catch (error) {
      console.error(
        'Failed to fetch subcategory:',
        error
      );

      setErrorMessage(
        getErrorMessage(
          error,
          'Failed to fetch subcategory details'
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(
        'Please select a valid image file'
      );
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setErrorMessage(
        'Image size must be less than 1MB'
      );
      return;
    }

    setErrorMessage('');

    const previewUrl =
      URL.createObjectURL(file);

    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(previewUrl);

    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: previewUrl
    }));
  };

  const removeImage = () => {
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview('');

    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imageUrl: ''
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const name =
      String(formData.name || '').trim();

    const categoryId = CATEGORY_ID;

    if (!name) {
      setErrorMessage(
        'Subcategory name is required'
      );
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const payload = new FormData();

    payload.append('name', name);
    payload.append('categoryId', categoryId);

    if (formData.imageFile) {
      payload.append(
        'image',
        formData.imageFile
      );
    }

    try {
      if (editingSubcategory) {
        await updateSubcategory(
          editingSubcategory,
          payload
        );
      } else {
        await createSubcategory(payload);
      }

      await fetchSubcategories();

      setIsPanelOpen(false);
      setEditingSubcategory(null);
      resetForm();
    } catch (error) {
      console.error(
        'Failed to save subcategory:',
        error
      );

      setErrorMessage(
        getErrorMessage(
          error,
          'Failed to save subcategory'
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (
    subcategory
  ) => {
    if (!subcategory?.id) return;

    setActionLoading(subcategory.id);
    setErrorMessage('');

    try {
      if (subcategory.active === false) {
        await activateSubcategory(
          subcategory.id
        );
      } else {
        await deactivateSubcategory(
          subcategory.id
        );
      }

      await fetchSubcategories();
    } catch (error) {
      console.error(
        'Failed to change subcategory status:',
        error
      );

      setErrorMessage(
        getErrorMessage(
          error,
          'Failed to update subcategory status'
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSubcategories = useMemo(() => {
    const query =
      searchQuery.toLowerCase().trim();

    return subcategories.filter((item) => {
      const name = String(
        item?.name || ''
      ).toLowerCase();

      const category = String(
        item?.categoryName || ''
      )
        .trim()
        .toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        category.includes(query);

      const status =
        item?.active === true
          ? 'Active'
          : 'Inactive';

      const matchesStatus =
        statusFilter === 'All' ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    subcategories,
    searchQuery,
    statusFilter
  ]);

  const totalSubcategories =
    subcategories.length;

  const activeSubcategories =
    subcategories.filter(
      (item) => item?.active === true
    ).length;

  const inactiveSubcategories =
    subcategories.filter(
      (item) => item?.active === false
    ).length;

  const categoryCount = new Set(
    subcategories
      .map((item) =>
        String(
          item?.categoryName || ''
        ).trim()
      )
      .filter(Boolean)
  ).size;

  const stats = [
    {
      label: 'Total Subcategories',
      value: totalSubcategories,
      change: '+12.4%',
      up: true,
      accentColor: 'bg-emerald-600',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Layers3,
      suffix: ' Records'
    },
    {
      label: 'Active Subcategories',
      value: activeSubcategories,
      change: '+8.2%',
      up: true,
      accentColor: 'bg-teal-600',
      iconBg:
        'bg-teal-50 text-teal-700',
      tagColor:
        'text-teal-700 bg-teal-50/80 border-teal-200/80',
      icon: CheckCircle2,
      suffix: ' Active'
    },
    {
      label: 'Parent Categories',
      value: categoryCount,
      change: '+4.1%',
      up: true,
      accentColor: 'bg-emerald-500',
      iconBg:
        'bg-amber-50 text-amber-700',
      tagColor:
        'text-amber-700 bg-amber-50/80 border-amber-200/80',
      icon: AlertTriangle,
      suffix: ' Categories'
    },
    {
      label: 'Inactive',
      value: inactiveSubcategories,
      change: '-2.8%',
      up: false,
      accentColor: 'bg-green-700',
      iconBg:
        'bg-rose-50 text-rose-700',
      tagColor:
        'text-rose-700 bg-rose-50/80 border-rose-200/80',
      icon: XCircle,
      suffix: ' Inactive'
    }
  ];

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
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm backdrop-blur-md">
                <Zap
                  size={12}
                  className="text-emerald-400 animate-bounce"
                />
                Inventory Control
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
              Subcategory Catalog

              <Sparkles className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </h1>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center z-10">
            <motion.button
              whileHover={{
                scale: 1.05
              }}
              whileTap={{
                scale: 0.95
              }}
              onClick={openAddPanel}
              className="px-4 py-2.5 bg-emerald-500/20 border border-emerald-700 rounded-2xl hover:bg-emerald-500/30 transition-all text-xs font-semibold text-emerald-100 flex items-center gap-2"
            >
              <Plus size={15} />
              Add Subcategory
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
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner group/btn disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw
                size={15}
                className={`text-emerald-300 transition-transform duration-700 ${
                  isRefreshing
                    ? 'rotate-180'
                    : 'group-hover/btn:rotate-45'
                }`}
              />
            </motion.button>
          </div>
        </motion.header>

        <AnimatePresence>
          {errorMessage && (
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
              className="px-5 py-3.5 rounded-2xl border text-xs font-semibold bg-rose-50 border-rose-200 text-rose-700"
            >
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat, idx) => {
            const IconComponent = stat.icon;

            return (
              <motion.div
                key={`${idx}-${refreshKey}`}
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
                  delay: idx * 0.1
                }}
                whileHover={{
                  y: -6,
                  transition: {
                    duration: 0.2
                  }
                }}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accentColor} transition-all duration-300 group-hover:h-2`}
                />

                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:scale-125" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-black uppercase tracking-wider group-hover:text-emerald-700 transition-colors duration-200">
                      {stat.label}
                    </span>

                    <motion.div
                      whileHover={{
                        rotate: 12,
                        scale: 1.1
                      }}
                      className={`${stat.iconBg} p-2.5 rounded-2xl transition-all shadow-xs`}
                    >
                      <IconComponent size={18} />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-semibold text-black tracking-tight font-mono group-hover:text-emerald-800 transition-colors duration-200">
                    {loading ? (
                      <span className="text-slate-300">
                        ...
                      </span>
                    ) : (
                      <>
                        <AnimatedValue
                          value={stat.value}
                        />

                        <span className="text-base ml-1 font-sans">
                          {stat.suffix}
                        </span>
                      </>
                    )}
                  </h3>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between relative z-10">
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-transform duration-300 group-hover:scale-105 ${stat.tagColor}`}
                  >
                    {stat.up ? (
                      <ArrowUpRight
                        size={13}
                        className="text-emerald-600"
                      />
                    ) : (
                      <ArrowDownRight
                        size={13}
                        className="text-rose-600"
                      />
                    )}

                    {stat.change}
                  </span>

                  <span className="text-[11px] text-black font-semibold">
                    Monthly Period
                  </span>
                </div>
              </motion.div>
            );
          })}
        </section>

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <Layers3 size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Subcategory Records
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Subcategory inventory management directory
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 sm:w-72">
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

                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                  <Filter
                    size={13}
                    className="text-slate-400 ml-2"
                  />

                  {[
                    'All',
                    'Active',
                    'Inactive'
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        setStatusFilter(status)
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                        statusFilter === status
                          ? 'bg-white text-emerald-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
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
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">
                    <th className="py-3.5 px-4 rounded-l-xl">
                      Subcategory
                    </th>

                    <th className="py-3.5 px-4">
                      Parent Category
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
                        colSpan={4}
                        className="py-12 text-center"
                      >
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Loader2
                            size={28}
                            className="animate-spin text-emerald-600"
                          />

                          <span className="text-xs font-semibold">
                            Loading subcategories...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredSubcategories.length > 0 ? (
                    filteredSubcategories.map(
                      (subcategory, idx) => (
                        <motion.tr
                          key={
                            subcategory.id ||
                            idx
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
                              0.3 +
                              idx * 0.05
                          }}
                          className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:border-emerald-300 transition-colors overflow-hidden">
                                {subcategory.imageUrl ||
                                subcategory.image ? (
                                  <img
                                    src={
                                      subcategory.imageUrl ||
                                      subcategory.image
                                    }
                                    alt={
                                      subcategory.name
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Layers3
                                    size={17}
                                    className="text-emerald-600"
                                  />
                                )}
                              </div>

                              <div className="flex flex-col">
                                <span className="font-semibold text-black group-hover:text-emerald-700 transition-colors">
                                  {subcategory.name ||
                                    '-'}
                                </span>

                                <span className="text-[10px] text-slate-500">
                                  {String(
                                    subcategory.categoryName ||
                                      ''
                                  ).trim() ||
                                    'Subcategory'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {String(
                                subcategory.categoryName ||
                                  ''
                              ).trim() || '-'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all duration-300 group-hover:scale-105 ${
                                subcategory.active ===
                                true
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                  : 'bg-rose-50 text-rose-700 border-rose-200/80'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  subcategory.active ===
                                  true
                                    ? 'bg-emerald-500'
                                    : 'bg-rose-500'
                                }`}
                              />

                              {subcategory.active ===
                              true
                                ? 'Active'
                                : 'Inactive'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  openEditPanel(
                                    subcategory
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  subcategory.id
                                }
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-40"
                                title="Edit Subcategory"
                              >
                                {actionLoading ===
                                subcategory.id ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Edit3
                                    size={15}
                                  />
                                )}
                              </button>

                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    subcategory
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  subcategory.id
                                }
                                className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                                  subcategory.active ===
                                  false
                                    ? 'text-slate-400 hover:text-emerald-700 hover:bg-emerald-50'
                                    : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                }`}
                                title={
                                  subcategory.active ===
                                  false
                                    ? 'Activate Subcategory'
                                    : 'Deactivate Subcategory'
                                }
                              >
                                {actionLoading ===
                                subcategory.id ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : subcategory.active ===
                                  false ? (
                                  <Power
                                    size={15}
                                  />
                                ) : (
                                  <PowerOff
                                    size={15}
                                  />
                                )}
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-12 text-center"
                      >
                        <Layers3
                          size={35}
                          className="mx-auto text-slate-300 mb-3"
                        />

                        <p className="text-xs font-semibold text-slate-400">
                          No matching subcategory records found.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {loading ? (
                <div className="py-10 text-center text-xs font-semibold text-slate-400">
                  Loading subcategories...
                </div>
              ) : filteredSubcategories.length > 0 ? (
                filteredSubcategories.map(
                  (subcategory) => (
                    <motion.div
                      key={subcategory.id}
                      whileHover={{
                        scale: 1.01
                      }}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center overflow-hidden">
                            {subcategory.imageUrl ||
                            subcategory.image ? (
                              <img
                                src={
                                  subcategory.imageUrl ||
                                  subcategory.image
                                }
                                alt={
                                  subcategory.name
                                }
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Layers3
                                size={16}
                              />
                            )}
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700 transition-colors">
                              {subcategory.name ||
                                '-'}
                            </h4>

                            <p className="text-[10px] text-slate-400">
                              {String(
                                subcategory.categoryName ||
                                  ''
                              ).trim() ||
                                'Subcategory'}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            subcategory.active ===
                            true
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              subcategory.active ===
                              true
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                            }`}
                          />

                          {subcategory.active ===
                          true
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Parent Category
                          </span>

                          <span className="text-slate-500 font-semibold">
                            {String(
                              subcategory.categoryName ||
                                ''
                            ).trim() || '-'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Display Order
                          </span>

                          <span className="text-slate-500 font-semibold">
                            {subcategory.displayOrder ??
                              '-'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Status
                          </span>

                          <span className="font-semibold text-slate-500">
                            {subcategory.active ===
                            true
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Type
                          </span>

                          <span className="font-semibold text-slate-500">
                            Subcategory
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-1 pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() =>
                            openEditPanel(
                              subcategory
                            )
                          }
                          disabled={
                            actionLoading ===
                            subcategory.id
                          }
                          className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg disabled:opacity-40"
                          title="Edit Subcategory"
                        >
                          {actionLoading ===
                          subcategory.id ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Edit3 size={15} />
                          )}
                        </button>

                        <button
                          onClick={() =>
                            handleStatusChange(
                              subcategory
                            )
                          }
                          disabled={
                            actionLoading ===
                            subcategory.id
                          }
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg disabled:opacity-40"
                          title={
                            subcategory.active ===
                            false
                              ? 'Activate Subcategory'
                              : 'Deactivate Subcategory'
                          }
                        >
                          {actionLoading ===
                          subcategory.id ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : subcategory.active ===
                            false ? (
                            <Power size={15} />
                          ) : (
                            <PowerOff
                              size={15}
                            />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )
                )
              ) : (
                <div className="py-10 text-center">
                  <Layers3
                    size={35}
                    className="mx-auto text-slate-300 mb-3"
                  />

                  <p className="text-xs font-semibold text-slate-400">
                    No subcategories found.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </section>
      </main>

      <AnimatePresence>
        {isPanelOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                closePanel();
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 10
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 10
              }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto"
              onMouseDown={(e) =>
                e.stopPropagation()
              }
            >
              <button
                type="button"
                onClick={closePanel}
                disabled={saving}
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-40"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-2xl flex items-center justify-center">
                  {editingSubcategory ? (
                    <Edit3 size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                    Subcategory Management
                  </span>

                  <h3 className="text-lg font-bold text-black">
                    {editingSubcategory
                      ? 'Update Subcategory'
                      : 'Create Subcategory'}
                  </h3>
                </div>
              </div>

              <form
                onSubmit={handleSave}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Subcategory Name
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="e.g. Leafy Greens"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Status
                  </label>

                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Subcategory Image
                  </label>

                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/60">
                    {imagePreview ? (
                      <div className="relative">
                        <div className="w-full h-48 rounded-xl overflow-hidden bg-white border border-slate-200">
                          <img
                            src={imagePreview}
                            alt="Subcategory preview"
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={removeImage}
                          disabled={saving}
                          className="absolute top-2 right-2 p-2 bg-white text-rose-600 rounded-full shadow-md border border-slate-200 hover:bg-rose-50 disabled:opacity-50"
                        >
                          <X size={15} />
                        </button>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[75%]">
                            {formData.imageFile?.name ||
                              'Current image'}
                          </span>

                          <label
                            htmlFor="subcategory-image"
                            className="cursor-pointer text-[10px] font-bold text-emerald-700 hover:text-emerald-800"
                          >
                            Change Image
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="subcategory-image"
                        className="min-h-40 flex flex-col items-center justify-center cursor-pointer"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mb-3">
                          <ImageIcon size={24} />
                        </div>

                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <Upload size={16} />
                          Upload Image
                        </div>

                        <p className="text-[10px] font-semibold text-slate-400 mt-1">
                          PNG, JPG, JPEG up to 1MB
                        </p>
                      </label>
                    )}

                    <input
                      id="subcategory-image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleImageChange}
                      disabled={saving}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closePanel}
                    disabled={saving}
                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm transition-colors"
                  >
                    {saving ? (
                      <Loader2
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
                      : 'Save Subcategory'}
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