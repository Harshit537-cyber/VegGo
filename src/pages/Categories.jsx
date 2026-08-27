import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

import {
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deactivateCategory,
  activateCategory
} from '../Api/catalogService/categoryService';

import {
  Calendar,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  FolderTree,
  Power,
  X,
  Save,
  CheckCircle2,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Eye
} from 'lucide-react';

/* =========================================================
   ANIMATED VALUE
========================================================= */

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    const stringValue = String(value ?? '');

    const match = stringValue.match(/([\d,.]+)\s*(.*)/);

    if (!match) {
      setDisplayValue(stringValue);
      return;
    }

    const rawNumberStr = match[1].replace(/,/g, '');
    const targetNum = parseFloat(rawNumberStr);
    const suffix = match[2] || '';

    if (isNaN(targetNum)) {
      setDisplayValue(stringValue);
      return;
    }

    const isDecimal = rawNumberStr.includes('.');
    const hasComma = match[1].includes(',');

    const duration = 1000;
    const startTime = performance.now();

    let animationFrameId;

    const updateCount = (timestamp) => {
      const elapsed = timestamp - startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      const easeProgress =
        progress === 1
          ? 1
          : 1 - Math.pow(2, -10 * progress);

      const currentVal =
        easeProgress * targetNum;

      let formatted;

      if (isDecimal) {
        formatted = currentVal.toFixed(2);
      } else {
        formatted =
          Math.floor(currentVal).toString();
      }

      if (hasComma) {
        const parts = formatted.split('.');

        parts[0] = parseInt(
          parts[0],
          10
        ).toLocaleString('en-IN');

        formatted = parts.join('.');
      }

      setDisplayValue(
        `${formatted}${suffix ? ` ${suffix}` : ''}`
      );

      if (progress < 1) {
        animationFrameId =
          requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(stringValue);
      }
    };

    animationFrameId =
      requestAnimationFrame(updateCount);

    return () =>
      cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{displayValue}</span>;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Categories() {
  const [currentTab, setCurrentTab] =
    useState('categories');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('All');

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  const [isPanelOpen, setIsPanelOpen] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    displayOrder: 1,
    imageUrl: '',
    status: 'Active'
  });

  /* =========================================================
     HELPERS
  ========================================================= */

  const getCategoryId = (category) =>
    category?.id ||
    category?._id ||
    category?.categoryId;

  const getCategoryName = (category) =>
    category?.name ||
    category?.categoryName ||
    '';

  const getCategoryDescription = (category) =>
    category?.description || '';

  const getCategoryStatus = (category) => {
    if (
      category?.active === true ||
      category?.status === 'Active' ||
      category?.status === 'active' ||
      category?.isActive === true
    ) {
      return 'Active';
    }

    if (
      category?.active === false ||
      category?.status === 'Inactive' ||
      category?.status === 'inactive' ||
      category?.isActive === false
    ) {
      return 'Inactive';
    }

    return 'Active';
  };

  const getDisplayOrder = (category) =>
    category?.displayOrder ?? 0;

  const getImageUrl = (category) =>
    category?.imageUrl ||
    category?.image ||
    '';

  const getProductsCount = (category) =>
    category?.productsCount ??
    category?.productCount ??
    (Array.isArray(category?.products)
      ? category.products.length
      : 0);

  const normalizeCategory = (category) => ({
    ...category,

    id: getCategoryId(category),

    name: getCategoryName(category),

    description:
      getCategoryDescription(category),

    displayOrder:
      getDisplayOrder(category),

    imageUrl:
      getImageUrl(category),

    productsCount:
      getProductsCount(category),

    status:
      getCategoryStatus(category)
  });

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  /* =========================================================
     FETCH CATEGORIES
  ========================================================= */

  const fetchCategories = async () => {
    try {
      setIsRefreshing(true);
      setErrorMessage('');

      const response =
        await getCategories(false);

      console.log(
        'Categories API Response:',
        response
      );

      if (response?.success) {
        let data = [];

        if (Array.isArray(response?.data)) {
          data = response.data;
        } else if (
          Array.isArray(
            response?.data?.content
          )
        ) {
          data =
            response.data.content;
        } else if (
          Array.isArray(
            response?.data?.categories
          )
        ) {
          data =
            response.data.categories;
        }

        setCategories(
          data.map(normalizeCategory)
        );

        setRefreshKey(
          (prev) => prev + 1
        );
      } else {
        setCategories([]);

        setErrorMessage(
          response?.message ||
            'Failed to fetch categories'
        );
      }
    } catch (error) {
      console.error(
        'Categories API Error:',
        error
      );

      setCategories([]);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch categories'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* =========================================================
     ADD CATEGORY
  ========================================================= */

  const openAddPanel = () => {
    clearMessages();

    setEditingCategory(null);

    setFormData({
      id: '',
      name: '',
      slug: '',
      description: '',
      displayOrder: 1,
      imageUrl: '',
      status: 'Active'
    });

    setIsPanelOpen(true);
  };

  /* =========================================================
     EDIT CATEGORY
  ========================================================= */

  const openEditPanel = async (category) => {
    clearMessages();

    const categoryId =
      getCategoryId(category);

    if (!categoryId) {
      setErrorMessage(
        'Category ID not found'
      );
      return;
    }

    try {
      setEditingCategory(categoryId);
      setIsPanelOpen(true);

      const response =
        await getCategoryById(categoryId);

      console.log(
        'Category Details API Response:',
        response
      );

      if (!response?.success) {
        setErrorMessage(
          response?.message ||
            'Failed to fetch category details'
        );
        return;
      }

      const categoryData =
        response?.data?.category ||
        response?.data ||
        category;

      setFormData({
        id:
          getCategoryId(
            categoryData
          ),

        name:
          getCategoryName(
            categoryData
          ),

        slug:
          categoryData?.slug ||
          '',

        description:
          getCategoryDescription(
            categoryData
          ),

        displayOrder:
          getDisplayOrder(
            categoryData
          ),

        imageUrl:
          getImageUrl(
            categoryData
          ),

        status:
          getCategoryStatus(
            categoryData
          )
      });
    } catch (error) {
      console.error(
        'Category Details Error:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch category details'
      );
    }
  };

  /* =========================================================
     TOGGLE STATUS
  ========================================================= */

  const handleToggleStatus = async (
    category
  ) => {
    clearMessages();

    const categoryId =
      getCategoryId(category);

    if (!categoryId) {
      setErrorMessage(
        'Category ID not found'
      );
      return;
    }

    try {
      setIsRefreshing(true);

      const isActive =
        getCategoryStatus(category) ===
        'Active';

      const response = isActive
        ? await deactivateCategory(
            categoryId
          )
        : await activateCategory(
            categoryId
          );

      if (response?.success) {
        setSuccessMessage(
          isActive
            ? 'Category deactivated successfully'
            : 'Category activated successfully'
        );

        await fetchCategories();
      } else {
        setErrorMessage(
          response?.message ||
            'Failed to update category status'
        );
      }
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update category status'
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  /* =========================================================
     DELETE / DEACTIVATE
  ========================================================= */

  const handleDelete = async (
    category
  ) => {
    clearMessages();

    const categoryId =
      getCategoryId(category);

    if (!categoryId) {
      setErrorMessage(
        'Category ID not found'
      );
      return;
    }

    if (
      getCategoryStatus(category) ===
      'Inactive'
    ) {
      setErrorMessage(
        'Category is already inactive'
      );
      return;
    }

    try {
      setIsRefreshing(true);

      const response =
        await deactivateCategory(
          categoryId
        );

      if (response?.success) {
        setSuccessMessage(
          'Category deactivated successfully'
        );

        await fetchCategories();
      } else {
        setErrorMessage(
          response?.message ||
            'Failed to deactivate category'
        );
      }
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to deactivate category'
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  /* =========================================================
     SAVE CATEGORY
  ========================================================= */

  const handleSave = async (e) => {
    e.preventDefault();

    clearMessages();
    setSaving(true);

    try {
      const payload = {
        name:
          formData.name.trim(),

        description:
          formData.description.trim(),

        displayOrder:
          Number(
            formData.displayOrder
          ) || 1
      };

      if (
        formData.slug.trim()
      ) {
        payload.slug =
          formData.slug.trim();
      }

      if (
        formData.imageUrl.trim()
      ) {
        payload.imageUrl =
          formData.imageUrl.trim();
      }

      let response;

      if (editingCategory) {
        response =
          await updateCategory(
            editingCategory,
            payload
          );
      } else {
        response =
          await createCategory(
            payload
          );
      }

      console.log(
        'Save Category Response:',
        response
      );

      if (!response?.success) {
        setErrorMessage(
          response?.message ||
            'Failed to save category'
        );
        return;
      }

      if (editingCategory) {
        const existingCategory =
          categories.find(
            (category) =>
              String(
                getCategoryId(
                  category
                )
              ) ===
              String(
                editingCategory
              )
          );

        const oldStatus =
          getCategoryStatus(
            existingCategory
          );

        const newStatus =
          formData.status;

        if (
          oldStatus !== newStatus
        ) {
          if (
            newStatus ===
            'Active'
          ) {
            await activateCategory(
              editingCategory
            );
          } else {
            await deactivateCategory(
              editingCategory
            );
          }
        }
      }

      setSuccessMessage(
        editingCategory
          ? 'Category updated successfully'
          : 'Category created successfully'
      );

      setIsPanelOpen(false);
      setEditingCategory(null);

      await fetchCategories();
    } catch (error) {
      console.error(
        'Save Category Error:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to save category'
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredCategories =
    categories.filter((cat) => {
      const name =
        getCategoryName(
          cat
        ).toLowerCase();

      const description =
        getCategoryDescription(
          cat
        ).toLowerCase();

      const query =
        searchQuery.toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        description.includes(query);

      const matchesStatus =
        statusFilter === 'All' ||
        getCategoryStatus(cat) ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  /* =========================================================
     STATS
  ========================================================= */

  const activeCategories =
    categories.filter(
      (category) =>
        getCategoryStatus(
          category
        ) === 'Active'
    );

  const inactiveCategories =
    categories.filter(
      (category) =>
        getCategoryStatus(
          category
        ) === 'Inactive'
    );

  const totalProducts =
    categories.reduce(
      (acc, category) =>
        acc +
        Number(
          getProductsCount(
            category
          ) || 0
        ),
      0
    );

  const categoryStats = [
    {
      label: 'Total Categories',
      value: `${categories.length}`,
      change: '+12.4%',
      up: true,
      accentColor:
        'bg-emerald-600',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: FolderTree,
      suffix: ' Categories'
    },

    {
      label: 'Active Categories',
      value: `${activeCategories.length}`,
      change: '+8.2%',
      up: true,
      accentColor:
        'bg-teal-600',
      iconBg:
        'bg-teal-50 text-teal-700',
      tagColor:
        'text-teal-700 bg-teal-50/80 border-teal-200/80',
      icon: CheckCircle2,
      suffix: ' Active'
    },

    {
      label: 'Inactive Categories',
      value: `${inactiveCategories.length}`,
      change: '-4.1%',
      up: false,
      accentColor:
        'bg-emerald-500',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-rose-700 bg-rose-50/80 border-rose-200/80',
      icon: FolderTree,
      suffix: ' Inactive'
    },

    {
      label: 'Assigned Products',
      value: `${totalProducts}`,
      change: '+15.5%',
      up: true,
      accentColor:
        'bg-green-700',
      iconBg:
        'bg-green-50 text-green-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Package,
      suffix: ' Products'
    }
  ];

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">

      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">

        {/* =====================================================
            HEADER - SAME AS CUSTOMER DIRECTORY
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

          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />

          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 z-10">

            <div className="flex flex-wrap items-center gap-2.5">

              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm backdrop-blur-md">

                <Zap
                  size={12}
                  className="text-emerald-400 animate-bounce"
                />

                Category Management Directory

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

              Category Directory

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

              New Category

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
              onClick={fetchCategories}
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

        {/* =====================================================
            MESSAGES
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
              className={`px-5 py-3.5 rounded-2xl border text-xs font-semibold ${
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
            STATS GRID - SAME AS CUSTOMER DIRECTORY
        ===================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

          {categoryStats.map(
            (stat, idx) => {
              const IconComponent =
                stat.icon;

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
                        <IconComponent
                          size={18}
                        />
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
                            value={
                              stat.value
                            }
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
                          className="text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      ) : (
                        <ArrowDownRight
                          size={13}
                          className="text-rose-600 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"
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
            }
          )}

        </section>

        {/* =====================================================
            FULL WIDTH CATEGORY TABLE
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

            <div>

              {/* TABLE HEADER */}

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
                      Product category management directory
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-2 flex-wrap">

                  {/* SEARCH */}

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
                        setSearchQuery(
                          e.target.value
                        )
                      }
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />

                  </div>

                  {/* FILTER */}

                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5">

                    <Filter
                      size={13}
                      className="text-slate-400 ml-2"
                    />

                    {[
                      'All',
                      'Active',
                      'Inactive'
                    ].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() =>
                            setStatusFilter(
                              status
                            )
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                            statusFilter ===
                            status
                              ? 'bg-white text-emerald-700 shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {status}
                        </button>
                      )
                    )}

                  </div>

                </div>

              </div>

              {/* =================================================
                  DESKTOP TABLE
              ================================================= */}

              <div className="hidden md:block overflow-x-auto">

                <table className="w-full text-left border-collapse">

                  <thead>

                    <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">

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
                        Products
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
                          colSpan="6"
                          className="py-12 text-center text-xs font-semibold text-slate-400"
                        >
                          Loading categories...
                        </td>

                      </tr>
                    ) : filteredCategories.length >
                      0 ? (
                      filteredCategories.map(
                        (category, idx) => {

                          const categoryId =
                            getCategoryId(
                              category
                            );

                          const status =
                            getCategoryStatus(
                              category
                            );

                          const imageUrl =
                            getImageUrl(
                              category
                            );

                          return (
                            <motion.tr
                              key={categoryId}
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

                              {/* CATEGORY */}

                              <td className="py-3.5 px-4">

                                <div className="flex items-center gap-3">

                                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 overflow-hidden flex items-center justify-center shrink-0 group-hover:border-emerald-300 transition-colors">

                                    {imageUrl ? (
                                      <img
                                        src={
                                          imageUrl
                                        }
                                        alt={getCategoryName(
                                          category
                                        )}
                                        className="w-full h-full object-cover"
                                        onError={(
                                          e
                                        ) => {
                                          e.currentTarget.style.display =
                                            'none';

                                          e.currentTarget.parentElement
                                            .querySelector(
                                              '[data-fallback]'
                                            )
                                            ?.classList.remove(
                                              'hidden'
                                            );
                                        }}
                                      />
                                    ) : null}

                                    <FolderTree
                                      data-fallback
                                      size={
                                        17
                                      }
                                      className={
                                        imageUrl
                                          ? 'hidden text-emerald-600'
                                          : 'text-emerald-600'
                                      }
                                    />

                                  </div>

                                  <div className="flex flex-col">

                                    <span className="font-semibold text-black group-hover:text-emerald-700 transition-colors">
                                      {getCategoryName(
                                        category
                                      )}
                                    </span>

                                    <span className="text-[10px] text-slate-500 font-mono">
                                      {categoryId ||
                                        'CATEGORY'}
                                    </span>

                                  </div>

                                </div>

                              </td>

                              {/* DESCRIPTION */}

                              <td className="py-3.5 px-4">

                                <span className="text-[10px] text-slate-500 font-semibold line-clamp-2 max-w-[280px]">
                                  {getCategoryDescription(
                                    category
                                  ) ||
                                    'No description available'}
                                </span>

                              </td>

                              {/* DISPLAY ORDER */}

                              <td className="py-3.5 px-4 text-center font-mono text-black">
                                {getDisplayOrder(
                                  category
                                )}
                              </td>

                              {/* PRODUCTS */}

                              <td className="py-3.5 px-4 text-center">

                                <span className="inline-flex items-center gap-1.5 font-mono text-emerald-700 font-semibold">

                                  <Package
                                    size={
                                      13
                                    }
                                  />

                                  {getProductsCount(
                                    category
                                  )}

                                </span>

                              </td>

                              {/* STATUS */}

                              <td className="py-3.5 px-4 text-center">

                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all duration-300 group-hover:scale-105 ${
                                    status ===
                                    'Active'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                      : 'bg-slate-100 text-slate-600 border-slate-200/80'
                                  }`}
                                >

                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      status ===
                                      'Active'
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-400'
                                    }`}
                                  />

                                  {status}

                                </span>

                              </td>

                              {/* ACTIONS */}

                              <td className="py-3.5 px-4 text-right">

                                <div className="flex items-center justify-end gap-1">

                                  <button
                                    onClick={() =>
                                      setSelectedCategory(
                                        category
                                      )
                                    }
                                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="View Info"
                                  >
                                    <Eye
                                      size={
                                        15
                                      }
                                    />
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleToggleStatus(
                                        category
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

                                  <button
                                    onClick={() =>
                                      openEditPanel(
                                        category
                                      )
                                    }
                                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit3
                                      size={
                                        15
                                      }
                                    />
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleDelete(
                                        category
                                      )
                                    }
                                    disabled={
                                      isRefreshing ||
                                      status ===
                                        'Inactive'
                                    }
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-40"
                                    title="Deactivate"
                                  >
                                    <Trash2
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
                          colSpan="6"
                          className="py-12 text-center"
                        >

                          <FolderTree
                            size={35}
                            className="mx-auto text-slate-300 mb-3"
                          />

                          <p className="text-xs font-semibold text-slate-400">
                            No matching category profiles found.
                          </p>

                        </td>

                      </tr>
                    )}

                  </tbody>

                </table>

              </div>

              {/* =================================================
                  MOBILE CARD VIEW
              ================================================= */}

              <div className="md:hidden space-y-3">

                {loading ? (
                  <div className="py-10 text-center text-xs font-semibold text-slate-400">
                    Loading categories...
                  </div>
                ) : filteredCategories.length >
                  0 ? (
                  filteredCategories.map(
                    (category) => {

                      const status =
                        getCategoryStatus(
                          category
                        );

                      return (
                        <motion.div
                          key={getCategoryId(
                            category
                          )}
                          whileHover={{
                            scale: 1.01
                          }}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group"
                        >

                          <div className="flex items-center justify-between">

                            <div className="flex items-center gap-2">

                              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                <FolderTree
                                  size={
                                    16
                                  }
                                />
                              </div>

                              <div>

                                <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700 transition-colors">
                                  {getCategoryName(
                                    category
                                  )}
                                </h4>

                                <p className="text-[10px] font-mono text-slate-400">
                                  {getCategoryId(
                                    category
                                  )}
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

                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  status ===
                                  'Active'
                                    ? 'bg-emerald-500'
                                    : 'bg-slate-400'
                                }`}
                              />

                              {status}

                            </span>

                          </div>

                          <p className="text-xs text-slate-500">
                            {getCategoryDescription(
                              category
                            ) ||
                              'No description available'}
                          </p>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">

                            <div>

                              <span className="text-[10px] uppercase font-semibold text-black block">
                                Display Order
                              </span>

                              <span className="font-mono font-semibold text-black">
                                {getDisplayOrder(
                                  category
                                )}
                              </span>

                            </div>

                            <div>

                              <span className="text-[10px] uppercase font-semibold text-black block">
                                Products
                              </span>

                              <span className="font-mono font-semibold text-emerald-700">
                                {getProductsCount(
                                  category
                                )}
                              </span>

                            </div>

                          </div>

                          <div className="flex justify-end gap-1 pt-2">

                            <button
                              onClick={() =>
                                setSelectedCategory(
                                  category
                                )
                              }
                              className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                            >
                              <Eye
                                size={
                                  15
                                }
                              />
                            </button>

                            <button
                              onClick={() =>
                                openEditPanel(
                                  category
                                )
                              }
                              className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
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
                                  category
                                )
                              }
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                            >
                              <Power
                                size={
                                  15
                                }
                              />
                            </button>

                          </div>

                        </motion.div>
                      );
                    }
                  )
                ) : (
                  <div className="py-10 text-center">

                    <FolderTree
                      size={35}
                      className="mx-auto text-slate-300 mb-3"
                    />

                    <p className="text-xs font-semibold text-slate-400">
                      No categories found.
                    </p>

                  </div>
                )}

              </div>

            </div>

          </motion.div>

        </section>

      </main>

      {/* =====================================================
          CATEGORY DETAIL MODAL
      ===================================================== */}

      <AnimatePresence>

        {selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">

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
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 relative"
            >

              <button
                onClick={() =>
                  setSelectedCategory(
                    null
                  )
                }
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5 mb-6">

                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-2xl flex items-center justify-center">
                  <FolderTree
                    size={21}
                  />
                </div>

                <div>

                  <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                    {getCategoryId(
                      selectedCategory
                    )}
                  </span>

                  <h3 className="text-lg font-bold text-black">
                    {getCategoryName(
                      selectedCategory
                    )}
                  </h3>

                </div>

              </div>

              <div className="space-y-3">

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                      <Package
                        size={16}
                      />
                    </div>

                    <span className="text-xs font-semibold text-black">
                      Assigned Products
                    </span>

                  </div>

                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {getProductsCount(
                      selectedCategory
                    )}
                  </span>

                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                      <FolderTree
                        size={16}
                      />
                    </div>

                    <span className="text-xs font-semibold text-black">
                      Display Order
                    </span>

                  </div>

                  <span className="font-mono font-bold text-black text-sm">
                    {getDisplayOrder(
                      selectedCategory
                    )}
                  </span>

                </div>

              </div>

              <div className="mt-5">

                <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-1">
                  Description
                </span>

                <p className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl p-4 leading-relaxed">
                  {getCategoryDescription(
                    selectedCategory
                  ) ||
                    'No description available'}
                </p>

              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">

                <span className="text-[10px] font-bold text-black uppercase tracking-wider">
                  Status
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                    getCategoryStatus(
                      selectedCategory
                    ) === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >

                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      getCategoryStatus(
                        selectedCategory
                      ) === 'Active'
                        ? 'bg-emerald-500'
                        : 'bg-slate-400'
                    }`}
                  />

                  {getCategoryStatus(
                    selectedCategory
                  )}

                </span>

              </div>

            </motion.div>

          </div>
        )}

      </AnimatePresence>

      {/* =====================================================
          CREATE / UPDATE CATEGORY MODAL
      ===================================================== */}

      <AnimatePresence>

        {isPanelOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">

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
            >

              <button
                onClick={() => {
                  setIsPanelOpen(false);
                  setEditingCategory(
                    null
                  );
                }}
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5 mb-6">

                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-2xl flex items-center justify-center">
                  {editingCategory ? (
                    <Edit3
                      size={20}
                    />
                  ) : (
                    <Plus
                      size={20}
                    />
                  )}
                </div>

                <div>

                  <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                    Category Management
                  </span>

                  <h3 className="text-lg font-bold text-black">
                    {editingCategory
                      ? 'Update Category'
                      : 'Create Category'}
                  </h3>

                </div>

              </div>

              <form
                onSubmit={handleSave}
                className="space-y-4"
              >

                {/* NAME */}

                <div>

                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Category Name
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="e.g. Vegetables"
                    value={
                      formData.name
                    }
                    onChange={(e) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          name:
                            e.target
                              .value,
                          slug:
                            e.target.value
                              .toLowerCase()
                              .trim()
                              .replace(
                                /\s+/g,
                                '-'
                              )
                        })
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />

                </div>

                {/* SLUG */}

                <div>

                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Slug
                  </label>

                  <input
                    type="text"
                    placeholder="vegetables"
                    value={
                      formData.slug
                    }
                    onChange={(e) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          slug:
                            e.target
                              .value
                        })
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />

                </div>

                {/* DISPLAY ORDER */}

                <div>

                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      formData.displayOrder
                    }
                    onChange={(e) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          displayOrder:
                            e.target
                              .value
                        })
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />

                </div>

                {/* IMAGE URL */}

                <div>

                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Image URL
                  </label>

                  <input
                    type="text"
                    placeholder="https://example.com/image.png"
                    value={
                      formData.imageUrl
                    }
                    onChange={(e) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          imageUrl:
                            e.target
                              .value
                        })
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />

                </div>

                {/* STATUS */}

                <div>

                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Status
                  </label>

                  <select
                    value={
                      formData.status
                    }
                    onChange={(e) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          status:
                            e.target
                              .value
                        })
                      )
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

                {/* DESCRIPTION */}

                <div>

                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Description
                  </label>

                  <textarea
                    rows="4"
                    placeholder="Provide short category information..."
                    value={
                      formData.description
                    }
                    onChange={(e) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          description:
                            e.target
                              .value
                        })
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
                  />

                </div>

                {/* BUTTONS */}

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">

                  <button
                    type="button"
                    onClick={() => {
                      setIsPanelOpen(
                        false
                      );
                      setEditingCategory(
                        null
                      );
                    }}
                    disabled={saving}
                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      !formData.name.trim()
                    }
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm transition-colors"
                  >

                    {saving ? (
                      <RefreshCw
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <Save
                        size={14}
                      />
                    )}

                    {saving
                      ? 'Saving...'
                      : editingCategory
                      ? 'Update Category'
                      : 'Create Category'}

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