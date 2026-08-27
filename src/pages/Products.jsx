import React, { useState, useEffect } from 'react';
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
  Package,
  Loader2,
  Power,
  PowerOff,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap
} from 'lucide-react';

import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deactivateProduct,
  activateProduct
} from '../Api/catalogService/productService';

/* =========================================================
   ANIMATED VALUE
========================================================= */

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
        progress === 1
          ? 1
          : 1 - Math.pow(2, -10 * progress);

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
        `${isRupee ? '₹' : ''}${formatted}${
          suffix ? ` ${suffix}` : ''
        }`
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
   HELPERS
========================================================= */

const getValue = (obj, keys, fallback = '') => {
  for (const key of keys) {
    if (
      obj?.[key] !== undefined &&
      obj?.[key] !== null
    ) {
      return obj[key];
    }
  }

  return fallback;
};

/* =========================================================
   NORMALIZE PRODUCT
========================================================= */

const normalizeProduct = (product) => {
  const id = getValue(
    product,
    ['id', '_id', 'productId'],
    ''
  );

  const name = getValue(
    product,
    ['name', 'productName', 'title'],
    ''
  );

  const categoryValue = getValue(
    product,
    ['category', 'categoryName', 'categoryId'],
    ''
  );

  const priceValue = getValue(
    product,
    ['price', 'unitPrice', 'sellingPrice'],
    0
  );

  const stockValue = getValue(
    product,
    [
      'stock',
      'quantity',
      'stockQuantity',
      'availableStock'
    ],
    0
  );

  const unit = getValue(
    product,
    ['unit', 'unitMetric'],
    'kg'
  );

  const rawStatus = getValue(
    product,
    ['status', 'availability', 'stockStatus'],
    ''
  );

  const numericStock = Number(stockValue) || 0;

  let status = rawStatus;

  if (!status) {
    if (numericStock === 0) {
      status = 'Out of Stock';
    } else if (numericStock < 15) {
      status = 'Low Stock';
    } else {
      status = 'In Stock';
    }
  }

  const normalizedStatus =
    String(status).toLowerCase();

  if (
    normalizedStatus === 'active' ||
    normalizedStatus === 'in stock' ||
    normalizedStatus === 'available'
  ) {
    status =
      numericStock === 0
        ? 'Out of Stock'
        : numericStock < 15
        ? 'Low Stock'
        : 'In Stock';
  }

  if (
    normalizedStatus === 'inactive' ||
    normalizedStatus === 'out of stock' ||
    normalizedStatus === 'outofstock'
  ) {
    status =
      numericStock === 0
        ? 'Out of Stock'
        : 'In Stock';
  }

  return {
    ...product,
    id,
    name,

    category:
      typeof categoryValue === 'object'
        ? getValue(
            categoryValue,
            ['name', 'title', 'categoryName'],
            ''
          )
        : categoryValue,

    price: `₹${Number(priceValue || 0).toFixed(2)}`,

    stock: numericStock,

    unit,

    status
  };
};

/* =========================================================
   EXTRACT PRODUCTS
========================================================= */

const extractProducts = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.products)) {
    return data.products;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(response?.products)) {
    return response.products;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Products() {
  const [currentTab, setCurrentTab] =
    useState('products');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [stockFilter, setStockFilter] =
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

  const [products, setProducts] =
    useState([]);

  const [isPanelOpen, setIsPanelOpen] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    price: '',
    stock: '',
    unit: 'kg',
    status: 'In Stock'
  });

  /* =========================================================
     FETCH PRODUCTS
  ========================================================= */

  const fetchProducts = async () => {
    setIsRefreshing(true);
    setErrorMessage('');

    try {
      const response = await getProducts({
        page: 0,
        size: 100
      });

      const productList =
        extractProducts(response).map(
          normalizeProduct
        );

      setProducts(productList);

      setRefreshKey(
        (prev) => prev + 1
      );
    } catch (error) {
      console.error(
        'Failed to fetch products:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to load products'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = () => {
    fetchProducts();
  };

  /* =========================================================
     ADD PRODUCT
  ========================================================= */

  const openAddPanel = () => {
    setEditingProduct(null);
    setErrorMessage('');

    setFormData({
      id: '',
      name: '',
      category: '',
      price: '',
      stock: '',
      unit: 'kg',
      status: 'In Stock'
    });

    setIsPanelOpen(true);
  };

  /* =========================================================
     EDIT PRODUCT
  ========================================================= */

  const openEditPanel = async (product) => {
    setActionLoading(product.id);
    setErrorMessage('');

    try {
      const response =
        await getProductById(product.id);

      const productData =
        response?.data?.product ||
        response?.data ||
        response?.product ||
        product;

      const normalized =
        normalizeProduct(productData);

      setEditingProduct(normalized.id);

      setFormData({
        id: normalized.id,
        name: normalized.name,
        category: normalized.category,
        price: String(
          normalized.price
        ).replace(/[₹,]/g, ''),
        stock: normalized.stock,
        unit: normalized.unit,
        status: normalized.status
      });

      setIsPanelOpen(true);
    } catch (error) {
      console.error(
        'Failed to fetch product:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch product details'
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =========================================================
     SAVE PRODUCT
  ========================================================= */

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage(
        'Product name is required'
      );
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const stockVal =
      parseInt(formData.stock, 10) || 0;

    const priceVal =
      parseFloat(formData.price) || 0;

    let computedStatus = 'In Stock';

    if (stockVal === 0) {
      computedStatus = 'Out of Stock';
    } else if (stockVal < 15) {
      computedStatus = 'Low Stock';
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: priceVal,
      stock: stockVal,
      unit: formData.unit,
      status: computedStatus
    };

    try {
      if (editingProduct) {
        await updateProduct(
          editingProduct,
          payload
        );
      } else {
        await createProduct(payload);
      }

      await fetchProducts();

      setIsPanelOpen(false);
      setEditingProduct(null);

      setFormData({
        id: '',
        name: '',
        category: '',
        price: '',
        stock: '',
        unit: 'kg',
        status: 'In Stock'
      });
    } catch (error) {
      console.error(
        'Failed to save product:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to save product'
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     STATUS CHANGE
  ========================================================= */

  const handleStatusChange = async (product) => {
    if (!product?.id) {
      return;
    }

    setActionLoading(product.id);
    setErrorMessage('');

    try {
      if (
        product.status ===
        'Out of Stock'
      ) {
        await activateProduct(product.id);
      } else {
        await deactivateProduct(product.id);
      }

      await fetchProducts();

      if (
        editingProduct === product.id
      ) {
        setIsPanelOpen(false);
        setEditingProduct(null);
      }
    } catch (error) {
      console.error(
        'Failed to change product status:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update product status'
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredProducts =
    products.filter((prod) => {
      const name =
        String(
          prod.name || ''
        ).toLowerCase();

      const category =
        String(
          prod.category || ''
        ).toLowerCase();

      const query =
        searchQuery.toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        category.includes(query);

      const matchesStock =
        stockFilter === 'All' ||
        prod.status === stockFilter;

      return (
        matchesSearch &&
        matchesStock
      );
    });

  /* =========================================================
     STATS
  ========================================================= */

  const totalProducts =
    products.length;

  const inStock =
    products.filter(
      (p) =>
        p.status === 'In Stock'
    ).length;

  const lowStock =
    products.filter(
      (p) =>
        p.status === 'Low Stock'
    ).length;

  const outOfStock =
    products.filter(
      (p) =>
        p.status === 'Out of Stock'
    ).length;

  const productStats = [
    {
      label: 'Total Products',
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
      suffix: ' Products'
    },

    {
      label: 'In Stock',
      value: `${inStock}`,
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
      label: 'Low Stock Warnings',
      value: `${lowStock}`,
      change: '-4.1%',
      up: false,
      accentColor:
        'bg-emerald-500',
      iconBg:
        'bg-amber-50 text-amber-700',
      tagColor:
        'text-amber-700 bg-amber-50/80 border-amber-200/80',
      icon: AlertTriangle,
      suffix: ' Alerted'
    },

    {
      label: 'Out of Stock',
      value: `${outOfStock}`,
      change: '-2.8%',
      up: false,
      accentColor:
        'bg-green-700',
      iconBg:
        'bg-rose-50 text-rose-700',
      tagColor:
        'text-rose-700 bg-rose-50/80 border-rose-200/80',
      icon: XCircle,
      suffix: ' Depleted'
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
              onClick={openAddPanel}
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

        {/* =====================================================
            ERROR MESSAGE
        ===================================================== */}

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

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

          {productStats.map(
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
            }
          )}

        </section>

        {/* =====================================================
            PRODUCT TABLE
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

            {/* TABLE HEADER */}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <Package size={18} />
                </div>

                <div>

                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Product Records
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Product inventory management directory
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2 flex-wrap">

                {/* SEARCH */}

                <div className="relative flex-1 sm:w-72">

                  <Search
                    className="absolute left-3 top-2.5 text-slate-400"
                    size={15}
                  />

                  <input
                    type="text"
                    placeholder="Search products..."
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
                    'In Stock',
                    'Low Stock',
                    'Out of Stock'
                  ].map(
                    (status) => (
                      <button
                        key={status}
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
                      Product
                    </th>

                    <th className="py-3.5 px-4">
                      Category
                    </th>

                    <th className="py-3.5 px-4">
                      Unit Rate
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Stock
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
                            size={28}
                            className="animate-spin text-emerald-600"
                          />

                          <span className="text-xs font-semibold">
                            Loading products...
                          </span>

                        </div>

                      </td>

                    </tr>
                  ) : filteredProducts.length >
                    0 ? (
                    filteredProducts.map(
                      (prod, idx) => (
                        <motion.tr
                          key={prod.id}
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

                          {/* PRODUCT */}

                          <td className="py-3.5 px-4">

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:border-emerald-300 transition-colors">

                                <Package
                                  size={17}
                                  className="text-emerald-600"
                                />

                              </div>

                              <div className="flex flex-col">

                                <span className="font-semibold text-black group-hover:text-emerald-700 transition-colors">
                                  {prod.name ||
                                    '-'}
                                </span>

                                <span className="text-[10px] text-slate-500">
                                  {prod.category ||
                                    'Product'}
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* CATEGORY */}

                          <td className="py-3.5 px-4">

                            <span className="text-[10px] text-slate-500 font-semibold">
                              {prod.category ||
                                '-'}
                            </span>

                          </td>

                          {/* PRICE */}

                          <td className="py-3.5 px-4">

                            <span className="font-semibold text-black">
                              {prod.price ||
                                '₹0.00'}
                            </span>

                            <span className="text-[10px] text-slate-400 font-normal">
                              {' '}
                              /
                              {' '}
                              {prod.unit ||
                                'kg'}
                            </span>

                          </td>

                          {/* STOCK */}

                          <td className="py-3.5 px-4 text-center">

                            <span className="font-mono font-semibold text-black">
                              {prod.stock ??
                                0}
                            </span>

                            <span className="text-[10px] text-slate-400 font-normal">
                              {' '}
                              {prod.unit ||
                                'kg'}
                            </span>

                          </td>

                          {/* STATUS */}

                          <td className="py-3.5 px-4 text-center">

                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all duration-300 group-hover:scale-105 ${
                                prod.status ===
                                'In Stock'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                  : prod.status ===
                                    'Low Stock'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                                  : 'bg-rose-50 text-rose-700 border-rose-200/80'
                              }`}
                            >

                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  prod.status ===
                                  'In Stock'
                                    ? 'bg-emerald-500'
                                    : prod.status ===
                                      'Low Stock'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                              />

                              {prod.status}

                            </span>

                          </td>

                          {/* ACTIONS */}

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
                                    prod
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  prod.id
                                }
                                className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                                  prod.status ===
                                  'Out of Stock'
                                    ? 'text-slate-400 hover:text-emerald-700 hover:bg-emerald-50'
                                    : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                }`}
                                title={
                                  prod.status ===
                                  'Out of Stock'
                                    ? 'Activate Product'
                                    : 'Deactivate Product'
                                }
                              >

                                {actionLoading ===
                                prod.id ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : prod.status ===
                                  'Out of Stock' ? (
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
                        colSpan="6"
                        className="py-12 text-center"
                      >

                        <Package
                          size={35}
                          className="mx-auto text-slate-300 mb-3"
                        />

                        <p className="text-xs font-semibold text-slate-400">
                          No matching product records found.
                        </p>

                      </td>

                    </tr>
                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                MOBILE PRODUCT CARDS
            ================================================= */}

            <div className="md:hidden space-y-3">

              {loading ? (
                <div className="py-10 text-center text-xs font-semibold text-slate-400">
                  Loading products...
                </div>
              ) : filteredProducts.length >
                0 ? (
                filteredProducts.map(
                  (prod) => (
                    <motion.div
                      key={prod.id}
                      whileHover={{
                        scale: 1.01
                      }}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group"
                    >

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2">

                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">

                            <Package
                              size={16}
                            />

                          </div>

                          <div>

                            <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700 transition-colors">
                              {prod.name ||
                                '-'}
                            </h4>

                            <p className="text-[10px] text-slate-400">
                              {prod.category ||
                                'Product'}
                            </p>

                          </div>

                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            prod.status ===
                            'In Stock'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : prod.status ===
                                'Low Stock'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >

                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              prod.status ===
                              'In Stock'
                                ? 'bg-emerald-500'
                                : prod.status ===
                                  'Low Stock'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />

                          {prod.status}

                        </span>

                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">

                        <div>

                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Category
                          </span>

                          <span className="text-slate-500 font-semibold">
                            {prod.category ||
                              '-'}
                          </span>

                        </div>

                        <div>

                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Unit Rate
                          </span>

                          <span className="font-semibold text-black">
                            {prod.price ||
                              '₹0.00'}
                          </span>

                        </div>

                        <div>

                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Stock
                          </span>

                          <span className="font-mono font-semibold text-black">
                            {prod.stock ??
                              0}{' '}
                            {prod.unit ||
                              'kg'}
                          </span>

                        </div>

                        <div>

                          <span className="text-[10px] uppercase font-semibold text-black block">
                            Availability
                          </span>

                          <span className="font-semibold text-slate-500">
                            {prod.status}
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
                              prod
                            )
                          }
                          disabled={
                            actionLoading ===
                            prod.id
                          }
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                          title={
                            prod.status ===
                            'Out of Stock'
                              ? 'Activate Product'
                              : 'Deactivate Product'
                          }
                        >

                          {actionLoading ===
                          prod.id ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : prod.status ===
                            'Out of Stock' ? (
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

                    </motion.div>
                  )
                )
              ) : (
                <div className="py-10 text-center">

                  <Package
                    size={35}
                    className="mx-auto text-slate-300 mb-3"
                  />

                  <p className="text-xs font-semibold text-slate-400">
                    No products found.
                  </p>

                </div>
              )}

            </div>

          </motion.div>

        </section>

      </main>

      {/* =====================================================
          PRODUCT CREATE / UPDATE MODAL
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
                onClick={() =>
                  setIsPanelOpen(false)
                }
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5 mb-6">

                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-2xl flex items-center justify-center">

                  {editingProduct ? (
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
                    {editingProduct
                      ? 'Update Product'
                      : 'Create Product'}
                  </h3>

                </div>

              </div>

              <form
                onSubmit={handleSave}
                className="space-y-4"
              >

                {/* PRODUCT NAME */}

                <div>

                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Product Title
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="e.g. Crisp Romaine Lettuce"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          name:
                            e.target.value
                        })
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />

                </div>

                {/* CATEGORY */}

                <div>

                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Taxonomy Category
                  </label>

                  <input
                    type="text"
                    placeholder="Leafy Greens"
                    value={
                      formData.category
                    }
                    onChange={(e) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          category:
                            e.target.value
                        })
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />

                </div>

                {/* PRICE + UNIT */}

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Unit Rate (₹)
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
                      onChange={(e) =>
                        setFormData(
                          (prev) => ({
                            ...prev,
                            price:
                              e.target.value
                          })
                        )
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />

                  </div>

                  <div>

                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Unit Metric
                    </label>

                    <select
                      value={
                        formData.unit
                      }
                      onChange={(e) =>
                        setFormData(
                          (prev) => ({
                            ...prev,
                            unit:
                              e.target.value
                          })
                        )
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    >

                      <option value="kg">
                        kg
                      </option>

                      <option value="bunch">
                        bunch
                      </option>

                      <option value="box">
                        box
                      </option>

                      <option value="pack">
                        pack
                      </option>

                      <option value="piece">
                        piece
                      </option>

                    </select>

                  </div>

                </div>

                {/* STOCK */}

                <div>

                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    In-Stock Quantity
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="0"
                    value={
                      formData.stock
                    }
                    onChange={(e) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          stock:
                            e.target.value
                        })
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />

                </div>

                {/* BUTTONS */}

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">

                  <button
                    type="button"
                    onClick={() =>
                      setIsPanelOpen(
                        false
                      )
                    }
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