import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
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
  PowerOff
} from 'lucide-react';

import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deactivateProduct,
  activateProduct
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

    const duration = 1200;
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
    if (
      obj?.[key] !== undefined &&
      obj?.[key] !== null
    ) {
      return obj[key];
    }
  }

  return fallback;
};

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

  const sku = getValue(
    product,
    ['sku', 'SKU', 'productSku'],
    ''
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

  const normalizedStatus = String(status).toLowerCase();

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
    status,
    sku
  };
};

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

export default function Products() {
  const [currentTab, setCurrentTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    price: '',
    stock: '',
    unit: 'kg',
    status: 'In Stock',
    sku: ''
  });

  const fetchProducts = async () => {
    setIsRefreshing(true);
    setErrorMessage('');

    try {
      const response = await getProducts({
        page: 0,
        size: 100
      });

      const productList = extractProducts(response).map(
        normalizeProduct
      );

      setProducts(productList);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to fetch products:', error);

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
      status: 'In Stock',
      sku: ''
    });

    setIsPanelOpen(true);
  };

  const openEditPanel = async (product) => {
    setActionLoading(product.id);
    setErrorMessage('');

    try {
      const response = await getProductById(product.id);

      const productData =
        response?.data?.product ||
        response?.data ||
        response?.product ||
        product;

      const normalized = normalizeProduct(productData);

      setEditingProduct(product.id);

      setFormData({
        id: normalized.id,
        name: normalized.name,
        category: normalized.category,
        price: String(normalized.price).replace(/[₹,]/g, ''),
        stock: normalized.stock,
        unit: normalized.unit,
        status: normalized.status,
        sku: normalized.sku
      });

      setIsPanelOpen(true);
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

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage('Product name is required');
      return;
    }

    if (!formData.sku.trim()) {
      setErrorMessage('SKU is required');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const stockVal = parseInt(formData.stock, 10) || 0;
    const priceVal = parseFloat(formData.price) || 0;

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
      sku: formData.sku.trim(),
      status: computedStatus
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct, payload);
      } else {
        await createProduct(payload);
      }

      await fetchProducts();

      setIsPanelOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to save product:', error);

      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to save product'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (product) => {
    if (!product?.id) {
      return;
    }

    setActionLoading(product.id);
    setErrorMessage('');

    try {
      if (product.status === 'Out of Stock') {
        await activateProduct(product.id);
      } else {
        await deactivateProduct(product.id);
      }

      await fetchProducts();

      if (editingProduct === product.id) {
        setIsPanelOpen(false);
        setEditingProduct(null);
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
    const sku = String(prod.sku || '').toLowerCase();
    const category = String(prod.category || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      name.includes(query) ||
      sku.includes(query) ||
      category.includes(query);

    const matchesStock =
      stockFilter === 'All' ||
      prod.status === stockFilter;

    return matchesSearch && matchesStock;
  });

  const productStats = [
    {
      label: 'Total SKUs',
      value: `${products.length} Products`,
      cardBg:
        'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent',
      cardBorder: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-700',
      icon: Package
    },
    {
      label: 'In Stock',
      value: `${products.filter((p) => p.status === 'In Stock').length} Active`,
      cardBg:
        'bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-transparent',
      cardBorder: 'border-teal-500/20',
      iconBg: 'bg-teal-500/15 text-teal-700',
      icon: CheckCircle2
    },
    {
      label: 'Low Stock Warnings',
      value: `${products.filter((p) => p.status === 'Low Stock').length} Alerted`,
      cardBg:
        'bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent',
      cardBorder: 'border-amber-500/20',
      iconBg: 'bg-amber-500/15 text-amber-700',
      icon: AlertTriangle
    },
    {
      label: 'Out of Stock',
      value: `${products.filter((p) => p.status === 'Out of Stock').length} Depleted`,
      cardBg:
        'bg-gradient-to-br from-rose-500/10 via-rose-400/5 to-transparent',
      cardBorder: 'border-rose-500/20',
      iconBg: 'bg-rose-500/15 text-rose-700',
      icon: XCircle
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/10 to-teal-50/20 flex font-sans antialiased text-slate-800">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto max-h-screen">
        <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-850 text-white shadow-lg overflow-hidden border border-emerald-700/30">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 z-10 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-100 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15">
                Inventory Control
              </span>

              <div className="flex items-center gap-3 bg-rose-950/60 backdrop-blur-md border border-rose-500/30 px-3.5 py-1.5 rounded-full text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.2)] max-w-[190px] overflow-hidden">
                <span className="relative flex h-3.5 w-3.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border border-white/20" />
                </span>

                <div className="overflow-hidden whitespace-nowrap text-[11px] font-black uppercase tracking-widest text-white w-full">
                  <marquee scrollamount="3.5" className="leading-none">
                    LIVE ADMIN VEG GO
                  </marquee>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Product Catalog
            </h1>
          </div>

          <div className="flex items-center gap-3 z-10">
            <button
              onClick={openAddPanel}
              className="px-5 py-3 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-2xl flex items-center gap-2 text-xs font-bold border border-white/10 shadow-sm transition-all active:scale-95"
            >
              <Plus size={16} />
              Add Product
            </button>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm text-sm font-bold text-emerald-50">
              <Calendar size={16} className="text-emerald-300" />
              <span>
                {new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl hover:bg-white/20 transition-all active:scale-95 shadow-sm text-white disabled:opacity-50"
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

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
            {errorMessage}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {productStats.map((stat, idx) => {
            const IconComponent = stat.icon;

            return (
              <div
                key={idx}
                className={`${stat.cardBg} ${stat.cardBorder} p-6 rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 pointer-events-none" />

                <div>
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </p>

                  <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                    <AnimatedValue
                      value={loading ? '...' : stat.value}
                      key={`${refreshKey}-${stat.value}`}
                    />
                  </h3>
                </div>

                <div
                  className={`${stat.iconBg} p-4 rounded-2xl border border-white/10 shadow-sm z-10`}
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
                  placeholder="Search by product name, SKU or category..."
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
                  {[
                    'All',
                    'In Stock',
                    'Low Stock',
                    'Out of Stock'
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        setStockFilter(status)
                      }
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        stockFilter === status
                          ? 'bg-white text-emerald-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase font-bold tracking-widest text-slate-400">
                    <th className="pb-4 pl-2">SKU</th>
                    <th className="pb-4">Product details</th>
                    <th className="pb-4">Category</th>
                    <th className="pb-4">Unit Rate</th>
                    <th className="pb-4 text-center">
                      Stock Volume
                    </th>
                    <th className="pb-4">Availability</th>
                    <th className="pb-4 text-right pr-2">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100/60">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Loader2
                            size={28}
                            className="animate-spin text-emerald-600"
                          />
                          <span className="text-sm font-semibold">
                            Loading products...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Package size={34} />
                          <span className="text-sm font-semibold">
                            No products found
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => (
                      <tr
                        key={prod.id}
                        className="text-sm font-semibold text-slate-600 hover:bg-emerald-50/20 transition-colors"
                      >
                        <td className="py-5 pl-2 font-mono text-xs font-bold text-slate-400">
                          {prod.sku || '-'}
                        </td>

                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                              <Package size={18} />
                            </div>

                            <div>
                              <span className="font-bold text-slate-900 block">
                                {prod.name || '-'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 text-slate-500 font-medium">
                          {prod.category || '-'}
                        </td>

                        <td className="py-5 font-bold text-slate-900">
                          {prod.price || '₹0.00'}
                          <span className="text-xs text-slate-400 font-normal">
                            {' '}
                            / {prod.unit || 'kg'}
                          </span>
                        </td>

                        <td className="py-5 text-center font-bold text-slate-900">
                          {prod.stock ?? 0}
                          <span className="text-xs text-slate-400 font-normal">
                            {' '}
                            {prod.unit || 'kg'}
                          </span>
                        </td>

                        <td className="py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                              prod.status === 'In Stock'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : prod.status === 'Low Stock'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}
                          >
                            {prod.status === 'In Stock' && (
                              <CheckCircle2 size={12} />
                            )}

                            {prod.status === 'Low Stock' && (
                              <AlertTriangle size={12} />
                            )}

                            {prod.status === 'Out of Stock' && (
                              <XCircle size={12} />
                            )}

                            {prod.status}
                          </span>
                        </td>

                        <td className="py-5 text-right pr-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() =>
                                openEditPanel(prod)
                              }
                              disabled={
                                actionLoading === prod.id
                              }
                              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
                              title="Edit Product"
                            >
                              {actionLoading === prod.id ? (
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
                                handleStatusChange(prod)
                              }
                              disabled={
                                actionLoading === prod.id
                              }
                              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                prod.status === 'Out of Stock'
                                  ? 'hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'
                                  : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                              }`}
                              title={
                                prod.status === 'Out of Stock'
                                  ? 'Activate Product'
                                  : 'Deactivate Product'
                              }
                            >
                              {actionLoading === prod.id ? (
                                <Loader2
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : prod.status === 'Out of Stock' ? (
                                <Power size={15} />
                              ) : (
                                <PowerOff size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {isPanelOpen && (
            <aside className="w-full lg:w-96 bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8 shrink-0">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <h3 className="text-lg font-black text-slate-900">
                  {editingProduct
                    ? 'Modify Product'
                    : 'Add Product'}
                </h3>

                <button
                  onClick={() =>
                    setIsPanelOpen(false)
                  }
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
                    Product Title
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="e.g. Crisp Romaine Lettuce"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Stock Keeping Unit (SKU)
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="VG-LTC-09"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sku: e.target.value
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Taxonomy Category
                  </label>

                  <input
                    type="text"
                    placeholder="Leafy Greens"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-700 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Unit Rate (₹)
                    </label>

                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Unit Metric
                    </label>

                    <select
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          unit: e.target.value
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-700 font-bold"
                    >
                      <option value="kg">kg</option>
                      <option value="bunch">bunch</option>
                      <option value="box">box</option>
                      <option value="pack">pack</option>
                      <option value="piece">piece</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    In-Stock Quantity
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stock: e.target.value
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-700 font-semibold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() =>
                      setIsPanelOpen(false)
                    }
                    disabled={saving}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm transition-colors"
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
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}