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
  FolderTree, 
  Power, 
  X, 
  Save, 
  Tag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Categories() {
  const [currentTab, setCurrentTab] = useState('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
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

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cat.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cat.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || cat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/60">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Taxonomy Catalog
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Manage Categories</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={openAddPanel}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-md shadow-emerald-900/10 transition-colors"
            >
              <Plus size={18} />
              New Category
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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Categories</p>
              <h3 className="text-2xl font-black text-slate-900 mt-3">{categories.length} Classes</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Catalogues</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-3">
                {categories.filter(c => c.status === 'Active').length} Live
              </h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sub-Categories Listed</p>
              <h3 className="text-2xl font-black text-slate-900 mt-3">
                {categories.reduce((acc, curr) => acc + curr.subCategories.length, 0)} Nodes
              </h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Products</p>
              <h3 className="text-2xl font-black text-slate-900 mt-3">
                {categories.reduce((acc, curr) => acc + curr.productsCount, 0)} Items
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
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
                />
              </div>
              <div className="flex items-center gap-3">
                <Filter size={18} className="text-slate-400" />
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {['All', 'Active', 'Inactive'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
                  <tr className="border-b border-slate-100 text-xs uppercase font-black tracking-wider text-slate-400">
                    <th className="pb-4 pl-2">ID</th>
                    <th className="pb-4">Category Detail</th>
                    <th className="pb-4">Slug</th>
                    <th className="pb-4 text-center">Products</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.map((cat) => (
                    <tr key={cat.id} className="text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors">
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
                            : 'bg-slate-100 text-slate-500 border border-slate-200/50'
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
            <aside className="w-full lg:w-96 bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6 shrink-0">
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 font-medium"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 font-bold"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 font-medium leading-relaxed resize-none"
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
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none text-slate-700 font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubTag}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition-all"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50/50 border border-slate-100 rounded-xl min-h-[44px]">
                    {formData.subCategories.length === 0 && (
                      <span className="text-[10px] text-slate-400 font-semibold italic">No items created.</span>
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