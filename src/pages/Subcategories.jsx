import React, { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Calendar,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit3,
  Eye,
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
  Image as ImageIcon,
  ChevronDown,
  Check
} from 'lucide-react';

import {
  getSubcategories,
  createSubcategory,
  getSubcategoryById,
  updateSubcategory,
  deactivateSubcategory,
  activateSubcategory
} from '../Api/catalogService/subcategoryService';

import { getCategories } from '../Api/catalogService/productService';

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
        progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setDisplayValue(
        Math.floor(easeProgress * targetNum).toLocaleString('en-IN')
      );

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(targetNum.toLocaleString('en-IN'));
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

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    fallback
  );
};

const getValue = (obj, keys, fallback = '') => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) {
      return obj[key];
    }
  }

  return fallback;
};

const normalizeCategory = (category) => ({
  ...category,
  id: getValue(category, ['id', 'categoryId', '_id'], ''),
  name: getValue(category, ['name', 'categoryName', 'title'], '')
});

const extractCategories = (response) => {
  const root = response?.data;

  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.content)) return root.content;
  if (Array.isArray(root?.categories)) return root.categories;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(response?.categories)) return response.categories;
  if (Array.isArray(response?.items)) return response.items;

  return [];
};

const normalizeSubcategory = (item, category = {}) => {
  const source = item?.subcategory || item?.data || item || {};

  return {
    ...source,
    id: getValue(
      source,
      ['id', 'subcategoryId', '_id'],
      getValue(item, ['id', 'subcategoryId', '_id'], '')
    ),
    name: getValue(
      source,
      ['name', 'subcategoryName', 'title'],
      getValue(item, ['name', 'subcategoryName', 'title'], '')
    ),
    categoryId: getValue(
      source,
      ['categoryId', 'parentCategoryId'],
      getValue(item, ['categoryId', 'parentCategoryId'], category.id || '')
    ),
    categoryName: getValue(
      source,
      ['categoryName', 'parentCategoryName'],
      getValue(
        item,
        ['categoryName', 'parentCategoryName'],
        category.name || ''
      )
    ),
    description: getValue(
      source,
      ['description', 'subcategoryDescription'],
      getValue(item, ['description', 'subcategoryDescription'], '')
    ),
    displayOrder: getValue(
      source,
      ['displayOrder', 'sortOrder', 'order'],
      getValue(item, ['displayOrder', 'sortOrder', 'order'], 1)
    ),
    active:
      source?.active !== undefined
        ? source.active
        : item?.active !== undefined
        ? item.active
        : true,
    imageUrl: getValue(
      source,
      ['imageUrl', 'image'],
      getValue(item, ['imageUrl', 'image'], '')
    )
  };
};

function CategorySelect({
  value,
  options,
  placeholder,
  onChange,
  disabled = false,
  loading = false
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find(
    (option) => String(option.id) === String(value)
  );

  useEffect(() => {
    if (!open) {
      setSearchTerm(selectedOption ? selectedOption.name : '');
    }
  }, [open, value, options]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
        setSearchTerm(selectedOption ? selectedOption.name : '');
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [selectedOption]);

  const filteredOptions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return options;

    return options.filter((option) =>
      String(option.name || '').toLowerCase().includes(query)
    );
  }, [options, searchTerm]);

  const handleFocus = () => {
    if (disabled || loading) return;

    setOpen(true);
    setSearchTerm('');
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);

    if (!open) {
      setOpen(true);
    }
  };

  const handleSelect = (option) => {
    onChange(option);
    setSearchTerm(option?.name || '');
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div
        className={`w-full h-[38px] px-3.5 bg-slate-50 border rounded-xl flex items-center gap-2 transition-all ${
          open
            ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/10'
            : 'border-slate-200 hover:border-emerald-300'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <Search size={14} className="text-emerald-600 shrink-0" />

        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={loading ? 'Loading...' : searchTerm}
          onFocus={handleFocus}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent text-xs font-bold text-black placeholder:text-slate-400 placeholder:font-semibold focus:outline-none disabled:cursor-not-allowed"
        />

        {loading ? (
          <Loader2 size={14} className="animate-spin text-emerald-600 shrink-0" />
        ) : (
          <ChevronDown
            size={15}
            className={`text-emerald-600 transition-transform duration-200 shrink-0 ${
              open ? 'rotate-180' : ''
            }`}
          />
        )}
      </div>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-[90] max-h-56 sm:max-h-60 overflow-y-auto rounded-xl border border-emerald-200 bg-white shadow-xl shadow-slate-900/10 p-1.5"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const selected = String(option.id) === String(value);

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-all ${
                      selected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <span className="truncate">{option.name}</span>

                    {selected && <Check size={14} className="shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-xs font-semibold text-slate-400 text-center">
                {searchTerm
                  ? `No category matches "${searchTerm}"`
                  : 'No categories available'}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Subcategories() {
  const [currentTab, setCurrentTab] = useState('subcategories');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilterId, setCategoryFilterId] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  // true = read-only "View" panel opened from the listing, false = normal edit
  const [isViewMode, setIsViewMode] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    categoryId: '',
    categoryName: '',
    description: '',
    displayOrder: 1,
    status: 'Active',
    imageFile: null,
    imageUrl: ''
  });

  const fetchCategoriesList = async () => {
    setCategoriesLoading(true);

    try {
      const response = await getCategories();

      const list = extractCategories(response).map(normalizeCategory);

      setCategories(list);

      return list;
    } catch (error) {
      console.error('Failed to fetch categories:', error);

      setErrorMessage(getErrorMessage(error, 'Failed to load categories'));

      return [];
    } finally {
      setCategoriesLoading(false);
    }
  };

  // NOTE: the backend's GET /subcategories endpoint 500s when called
  // without a categoryId (confirmed via Network tab), so a single
  // "fetch everything" call isn't possible here. We fetch per category
  // and merge/dedupe the results.
  const fetchSubcategories = async (categoryList) => {
    const list =
      Array.isArray(categoryList) && categoryList.length > 0
        ? categoryList
        : categories;

    setIsRefreshing(true);
    setErrorMessage('');

    if (!list.length) {
      setSubcategories([]);
      setLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const results = await Promise.all(
        list.map(async (category) => {
          try {
            const response = await getSubcategories({
              categoryId: category.id
            });

            let items = [];

            if (response?.success) {
              if (Array.isArray(response?.data)) {
                items = response.data;
              } else if (Array.isArray(response?.data?.content)) {
                items = response.data.content;
              } else if (Array.isArray(response?.data?.items)) {
                items = response.data.items;
              } else if (Array.isArray(response?.data?.subcategories)) {
                items = response.data.subcategories;
              }
            }

            return items.map((item) => normalizeSubcategory(item, category));
          } catch (err) {
            console.error(
              `Failed to fetch subcategories for ${category.name}:`,
              err
            );

            return [];
          }
        })
      );

      const merged = results.flat();

      const unique = Array.from(
        new Map(merged.map((item) => [item.id, item])).values()
      );

      setSubcategories(unique);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);

      setSubcategories([]);

      setErrorMessage(getErrorMessage(error, 'Failed to load subcategories'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const refreshAll = async () => {
    const list = await fetchCategoriesList();

    await fetchSubcategories(list);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleRefresh = () => {
    refreshAll();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      categoryId: '',
      categoryName: '',
      description: '',
      displayOrder: 1,
      status: 'Active',
      imageFile: null,
      imageUrl: ''
    });
  };

  const closePanel = () => {
    if (saving) return;

    if (formData.imageUrl && formData.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formData.imageUrl);
    }

    setIsPanelOpen(false);
    setEditingSubcategory(null);
    setIsViewMode(false);
    resetForm();
  };

  const openAddPanel = async () => {
    setEditingSubcategory(null);
    setIsViewMode(false);
    setErrorMessage('');
    resetForm();
    setIsPanelOpen(true);

    if (categories.length === 0) {
      await fetchCategoriesList();
    }
  };

  const getNextDisplayOrder = (categoryId, excludeId) => {
    if (!categoryId) return 1;

    const maxOrder = subcategories
      .filter(
        (item) =>
          String(item.categoryId) === String(categoryId) &&
          item.id !== excludeId
      )
      .reduce((max, item) => Math.max(max, Number(item.displayOrder) || 0), 0);

    return maxOrder + 1;
  };

  // Shared loader for both "Edit" and read-only "View" — viewOnly=true opens
  // the same panel but disabled, with no Save button.
  const openSubcategoryPanel = async (subcategory, viewOnly = false) => {
    if (!subcategory?.id) return;

    setActionLoading(subcategory.id);
    setErrorMessage('');
    setIsViewMode(viewOnly);

    try {
      const response = await getSubcategoryById(subcategory.id);

      const rawData =
        response?.data?.subcategory ||
        response?.data?.data ||
        response?.data ||
        response?.subcategory ||
        response;

      const data = normalizeSubcategory(rawData, {
        id: subcategory.categoryId,
        name: subcategory.categoryName
      });

      const existingImage =
        data?.imageUrl || subcategory?.imageUrl || subcategory?.image || '';

      const description = getValue(
        rawData,
        ['description', 'subcategoryDescription'],
        getValue(
          response?.data,
          ['description', 'subcategoryDescription'],
          subcategory?.description || ''
        )
      );

      setEditingSubcategory(data?.id || subcategory.id);

      setFormData({
        id: data?.id || subcategory.id || '',
        name: data?.name || subcategory.name || '',
        categoryId: data?.categoryId || subcategory?.categoryId || '',
        categoryName: data?.categoryName || subcategory?.categoryName || '',
        description: description || '',
        displayOrder: data?.displayOrder || subcategory?.displayOrder || 1,
        status: data?.active === true ? 'Active' : 'Inactive',
        imageFile: null,
        imageUrl: existingImage
      });

      setIsPanelOpen(true);

      if (categories.length === 0) {
        await fetchCategoriesList();
      }
    } catch (error) {
      console.error('Failed to fetch subcategory:', error);

      setErrorMessage(
        getErrorMessage(error, 'Failed to fetch subcategory details')
      );
    } finally {
      setActionLoading(null);
    }
  };

  const openEditPanel = (subcategory) => openSubcategoryPanel(subcategory, false);
  const openViewPanel = (subcategory) => openSubcategoryPanel(subcategory, true);

  const handleCategoryChange = (category) => {
    if (isViewMode) return;

    setFormData((prev) => ({
      ...prev,
      categoryId: category?.id || '',
      categoryName: category?.name || '',
      displayOrder: getNextDisplayOrder(category?.id, editingSubcategory)
    }));
  };

  const handleImageChange = (e) => {
    if (isViewMode) return;

    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file');
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 1MB');
      return;
    }

    setErrorMessage('');

    const previewUrl = URL.createObjectURL(file);

    if (formData.imageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(formData.imageUrl);
    }

    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: previewUrl
    }));
  };

  const removeImage = () => {
    if (isViewMode) return;

    if (formData.imageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(formData.imageUrl);
    }

    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imageUrl: ''
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (isViewMode) return;

    const name = String(formData.name || '').trim();

    if (!name) {
      setErrorMessage('Subcategory name is required');
      return;
    }

    if (!formData.categoryId) {
      setErrorMessage('Please select a parent category');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const payload = new FormData();

    payload.append('name', name);
    payload.append('categoryId', formData.categoryId);
    payload.append('description', String(formData.description || '').trim());
    payload.append('displayOrder', String(Number(formData.displayOrder) || 1));
    payload.append('active', String(formData.status === 'Active'));

    if (formData.imageFile) {
      payload.append('image', formData.imageFile);
    }

    try {
      if (editingSubcategory) {
        await updateSubcategory(editingSubcategory, payload);
      } else {
        await createSubcategory(payload);
      }

      await fetchSubcategories();

      setIsPanelOpen(false);
      setEditingSubcategory(null);
      setIsViewMode(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save subcategory:', error);

      setErrorMessage(getErrorMessage(error, 'Failed to save subcategory'));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (subcategory) => {
    if (!subcategory?.id) return;

    setActionLoading(subcategory.id);

    setErrorMessage('');

    try {
      if (subcategory.active === false) {
        await activateSubcategory(subcategory.id);
      } else {
        await deactivateSubcategory(subcategory.id);
      }

      await fetchSubcategories();

      if (editingSubcategory === subcategory.id) {
        closePanel();
      }
    } catch (error) {
      console.error('Failed to change subcategory status:', error);

      setErrorMessage(
        getErrorMessage(error, 'Failed to update subcategory status')
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSubcategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return subcategories.filter((item) => {
      const name = String(item?.name || '').toLowerCase();

      const category = String(item?.categoryName || '').trim().toLowerCase();

      const matchesSearch =
        !query || name.includes(query) || category.includes(query);

      const status = item?.active === true ? 'Active' : 'Inactive';

      const matchesStatus = statusFilter === 'All' || status === statusFilter;

      const matchesCategory =
        !categoryFilterId ||
        String(item?.categoryId) === String(categoryFilterId);

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [subcategories, searchQuery, statusFilter, categoryFilterId]);

  const totalSubcategories = subcategories.length;

  const activeSubcategories = subcategories.filter(
    (item) => item?.active === true
  ).length;

  const inactiveSubcategories = subcategories.filter(
    (item) => item?.active === false
  ).length;

  const categoryCount = new Set(
    subcategories
      .map((item) => String(item?.categoryName || '').trim())
      .filter(Boolean)
  ).size;

  const stats = [
    {
      label: 'Total Subcategories',
      value: `${totalSubcategories}`,
      change: '+12.4%',
      up: true,
      accentColor: 'bg-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-700',
      tagColor: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Layers3,
      suffix: ' Records'
    },
    {
      label: 'Active Subcategories',
      value: `${activeSubcategories}`,
      change: '+8.2%',
      up: true,
      accentColor: 'bg-teal-600',
      iconBg: 'bg-teal-50 text-teal-700',
      tagColor: 'text-teal-700 bg-teal-50/80 border-teal-200/80',
      icon: CheckCircle2,
      suffix: ' Active'
    },
    {
      label: 'Parent Categories',
      value: `${categoryCount}`,
      change: '+4.1%',
      up: true,
      accentColor: 'bg-emerald-500',
      iconBg: 'bg-amber-50 text-amber-700',
      tagColor: 'text-amber-700 bg-amber-50/80 border-amber-200/80',
      icon: AlertTriangle,
      suffix: ' Categories'
    },
    {
      label: 'Inactive',
      value: `${inactiveSubcategories}`,
      change: '-2.8%',
      up: false,
      accentColor: 'bg-green-700',
      iconBg: 'bg-rose-50 text-rose-700',
      tagColor: 'text-rose-700 bg-rose-50/80 border-rose-200/80',
      icon: XCircle,
      suffix: ' Inactive'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-18 sm:pt-20 lg:pt-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm backdrop-blur-md">
                <Zap size={12} className="text-emerald-400 animate-bounce" />
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAddPanel}
              className="px-4 py-2.5 bg-emerald-500/20 border border-emerald-700 rounded-2xl hover:bg-emerald-500/30 transition-all text-xs font-semibold text-emerald-100 flex items-center gap-2"
            >
              <Plus size={15} />
              Add Subcategory
            </motion.button>

            <div className="bg-emerald-900/60 border border-emerald-800 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-100 shadow-inner backdrop-blur-sm">
              <Calendar size={14} className="text-emerald-400" />

              <span>
                {new Date().toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner group/btn disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw
                size={15}
                className={`text-emerald-300 transition-transform duration-700 ${
                  isRefreshing ? 'rotate-180' : 'group-hover/btn:rotate-45'
                }`}
              />
            </motion.button>
          </div>
        </motion.header>

        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
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
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      className={`${stat.iconBg} p-2.5 rounded-2xl transition-all shadow-xs`}
                    >
                      <IconComponent size={18} />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-semibold text-black tracking-tight font-mono group-hover:text-emerald-800 transition-colors duration-200">
                    {loading ? (
                      <span className="text-slate-300">...</span>
                    ) : (
                      <>
                        <AnimatedValue value={stat.value} />
                        <span className="text-base ml-1 font-sans">{stat.suffix}</span>
                      </>
                    )}
                  </h3>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between relative z-10">
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-transform duration-300 group-hover:scale-105 ${stat.tagColor}`}
                  >
                    {stat.up ? (
                      <ArrowUpRight size={13} className="text-emerald-600" />
                    ) : (
                      <ArrowDownRight size={13} className="text-rose-600" />
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto sm:flex-wrap">
                <div className="w-full sm:w-44">
                  <CategorySelect
                    value={categoryFilterId}
                    options={[{ id: '', name: 'All Categories' }, ...categories]}
                    placeholder="All Categories"
                    loading={categoriesLoading}
                    onChange={(option) => setCategoryFilterId(option?.id || '')}
                  />
                </div>

                <div className="relative w-full sm:flex-1 sm:w-64">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />

                  <input
                    type="text"
                    placeholder="Search subcategories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5 w-full sm:w-auto overflow-x-auto">
                  <Filter size={13} className="text-slate-400 ml-2 shrink-0" />

                  {['All', 'Active', 'Inactive'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap ${
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
                    <th className="py-3.5 px-4 rounded-l-xl">Subcategory</th>
                    <th className="py-3.5 px-4">Parent Category</th>
                    <th className="py-3.5 px-4 text-center">Display Order</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Loader2 size={28} className="animate-spin text-emerald-600" />
                          <span className="text-xs font-semibold">
                            Loading subcategories...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredSubcategories.length > 0 ? (
                    filteredSubcategories.map((subcategory, idx) => (
                      <motion.tr
                        key={subcategory.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + idx * 0.05 }}
                        className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:border-emerald-300 transition-colors overflow-hidden">
                              {subcategory.imageUrl || subcategory.image ? (
                                <img
                                  src={subcategory.imageUrl || subcategory.image}
                                  alt={subcategory.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Layers3 size={17} className="text-emerald-600" />
                              )}
                            </div>

                            <div className="flex flex-col">
                              <span className="font-semibold text-black group-hover:text-emerald-700 transition-colors">
                                {subcategory.name || '-'}
                              </span>

                              <span className="text-[10px] text-slate-500">
                                {String(subcategory.categoryName || '').trim() ||
                                  'Subcategory'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {String(subcategory.categoryName || '').trim() || '-'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[10px]">
                            {subcategory.displayOrder ?? '-'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all duration-300 group-hover:scale-105 ${
                              subcategory.active === true
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                : 'bg-rose-50 text-rose-700 border-rose-200/80'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                subcategory.active === true
                                  ? 'bg-emerald-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            {subcategory.active === true ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openViewPanel(subcategory)}
                              disabled={actionLoading === subcategory.id}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-40"
                              title="View Subcategory"
                            >
                              {actionLoading === subcategory.id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Eye size={15} />
                              )}
                            </button>

                            <button
                              onClick={() => openEditPanel(subcategory)}
                              disabled={actionLoading === subcategory.id}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-40"
                              title="Edit Subcategory"
                            >
                              {actionLoading === subcategory.id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Edit3 size={15} />
                              )}
                            </button>

                            <button
                              onClick={() => handleStatusChange(subcategory)}
                              disabled={actionLoading === subcategory.id}
                              className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                                subcategory.active === false
                                  ? 'text-slate-400 hover:text-emerald-700 hover:bg-emerald-50'
                                  : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              }`}
                              title={
                                subcategory.active === false
                                  ? 'Activate Subcategory'
                                  : 'Deactivate Subcategory'
                              }
                            >
                              {actionLoading === subcategory.id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : subcategory.active === false ? (
                                <Power size={15} />
                              ) : (
                                <PowerOff size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <Layers3 size={35} className="mx-auto text-slate-300 mb-3" />
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
                filteredSubcategories.map((subcategory) => (
                  <motion.div
                    key={subcategory.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center overflow-hidden">
                          {subcategory.imageUrl || subcategory.image ? (
                            <img
                              src={subcategory.imageUrl || subcategory.image}
                              alt={subcategory.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Layers3 size={16} />
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700 transition-colors">
                            {subcategory.name || '-'}
                          </h4>

                          <p className="text-[10px] text-slate-400">
                            {String(subcategory.categoryName || '').trim() ||
                              'Subcategory'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          subcategory.active === true
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            subcategory.active === true
                              ? 'bg-emerald-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        {subcategory.active === true ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">
                          Parent Category
                        </span>
                        <span className="text-slate-500 font-semibold">
                          {String(subcategory.categoryName || '').trim() || '-'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">
                          Display Order
                        </span>
                        <span className="text-slate-500 font-semibold">
                          {subcategory.displayOrder ?? '-'}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-1 pt-2 border-t border-slate-200/60">
                      <button
                        onClick={() => openViewPanel(subcategory)}
                        disabled={actionLoading === subcategory.id}
                        className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                        title="View Subcategory"
                      >
                        {actionLoading === subcategory.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>

                      <button
                        onClick={() => openEditPanel(subcategory)}
                        disabled={actionLoading === subcategory.id}
                        className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                        title="Edit Subcategory"
                      >
                        {actionLoading === subcategory.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Edit3 size={15} />
                        )}
                      </button>

                      <button
                        onClick={() => handleStatusChange(subcategory)}
                        disabled={actionLoading === subcategory.id}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                        title={
                          subcategory.active === false
                            ? 'Activate Subcategory'
                            : 'Deactivate Subcategory'
                        }
                      >
                        {actionLoading === subcategory.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : subcategory.active === false ? (
                          <Power size={15} />
                        ) : (
                          <PowerOff size={15} />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <Layers3 size={35} className="mx-auto text-slate-300 mb-3" />
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
                  ) : editingSubcategory ? (
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
                    {isViewMode
                      ? 'View Subcategory'
                      : editingSubcategory
                      ? 'Update Subcategory'
                      : 'Create Subcategory'}
                  </h3>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Parent Category
                  </label>

                  <CategorySelect
                    value={formData.categoryId}
                    options={categories}
                    placeholder="Select category"
                    loading={categoriesLoading}
                    disabled={categoriesLoading || saving || isViewMode}
                    onChange={handleCategoryChange}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Subcategory Name
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="e.g. Leafy Greens"
                    value={formData.name}
                    disabled={isViewMode}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full h-[38px] px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Display Order
                    </label>

                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 1"
                      value={formData.displayOrder}
                      disabled={isViewMode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          displayOrder: e.target.value
                        }))
                      }
                      className="w-full h-[38px] px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-black uppercase tracking-wider block">
                        Status
                      </span>

                      <span className="text-[10px] text-slate-400">
                        {formData.status}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isViewMode}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          status: prev.status === 'Active' ? 'Inactive' : 'Active'
                        }))
                      }
                      className={`relative w-11 h-6 rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                        formData.status === 'Active' ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                          formData.status === 'Active' ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-black uppercase tracking-wider">
                      Subcategory Image
                    </label>

                    {!isViewMode && formData.imageUrl && (
                      <label
                        htmlFor="subcategory-image"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          saving
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                        }`}
                      >
                        <Upload size={13} />
                        Change Image
                      </label>
                    )}
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/60">
                    {formData.imageUrl ? (
                      <div className="relative">
                        <div className="w-full h-48 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                          <img
                            src={formData.imageUrl}
                            alt={formData.name || 'Subcategory preview'}
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
                          No subcategory image
                        </span>
                      </div>
                    ) : (
                      <label
                        htmlFor="subcategory-image"
                        className="flex flex-col items-center justify-center cursor-pointer py-5"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                          <Upload size={22} />
                        </div>

                        <span className="text-xs font-bold text-slate-700">
                          Upload Subcategory Image
                        </span>

                        <span className="text-[10px] text-slate-400 mt-1">
                          PNG, JPG, JPEG or WEBP
                        </span>

                        <span className="text-[10px] text-slate-400">Maximum size 1MB</span>
                      </label>
                    )}

                    <input
                      id="subcategory-image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleImageChange}
                      disabled={saving || isViewMode}
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
                    {isViewMode ? 'Close' : 'Cancel'}
                  </button>

                  {!isViewMode && (
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm transition-colors"
                    >
                      {saving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      {saving
                        ? 'Saving...'
                        : editingSubcategory
                        ? 'Update Subcategory'
                        : 'Save Subcategory'}
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
          <ImageLightbox url={viewImageUrl} onClose={() => setViewImageUrl('')} />
        )}
      </AnimatePresence>
    </div>
  );
}