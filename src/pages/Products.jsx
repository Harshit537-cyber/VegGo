import React, { useState } from 'react';
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
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Package,
  DollarSign
} from 'lucide-react';

export default function Products() {
  const [currentTab, setCurrentTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('All');
  
  const [products, setProducts] = useState([
    { id: 'PRD-801', name: 'Organic Spinach', category: 'Leafy Greens', price: '3.50', stock: 120, unit: 'kg', status: 'In Stock', sku: 'VG-SPN-01' },
    { id: 'PRD-802', name: 'Fresh Broccoli', category: 'Root Vegetables', price: '4.20', stock: 85, unit: 'kg', status: 'In Stock', sku: 'VG-BRC-02' },
    { id: 'PRD-803', name: 'Sweet Potatoes', category: 'Root Vegetables', price: '2.80', stock: 340, unit: 'kg', status: 'In Stock', sku: 'VG-SPT-03' },
    { id: 'PRD-804', name: 'Organic Strawberries', category: 'Berries', price: '6.50', stock: 8, unit: 'box', status: 'Low Stock', sku: 'VG-STR-04' },
    { id: 'PRD-805', name: 'Button Mushrooms', category: 'Mushrooms & Fungi', price: '5.00', stock: 0, unit: 'kg', status: 'Out of Stock', sku: 'VG-MSH-05' },
    { id: 'PRD-806', name: 'Fresh Basil Leaves', category: 'Exotic Herbs', price: '1.95', stock: 42, unit: 'bunch', status: 'In Stock', sku: 'VG-BSL-06' }
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
    setFormData({ ...product });
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
    let computedStatus = 'In Stock';
    if (stockVal === 0) {
      computedStatus = 'Out of Stock';
    } else if (stockVal < 15) {
      computedStatus = 'Low Stock';
    }

    const payload = { ...formData, stock: stockVal, status: computedStatus };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct ? payload : p));
    } else {
      setProducts(prev => [payload, ...prev]);
    }
    setIsPanelOpen(false);
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = stockFilter === 'All' || prod.status === stockFilter;
    return matchesSearch && matchesStock;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/60">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Inventory Control
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Product Catalog</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={openAddPanel}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-md shadow-emerald-900/10 transition-colors"
            >
              <Plus size={18} />
              Add Product
            </button>
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm text-sm font-semibold text-slate-600">
              <Calendar size={18} className="text-slate-400" />
              <span>Oct 12, 2026</span>
            </div>
            <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total SKUs</p>
              <h3 className="text-2xl font-black text-slate-900 mt-3">{products.length} Products</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Stock</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-3 font-semibold">
                {products.filter(p => p.status === 'In Stock').length} Active
              </h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Warnings</p>
              <h3 className="text-2xl font-black text-amber-500 mt-3">
                {products.filter(p => p.status === 'Low Stock').length} Alerted
              </h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Out of Stock</p>
              <h3 className="text-2xl font-black text-rose-500 mt-3">
                {products.filter(p => p.status === 'Out of Stock').length} Depleted
              </h3>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <section className="flex-1 bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by product name, SKU or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
                />
              </div>
              <div className="flex items-center gap-3">
                <Filter size={18} className="text-slate-400" />
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStockFilter(status)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
                  <tr className="border-b border-slate-100 text-xs uppercase font-black tracking-wider text-slate-400">
                    <th className="pb-4 pl-2">SKU</th>
                    <th className="pb-4">Product details</th>
                    <th className="pb-4">Category</th>
                    <th className="pb-4">Unit Rate</th>
                    <th className="pb-4 text-center">Stock Volume</th>
                    <th className="pb-4">Availability</th>
                    <th className="pb-4 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 pl-2 font-mono text-xs font-bold text-slate-400">{prod.sku}</td>
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold">
                            <Package size={18} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{prod.name}</span>
                            <span className="text-xs text-slate-400 font-normal">{prod.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 text-slate-500 font-medium">{prod.category}</td>
                      <td className="py-5 font-bold text-slate-900">${prod.price} <span className="text-xs text-slate-400 font-normal">/ {prod.unit}</span></td>
                      <td className="py-5 text-center font-bold text-slate-900">
                        {prod.stock} <span className="text-xs text-slate-400 font-normal font-sans">{prod.unit}</span>
                      </td>
                      <td className="py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          prod.status === 'In Stock' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          prod.status === 'Low Stock' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {prod.status === 'In Stock' && <CheckCircle2 size={12} />}
                          {prod.status === 'Low Stock' && <AlertTriangle size={12} />}
                          {prod.status === 'Out of Stock' && <XCircle size={12} />}
                          {prod.status}
                        </span>
                      </td>
                      <td className="py-5 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => openEditPanel(prod)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button 
                            onClick={() => handleDelete(prod.id)}
                            className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
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
            <aside className="w-full lg:w-96 bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6 shrink-0">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <h3 className="text-lg font-black text-slate-900">
                  {editingProduct ? 'Modify Product' : 'Add Product'}
                </h3>
                <button 
                  onClick={() => setIsPanelOpen(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Product Title</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Crisp Romaine Lettuce"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Stock Keeping Unit (SKU)</label>
                  <input
                    required
                    type="text"
                    placeholder="VG-LTC-09"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Taxonomy Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 font-bold"
                  >
                    <option value="Leafy Greens">Leafy Greens</option>
                    <option value="Root Vegetables">Root Vegetables</option>
                    <option value="Citrus Fruits">Citrus Fruits</option>
                    <option value="Berries">Berries</option>
                    <option value="Mushrooms & Fungi">Mushrooms & Fungi</option>
                    <option value="Exotic Herbs">Exotic Herbs</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Unit Rate ($)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Unit Metric</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 font-bold"
                    >
                      <option value="kg">kg</option>
                      <option value="bunch">bunch</option>
                      <option value="box">box</option>
                      <option value="pack">pack</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">In-Stock Quantity</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 font-medium"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPanelOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm transition-colors"
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