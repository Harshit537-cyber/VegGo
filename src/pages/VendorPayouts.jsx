import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Calendar, 
  RefreshCw, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Package,
  Sparkles
} from 'lucide-react';

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    const match = value.match(/([₹\d,.]+)\s*(.*)/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const isRupee = value.startsWith('₹');
    const rawNumberStr = match[1].replace(/[₹,]/g, '');
    const targetNum = parseFloat(rawNumberStr);
    const suffix = match[2] || '';
    const isDecimal = rawNumberStr.includes('.');
    const hasComma = match[1].includes(',');

    const duration = 1200;
    const startTime = performance.now();
    let animationFrameId;

    const updateCount = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
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

      setDisplayValue(`${isRupee ? '₹' : ''}${formatted}${suffix ? ' ' + suffix : ''}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{displayValue}</span>;
}

export default function Products() {
  const [currentTab, setCurrentTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [products, setProducts] = useState([
    { id: 'PRD-801', name: 'Organic Spinach', category: 'Leafy Greens', price: '₹120.00', stock: 120, unit: 'kg', status: 'In Stock', sku: 'VG-SPN-01' },
    { id: 'PRD-802', name: 'Fresh Broccoli', category: 'Root Vegetables', price: '₹180.00', stock: 85, unit: 'kg', status: 'In Stock', sku: 'VG-BRC-02' },
    { id: 'PRD-803', name: 'Sweet Potatoes', category: 'Root Vegetables', price: '₹60.00', stock: 340, unit: 'kg', status: 'In Stock', sku: 'VG-SPT-03' },
    { id: 'PRD-804', name: 'Organic Strawberries', category: 'Berries', price: '₹250.00', stock: 8, unit: 'box', status: 'Low Stock', sku: 'VG-STR-04' },
    { id: 'PRD-805', name: 'Button Mushrooms', category: 'Mushrooms & Fungi', price: '₹150.00', stock: 0, unit: 'kg', status: 'Out of Stock', sku: 'VG-MSH-05' },
    { id: 'PRD-806', name: 'Fresh Basil Leaves', category: 'Exotic Herbs', price: '₹40.00', stock: 42, unit: 'bunch', status: 'In Stock', sku: 'VG-BSL-06' }
  ]);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'Leafy Greens',
    price: '',
    stock: '',
    unit: 'kg',
    status: 'In Stock',
    sku: ''
  });

  const openAddPanel = () => {
    setEditingProduct(null);
    setFormData({
      id: `PRD-${Math.floor(800 + Math.random() * 199)}`,
      name: '',
      category: 'Leafy Greens',
      price: '',
      stock: '',
      unit: 'kg',
      status: 'In Stock',
      sku: ''
    });
    setIsPanelOpen(true);
  };

  const openEditPanel = (product) => {
    setEditingProduct(product.id);
    const cleanedPrice = product.price.replace(/[₹,]/g, '');
    setFormData({ ...product, price: cleanedPrice });
    setIsPanelOpen(true);
  };

  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if (editingProduct === id) {
      setIsPanelOpen(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const stockVal = parseInt(formData.stock) || 0;
    const priceVal = parseFloat(formData.price) || 0;
    let computedStatus = 'In Stock';
    if (stockVal === 0) {
      computedStatus = 'Out of Stock';
    } else if (stockVal < 15) {
      computedStatus = 'Low Stock';
    }

    const payload = { 
      ...formData, 
      price: `₹${priceVal.toFixed(2)}`,
      stock: stockVal, 
      status: computedStatus 
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct ? payload : p));
    } else {
      setProducts(prev => [payload, ...prev]);
    }
    setIsPanelOpen(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = stockFilter === 'All' || prod.status === stockFilter;
    return matchesSearch && matchesStock;
  });

  const productStats = [
    {
      label: 'Total SKUs',
      value: `${products.length} Products`,
      bg: 'bg-slate-900/60 border-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: Package
    },
    {
      label: 'In Stock',
      value: `${products.filter(p => p.status === 'In Stock').length} Active`,
      bg: 'bg-slate-900/60 border-teal-500/20',
      iconBg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      icon: CheckCircle2
    },
    {
      label: 'Low Stock Warnings',
      value: `${products.filter(p => p.status === 'Low Stock').length} Alerted`,
      bg: 'bg-slate-900/60 border-amber-500/20',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: AlertTriangle
    },
    {
      label: 'Out of Stock',
      value: `${products.filter(p => p.status === 'Out of Stock').length} Depleted`,
      bg: 'bg-slate-900/60 border-rose-500/20',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: XCircle
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto max-h-screen space-y-8">
        <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 rounded-[2rem] bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white shadow-2xl border border-emerald-800/40 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3 z-10 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700/50 flex items-center gap-1.5">
                <Sparkles size={12} /> Inventory Control
              </span>
              
              <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-500/30 px-3 py-1 rounded-full text-rose-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">LIVE ADMIN CATALOG</span>
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Product Catalog
            </h1>
          </div>
          
          <div className="flex items-center gap-3 z-10">
            <button 
              onClick={openAddPanel}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl flex items-center gap-2 text-xs shadow-lg shadow-emerald-500/20 transition-all duration-300 active:scale-95"
            >
              <Plus size={16} />
              Add Product
            </button>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs font-bold text-slate-300">
              <Calendar size={15} className="text-emerald-400" />
              <span>Oct 12, 2026</span>
            </div>
            <button 
              onClick={handleRefresh}
              className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all duration-300 active:scale-95 text-slate-300 group"
            >
              <RefreshCw size={16} className={`text-emerald-400 transition-transform duration-700 ${isRefreshing ? 'rotate-180' : 'group-hover:rotate-45'}`} />
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {productStats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={idx} 
                className={`${stat.bg} p-6 rounded-3xl border shadow-lg hover:border-slate-700 transition-all duration-300 flex items-center justify-between group`}
              >
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-black text-white mt-1 tracking-tight">
                    <AnimatedValue value={stat.value} key={refreshKey} />
                  </h3>
                </div>
                <div className={`${stat.iconBg} p-3.5 rounded-2xl border`}>
                  <IconComponent size={20} />
                </div>
              </div>
            );
          })}
        </section>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <section className="flex-1 bg-slate-900/60 rounded-3xl border border-slate-800 p-6 md:p-8 w-full shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by product name, SKU or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-3">
                <Filter size={16} className="text-slate-400" />
                <div className="flex gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
                  {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStockFilter(status)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        stockFilter === status
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
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
                  <tr className="border-b border-slate-800 text-[11px] uppercase font-bold tracking-widest text-slate-400">
                    <th className="pb-4 pl-2">SKU</th>
                    <th className="pb-4">Product Details</th>
                    <th className="pb-4">Category</th>
                    <th className="pb-4">Unit Rate</th>
                    <th className="pb-4 text-center">Stock Volume</th>
                    <th className="pb-4">Availability</th>
                    <th className="pb-4 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="text-xs font-semibold text-slate-300 hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 pl-2 font-mono font-bold text-emerald-400">{prod.sku}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-emerald-400 font-bold">
                            <Package size={18} />
                          </div>
                          <div>
                            <span className="font-bold text-white block text-sm">{prod.name}</span>
                            <span className="text-[10px] text-slate-500 font-normal">{prod.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-slate-400">{prod.category}</td>
                      <td className="py-4 font-bold text-white">{prod.price} <span className="text-[10px] text-slate-500 font-normal">/ {prod.unit}</span></td>
                      <td className="py-4 text-center font-bold text-white">
                        {prod.stock} <span className="text-[10px] text-slate-500 font-normal">{prod.unit}</span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                          prod.status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          prod.status === 'Low Stock' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {prod.status === 'In Stock' && <CheckCircle2 size={12} />}
                          {prod.status === 'Low Stock' && <AlertTriangle size={12} />}
                          {prod.status === 'Out of Stock' && <XCircle size={12} />}
                          {prod.status}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => openEditPanel(prod)}
                            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button 
                            onClick={() => handleDelete(prod.id)}
                            className="p-2 hover:bg-rose-500/10 rounded-xl text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {isPanelOpen && (
            <aside className="w-full lg:w-96 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 md:p-8 shrink-0 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <h3 className="text-base font-black text-white">
                  {editingProduct ? 'Modify Product' : 'Add New Product'}
                </h3>
                <button 
                  onClick={() => setIsPanelOpen(false)}
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-[10px]">Product Title</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Crisp Romaine Lettuce"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-semibold text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-[10px]">Stock Keeping Unit (SKU)</label>
                  <input
                    required
                    type="text"
                    placeholder="VG-LTC-09"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-[10px]">Taxonomy Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Leafy Greens">Leafy Greens</option>
                    <option value="Root Vegetables">Root Vegetables</option>
                    <option value="Citrus Fruits">Citrus Fruits</option>
                    <option value="Berries">Berries</option>
                    <option value="Mushrooms & Fungi">Mushrooms & Fungi</option>
                    <option value="Exotic Herbs">Exotic Herbs</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-[10px]">Unit Rate (₹)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-semibold text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-[10px]">Unit Metric</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="kg">kg</option>
                      <option value="bunch">bunch</option>
                      <option value="box">box</option>
                      <option value="pack">pack</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-[10px]">In-Stock Quantity</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-semibold text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsPanelOpen(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl flex items-center gap-1.5 font-bold shadow-lg shadow-emerald-500/20 transition-colors"
                  >
                    <Save size={14} />
                    Save Product
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