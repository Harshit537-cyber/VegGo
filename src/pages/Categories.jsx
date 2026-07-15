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
  FolderTree, 
  Power, 
  X, 
  Save, 
  Tag,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    const match = value.match(/([\d,.]+)\s*(.*)/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const rawNumberStr = match[1].replace(/,/g, '');
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

      setDisplayValue(`${formatted}${suffix ? ' ' + suffix : ''}`);

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

export default function Categories() {
  const [currentTab, setCurrentTab] = useState('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [categories, setCategories] = useState([
    { id: 'CAT-101', name: 'Leafy Greens', slug: 'leafy-greens', productsCount: 142, status: 'Active', description: 'Fresh spinach, lettuce, kale, and other culinary greens.', subCategories: ['Spinach', 'Lettuces', 'Kale', 'Microgreens'] },
    { id: 'CAT-102', name: 'Root Vegetables', slug: 'root-vegetables', productsCount: 98, status: 'Active', description: 'Carrots, potatoes, beets, onions, and subterranean crops.', subCategories: ['Carrots', 'Potatoes', 'Onions'] },
    { id: 'CAT-103', name: 'Citrus Fruits', slug: 'citrus-fruits', productsCount: 64, status: 'Active', description: 'Oranges, lemons, limes, and grapefruits sourced directly.', subCategories: ['Oranges', 'Lemons', 'Limes'] },
    { id: 'CAT-104', name: 'Berries', slug: 'berries', productsCount: 45, status: 'Inactive', description: 'Strawberries, blueberries, raspberries, and seasonal berries.', subCategories: ['Strawberries', 'Blueberries'] },
    { id: 'CAT-105', name: 'Mushrooms & Fungi', slug: 'mushrooms-fungi', productsCount: 29, status: 'Active', description: 'Button, shiitake, oyster, and wild edible mushrooms.', subCategories: ['Shiitake', 'Button Mush'] },
    { id: 'CAT-106', name: 'Exotic Herbs', slug: 'exotic-herbs', productsCount: 51, status: 'Active', description: 'Basil, rosemary, thyme, and aromatic culinary herbs.', subCategories: ['Basil', 'Rosemary', 'Thyme'] }
  ]);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    status: 'Active',
    subCategories: []
  });
  
  const [subInput, setSubInput] = useState('');

  const openAddPanel = () => {
    setEditingCategory(null);
    setFormData({
      id: `CAT-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      slug: '',
      description: '',
      status: 'Active',
      subCategories: []
    });
    setIsPanelOpen(true);
  };

  const openEditPanel = (category) => {
    setEditingCategory(category.id);
    setFormData({ ...category });
    setIsPanelOpen(true);
  };

  const handleToggleStatus = (id) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, status: cat.status === 'Active' ? 'Inactive' : 'Active' } : cat))
    );
  };

  const handleDelete = (id) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    if (editingCategory === id) {
      setIsPanelOpen(false);
    }
  };

  const handleAddSubTag = () => {
    if (subInput.trim() && !formData.subCategories.includes(subInput.trim())) {
      setFormData(prev => ({
        ...prev,
        subCategories: [...prev.subCategories, subInput.trim()]
      }));
      setSubInput('');
    }
  };

  const handleRemoveSubTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      subCategories: prev.subCategories.filter(t => t !== tag)
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingCategory) {
      setCategories(prev => prev.map(cat => cat.id === editingCategory ? { ...formData } : cat));
    } else {
      setCategories(prev => [formData, ...prev]);
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

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cat.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cat.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || cat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const categoryStats = [
    {
      label: 'Total Categories',
      value: `${categories.length} Classes`,
      cardBg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent',
      cardBorder: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-700',
      icon: FolderTree
    },
    {
      label: 'Active Catalogues',
      value: `${categories.filter(c => c.status === 'Active').length} Live`,
      cardBg: 'bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-transparent',
      cardBorder: 'border-teal-500/20',
      iconBg: 'bg-teal-500/15 text-teal-700',
      icon: CheckCircle2
    },
    {
      label: 'Sub-Categories Listed',
      value: `${categories.reduce((acc, curr) => acc + curr.subCategories.length, 0)} Nodes`,
      cardBg: 'bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent',
      cardBorder: 'border-amber-500/20',
      iconBg: 'bg-amber-500/15 text-amber-700',
      icon: Tag
    },
    {
      label: 'Assigned Products',
      value: `${categories.reduce((acc, curr) => acc + curr.productsCount, 0)} Items`,
      cardBg: 'bg-gradient-to-br from-green-600/10 via-green-500/5 to-transparent',
      cardBorder: 'border-green-600/20',
      iconBg: 'bg-green-600/15 text-green-700',
      icon: Package
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/10 to-teal-50/20 flex font-sans antialiased text-slate-800">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto max-h-screen">
        <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-850 text-white shadow-lg overflow-hidden border border-emerald-700/30">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 z-10 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-100 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15">
                Taxonomy Catalog
              </span>
              
              <div className="flex items-center gap-3 bg-rose-950/60 backdrop-blur-md border border-rose-500/30 px-3.5 py-1.5 rounded-full text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.2)] max-w-[190px] overflow-hidden">
                <span className="relative flex h-3.5 w-3.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] border border-white/20"></span>
                </span>
                <div className="overflow-hidden whitespace-nowrap text-[11px] font-black uppercase tracking-widest text-white w-full">
                  <marquee scrollamount="3.5" className="leading-none">LIVE ADMIN VEG GO</marquee>
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
              className="px-5 py-3 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-2xl flex items-center gap-2 text-xs font-bold border border-white/10 shadow-sm transition-all duration-300 active:scale-95"
            >
              <Plus size={16} />
              New Category
            </button>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm text-sm font-bold text-emerald-50">
              <Calendar size={16} className="text-emerald-300" />
              <span>Oct 12, 2026</span>
            </div>
            <button 
              onClick={handleRefresh}
              className="p-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl hover:bg-white/20 transition-all duration-300 active:scale-95 shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 group"
            >
              <RefreshCw size={16} className={`text-emerald-300 transition-transform duration-700 ${isRefreshing ? 'rotate-180' : 'group-hover:rotate-45'}`} />
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {categoryStats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={idx} 
                className={`${stat.cardBg} ${stat.cardBorder} p-6 rounded-3xl border shadow-sm hover:shadow-xl hover:shadow-emerald-950/[0.02] hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125 pointer-events-none" />
                
                <div>
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest group-hover:text-slate-700 transition-colors">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                    <AnimatedValue value={stat.value} key={refreshKey} />
                  </h3>
                </div>
                <div className={`${stat.iconBg} p-4 rounded-2xl border border-white/10 shadow-sm transition-colors duration-300 z-10`}>
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
                <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-550 focus:bg-white transition-all text-slate-700"
                />
              </div>
              <div className="flex items-center gap-3">
                <Filter size={16} className="text-slate-400" />
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {['All', 'Active', 'Inactive'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        statusFilter === status
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
                    <th className="pb-4 pl-2">ID</th>
                    <th className="pb-4">Category Detail</th>
                    <th className="pb-4">Slug</th>
                    <th className="pb-4 text-center">Products</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {filteredCategories.map((cat) => (
                    <tr key={cat.id} className="text-sm font-semibold text-slate-600 hover:bg-emerald-50/20 transition-colors">
                      <td className="py-5 pl-2 font-bold text-slate-400">{cat.id}</td>
                      <td className="py-5">
                        <div>
                          <span className="font-bold text-slate-900 block">{cat.name}</span>
                          <span className="text-xs text-slate-400 font-normal line-clamp-1 max-w-[240px]">
                            {cat.description}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 font-mono text-xs font-bold text-slate-500">/{cat.slug}</td>
                      <td className="py-5 text-center font-bold text-slate-900">{cat.productsCount}</td>
                      <td className="py-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          cat.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' 
                            : 'bg-slate-50 text-slate-500 border border-slate-100'
                        }`}>
                          {cat.status}
                        </span>
                      </td>
                      <td className="py-5 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleToggleStatus(cat.id)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-colors"
                          >
                            <Power size={15} />
                          </button>
                          <button 
                            onClick={() => openEditPanel(cat)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cat.id)}
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
            <aside className="w-full lg:w-96 bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8 shrink-0">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <h3 className="text-lg font-black text-slate-900">
                  {editingCategory ? 'Update Category' : 'Create Category'}
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
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Root Vegetables"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      name: e.target.value, 
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-') 
                    }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-550 text-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Slug Link</label>
                  <input
                    required
                    type="text"
                    placeholder="root-vegetables"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-550 text-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-550 text-slate-700 font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Provide short category information..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-550 text-slate-700 font-medium leading-relaxed resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Subcategories</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={subInput}
                      onChange={(e) => setSubInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubTag())}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-550 text-slate-700 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubTag}
                      className="px-3.5 py-2 bg-slate-55 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition-all"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50/50 border border-slate-100 rounded-xl min-h-[44px]">
                    {formData.subCategories.length === 0 && (
                      <span className="text-[10px] text-slate-400 font-bold italic">No items created.</span>
                    )}
                    {formData.subCategories.map((sub, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100/50 rounded-lg text-[10px] font-bold"
                      >
                        {sub}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSubTag(sub)}
                          className="text-emerald-600 hover:text-emerald-950 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-105">
                  <button
                    type="button"
                    onClick={() => setIsPanelOpen(false)}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm transition-colors"
                  >
                    <Save size={14} />
                    Save Changes
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