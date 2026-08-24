import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

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
  Package
} from 'lucide-react';

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
    const isDecimal = rawNumberStr.includes('.');
    const hasComma = match[1].includes(',');

    const duration = 700;
    const startTime = performance.now();
    let animationFrameId;

    const updateCount = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress =
        progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const currentVal = easeProgress * targetNum;

      let formatted = isDecimal
        ? currentVal.toFixed(2)
        : Math.floor(currentVal).toString();

      if (hasComma) {
        const parts = formatted.split('.');
        parts[0] = parseInt(parts[0], 10).toLocaleString('en-IN');
        formatted = parts.join('.');
      }

      setDisplayValue(
        `${formatted}${suffix ? ` ${suffix}` : ''}`
      );

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(stringValue);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{displayValue}</span>;
}

export default function Categories() {
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    displayOrder: 1,
    imageUrl: '',
    status: 'Active'
  });

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
    description: getCategoryDescription(category),
    displayOrder: getDisplayOrder(category),
    imageUrl: getImageUrl(category),
    productsCount: getProductsCount(category),
    status: getCategoryStatus(category)
  });

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const fetchCategories = async () => {
    try {
      setIsRefreshing(true);
      setErrorMessage('');

      const response = await getCategories(false);

      console.log('Categories API Response:', response);

      if (response?.success) {
        let data = [];

        if (Array.isArray(response?.data)) {
          data = response.data;
        } else if (Array.isArray(response?.data?.content)) {
          data = response.data.content;
        } else if (Array.isArray(response?.data?.categories)) {
          data = response.data.categories;
        }

        setCategories(data.map(normalizeCategory));
      } else {
        setCategories([]);
        setErrorMessage(
          response?.message || 'Failed to fetch categories'
        );
      }
    } catch (error) {
      console.error('Categories API Error:', error);

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

  const openEditPanel = async (category) => {
    clearMessages();

    const categoryId = getCategoryId(category);

    if (!categoryId) {
      setErrorMessage('Category ID not found');
      return;
    }

    try {
      setEditingCategory(categoryId);
      setIsPanelOpen(true);

      const response = await getCategoryById(categoryId);

      console.log('Category Details API Response:', response);

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
        id: getCategoryId(categoryData),
        name: getCategoryName(categoryData),
        slug: categoryData?.slug || '',
        description: getCategoryDescription(categoryData),
        displayOrder: getDisplayOrder(categoryData),
        imageUrl: getImageUrl(categoryData),
        status: getCategoryStatus(categoryData)
      });
    } catch (error) {
      console.error('Category Details Error:', error);

      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch category details'
      );
    }
  };

  const handleToggleStatus = async (category) => {
    clearMessages();

    const categoryId = getCategoryId(category);

    if (!categoryId) {
      setErrorMessage('Category ID not found');
      return;
    }

    try {
      setIsRefreshing(true);

      const isActive =
        getCategoryStatus(category) === 'Active';

      const response = isActive
        ? await deactivateCategory(categoryId)
        : await activateCategory(categoryId);

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

  const handleDelete = async (category) => {
    clearMessages();

    const categoryId = getCategoryId(category);

    if (!categoryId) {
      setErrorMessage('Category ID not found');
      return;
    }

    if (getCategoryStatus(category) === 'Inactive') {
      setErrorMessage('Category is already inactive');
      return;
    }

    try {
      setIsRefreshing(true);

      const response =
        await deactivateCategory(categoryId);

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

  const handleSave = async (e) => {
    e.preventDefault();

    clearMessages();
    setSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        displayOrder: Number(formData.displayOrder) || 1
      };

      if (formData.slug.trim()) {
        payload.slug = formData.slug.trim();
      }

      if (formData.imageUrl.trim()) {
        payload.imageUrl = formData.imageUrl.trim();
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

      console.log('Save Category Response:', response);

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
              String(getCategoryId(category)) ===
              String(editingCategory)
          );

        const oldStatus =
          getCategoryStatus(existingCategory);

        const newStatus = formData.status;

        if (oldStatus !== newStatus) {
          if (newStatus === 'Active') {
            await activateCategory(editingCategory);
          } else {
            await deactivateCategory(editingCategory);
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
      console.error('Save Category Error:', error);

      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to save category'
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const name =
      getCategoryName(cat).toLowerCase();

    const description =
      getCategoryDescription(cat).toLowerCase();

    const query =
      searchQuery.toLowerCase();

    const matchesSearch =
      name.includes(query) ||
      description.includes(query);

    const matchesStatus =
      statusFilter === 'All' ||
      getCategoryStatus(cat) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCategories =
    categories.filter(
      (category) =>
        getCategoryStatus(category) === 'Active'
    );

  const totalProducts =
    categories.reduce(
      (acc, category) =>
        acc + Number(getProductsCount(category) || 0),
      0
    );

  const categoryStats = [
    {
      label: 'Total Categories',
      value: `${categories.length} Categories`,
      cardBg:
        'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent',
      cardBorder: 'border-emerald-500/20',
      iconBg:
        'bg-emerald-500/15 text-emerald-700',
      icon: FolderTree
    },
    {
      label: 'Active Categories',
      value: `${activeCategories.length} Active`,
      cardBg:
        'bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-transparent',
      cardBorder: 'border-teal-500/20',
      iconBg:
        'bg-teal-500/15 text-teal-700',
      icon: CheckCircle2
    },
    {
      label: 'Inactive Categories',
      value: `${categories.length - activeCategories.length} Inactive`,
      cardBg:
        'bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent',
      cardBorder: 'border-amber-500/20',
      iconBg:
        'bg-amber-500/15 text-amber-700',
      icon: FolderTree
    },
    {
      label: 'Assigned Products',
      value: `${totalProducts} Products`,
      cardBg:
        'bg-gradient-to-br from-green-600/10 via-green-500/5 to-transparent',
      cardBorder: 'border-green-600/20',
      iconBg:
        'bg-green-600/15 text-green-700',
      icon: Package
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/10 to-teal-50/20 flex font-sans antialiased text-slate-800">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto max-h-screen">
        <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-lg overflow-hidden border border-emerald-700/30">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />

          <div className="space-y-4 z-10 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-100 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15">
                Taxonomy Catalog
              </span>

              <div className="flex items-center gap-3 bg-rose-950/60 backdrop-blur-md border border-rose-500/30 px-3.5 py-1.5 rounded-full text-rose-300 max-w-[190px] overflow-hidden">
                <span className="relative flex h-3.5 w-3.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border border-white/20" />
                </span>

                <div className="overflow-hidden whitespace-nowrap text-[11px] font-black uppercase tracking-widest text-white w-full">
                  <marquee scrollamount="3.5">
                    LIVE ADMIN VEG GO
                  </marquee>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Manage Categories
            </h1>
          </div>

          <div className="flex items-center gap-3 z-10">
            <button
              onClick={openAddPanel}
              className="px-5 py-3 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-2xl flex items-center gap-2 text-xs font-bold border border-white/10 transition-all active:scale-95"
            >
              <Plus size={16} />
              New Category
            </button>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm text-sm font-bold text-emerald-50">
              <Calendar
                size={16}
                className="text-emerald-300"
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

            <button
              onClick={fetchCategories}
              disabled={isRefreshing}
              className="p-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl hover:bg-white/20 transition-all text-white disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={`text-emerald-300 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>
        </header>

        {(errorMessage || successMessage) && (
          <div
            className={`mb-6 px-5 py-4 rounded-2xl border text-sm font-semibold ${
              errorMessage
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {errorMessage || successMessage}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {categoryStats.map((stat, idx) => {
            const IconComponent = stat.icon;

            return (
              <div
                key={idx}
                className={`${stat.cardBg} ${stat.cardBorder} p-6 rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between`}
              >
                <div>
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </p>

                  <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                    {loading ? (
                      <span className="text-slate-300 animate-pulse">
                        ...
                      </span>
                    ) : (
                      <AnimatedValue value={stat.value} />
                    )}
                  </h3>
                </div>

                <div
                  className={`${stat.iconBg} p-4 rounded-2xl border border-white/10 shadow-sm`}
                >
                  <IconComponent size={22} />
                </div>
              </div>
            );
          })}
        </section>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <section className="flex-1 bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-3.5 top-3.5 text-slate-400"
                  size={16}
                />

                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-700"
                />
              </div>

              <div className="flex items-center gap-3">
                <Filter
                  size={16}
                  className="text-slate-400"
                />

                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {['All', 'Active', 'Inactive'].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() =>
                          setStatusFilter(status)
                        }
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          statusFilter === status
                            ? 'bg-white text-emerald-800 shadow-sm'
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

            {loading ? (
              <div className="py-16 text-center text-sm font-semibold text-slate-400">
                Loading categories...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="py-16 text-center">
                <FolderTree
                  size={40}
                  className="mx-auto text-slate-300 mb-3"
                />

                <p className="text-sm font-bold text-slate-500">
                  No categories found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase font-bold tracking-widest text-slate-400">
                      <th className="pb-4 pl-2">
                        Category
                      </th>

                      <th className="pb-4">
                        Description
                      </th>

                      <th className="pb-4 text-center">
                        Display Order
                      </th>

                      <th className="pb-4 text-center">
                        Products
                      </th>

                      <th className="pb-4">
                        Status
                      </th>

                      <th className="pb-4 text-right pr-2">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100/60">
                    {filteredCategories.map((cat) => {
                      const categoryId =
                        getCategoryId(cat);

                      const status =
                        getCategoryStatus(cat);

                      const imageUrl =
                        getImageUrl(cat);

                      return (
                        <tr
                          key={categoryId}
                          className="text-sm font-semibold text-slate-600 hover:bg-emerald-50/20 transition-colors"
                        >
                          <td className="py-5 pl-2">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={getCategoryName(cat)}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
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
                                  size={19}
                                  className={
                                    imageUrl
                                      ? 'hidden text-slate-400'
                                      : 'text-slate-400'
                                  }
                                />
                              </div>

                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {getCategoryName(cat)}
                                </span>

                                <span className="text-[10px] text-slate-400 font-semibold">
                                  Category
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-5">
                            <span className="text-xs text-slate-500 font-normal line-clamp-2 max-w-[280px]">
                              {getCategoryDescription(cat) ||
                                'No description available'}
                            </span>
                          </td>

                          <td className="py-5 text-center font-bold text-slate-700">
                            {getDisplayOrder(cat)}
                          </td>

                          <td className="py-5 text-center font-bold text-slate-900">
                            {getProductsCount(cat)}
                          </td>

                          <td className="py-5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'
                                  : 'bg-slate-50 text-slate-500 border border-slate-100'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  status === 'Active'
                                    ? 'bg-emerald-500'
                                    : 'bg-slate-400'
                                }`}
                              />

                              {status}
                            </span>
                          </td>

                          <td className="py-5 text-right pr-2">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() =>
                                  handleToggleStatus(cat)
                                }
                                disabled={isRefreshing}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-colors disabled:opacity-50"
                                title={
                                  status === 'Active'
                                    ? 'Deactivate'
                                    : 'Activate'
                                }
                              >
                                <Power size={15} />
                              </button>

                              <button
                                onClick={() =>
                                  openEditPanel(cat)
                                }
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Edit"
                              >
                                <Edit3 size={15} />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(cat)
                                }
                                disabled={
                                  isRefreshing ||
                                  status === 'Inactive'
                                }
                                className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-40"
                                title="Deactivate"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {isPanelOpen && (
            <aside className="w-full lg:w-96 bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8 shrink-0">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <h3 className="text-lg font-black text-slate-900">
                  {editingCategory
                    ? 'Update Category'
                    : 'Create Category'}
                </h3>

                <button
                  onClick={() => {
                    setIsPanelOpen(false);
                    setEditingCategory(null);
                  }}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleSave}
                className="space-y-5"
              >
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Name
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="e.g. Vegetables"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                        slug: e.target.value
                          .toLowerCase()
                          .trim()
                          .replace(/\s+/g, '-')
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Slug
                  </label>

                  <input
                    type="text"
                    placeholder="vegetables"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        slug: e.target.value
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Display Order
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        displayOrder: e.target.value
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Image URL
                  </label>

                  <input
                    type="text"
                    placeholder="https://example.com/image.png"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        imageUrl: e.target.value
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-700 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-700 font-bold"
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
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Description
                  </label>

                  <textarea
                    rows="4"
                    placeholder="Provide short category information..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-700 font-medium leading-relaxed resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPanelOpen(false);
                      setEditingCategory(null);
                    }}
                    disabled={saving}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      !formData.name.trim()
                    }
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm transition-colors"
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
                      : editingCategory
                        ? 'Update Category'
                        : 'Create Category'}
                  </button>
                </div>
              </form>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}