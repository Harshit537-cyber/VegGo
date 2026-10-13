import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Sidebar from '../../../layouts/Sidebar';
import PageHeader from '../../../components/common/PageHeader';
import SegmentedTabs from '../../../components/common/SegmentedTabs';
import StatusFilterPills from '../../../components/common/StatusFilterPills';
import WorkflowRulesBar from '../../../components/common/WorkflowRulesBar';
import EmptyState from '../../../components/common/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import Categories from './Categories';
import Subcategories from './Subcategories';

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
  Package,
  Loader2,
  Power,
  PowerOff,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Image,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Tag,
  Layers
} from 'lucide-react';

import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deactivateProduct,
  activateProduct,
  addProductImages,
  getProductImages,
  deleteProductImage,
  reorderProductImages,
  getCategories,
  getSubcategories
} from '../services/productService';

const UNIT_OPTIONS = [
  { id: '250g', name: '250 g' },
  { id: '500g', name: '500 g' },
  { id: '1kg', name: '1 kg' },
  { id: '2kg', name: '2 kg' },
  { id: '5kg', name: '5 kg' },
  { id: 'kg', name: 'kg' },
  { id: 'g', name: 'g' },
  { id: 'l', name: 'l' },
  { id: 'ml', name: 'ml' },
  { id: 'pcs', name: 'pcs' },
  { id: 'dozen', name: 'dozen' },
  { id: 'pack', name: 'pack' },
  { id: 'box', name: 'box' },
  { id: 'bundle', name: 'bundle' },
  { id: 'unit', name: 'unit' }
];

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    const stringValue = String(value ?? '');
    const match = stringValue.match(/([₹\d,.]+)\s*(.*)/);

    if (!match) {
      setDisplayValue(stringValue);
      return;
    }

    const isRupee = stringValue.startsWith('₹');
    const rawNumberStr = match[1].replace(/[₹,]/g, '');
    const targetNum = parseFloat(rawNumberStr);
    const suffix = match[2] || '';
    const isDecimal = rawNumberStr.includes('.');
    const hasComma = match[1].includes(',');

    if (Number.isNaN(targetNum)) {
      setDisplayValue(stringValue);
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

      const currentVal = easeProgress * targetNum;

      let formatted;

      if (isDecimal) {
        formatted = currentVal.toFixed(2);
      } else {
        formatted = Math.floor(currentVal).toString();
      }

      if (hasComma) {
        const parts = formatted.split('.');
        parts[0] = parseInt(parts[0], 10).toLocaleString('en-IN');
        formatted = parts.join('.');
      }

      setDisplayValue(
        `${isRupee ? '₹' : ''}${formatted}${suffix ? ` ${suffix}` : ''}`
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

const getValue = (obj, keys, fallback = '') => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) {
      return obj[key];
    }
  }

  return fallback;
};

const normalizeImageUrl = (url = '') => {
  const value = String(url || '').trim();

  const markdownMatch = value.match(/\((https?:\/\/[^)]+)\)/);

  if (markdownMatch?.[1]) {
    return markdownMatch[1];
  }

  return value;
};

const normalizeProduct = (product) => {
  const id = getValue(product, ['id', 'productId', '_id'], '');

  const name = getValue(product, ['name', 'productName', 'title'], '');

  const description = getValue(product, ['description'], '');

  const categoryId = getValue(product, ['categoryId'], '');

  const categoryName = getValue(product, ['categoryName'], '');

  const subcategoryId = getValue(product, ['subcategoryId'], '');

  const subcategoryName = getValue(product, ['subcategoryName'], '');

  const price = Number(getValue(product, ['price'], 0)) || 0;

  const originalPrice = Number(getValue(product, ['originalPrice'], 0)) || 0;

  const unit = getValue(product, ['unit'], '');

  const active = product?.active === true || product?.active === 'true';

  const imageUrl = normalizeImageUrl(getValue(product, ['imageUrl'], ''));

  const imageUrls = Array.isArray(product?.imageUrls)
    ? product.imageUrls.map(normalizeImageUrl)
    : [];

  return {
    ...product,
    id,
    name,
    description,
    categoryId,
    categoryName,
    category: categoryName,
    subcategoryId,
    subcategoryName,
    price,
    originalPrice,
    unit,
    active,
    status: active ? 'Active' : 'Inactive',
    imageUrl,
    imageUrls
  };
};

const extractProducts = (response) => {
  const root = response?.data;

  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.content)) return root.content;
  if (Array.isArray(root?.products)) return root.products;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(response?.products)) return response.products;
  if (Array.isArray(response?.items)) return response.items;

  return [];
};

const extractImages = (response) => {
  const root = response?.data;

  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.images)) return root.images;
  if (Array.isArray(root?.content)) return root.content;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(response?.images)) return response.images;
  if (Array.isArray(response?.items)) return response.items;

  return [];
};

const getImageId = (image) => {
  return image?.id ?? image?.productImageId ?? image?.imageId ?? image?._id;
};

const getImageUrl = (image) => {
  const url =
    image?.url ||
    image?.imageUrl ||
    image?.image_path ||
    image?.imagePath ||
    image?.path ||
    image?.src ||
    '';

  return normalizeImageUrl(url);
};

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

const extractSubcategories = (response) => {
  const root = response?.data;

  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.content)) return root.content;
  if (Array.isArray(root?.subcategories)) return root.subcategories;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(response?.subcategories)) return response.subcategories;
  if (Array.isArray(response?.items)) return response.items;

  return [];
};

const normalizeCategory = (category) => ({
  ...category,
  id: getValue(category, ['id', 'categoryId', '_id'], ''),
  name: getValue(category, ['name', 'categoryName', 'title'], '')
});

const normalizeSubcategory = (subcategory) => ({
  ...subcategory,
  id: getValue(subcategory, ['id', 'subcategoryId', '_id'], ''),
  name: getValue(subcategory, ['name', 'subcategoryName', 'title'], '')
});

function SelectDropdown({
  value,
  options,
  placeholder,
  onChange,
  disabled = false,
  loading = false,
  allowCustom = false
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  const selectedOption = options.find(
    (option) => String(option.id) === String(value)
  );

  const displayLabel = selectedOption
    ? selectedOption.name
    : value
    ? String(value)
    : '';

  const filteredOptions = options.filter((option) =>
    String(option.name || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const trimmedSearch = search.trim();

  const exactMatchExists = options.some(
    (option) => String(option.name || '').toLowerCase() === trimmedSearch.toLowerCase()
  );

  const showCustomOption =
    allowCustom && trimmedSearch.length > 0 && !exactMatchExists;

  const handleSelect = (option) => {
    onChange(option);
    setOpen(false);
    setSearch('');
  };

  const handleCustomSelect = () => {
    if (!trimmedSearch) return;
    onChange({ id: trimmedSearch, name: trimmedSearch });
    setOpen(false);
    setSearch('');
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && allowCustom && trimmedSearch) {
      e.preventDefault();

      const match = options.find(
        (option) => String(option.name || '').toLowerCase() === trimmedSearch.toLowerCase()
      );

      if (match) {
        handleSelect(match);
      } else {
        handleCustomSelect();
      }
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full h-[38px] px-3.5 bg-slate-50 border rounded-xl text-xs font-bold text-black flex items-center justify-between transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          open
            ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/10'
            : 'border-slate-200 hover:border-emerald-300'
        }`}
      >
        <span className={displayLabel ? 'text-black truncate' : 'text-slate-400'}>
          {loading ? 'Loading...' : displayLabel || placeholder}
        </span>

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
      </button>

      <AnimatePresence>
        {open && !disabled && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-[90] rounded-xl border border-emerald-200 bg-white shadow-xl shadow-slate-900/10 overflow-hidden"
          >
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={
                    allowCustom
                      ? 'Type or search (e.g. 250 g, 1 kg)...'
                      : `Search ${placeholder.replace('Select ', '').replace('Enter ', '').toLowerCase()}...`
                  }
                  className="w-full h-[36px] pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto p-1.5">
              {showCustomOption && (
                <button
                  type="button"
                  onClick={handleCustomSelect}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-left mb-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all"
                >
                  <Plus size={13} className="shrink-0" />
                  <span className="truncate">Add "{trimmedSearch}"</span>
                </button>
              )}

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

                      {selected && <Check size={14} className="shrink-0" />}
                    </button>
                  );
                })
              ) : !showCustomOption ? (
                <div className="px-3 py-5 text-xs font-semibold text-slate-400 text-center">
                  No matching options found
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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

export default function Products({ defaultTab = 'products' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabParam = searchParams.get('tab');

  const [currentTab, setCurrentTab] = useState(
    currentTabParam || defaultTab
  );

  useEffect(() => {
    if (currentTabParam && currentTabParam !== currentTab) {
      setCurrentTab(currentTabParam);
    }
  }, [currentTabParam, currentTab]);

  const handleTabChange = (tabId) => {
    setCurrentTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  const [productImages, setProductImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    categoryId: '',
    categoryName: '',
    subcategoryId: '',
    subcategoryName: '',
    price: '',
    originalPrice: '',
    unit: '',
    active: true
  });

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      categoryId: '',
      categoryName: '',
      subcategoryId: '',
      subcategoryName: '',
      price: '',
      originalPrice: '',
      unit: '',
      active: true
    });
  };

  const closePanel = () => {
    if (saving || imageUploading) return;

    setIsPanelOpen(false);
    setEditingProduct(null);
    setIsViewMode(false);
    setProductImages([]);
    setSelectedImages([]);
    resetForm();
  };

  const fetchProducts = async (page = 0, search = searchQuery) => {
    setIsRefreshing(true);
    setErrorMessage('');

    try {
      const response = await getProducts({
        page,
        size: pageSize,
        search: (search || '').trim()
      });

      const rawData = response?.data ?? response;
      const productList = extractProducts(response).map(normalizeProduct);

      setProducts(productList);
      setTotalPages(Math.max(1, rawData?.totalPages ?? rawData?.pages ?? 1));
      setTotalElements(
        rawData?.totalElements ??
        rawData?.totalCount ??
        productList.length
      );
      setCurrentPage(page);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to fetch products:', error);

      setErrorMessage(
        error?.response?.data?.message || error?.message || 'Failed to load products'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchCategoriesList = async () => {
    setCategoriesLoading(true);

    try {
      const response = await getCategories();
      const list = extractCategories(response).map(normalizeCategory);
      setCategories(list);
    } catch (error) {
      setCategories([]);
      setErrorMessage(
        error?.response?.data?.message || error?.message || 'Failed to load categories'
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchSubcategoriesList = async (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }

    setSubcategoriesLoading(true);

    try {
      const response = await getSubcategories(categoryId);
      const list = extractSubcategories(response).map(normalizeSubcategory);
      setSubcategories(list);
    } catch (error) {
      setSubcategories([]);
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to load subcategories'
      );
    } finally {
      setSubcategoriesLoading(false);
    }
  };

  const fetchProductImages = async (productId) => {
    if (!productId) return;

    setImageLoading(true);

    try {
      const response = await getProductImages(productId);

      setProductImages(extractImages(response));
    } catch (error) {
      setProductImages([]);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to load product images'
      );
    } finally {
      setImageLoading(false);
    }
  };

  const location = useLocation();

  useEffect(() => {
    fetchProducts(0, '');
    fetchCategoriesList();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(0, searchQuery);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (location.state?.productId && products.length > 0) {
      const target = products.find(
        (p) => String(p.id) === String(location.state.productId)
      );
      if (target) {
        openProductPanel(target, true);
      }
    }
  }, [location.state?.productId, products]);

  const openAddPanel = async () => {
    setEditingProduct(null);
    setIsViewMode(false);
    setErrorMessage('');
    setProductImages([]);
    setSelectedImages([]);
    setSubcategories([]);
    resetForm();
    setIsPanelOpen(true);

    if (categories.length === 0) {
      await fetchCategoriesList();
    }
  };

  const openProductPanel = async (product, viewOnly = false) => {
    setActionLoading(product.id);
    setErrorMessage('');
    setProductImages([]);
    setSelectedImages([]);
    setIsViewMode(viewOnly);

    try {
      const response = await getProductById(product.id);

      const productData =
        response?.data?.product || response?.data || response?.product || product;

      const normalized = normalizeProduct(productData);

      setEditingProduct(normalized.id);

      setFormData({
        id: normalized.id,
        name: normalized.name || '',
        description: normalized.description || '',
        categoryId: normalized.categoryId || '',
        categoryName: normalized.categoryName || '',
        subcategoryId: normalized.subcategoryId || '',
        subcategoryName: normalized.subcategoryName || '',
        price: normalized.price !== undefined ? String(normalized.price) : '',
        originalPrice:
          normalized.originalPrice !== undefined
            ? String(normalized.originalPrice)
            : '',
        unit: normalized.unit || '',
        active: normalized.active
      });

      setIsPanelOpen(true);

      if (normalized.categoryId) {
        await fetchSubcategoriesList(normalized.categoryId);
      } else {
        setSubcategories([]);
      }

      await fetchProductImages(normalized.id);
    } catch (error) {
      console.error('Failed to fetch product:', error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch product details'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const openEditPanel = (product) => openProductPanel(product, false);
  const openViewPanel = (product) => openProductPanel(product, true);

  const handleCategoryChange = async (category) => {
    if (isViewMode) return;

    const categoryId = category?.id || '';
    const categoryName = category?.name || '';

    setFormData((prev) => ({
      ...prev,
      categoryId,
      categoryName,
      subcategoryId: '',
      subcategoryName: ''
    }));

    setSubcategories([]);
    setErrorMessage('');

    if (categoryId) {
      await fetchSubcategoriesList(categoryId);
    }
  };

  const handleSubcategoryChange = (subcategory) => {
    if (isViewMode) return;

    setFormData((prev) => ({
      ...prev,
      subcategoryId: subcategory?.id || '',
      subcategoryName: subcategory?.name || ''
    }));

    setErrorMessage('');
  };

  const handleUnitChange = (option) => {
    if (isViewMode) return;

    setFormData((prev) => ({
      ...prev,
      unit: option?.name || ''
    }));
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > MAX_IMAGE_SIZE_BYTES) return false;
      return true;
    });

    if (!validFiles.length) {
      setErrorMessage('Please select valid image files under 5MB');
      event.target.value = '';
      return;
    }

    if (validFiles.length !== files.length) {
      setErrorMessage('Some images were skipped. Only image files under 5MB are allowed.');
    } else {
      setErrorMessage('');
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);
    event.target.value = '';
  };

  const handleProductImageUpload = async () => {
    if (!editingProduct || !selectedImages.length) return;

    setImageUploading(true);
    setErrorMessage('');

    try {
      await addProductImages(editingProduct, selectedImages);

      setSelectedImages([]);

      await fetchProductImages(editingProduct);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to upload product images'
      );
    } finally {
      setImageUploading(false);
    }
  };

  const handleDeleteProductImage = async (image) => {
    if (!editingProduct) return;

    const imageId = getImageId(image);

    if (!imageId) {
      setErrorMessage('Product image id not found');
      return;
    }

    setImageLoading(true);
    setErrorMessage('');

    try {
      await deleteProductImage(editingProduct, imageId);

      await fetchProductImages(editingProduct);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to delete product image'
      );

      setImageLoading(false);
    }
  };

  const handleReorderProductImages = async (images) => {
    if (!editingProduct || !Array.isArray(images)) return;

    const imageIds = images
      .map((image) => getImageId(image))
      .filter((id) => id !== undefined && id !== null && id !== '');

    if (!imageIds.length) return;

    try {
      await reorderProductImages(editingProduct, imageIds);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to reorder product images'
      );

      await fetchProductImages(editingProduct);
    }
  };

  const moveProductImage = async (index, direction) => {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= productImages.length) return;

    const updatedImages = [...productImages];

    [updatedImages[index], updatedImages[targetIndex]] = [
      updatedImages[targetIndex],
      updatedImages[index]
    ];

    setProductImages(updatedImages);

    await handleReorderProductImages(updatedImages);
  };

  const removeSelectedImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, imageIndex) => imageIndex !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (isViewMode) return;

    if (!formData.name.trim()) {
      setErrorMessage('Product name is required');
      return;
    }

    if (!formData.categoryId) {
      setErrorMessage('Category is required');
      return;
    }

    if (!formData.subcategoryId) {
      setErrorMessage('Subcategory is required');
      return;
    }

    if (!formData.price) {
      setErrorMessage('Product price is required');
      return;
    }

    if (!formData.unit.trim()) {
      setErrorMessage('Product unit is required');
      return;
    }

    if (!editingProduct && selectedImages.length === 0) {
      setErrorMessage('At least one product image is required');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      categoryId: formData.categoryId,
      subcategoryId: formData.subcategoryId,
      price: parseFloat(formData.price) || 0,
      originalPrice: parseFloat(formData.originalPrice) || 0,
      unit: formData.unit.trim(),
      active: Boolean(formData.active)
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct, payload);

        if (selectedImages.length > 0) {
          await addProductImages(editingProduct, selectedImages);
        }
      } else {
        await createProduct(payload, selectedImages);
      }

      await fetchProducts();

      setIsPanelOpen(false);
      setEditingProduct(null);
      setIsViewMode(false);
      setProductImages([]);
      setSelectedImages([]);
      resetForm();
    } catch (error) {
      console.error('Failed to save product:', error);

      setErrorMessage(
        error?.response?.data?.message || error?.message || 'Failed to save product'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (product) => {
    if (!product?.id) return;

    setActionLoading(product.id);
    setErrorMessage('');

    try {
      if (product.active) {
        await deactivateProduct(product.id);
      } else {
        await activateProduct(product.id);
      }

      await fetchProducts();

      if (editingProduct === product.id) {
        closePanel();
      }
    } catch (error) {
      console.error('Failed to change product status:', error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update product status'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProducts = products.filter((prod) => {
    const name = String(prod.name || '').toLowerCase();
    const category = String(prod.categoryName || '').toLowerCase();
    const subcategory = String(prod.subcategoryName || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      name.includes(query) || category.includes(query) || subcategory.includes(query);

    const matchesStatus =
      stockFilter === 'All' ||
      (stockFilter === 'Active' && prod.active) ||
      (stockFilter === 'Inactive' && !prod.active);

    return matchesSearch && matchesStatus;
  });

  const totalProductsCount = totalElements || products.length;
  const activeProducts = products.filter((p) => p.active).length;
  const inactiveProducts = products.filter((p) => !p.active).length;

  const productStats = [
    {
      label: 'Total Products',
      value: totalProductsCount,
      subLabel: 'Catalog Produce Items',
      accentGradient: 'from-emerald-600 to-teal-600',
      iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
      icon: Package,
    },
    {
      label: 'Active (In Stock)',
      value: activeProducts,
      subLabel: 'Live on Storefront',
      accentGradient: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-50/90 text-emerald-800 border border-emerald-200/80',
      icon: CheckCircle2,
    },
    {
      label: 'Inactive / Hidden',
      value: inactiveProducts,
      subLabel: 'Delisted or Paused',
      accentGradient: 'from-slate-500 to-slate-600',
      iconBg: 'bg-slate-50 text-slate-700 border border-slate-200',
      icon: AlertTriangle,
    },
    {
      label: 'Categories Covered',
      value: categories.length,
      subLabel: 'Taxonomy Departments',
      accentGradient: 'from-teal-600 to-emerald-700',
      iconBg: 'bg-teal-50 text-teal-700 border border-teal-200/80',
      icon: Layers,
    },
  ];

  const priceInputClass =
    'w-full h-[38px] px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] disabled:opacity-60 disabled:cursor-not-allowed';

  const productTabs = [
    { id: 'products', label: 'All Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'subcategories', label: 'Subcategories', icon: Tag },
  ];

  const filterPills = [
    { id: 'All', label: 'All Products', count: totalProductsCount },
    { id: 'Active', label: 'Active (In Stock)', count: activeProducts },
    { id: 'Inactive', label: 'Inactive (Hidden)', count: inactiveProducts }
  ];

  return (
    <div className="min-h-dvh bg-[#f6f9f7] flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto max-h-dvh w-full space-y-5 sm:space-y-6">
        {/* Horizontal Navigation Segmented Tabs Bar */}
        <div className="bg-white p-2 rounded-2xl border border-emerald-100/80 shadow-2xs">
          <SegmentedTabs
            tabs={productTabs}
            activeTab={currentTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Tab 1: All Products View */}
        {currentTab === 'products' && (
          <div className="w-full space-y-5 sm:space-y-6">
            {/* Top Executive Header */}
            <PageHeader
              icon={Package}
              title="Produce & Inventory"
              subtitle="View and manage products, pricing, and stock levels."
              stats={[
                { label: 'Total Products', value: totalProductsCount },
                { label: 'Inactive / Hidden', value: inactiveProducts, alert: inactiveProducts > 0 }
              ]}
              actionButtonText="Add Product"
              actionButtonIcon={Plus}
              onActionClick={openAddPanel}
              onRefresh={() => fetchProducts(currentPage, searchQuery)}
              isRefreshing={isRefreshing || loading}
            />

            {/* Global Error Banner */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center gap-3 text-xs sm:text-sm font-semibold text-amber-900 shadow-2xs"
                >
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Secondary Status Filter Pills */}
            <StatusFilterPills
              filters={filterPills}
              activeFilter={stockFilter}
              onFilterChange={setStockFilter}
            />

            {/* Workflow Rules Information Bar */}
            <WorkflowRulesBar
              rulesText="Live catalog inventory management with category taxonomy, real-time pricing, and one-click stock availability toggle."
              showingCount={filteredProducts.length}
              totalCount={products.length}
              itemLabel="products"
            />

            {/* Unified Search Input Bar */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search products by item name, category, or subcategory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            {/* Data Table or Empty State Card */}
            {filteredProducts.length === 0 && !loading ? (
              <EmptyState
                icon={Package}
                title="No products found"
                description={`There are currently no products in the selected "${stockFilter}" category or matching your search.`}
                actionText="Add New Product"
                onAction={openAddPanel}
              />
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] uppercase font-semibold tracking-wider text-slate-600 bg-slate-50/80">
                        <th className="py-4 px-5">Product Details</th>
                        <th className="py-4 px-5">Taxonomy / Category</th>
                        <th className="py-4 px-5">Pricing</th>
                        <th className="py-4 px-5">Unit Standard</th>
                        <th className="py-4 px-5 text-center">Status</th>
                        <th className="py-4 px-5 text-right min-w-[220px]">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="py-16 text-center">
                            <div className="flex flex-col items-center gap-3 text-slate-400">
                              <Loader2 size={32} className="animate-spin text-emerald-600" />
                              <span className="text-xs font-semibold">Loading product catalog...</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((prod, idx) => (
                          <motion.tr
                            key={prod.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: idx * 0.02 }}
                            className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group"
                          >
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:border-emerald-300 transition-colors overflow-hidden">
                                  {prod.imageUrl ? (
                                    <img
                                      src={prod.imageUrl}
                                      alt={prod.name || 'Product'}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package size={20} className="text-emerald-600" />
                                  )}
                                </div>

                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm">
                                    {prod.name || '-'}
                                  </span>

                                  <span className="text-[11px] text-slate-500 line-clamp-1">
                                    {prod.description || prod.subcategoryName || prod.categoryName || 'No description'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-5">
                              <div className="flex flex-col">
                                <span className="text-xs text-slate-800 font-semibold">
                                  {prod.categoryName || '-'}
                                </span>

                                <span className="text-[11px] text-slate-500 font-normal">
                                  {prod.subcategoryName || '-'}
                                </span>
                              </div>
                            </td>

                            <td className="py-4 px-5">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-900 font-mono">
                                  ₹{prod.price || 0}
                                </span>

                                {prod.originalPrice > prod.price && (
                                  <span className="text-[10px] text-slate-400 line-through font-mono">
                                    ₹{prod.originalPrice}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-4 px-5">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                                {prod.unit || '-'}
                              </span>
                            </td>

                            <td className="py-4 px-5 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                                  prod.active
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    prod.active ? 'bg-emerald-500' : 'bg-rose-500'
                                  }`}
                                />
                                {prod.active ? 'In Stock' : 'Inactive'}
                              </span>
                            </td>

                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditPanel(prod, true)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                                  title="View Details"
                                >
                                  <Eye size={13} className="text-slate-500" />
                                  <span>View</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openEditPanel(prod, false)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200/90 hover:border-emerald-600 text-xs font-bold shadow-2xs hover:shadow-emerald-600/20 transition-all cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit3 size={13} />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(prod)}
                                  disabled={actionLoading === prod.id}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-2xs cursor-pointer disabled:opacity-50 ${
                                    prod.active
                                      ? 'bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border-rose-200/90 hover:border-rose-600 hover:shadow-rose-600/20'
                                      : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border-emerald-200/90 hover:border-emerald-600 hover:shadow-emerald-600/20'
                                  }`}
                                  title={prod.active ? 'Deactivate Product' : 'Activate Product'}
                                >
                                  {actionLoading === prod.id ? (
                                    <Loader2 size={13} className="animate-spin text-emerald-600" />
                                  ) : prod.active ? (
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
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards List */}
                <div className="md:hidden p-4 space-y-3">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center overflow-hidden shrink-0">
                            {prod.imageUrl ? (
                              <img
                                src={prod.imageUrl}
                                alt={prod.name || 'Product'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package size={18} />
                            )}
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm text-slate-900">
                              {prod.name || '-'}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {prod.categoryName || 'Catalog Item'}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            prod.active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              prod.active ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {prod.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Price</span>
                          <span className="font-semibold text-slate-900 font-mono">₹{prod.price || 0}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Unit</span>
                          <span className="font-semibold text-slate-700">{prod.unit || '-'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => openEditPanel(prod, true)}
                          className="h-9 px-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                        >
                          <Eye size={15} /> View
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditPanel(prod, false)}
                          className="h-9 px-3.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-emerald-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                        >
                          <Edit3 size={15} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(prod)}
                          disabled={actionLoading === prod.id}
                          className={`h-9 px-3 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs border cursor-pointer ${
                            prod.active
                              ? 'bg-white hover:bg-rose-50 text-rose-600 border-slate-200 hover:border-rose-300'
                              : 'bg-white hover:bg-emerald-50 text-emerald-700 border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          {actionLoading === prod.id ? (
                            <Loader2 size={15} className="animate-spin text-emerald-600" />
                          ) : prod.active ? (
                            <>
                              <PowerOff size={15} /> Deactivate
                            </>
                          ) : (
                            <>
                              <Power size={15} /> Activate
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table Footer with Pagination Controls */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                    <span>
                      Showing Page {currentPage + 1} of {totalPages} ({totalElements} total products)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={currentPage === 0 || loading}
                        onClick={() => fetchProducts(currentPage - 1, searchQuery)}
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">Prev</span>
                      </button>

                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 font-mono">
                        {currentPage + 1}
                      </span>

                      <button
                        type="button"
                        disabled={currentPage >= totalPages - 1 || loading}
                        onClick={() => fetchProducts(currentPage + 1, searchQuery)}
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Categories View */}
        {currentTab === 'categories' && (
          <div className="w-full">
            <Categories embedded={true} />
          </div>
        )}

        {/* Tab 3: Subcategories View */}
        {currentTab === 'subcategories' && (
          <div className="w-full">
            <Subcategories embedded={true} />
          </div>
        )}
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
                disabled={saving || imageUploading}
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 z-10"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5 mb-6 pr-8">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-2xl flex items-center justify-center">
                  {isViewMode ? (
                    <Eye size={20} />
                  ) : editingProduct ? (
                    <Edit3 size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                    Product Management
                  </span>

                  <h3 className="text-lg font-bold text-black">
                    {isViewMode
                      ? 'View Product'
                      : editingProduct
                      ? 'Update Product'
                      : 'Create Product'}
                  </h3>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Product Title
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="e.g. Crisp Romaine Lettuce"
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
                    placeholder="Product description"
                    value={formData.description}
                    disabled={isViewMode}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Category
                    </label>

                    <SelectDropdown
                      value={formData.categoryId}
                      options={categories}
                      placeholder="Select category"
                      onChange={handleCategoryChange}
                      disabled={isViewMode}
                      loading={categoriesLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Subcategory
                    </label>

                    <SelectDropdown
                      value={formData.subcategoryId}
                      options={subcategories}
                      placeholder={
                        formData.categoryId ? 'Select subcategory' : 'Select category first'
                      }
                      onChange={handleSubcategoryChange}
                      disabled={isViewMode || !formData.categoryId}
                      loading={subcategoriesLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Price (₹)
                    </label>

                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter price"
                      value={formData.price}
                      disabled={isViewMode}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, price: e.target.value }))
                      }
                      className={priceInputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Original Price
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter original price"
                      value={formData.originalPrice}
                      disabled={isViewMode}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, originalPrice: e.target.value }))
                      }
                      className={priceInputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Unit Metric
                  </label>

                  <SelectDropdown
                    value={formData.unit}
                    options={UNIT_OPTIONS}
                    placeholder="Select or type unit"
                    onChange={handleUnitChange}
                    disabled={isViewMode}
                    allowCustom
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-black uppercase tracking-wider block">
                      Product Status
                    </span>

                    <span className="text-[10px] text-slate-400">
                      {formData.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isViewMode}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, active: !prev.active }))
                    }
                    className={`relative w-11 h-6 rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                      formData.active ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        formData.active ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-black uppercase tracking-wider">
                      Product Images
                    </label>

                    {!isViewMode && (
                      <label
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          saving || imageUploading
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                        }`}
                      >
                        <Upload size={13} />
                        Select Images

                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={saving || imageUploading}
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {!isViewMode && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-[10px] font-semibold text-emerald-700 mb-3">
                      {editingProduct
                        ? 'Select new images (multiple allowed, up to 5MB each) and click Upload to attach them to this product.'
                        : 'Select one or more product images (up to 5MB each). They are sent together when you save the product.'}
                    </div>
                  )}

                  {!isViewMode && selectedImages.length > 0 && (
                    <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-slate-700">
                          Selected Images ({selectedImages.length})
                        </span>

                        {editingProduct && (
                          <button
                            type="button"
                            onClick={handleProductImageUpload}
                            disabled={imageUploading || saving}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {imageUploading ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Upload size={12} />
                            )}
                            {imageUploading ? 'Uploading...' : 'Upload'}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedImages.map((file, index) => {
                          const previewUrl = URL.createObjectURL(file);

                          return (
                            <div
                              key={`${file.name}-${file.lastModified}-${index}`}
                              className="relative rounded-xl overflow-hidden border border-slate-200 bg-white group"
                            >
                              <img
                                src={previewUrl}
                                alt={file.name}
                                className="w-full aspect-square object-cover"
                              />

                              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between gap-1">
                                <span className="text-[9px] font-bold text-white truncate max-w-[60%]">
                                  {file.name}
                                </span>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setViewImageUrl(previewUrl)}
                                    className="p-1 rounded-md bg-white/90 text-slate-700"
                                    title="View"
                                  >
                                    <Eye size={11} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => removeSelectedImage(index)}
                                    disabled={imageUploading || saving}
                                    className="p-1 rounded-md bg-rose-500 text-white disabled:opacity-50"
                                    title="Remove"
                                  >
                                    <X size={11} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {editingProduct &&
                    (imageLoading ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2 border border-dashed border-slate-200 rounded-xl">
                        <Loader2 size={22} className="animate-spin text-emerald-600" />
                        <span className="text-[10px] font-semibold text-slate-400">
                          Loading images...
                        </span>
                      </div>
                    ) : productImages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {productImages.map((image, index) => {
                          const imageUrl = getImageUrl(image);
                          const imageId = getImageId(image);

                          return (
                            <div
                              key={imageId || index}
                              className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group"
                            >
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={`Product ${index + 1}`}
                                  className="w-full aspect-square object-cover"
                                />
                              ) : (
                                <div className="w-full aspect-square flex items-center justify-center">
                                  <Image size={25} className="text-slate-300" />
                                </div>
                              )}

                              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between">
                                <span className="text-[9px] font-bold text-white">
                                  Image {index + 1}
                                </span>

                                <div className="flex items-center gap-1">
                                  {imageUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setViewImageUrl(imageUrl)}
                                      className="p-1 rounded-md bg-white/90 text-slate-700"
                                      title="View"
                                    >
                                      <Eye size={11} />
                                    </button>
                                  )}

                                  {!isViewMode && (
                                    <>
                                      <button
                                        type="button"
                                        disabled={index === 0 || imageLoading}
                                        onClick={() => moveProductImage(index, -1)}
                                        className="p-1 rounded-md bg-white/90 text-slate-700 disabled:opacity-30"
                                      >
                                        <ArrowUp size={11} />
                                      </button>

                                      <button
                                        type="button"
                                        disabled={
                                          index === productImages.length - 1 || imageLoading
                                        }
                                        onClick={() => moveProductImage(index, 1)}
                                        className="p-1 rounded-md bg-white/90 text-slate-700 disabled:opacity-30"
                                      >
                                        <ArrowDown size={11} />
                                      </button>

                                      <button
                                        type="button"
                                        disabled={!imageId || imageLoading}
                                        onClick={() => handleDeleteProductImage(image)}
                                        className="p-1 rounded-md bg-rose-500 text-white disabled:opacity-30"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 flex flex-col items-center justify-center gap-2 border border-dashed border-slate-200 rounded-xl">
                        <Image size={24} className="text-slate-300" />
                        <span className="text-[10px] font-semibold text-slate-400">
                          No product images
                        </span>
                      </div>
                    ))}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closePanel}
                    disabled={saving || imageUploading}
                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {isViewMode ? 'Close' : 'Cancel'}
                  </button>

                  {!isViewMode && (
                    <button
                      type="submit"
                      disabled={saving || imageUploading}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm transition-colors"
                    >
                      {saving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Save Product'}
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