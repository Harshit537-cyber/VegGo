import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../Api/Interceptor/axiosInstance';

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
  Check,
  Image,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deactivateProduct,
  activateProduct,
  addProductImages,
  deleteProductImage,
  reorderProductImages,
  getCategories,
  getSubcategories
} from '../Api/catalogService/productService';

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
  const id = getValue(
    product,
    ['id', 'productId', '_id'],
    ''
  );

  const name = getValue(
    product,
    ['name', 'productName', 'title'],
    ''
  );

  const description = getValue(
    product,
    ['description'],
    ''
  );

  const categoryId = getValue(
    product,
    ['categoryId'],
    ''
  );

  const categoryName = getValue(
    product,
    ['categoryName'],
    ''
  );

  const subcategoryId = getValue(
    product,
    ['subcategoryId'],
    ''
  );

  const subcategoryName = getValue(
    product,
    ['subcategoryName'],
    ''
  );

  const price =
    Number(getValue(product, ['price'], 0)) || 0;

  const originalPrice =
    Number(getValue(product, ['originalPrice'], 0)) || 0;

  const unit = getValue(
    product,
    ['unit'],
    ''
  );

  const discountPercent =
    Number(
      getValue(
        product,
        ['discountPercent'],
        0
      )
    ) || 0;

  const active =
    product?.active === true ||
    product?.active === 'true';

  const imageUrl = normalizeImageUrl(
    getValue(
      product,
      ['imageUrl'],
      ''
    )
  );

  const imageUrls =
    Array.isArray(product?.imageUrls)
      ? product.imageUrls.map(
          normalizeImageUrl
        )
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
    discountPercent,
    active,
    status: active
      ? 'Active'
      : 'Inactive',
    imageUrl,
    imageUrls
  };
};

const extractProducts = (response) => {
  const root = response?.data;

  if (Array.isArray(root)) {
    return root;
  }

  if (Array.isArray(root?.content)) {
    return root.content;
  }

  if (Array.isArray(root?.products)) {
    return root.products;
  }

  if (Array.isArray(root?.items)) {
    return root.items;
  }

  if (Array.isArray(root?.data)) {
    return root.data;
  }

  if (Array.isArray(response?.products)) {
    return response.products;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
};

const extractImages = (response) => {
  const root = response?.data;

  if (Array.isArray(root)) {
    return root;
  }

  if (Array.isArray(root?.images)) {
    return root.images;
  }

  if (Array.isArray(root?.content)) {
    return root.content;
  }

  if (Array.isArray(root?.items)) {
    return root.items;
  }

  if (Array.isArray(root?.data)) {
    return root.data;
  }

  if (Array.isArray(response?.images)) {
    return response.images;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
};

const extractCategories = (response) => {
  const root = response?.data;

  if (Array.isArray(root)) {
    return root;
  }

  if (Array.isArray(root?.content)) {
    return root.content;
  }

  if (Array.isArray(root?.categories)) {
    return root.categories;
  }

  if (Array.isArray(root?.items)) {
    return root.items;
  }

  if (Array.isArray(root?.data)) {
    return root.data;
  }

  if (Array.isArray(response?.categories)) {
    return response.categories;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
};

const extractSubcategories = (response) => {
  const root = response?.data;

  if (Array.isArray(root)) {
    return root;
  }

  if (Array.isArray(root?.content)) {
    return root.content;
  }

  if (Array.isArray(root?.subcategories)) {
    return root.subcategories;
  }

  if (Array.isArray(root?.items)) {
    return root.items;
  }

  if (Array.isArray(root?.data)) {
    return root.data;
  }

  if (Array.isArray(response?.subcategories)) {
    return response.subcategories;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
};

const getImageId = (image) => {
  return (
    image?.id ??
    image?.productImageId ??
    image?.imageId ??
    image?._id
  );
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

const normalizeCategory = (category) => {
  return {
    ...category,
    id: getValue(
      category,
      ['id', 'categoryId', '_id'],
      ''
    ),
    name: getValue(
      category,
      ['name', 'categoryName', 'title'],
      ''
    )
  };
};

const normalizeSubcategory = (subcategory) => {
  return {
    ...subcategory,
    id: getValue(
      subcategory,
      ['id', 'subcategoryId', '_id'],
      ''
    ),
    name: getValue(
      subcategory,
      [
        'name',
        'subcategoryName',
        'title'
      ],
      ''
    )
  };
};

const UNIT_OPTIONS = [
  {
    value: '1 kg',
    label: '1 kg'
  },
  {
    value: '500 g',
    label: '500 g'
  },
  {
    value: '1 liter',
    label: '1 liter'
  },
  {
    value: '500 ml',
    label: '500 ml'
  },
  {
    value: '1 bunch',
    label: '1 bunch'
  },
  {
    value: '1 box',
    label: '1 box'
  },
  {
    value: '1 pack',
    label: '1 pack'
  },
  {
    value: '1 piece',
    label: '1 piece'
  }
];

function UnitDropdown({
  value,
  onChange
}) {
  const [open, setOpen] =
    useState(false);

  const dropdownRef =
    useRef(null);

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  const selectedUnit =
    UNIT_OPTIONS.find(
      (option) =>
        option.value === value
    ) || {
      value: value || '',
      label: value || '-'
    };

  const handleSelect = (
    unit
  ) => {
    onChange(unit.value);
    setOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (prev) => !prev
          )
        }
        className={`w-full h-[38px] px-3.5 bg-slate-50 border rounded-xl text-xs font-bold text-black flex items-center justify-between transition-all ${
          open
            ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/10'
            : 'border-slate-200 hover:border-emerald-300'
        }`}
      >
        <span>
          {selectedUnit.label}
        </span>

        <ChevronDown
          size={15}
          className={`text-emerald-600 transition-transform duration-200 ${
            open
              ? 'rotate-180'
              : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -4,
              scale: 0.98
            }}
            animate={{
              opacity: 1,
              y: 4,
              scale: 1
            }}
            exit={{
              opacity: 0,
              y: -4,
              scale: 0.98
            }}
            transition={{
              duration: 0.15
            }}
            className="absolute left-0 right-0 top-full z-[80] overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-xl shadow-slate-900/10 p-1.5"
          >
            {UNIT_OPTIONS.map(
              (option) => {
                const selected =
                  option.value ===
                  value;

                return (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    onClick={() =>
                      handleSelect(
                        option
                      )
                    }
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-all ${
                      selected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <span>
                      {
                        option.label
                      }
                    </span>

                    {selected && (
                      <Check
                        size={14}
                      />
                    )}
                  </button>
                );
              }
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectDropdown({
  value,
  options,
  placeholder,
  onChange,
  disabled = false,
  loading = false
}) {
  const [open, setOpen] =
    useState(false);

  const dropdownRef =
    useRef(null);

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  const selectedOption =
    options.find(
      (option) =>
        String(option.id) ===
        String(value)
    );

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setOpen(
            (prev) => !prev
          )
        }
        className={`w-full h-[38px] px-3.5 bg-slate-50 border rounded-xl text-xs font-bold text-black flex items-center justify-between transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          open
            ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/10'
            : 'border-slate-200 hover:border-emerald-300'
        }`}
      >
        <span
          className={
            selectedOption
              ? 'text-black'
              : 'text-slate-400'
          }
        >
          {loading
            ? 'Loading...'
            : selectedOption
            ? selectedOption.name
            : placeholder}
        </span>

        {loading ? (
          <Loader2
            size={14}
            className="animate-spin text-emerald-600"
          />
        ) : (
          <ChevronDown
            size={15}
            className={`text-emerald-600 transition-transform duration-200 ${
              open
                ? 'rotate-180'
                : ''
            }`}
          />
        )}
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{
              opacity: 0,
              y: -4,
              scale: 0.98
            }}
            animate={{
              opacity: 1,
              y: 4,
              scale: 1
            }}
            exit={{
              opacity: 0,
              y: -4,
              scale: 0.98
            }}
            transition={{
              duration: 0.15
            }}
            className="absolute left-0 right-0 top-full z-[90] max-h-56 overflow-y-auto rounded-xl border border-emerald-200 bg-white shadow-xl shadow-slate-900/10 p-1.5"
          >
            {options.length >
            0 ? (
              options.map(
                (option) => {
                  const selected =
                    String(
                      option.id
                    ) ===
                    String(value);

                  return (
                    <button
                      key={
                        option.id
                      }
                      type="button"
                      onClick={() => {
                        onChange(
                          option
                        );
                        setOpen(
                          false
                        );
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-all ${
                        selected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <span>
                        {
                          option.name
                        }
                      </span>

                      {selected && (
                        <Check
                          size={
                            14
                          }
                        />
                      )}
                    </button>
                  );
                }
              )
            ) : (
              <div className="px-3 py-3 text-xs font-semibold text-slate-400 text-center">
                No options
                available
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Products() {
  const [
    currentTab,
    setCurrentTab
  ] = useState('products');

  const [
    searchQuery,
    setSearchQuery
  ] = useState('');

  const [
    stockFilter,
    setStockFilter
  ] = useState('All');

  const [
    isRefreshing,
    setIsRefreshing
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    actionLoading,
    setActionLoading
  ] = useState(null);

  const [
    refreshKey,
    setRefreshKey
  ] = useState(0);

  const [
    errorMessage,
    setErrorMessage
  ] = useState('');

  const [
    products,
    setProducts
  ] = useState([]);

  const [
    categories,
    setCategories
  ] = useState([]);

  const [
    subcategories,
    setSubcategories
  ] = useState([]);

  const [
    categoriesLoading,
    setCategoriesLoading
  ] = useState(false);

  const [
    subcategoriesLoading,
    setSubcategoriesLoading
  ] = useState(false);

  const [
    isPanelOpen,
    setIsPanelOpen
  ] = useState(false);

  const [
    editingProduct,
    setEditingProduct
  ] = useState(null);

  const [
    productImages,
    setProductImages
  ] = useState([]);

  const [
    selectedImages,
    setSelectedImages
  ] = useState([]);

  const [
    imageLoading,
    setImageLoading
  ] = useState(false);

  const [
    imageUploading,
    setImageUploading
  ] = useState(false);

  const [
    formData,
    setFormData
  ] = useState({
    id: '',
    name: '',
    description: '',
    categoryId: '',
    categoryName: '',
    subcategoryId: '',
    subcategoryName: '',
    price: '',
    originalPrice: '',
    unit: '1 kg',
    discountPercent: '',
    active: true,
    imageFile: null,
    imageUrl: ''
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
      unit: '1 kg',
      discountPercent: '',
      active: true,
      imageFile: null,
      imageUrl: ''
    });

    setSubcategories([]);
  };

  const getApiErrorMessage = (
    error,
    fallback
  ) => {
    const data =
      error?.response?.data;

    if (
      typeof data?.message ===
      'string'
    ) {
      return data.message;
    }

    if (
      typeof data?.error ===
      'string'
    ) {
      return data.error;
    }

    if (
      Array.isArray(data?.errors)
    ) {
      return data.errors.join(
        ', '
      );
    }

    if (
      typeof data === 'string' &&
      data.trim()
    ) {
      return data;
    }

    if (
      typeof error?.message ===
      'string'
    ) {
      return error.message;
    }

    return fallback;
  };

  const closePanel = () => {
    if (
      saving ||
      imageUploading
    ) {
      return;
    }

    setIsPanelOpen(false);
    setEditingProduct(null);
    setProductImages([]);
    setSelectedImages([]);
    resetForm();
    setErrorMessage('');
  };

  const fetchProducts = async () => {
    setIsRefreshing(true);
    setErrorMessage('');

    try {
      const response =
        await getProducts({
          page: 0,
          size: 100
        });

      const productList =
        extractProducts(
          response
        ).map(
          normalizeProduct
        );

      setProducts(
        productList
      );

      setRefreshKey(
        (prev) => prev + 1
      );
    } catch (error) {
      console.error(
        'Failed to fetch products:',
        error
      );

      setErrorMessage(
        getApiErrorMessage(
          error,
          'Failed to load products'
        )
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchCategoriesList =
    async () => {
      setCategoriesLoading(
        true
      );

      try {
        const response =
          await getCategories();

        const list =
          extractCategories(
            response
          ).map(
            normalizeCategory
          );

        setCategories(list);
      } catch (error) {
        console.error(
          'Failed to fetch categories:',
          error
        );

        setErrorMessage(
          getApiErrorMessage(
            error,
            'Failed to load categories'
          )
        );
      } finally {
        setCategoriesLoading(
          false
        );
      }
    };

  const fetchSubcategoriesList =
    async (
      categoryId
    ) => {
      if (!categoryId) {
        setSubcategories([]);
        return;
      }

      setSubcategoriesLoading(
        true
      );

      try {
        const response =
          await getSubcategories(
            categoryId
          );

        const list =
          extractSubcategories(
            response
          ).map(
            normalizeSubcategory
          );

        setSubcategories(list);
      } catch (error) {
        console.error(
          'Failed to fetch subcategories:',
          error
        );

        setSubcategories([]);

        setErrorMessage(
          getApiErrorMessage(
            error,
            'Failed to load subcategories'
          )
        );
      } finally {
        setSubcategoriesLoading(
          false
        );
      }
    };

  const fetchProductImages =
    async (
      productId
    ) => {
      if (!productId) {
        return;
      }

      setImageLoading(true);

      try {
        const response =
          await apiClient.get(
            `/api/admin/catalog/products/${productId}/images`
          );

        const images =
          Array.isArray(response?.data?.data)
            ? response.data.data
            : [];

        setProductImages(
          images
        );
      } catch (error) {
        setProductImages([]);

        setErrorMessage(
          getApiErrorMessage(
            error,
            'Failed to load product images'
          )
        );
      } finally {
        setImageLoading(
          false
        );
      }
    };

  useEffect(() => {
    fetchProducts();
    fetchCategoriesList();
  }, []);

  const openAddPanel =
    async () => {
      setEditingProduct(null);
      setErrorMessage('');
      setProductImages([]);
      setSelectedImages([]);
      setSubcategories([]);
      resetForm();
      setIsPanelOpen(true);

      if (
        categories.length ===
        0
      ) {
        await fetchCategoriesList();
      }
    };

  const openEditPanel =
    async (
      product
    ) => {
      setActionLoading(
        product.id
      );

      setErrorMessage('');
      setProductImages([]);
      setSelectedImages([]);

      try {
        const response =
          await getProductById(
            product.id
          );

        const productData =
          response?.data
            ?.product ||
          response?.data ||
          response?.product ||
          product;

        const normalized =
          normalizeProduct(
            productData
          );

        setEditingProduct(
          normalized.id
        );

        setFormData({
          id:
            normalized.id,
          name:
            normalized.name ||
            '',
          description:
            normalized.description ||
            '',
          categoryId:
            normalized.categoryId ||
            '',
          categoryName:
            normalized.categoryName ||
            '',
          subcategoryId:
            normalized.subcategoryId ||
            '',
          subcategoryName:
            normalized.subcategoryName ||
            '',
          price:
            normalized.price !==
            undefined
              ? String(
                  normalized.price
                )
              : '',
          originalPrice:
            normalized.originalPrice !==
            undefined
              ? String(
                  normalized.originalPrice
                )
              : '',
          unit:
            normalized.unit ||
            '',
          discountPercent:
            normalized.discountPercent !==
            undefined
              ? String(
                  normalized.discountPercent
                )
              : '',
          active:
            normalized.active,
          imageFile:
            null,
          imageUrl:
            normalized.imageUrl ||
            ''
        });

        setIsPanelOpen(
          true
        );

        if (
          normalized.categoryId
        ) {
          await fetchSubcategoriesList(
            normalized.categoryId
          );
        }

        await fetchProductImages(
          normalized.id
        );
      } catch (error) {
        console.error(
          'Failed to fetch product:',
          error
        );

        setErrorMessage(
          getApiErrorMessage(
            error,
            'Failed to fetch product details'
          )
        );
      } finally {
        setActionLoading(
          null
        );
      }
    };

  const handleCategoryChange =
    async (
      category
    ) => {
      const categoryId =
        category?.id || '';

      const categoryName =
        category?.name || '';

      setFormData(
        (prev) => ({
          ...prev,
          categoryId,
          categoryName,
          subcategoryId:
            '',
          subcategoryName:
            ''
        })
      );

      setSubcategories(
        []
      );

      setErrorMessage('');

      if (categoryId) {
        await fetchSubcategoriesList(
          categoryId
        );
      }
    };

  const handleSubcategoryChange =
    (
      subcategory
    ) => {
      setFormData(
        (prev) => ({
          ...prev,
          subcategoryId:
            subcategory?.id ||
            '',
          subcategoryName:
            subcategory?.name ||
            ''
        })
      );

      setErrorMessage('');
    };

  const handleImageSelect =
    (
      event
    ) => {
      const files =
        Array.from(
          event.target.files ||
            []
        );

      if (!files.length) {
        return;
      }

      const validFiles =
        files.filter(
          (file) =>
            file.type.startsWith(
              'image/'
            ) &&
            file.size <=
              1024 * 1024
        );

      if (
        !validFiles.length
      ) {
        setErrorMessage(
          'Please select a valid image up to 1MB'
        );

        event.target.value =
          '';

        return;
      }

      if (
        validFiles.length !==
        files.length
      ) {
        setErrorMessage(
          'Only image files up to 1MB are allowed'
        );
      } else {
        setErrorMessage('');
      }

      if (!editingProduct) {
        const file =
          validFiles[0];

        setFormData(
          (prev) => ({
            ...prev,
            imageFile:
              file,
            imageUrl:
              URL.createObjectURL(
                file
              )
          })
        );
      } else {
        setSelectedImages(
          (prev) => [
            ...prev,
            ...validFiles
          ]
        );
      }

      event.target.value = '';
    };

  const handleProductImageUpload =
    async () => {
      if (
        !editingProduct ||
        !selectedImages.length
      ) {
        return;
      }

      setImageUploading(
        true
      );

      setErrorMessage('');

      try {
        await addProductImages(
          editingProduct,
          selectedImages
        );

        setSelectedImages(
          []
        );

        await fetchProductImages(
          editingProduct
        );
      } catch (error) {
        console.error(
          'Failed to upload product images:',
          error
        );

        setErrorMessage(
          getApiErrorMessage(
            error,
            'Failed to upload product images'
          )
        );
      } finally {
        setImageUploading(
          false
        );
      }
    };

  const handleDeleteProductImage =
    async (
      image
    ) => {
      if (
        !editingProduct
      ) {
        return;
      }

      const imageId =
        getImageId(image);

      if (!imageId) {
        setErrorMessage(
          'Product image id not found'
        );

        return;
      }

      setImageLoading(true);
      setErrorMessage('');

      try {
        await deleteProductImage(
          editingProduct,
          imageId
        );

        await fetchProductImages(
          editingProduct
        );
      } catch (error) {
        console.error(
          'Failed to delete product image:',
          error
        );

        setErrorMessage(
          getApiErrorMessage(
            error,
            'Failed to delete product image'
          )
        );

        setImageLoading(
          false
        );
      }
    };

  const handleReorderProductImages = async (images) => {
    if (!editingProduct || !Array.isArray(images) || images.length === 0) {
      return false;
    }

    const imageIds = images
      .map((image) => getImageId(image))
      .filter(Boolean);

    if (imageIds.length !== images.length) {
      setErrorMessage('Unable to reorder images because an image ID is missing.');
      return false;
    }

    try {
      setImageLoading(true);

      await reorderProductImages(editingProduct, imageIds);
      await fetchProductImages(editingProduct);

      return true;
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'Failed to reorder product images'
        )
      );

      await fetchProductImages(editingProduct);
      return false;
    } finally {
      setImageLoading(false);
    }
  };

  const moveProductImage = async (index, direction) => {
    const targetIndex = index + direction;

    if (
      targetIndex < 0 ||
      targetIndex >= productImages.length ||
      imageLoading
    ) {
      return;
    }

    const updatedImages = [...productImages];

    [updatedImages[index], updatedImages[targetIndex]] = [
      updatedImages[targetIndex],
      updatedImages[index],
    ];

    setProductImages(updatedImages);

    const success = await handleReorderProductImages(updatedImages);

    if (!success) {
      await fetchProductImages(editingProduct);
    }
  };

  const removeSelectedImage =
    (
      index
    ) => {
      setSelectedImages(
        (prev) =>
          prev.filter(
            (_, imageIndex) =>
              imageIndex !==
              index
          )
      );
    };

  const handleSave =
    async (
      e
    ) => {
      e.preventDefault();

      setErrorMessage('');

      if (
        !formData.name.trim()
      ) {
        setErrorMessage(
          'Product name is required'
        );

        return;
      }

      if (
        !formData.categoryId
      ) {
        setErrorMessage(
          'Please select a category'
        );

        return;
      }

      if (
        !formData.subcategoryId
      ) {
        setErrorMessage(
          'Please select a subcategory'
        );

        return;
      }

      if (
        formData.price ===
          '' ||
        Number(
          formData.price
        ) < 0
      ) {
        setErrorMessage(
          'Product price is required'
        );

        return;
      }

      if (
        !formData.unit.trim()
      ) {
        setErrorMessage(
          'Product unit is required'
        );

        return;
      }

      if (
        !editingProduct &&
        !formData.imageFile
      ) {
        setErrorMessage(
          'Product image is required'
        );

        return;
      }

      const price =
        Number(
          formData.price
        );

      const originalPrice =
        formData.originalPrice ===
        ''
          ? 0
          : Number(
              formData.originalPrice
            );

      const calculatedDiscount =
        originalPrice > 0
          ? Math.max(
              0,
              Math.round(
                ((originalPrice - price) /
                  originalPrice) *
                  100
              )
            )
          : 0;

      const discountPercent =
        calculatedDiscount;

      if (
        Number.isNaN(
          price
        ) ||
        price < 0
      ) {
        setErrorMessage(
          'Please enter a valid price'
        );

        return;
      }

      if (
        Number.isNaN(
          originalPrice
        ) ||
        originalPrice < 0
      ) {
        setErrorMessage(
          'Please enter a valid original price'
        );

        return;
      }

      if (
        Number.isNaN(
          discountPercent
        ) ||
        discountPercent <
          0 ||
        discountPercent >
          100
      ) {
        setErrorMessage(
          'Discount must be between 0 and 100'
        );

        return;
      }

      if (
        originalPrice >
          0 &&
        price >
          originalPrice
      ) {
        setErrorMessage(
          'Price cannot be greater than original price'
        );

        return;
      }

      const payload = {
        name:
          formData.name.trim(),
        description:
          formData.description.trim(),
        categoryId:
          formData.categoryId,
        subcategoryId:
          formData.subcategoryId,
        price,
        originalPrice,
        unit:
          formData.unit.trim(),
        discountPercent,
        active:
          Boolean(
            formData.active
          )
      };

      setSaving(true);
      setErrorMessage('');

      try {
        if (
          editingProduct
        ) {
          await updateProduct(
            editingProduct,
            payload
          );

          if (
            selectedImages.length >
            0
          ) {
            await addProductImages(
              editingProduct,
              selectedImages
            );
          }

          await fetchProducts();

          setIsPanelOpen(
            false
          );

          setEditingProduct(
            null
          );

          setProductImages(
            []
          );

          setSelectedImages(
            []
          );

          resetForm();

          setErrorMessage('');
        } else {
          const createPayload = {
            name: payload.name,
            description: payload.description,
            categoryId: payload.categoryId,
            subcategoryId: payload.subcategoryId,
            price: payload.price,
            originalPrice: payload.originalPrice,
            unit: payload.unit
          };

          const response =
            await createProduct(
              createPayload,
              formData.imageFile
            );

          const createdProduct =
            response?.data
              ?.product ||
            response?.data ||
            response?.product ||
            response;

          const createdProductId =
            createdProduct?.id ||
            createdProduct?.productId ||
            response?.data?.id ||
            response?.id;

          if (
            !createdProductId
          ) {
            throw new Error(
              'Product created but product ID was not returned by the server'
            );
          }

          await fetchProducts();

          setIsPanelOpen(
            false
          );

          setEditingProduct(
            null
          );

          setProductImages(
            []
          );

          setSelectedImages(
            []
          );

          resetForm();

          setErrorMessage('');
        }
      } catch (error) {
        console.error(
          'Product save error:',
          error
        );

        setErrorMessage(
          getApiErrorMessage(
            error,
            'Failed to save product'
          )
        );
      } finally {
        setSaving(false);
      }
    };

  const handleStatusChange =
    async (
      product
    ) => {
      if (!product?.id) {
        return;
      }

      setActionLoading(
        product.id
      );

      setErrorMessage('');

      try {
        if (
          product.active
        ) {
          await deactivateProduct(
            product.id
          );
        } else {
          await activateProduct(
            product.id
          );
        }

        await fetchProducts();

        if (
          editingProduct ===
          product.id
        ) {
          closePanel();
        }
      } catch (error) {
        console.error(
          'Failed to change product status:',
          error
        );

        setErrorMessage(
          getApiErrorMessage(
            error,
            'Failed to update product status'
          )
        );
      } finally {
        setActionLoading(
          null
        );
      }
    };

  const filteredProducts =
    products.filter(
      (prod) => {
        const name =
          String(
            prod.name || ''
          ).toLowerCase();

        const category =
          String(
            prod.categoryName ||
              ''
          ).toLowerCase();

        const subcategory =
          String(
            prod.subcategoryName ||
              ''
          ).toLowerCase();

        const query =
          searchQuery.toLowerCase();

        const matchesSearch =
          name.includes(
            query
          ) ||
          category.includes(
            query
          ) ||
          subcategory.includes(
            query
          );

        const matchesStatus =
          stockFilter ===
            'All' ||
          (stockFilter ===
            'Active' &&
            prod.active) ||
          (stockFilter ===
            'Inactive' &&
            !prod.active);

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );

  const totalProducts =
    products.length;

  const activeProducts =
    products.filter(
      (p) => p.active
    ).length;

  const inactiveProducts =
    products.filter(
      (p) => !p.active
    ).length;

  const productStats = [
    {
      label:
        'Total Products',
      value: `${totalProducts}`,
      change: '+12.4%',
      up: true,
      accentColor:
        'bg-emerald-600',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Package,
      suffix:
        ' Products'
    },
    {
      label:
        'Active Products',
      value: `${activeProducts}`,
      change: '+8.2%',
      up: true,
      accentColor:
        'bg-teal-600',
      iconBg:
        'bg-teal-50 text-teal-700',
      tagColor:
        'text-teal-700 bg-teal-50/80 border-teal-200/80',
      icon:
        CheckCircle2,
      suffix:
        ' Active'
    },
    {
      label:
        'Inactive Products',
      value: `${inactiveProducts}`,
      change: '-4.1%',
      up: false,
      accentColor:
        'bg-emerald-500',
      iconBg:
        'bg-amber-50 text-amber-700',
      tagColor:
        'text-amber-700 bg-amber-50/80 border-amber-200/80',
      icon:
        AlertTriangle,
      suffix:
        ' Inactive'
    },
    {
      label:
        'Available Products',
      value: `${activeProducts}`,
      change: '+2.8%',
      up: true,
      accentColor:
        'bg-green-700',
      iconBg:
        'bg-rose-50 text-rose-700',
      tagColor:
        'text-rose-700 bg-rose-50/80 border-rose-200/80',
      icon:
        CheckCircle2,
      suffix:
        ' Available'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar
        currentTab={
          currentTab
        }
        setCurrentTab={
          setCurrentTab
        }
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
              Product Catalog

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
              onClick={
                openAddPanel
              }
              className="px-4 py-2.5 bg-emerald-500/20 border border-emerald-700 rounded-2xl hover:bg-emerald-500/30 transition-all text-xs font-semibold text-emerald-100 flex items-center gap-2"
            >
              <Plus size={15} />
              Add Product
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
                    month:
                      'short',
                    day: 'numeric',
                    year:
                      'numeric'
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
              onClick={
                fetchProducts
              }
              disabled={
                isRefreshing
              }
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
          {productStats.map(
            (
              stat,
              idx
            ) => {
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
                    delay:
                      idx *
                      0.1
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
                        {
                          stat.label
                        }
                      </span>

                      <motion.div
                        whileHover={{
                          rotate: 12,
                          scale: 1.1
                        }}
                        className={`${stat.iconBg} p-2.5 rounded-2xl transition-all shadow-xs`}
                      >
                        <IconComponent
                          size={
                            18
                          }
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
                            {
                              stat.suffix
                            }
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
                          size={
                            13
                          }
                          className="text-emerald-600"
                        />
                      ) : (
                        <ArrowDownRight
                          size={
                            13
                          }
                          className="text-rose-600"
                        />
                      )}

                      {
                        stat.change
                      }
                    </span>

                    <span className="text-[11px] text-black font-semibold">
                      Monthly
                      Period
                    </span>
                  </div>
                </motion.div>
              );
            }
          )}
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
                  <Package
                    size={18}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Product
                    Records
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Product
                    catalog
                    management
                    directory
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
                    placeholder="Search products..."
                    value={
                      searchQuery
                    }
                    onChange={(
                      e
                    ) =>
                      setSearchQuery(
                        e
                          .target
                          .value
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
                  ].map(
                    (
                      status
                    ) => (
                      <button
                        key={
                          status
                        }
                        onClick={() =>
                          setStockFilter(
                            status
                          )
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                          stockFilter ===
                          status
                            ? 'bg-white text-emerald-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {
                          status
                        }
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">
                    <th className="py-3.5 px-4 rounded-l-xl">
                      Product
                    </th>

                    <th className="py-3.5 px-4">
                      Category
                    </th>

                    <th className="py-3.5 px-4">
                      Unit Rate
                    </th>

                    <th className="py-3.5 px-4">
                      Unit
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Availability
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
                        className="py-12 text-center"
                      >
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Loader2
                            size={
                              28
                            }
                            className="animate-spin text-emerald-600"
                          />

                          <span className="text-xs font-semibold">
                            Loading
                            products...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.length >
                    0 ? (
                    filteredProducts.map(
                      (
                        prod,
                        idx
                      ) => (
                        <motion.tr
                          key={
                            prod.id
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
                            duration:
                              0.3,
                            delay:
                              0.3 +
                              idx *
                                0.05
                          }}
                          className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:border-emerald-300 transition-colors overflow-hidden">
                                {prod.imageUrl ? (
                                  <img
                                    src={
                                      prod.imageUrl
                                    }
                                    alt={
                                      prod.name ||
                                      'Product'
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package
                                    size={
                                      17
                                    }
                                    className="text-emerald-600"
                                  />
                                )}
                              </div>

                              <div className="flex flex-col">
                                <span className="font-semibold text-black group-hover:text-emerald-700 transition-colors">
                                  {
                                    prod.name
                                  }
                                </span>

                                <span className="text-[10px] text-slate-500">
                                  {prod.subcategoryName ||
                                    prod.categoryName ||
                                    'Product'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-700 font-semibold">
                                {
                                  prod.categoryName ||
                                  '-'
                                }
                              </span>

                              <span className="text-[10px] text-slate-400 font-normal">
                                {
                                  prod.subcategoryName ||
                                  '-'
                                }
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-black">
                                ₹
                                {Number(
                                  prod.price ||
                                    0
                                ).toFixed(
                                  2
                                )}
                              </span>

                              {Number(
                                prod.originalPrice ||
                                  0
                              ) >
                                Number(
                                  prod.price ||
                                    0
                                ) && (
                                <span className="text-[10px] text-slate-400 line-through">
                                  ₹
                                  {Number(
                                    prod.originalPrice ||
                                      0
                                  ).toFixed(
                                    2
                                  )}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-[10px] font-semibold text-slate-600">
                              {
                                prod.unit ||
                                '-'
                              }
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all duration-300 group-hover:scale-105 ${
                                prod.active
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                  : 'bg-rose-50 text-rose-700 border-rose-200/80'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  prod.active
                                    ? 'bg-emerald-500'
                                    : 'bg-rose-500'
                                }`}
                              />

                              {prod.active
                                ? 'Active'
                                : 'Inactive'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  openEditPanel(
                                    prod
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  prod.id
                                }
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-40"
                                title="Edit Product"
                              >
                                {actionLoading ===
                                prod.id ? (
                                  <Loader2
                                    size={
                                      15
                                    }
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Edit3
                                    size={
                                      15
                                    }
                                  />
                                )}
                              </button>

                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    prod
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  prod.id
                                }
                                className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                                  prod.active
                                    ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                    : 'text-slate-400 hover:text-emerald-700 hover:bg-emerald-50'
                                }`}
                                title={
                                  prod.active
                                    ? 'Deactivate Product'
                                    : 'Activate Product'
                                }
                              >
                                {actionLoading ===
                                prod.id ? (
                                  <Loader2
                                    size={
                                      15
                                    }
                                    className="animate-spin"
                                  />
                                ) : prod.active ? (
                                  <PowerOff
                                    size={
                                      15
                                    }
                                  />
                                ) : (
                                  <Power
                                    size={
                                      15
                                    }
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
                        colSpan="6"
                        className="py-12 text-center"
                      >
                        <Package
                          size={
                            35
                          }
                          className="mx-auto text-slate-300 mb-3"
                        />

                        <p className="text-xs font-semibold text-slate-400">
                          No
                          matching
                          product
                          records
                          found.
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
                  Loading
                  products...
                </div>
              ) : filteredProducts.length >
                0 ? (
                filteredProducts.map(
                  (
                    prod
                  ) => (
                    <motion.div
                      key={
                        prod.id
                      }
                      whileHover={{
                        scale: 1.01
                      }}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center overflow-hidden">
                            {prod.imageUrl ? (
                              <img
                                src={
                                  prod.imageUrl
                                }
                                alt={
                                  prod.name ||
                                  'Product'
                                }
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package
                                size={
                                  16
                                }
                              />
                            )}
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700 transition-colors">
                              {
                                prod.name
                              }
                            </h4>

                            <p className="text-[10px] text-slate-400">
                              {
                                prod.categoryName ||
                                'Product'
                              }
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
                              prod.active
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                            }`}
                          />

                          {prod.active
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Category
                          </span>

                          <span className="text-slate-500 font-semibold">
                            {
                              prod.categoryName ||
                              '-'
                            }
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Subcategory
                          </span>

                          <span className="text-slate-500 font-semibold">
                            {
                              prod.subcategoryName ||
                              '-'
                            }
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Unit Rate
                          </span>

                          <span className="font-semibold text-black">
                            ₹
                            {Number(
                              prod.price ||
                                0
                            ).toFixed(
                              2
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Unit
                          </span>

                          <span className="font-semibold text-slate-500">
                            {
                              prod.unit ||
                              '-'
                            }
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Discount
                          </span>

                          <span className="font-semibold text-slate-500">
                            {Number(
                              prod.discountPercent ||
                                0
                            )}
                            %
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Availability
                          </span>

                          <span className="font-semibold text-slate-500">
                            {prod.active
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-1 pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() =>
                            openEditPanel(
                              prod
                            )
                          }
                          disabled={
                            actionLoading ===
                            prod.id
                          }
                          className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                          title="Edit Product"
                        >
                          {actionLoading ===
                          prod.id ? (
                            <Loader2
                              size={
                                15
                              }
                              className="animate-spin"
                            />
                          ) : (
                            <Edit3
                              size={
                                15
                              }
                            />
                          )}
                        </button>

                        <button
                          onClick={() =>
                            handleStatusChange(
                              prod
                            )
                          }
                          disabled={
                            actionLoading ===
                            prod.id
                          }
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                          title={
                            prod.active
                              ? 'Deactivate Product'
                              : 'Activate Product'
                          }
                        >
                          {actionLoading ===
                          prod.id ? (
                            <Loader2
                              size={
                                15
                              }
                              className="animate-spin"
                            />
                          ) : prod.active ? (
                            <PowerOff
                              size={
                                15
                              }
                            />
                          ) : (
                            <Power
                              size={
                                15
                              }
                            />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )
                )
              ) : (
                <div className="py-10 text-center">
                  <Package
                    size={
                      35
                    }
                    className="mx-auto text-slate-300 mb-3"
                  />

                  <p className="text-xs font-semibold text-slate-400">
                    No
                    products
                    found.
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
              transition={{
                duration: 0.2
              }}
              className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 relative"
            >
              <button
                type="button"
                onClick={
                  closePanel
                }
                disabled={
                  saving ||
                  imageUploading
                }
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 z-10"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5 mb-6 pr-8">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-2xl flex items-center justify-center">
                  {editingProduct ? (
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
                    Product
                    Management
                  </span>

                  <h3 className="text-lg font-bold text-black">
                    {editingProduct
                      ? 'Update Product'
                      : 'Create Product'}
                  </h3>
                </div>
              </div>

              <form
                onSubmit={
                  handleSave
                }
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Product
                    Title
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="e.g. Crisp Romaine Lettuce"
                    value={
                      formData.name
                    }
                    onChange={(
                      e
                    ) =>
                      setFormData(
                        (
                          prev
                        ) => ({
                          ...prev,
                          name: e
                            .target
                            .value
                        })
                      )
                    }
                    className="w-full h-[38px] px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    placeholder="Product description"
                    value={
                      formData.description
                    }
                    onChange={(
                      e
                    ) =>
                      setFormData(
                        (
                          prev
                        ) => ({
                          ...prev,
                          description:
                            e
                              .target
                              .value
                        })
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Category
                    </label>

                    <SelectDropdown
                      value={
                        formData.categoryId
                      }
                      options={
                        categories
                      }
                      placeholder="Select category"
                      loading={
                        categoriesLoading
                      }
                      disabled={
                        categoriesLoading ||
                        saving ||
                        imageUploading
                      }
                      onChange={
                        handleCategoryChange
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Subcategory
                    </label>

                    <SelectDropdown
                      value={
                        formData.subcategoryId
                      }
                      options={
                        subcategories
                      }
                      placeholder={
                        formData.categoryId
                          ? 'Select subcategory'
                          : 'Select category first'
                      }
                      loading={
                        subcategoriesLoading
                      }
                      disabled={
                        !formData.categoryId ||
                        subcategoriesLoading ||
                        saving ||
                        imageUploading
                      }
                      onChange={
                        handleSubcategoryChange
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Price
                      (₹)
                    </label>

                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={
                        formData.price
                      }
                      onChange={(
                        e
                      ) =>
                        setFormData(
                          (
                            prev
                          ) => ({
                            ...prev,
                            price: e
                              .target
                              .value
                          })
                        )
                      }
                      className="w-full h-[38px] px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Original
                      Price
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={
                        formData.originalPrice
                      }
                      onChange={(
                        e
                      ) =>
                        setFormData(
                          (
                            prev
                          ) => ({
                            ...prev,
                            originalPrice:
                              e
                                .target
                                .value
                          })
                        )
                      }
                      className="w-full h-[38px] px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Unit
                      Metric
                    </label>

                    <UnitDropdown
                      value={
                        formData.unit
                      }
                      onChange={(
                        unit
                      ) =>
                        setFormData(
                          (
                            prev
                          ) => ({
                            ...prev,
                            unit
                          })
                        )
                      }
                    />

                    {!UNIT_OPTIONS.some(
                      (
                        option
                      ) =>
                        option.value ===
                        formData.unit
                    ) &&
                      formData.unit && (
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {
                            formData.unit
                          }
                        </span>
                      )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Discount
                      %
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={
                        formData.discountPercent
                      }
                      onChange={(
                        e
                      ) =>
                        setFormData(
                          (
                            prev
                          ) => ({
                            ...prev,
                            discountPercent:
                              e
                                .target
                                .value
                          })
                        )
                      }
                      className="w-full h-[38px] px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-black uppercase tracking-wider block">
                      Product
                      Status
                    </span>

                    <span className="text-[10px] text-slate-400">
                      {formData.active
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData(
                        (
                          prev
                        ) => ({
                          ...prev,
                          active:
                            !prev.active
                        })
                      )
                    }
                    className={`relative w-11 h-6 rounded-full transition-all ${
                      formData.active
                        ? 'bg-emerald-600'
                        : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        formData.active
                          ? 'left-6'
                          : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-black uppercase tracking-wider">
                      Product
                      Images
                    </label>

                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer">
                      <Upload
                        size={
                          13
                        }
                      />

                      {editingProduct ? 'Select Images' : 'Select Image'}

                      <input
                        type="file"
                        accept="image/*"
                        multiple={
                          Boolean(
                            editingProduct
                          )
                        }
                        disabled={
                          saving ||
                          imageUploading
                        }
                        onChange={
                          handleImageSelect
                        }
                        className="hidden"
                      />
                    </label>
                  </div>

                  {!editingProduct &&
                    formData.imageUrl && (
                      <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-slate-700">
                            Selected
                            Image
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setFormData(
                                (
                                  prev
                                ) => ({
                                  ...prev,
                                  imageFile:
                                    null,
                                  imageUrl:
                                    ''
                                })
                              )
                            }
                            disabled={
                              saving
                            }
                            className="p-1 rounded-full bg-rose-500 text-white disabled:opacity-50"
                          >
                            <X
                              size={
                                10
                              }
                            />
                          </button>
                        </div>

                        <div className="relative w-full h-44 rounded-xl overflow-hidden border border-emerald-100 bg-white">
                          <img
                            src={
                              formData.imageUrl
                            }
                            alt="Product Preview"
                            className="w-full h-full object-cover"
                          />

                          <div className="absolute left-2 bottom-2 px-2 py-1 rounded-lg bg-black/60 text-white text-[9px] font-semibold">
                            Ready to upload
                          </div>
                        </div>

                        {formData.imageFile && (
                          <div className="mt-2 text-[10px] font-semibold text-emerald-700 truncate">
                            {
                              formData
                                .imageFile
                                .name
                            }
                          </div>
                        )}
                      </div>
                    )}

                  {editingProduct &&
                    selectedImages.length >
                      0 && (
                      <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-slate-700">
                            Selected
                            Images
                            (
                            {
                              selectedImages.length
                            }
                            )
                          </span>

                          <button
                            type="button"
                            onClick={
                              handleProductImageUpload
                            }
                            disabled={
                              imageUploading ||
                              !editingProduct
                            }
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {imageUploading ? (
                              <Loader2
                                size={
                                  12
                                }
                                className="animate-spin"
                              />
                            ) : (
                              <Upload
                                size={
                                  12
                                }
                              />
                            )}

                            {imageUploading
                              ? 'Uploading...'
                              : 'Upload'}
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {selectedImages.map(
                            (
                              file,
                              index
                            ) => (
                              <div
                                key={`${file.name}-${index}`}
                                className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-white"
                              >
                                <img
                                  src={URL.createObjectURL(
                                    file
                                  )}
                                  alt={
                                    file.name
                                  }
                                  className="w-full h-full object-cover"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeSelectedImage(
                                      index
                                    )
                                  }
                                  disabled={
                                    imageUploading
                                  }
                                  className="absolute top-1 right-1 p-1 rounded-full bg-rose-500 text-white shadow disabled:opacity-50"
                                >
                                  <X
                                    size={
                                      10
                                    }
                                  />
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {editingProduct &&
                    (imageLoading ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2 border border-dashed border-slate-200 rounded-xl">
                        <Loader2
                          size={
                            22
                          }
                          className="animate-spin text-emerald-600"
                        />

                        <span className="text-[10px] font-semibold text-slate-400">
                          Loading
                          images...
                        </span>
                      </div>
                    ) : productImages.length >
                      0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {productImages.map(
                          (
                            image,
                            index
                          ) => {
                            const imageUrl =
                              getImageUrl(
                                image
                              );

                            const imageId =
                              getImageId(
                                image
                              );

                            return (
                              <div
                                key={
                                  imageId ||
                                  index
                                }
                                className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group"
                              >
                                {imageUrl ? (
                                  <img
                                    src={
                                      imageUrl
                                    }
                                    alt={`Product ${
                                      index +
                                      1
                                    }`}
                                    className="w-full aspect-square object-cover"
                                  />
                                ) : (
                                  <div className="w-full aspect-square flex items-center justify-center">
                                    <Image
                                      size={
                                        25
                                      }
                                      className="text-slate-300"
                                    />
                                  </div>
                                )}

                                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between">
                                  <span className="text-[9px] font-bold text-white">
                                    Image{' '}
                                    {index +
                                      1}
                                  </span>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={
                                        index ===
                                          0 ||
                                        imageLoading
                                      }
                                      onClick={() =>
                                        moveProductImage(
                                          index,
                                          -1
                                        )
                                      }
                                      className="p-1 rounded-md bg-white/90 text-slate-700 disabled:opacity-30"
                                    >
                                      <ArrowUp
                                        size={
                                          11
                                        }
                                      />
                                    </button>

                                    <button
                                      type="button"
                                      disabled={
                                        index ===
                                          productImages.length -
                                            1 ||
                                        imageLoading
                                      }
                                      onClick={() =>
                                        moveProductImage(
                                          index,
                                          1
                                        )
                                      }
                                      className="p-1 rounded-md bg-white/90 text-slate-700 disabled:opacity-30"
                                    >
                                      <ArrowDown
                                        size={
                                          11
                                        }
                                      />
                                    </button>

                                    <button
                                      type="button"
                                      disabled={
                                        !imageId ||
                                        imageLoading
                                      }
                                      onClick={() =>
                                        handleDeleteProductImage(
                                          image
                                        )
                                      }
                                      className="p-1 rounded-md bg-rose-500 text-white disabled:opacity-30"
                                    >
                                      <Trash2
                                        size={
                                          11
                                        }
                                      />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <div className="py-8 flex flex-col items-center justify-center gap-2 border border-dashed border-slate-200 rounded-xl">
                        <Image
                          size={
                            24
                          }
                          className="text-slate-300"
                        />

                        <span className="text-[10px] font-semibold text-slate-400">
                          No
                          product
                          images
                        </span>
                      </div>
                    ))}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={
                      closePanel
                    }
                    disabled={
                      saving ||
                      imageUploading
                    }
                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      imageUploading
                    }
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm transition-colors"
                  >
                    {saving ? (
                      <Loader2
                        size={
                          14
                        }
                        className="animate-spin"
                      />
                    ) : (
                      <Save
                        size={
                          14
                        }
                      />
                    )}

                    {saving
                      ? 'Saving...'
                      : editingProduct
                      ? 'Update Product'
                      : 'Save Product'}
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