import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';

import {
  getSubcategories,
  createSubcategory,
  getSubcategoryById,
  updateSubcategory,
  deactivateSubcategory,
  activateSubcategory
} from '../Api/catalogService/subcategoryService';

import {
  Calendar,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit3,
  Power,
  X,
  Save,
  Tag
} from 'lucide-react';

export default function Subcategories() {
  const [currentTab, setCurrentTab] = useState('subcategories');

  const [subcategories, setSubcategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);

  const [formData, setFormData] = useState({
    categoryId: '',
    name: ''
  });

  const getSubcategoryId = (subcategory) =>
    subcategory?.id ||
    subcategory?._id ||
    subcategory?.subcategoryId;

  const getSubcategoryName = (subcategory) =>
    subcategory?.name ||
    subcategory?.subcategoryName ||
    subcategory?.title ||
    '';

  const getCategoryId = (subcategory) =>
    subcategory?.categoryId ||
    subcategory?.category?.id ||
    '';

  const getCategoryName = (subcategory) =>
    subcategory?.categoryName ||
    subcategory?.category?.name ||
    '';

  const getSubcategoryStatus = (subcategory) => {
    if (
      subcategory?.active === true ||
      subcategory?.status === 'Active' ||
      subcategory?.status === 'active' ||
      subcategory?.isActive === true
    ) {
      return 'Active';
    }

    return 'Inactive';
  };

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const fetchSubcategories = async () => {
    try {
      setIsRefreshing(true);
      setErrorMessage('');

      const response = await getSubcategories();

      if (response?.success) {
        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.content)
            ? response.data.content
            : Array.isArray(response?.data?.subcategories)
              ? response.data.subcategories
              : Array.isArray(response?.data?.subCategories)
                ? response.data.subCategories
                : [];

        setSubcategories(data);
      } else {
        setSubcategories([]);
        setErrorMessage(
          response?.message || 'Failed to fetch subcategories'
        );
      }
    } catch (error) {
      setSubcategories([]);
      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch subcategories'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const openAddPanel = () => {
    clearMessages();

    setEditingSubcategory(null);

    setFormData({
      categoryId: '',
      name: ''
    });

    setIsPanelOpen(true);
  };

  const openEditPanel = async (subcategory) => {
    clearMessages();

    const subcategoryId =
      getSubcategoryId(subcategory);

    if (!subcategoryId) {
      setErrorMessage('Subcategory ID not found');
      return;
    }

    try {
      setSaving(true);

      const response =
        await getSubcategoryById(subcategoryId);

      if (!response?.success) {
        setErrorMessage(
          response?.message ||
          'Failed to fetch subcategory details'
        );
        return;
      }

      const data =
        response?.data?.subcategory ||
        response?.data ||
        subcategory;

      setEditingSubcategory(subcategoryId);

      setFormData({
        categoryId:
          data?.categoryId ||
          data?.category?.id ||
          '',
        name:
          data?.name ||
          data?.subcategoryName ||
          data?.title ||
          ''
      });

      setIsPanelOpen(true);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch subcategory details'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    clearMessages();

    const name = formData.name.trim();
    const categoryId = formData.categoryId.trim();

    if (!name) {
      setErrorMessage('Subcategory name is required');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Category ID is required');
      return;
    }

    try {
      setSaving(true);

      let response;

      if (editingSubcategory) {
        response = await updateSubcategory(
          editingSubcategory,
          {
            categoryId,
            name
          }
        );
      } else {
        response = await createSubcategory({
          categoryId,
          name
        });
      }

      if (!response?.success) {
        setErrorMessage(
          response?.message ||
          'Failed to save subcategory'
        );
        return;
      }

      setSuccessMessage(
        editingSubcategory
          ? 'Subcategory updated successfully'
          : 'Subcategory created successfully'
      );

      setIsPanelOpen(false);
      setEditingSubcategory(null);

      setFormData({
        categoryId: '',
        name: ''
      });

      await fetchSubcategories();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to save subcategory'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (subcategory) => {
    clearMessages();

    const subcategoryId =
      getSubcategoryId(subcategory);

    if (!subcategoryId) {
      setErrorMessage('Subcategory ID not found');
      return;
    }

    try {
      setIsRefreshing(true);

      const isActive =
        getSubcategoryStatus(subcategory) === 'Active';

      const response = isActive
        ? await deactivateSubcategory(subcategoryId)
        : await activateSubcategory(subcategoryId);

      if (!response?.success) {
        setErrorMessage(
          response?.message ||
          'Failed to update subcategory status'
        );
        return;
      }

      setSuccessMessage(
        isActive
          ? 'Subcategory deactivated successfully'
          : 'Subcategory activated successfully'
      );

      await fetchSubcategories();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update subcategory status'
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredSubcategories =
    subcategories.filter((subcategory) => {
      const name =
        getSubcategoryName(subcategory).toLowerCase();

      const category =
        getCategoryName(subcategory).toLowerCase();

      const query =
        searchQuery.toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        category.includes(query);

      const matchesStatus =
        statusFilter === 'All' ||
        getSubcategoryStatus(subcategory) === statusFilter;

      return matchesSearch && matchesStatus;
    });

  const activeCount =
    subcategories.filter(
      (subcategory) =>
        getSubcategoryStatus(subcategory) === 'Active'
    ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/10 to-teal-50/20 flex font-sans antialiased text-slate-800">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto max-h-screen">

        <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-lg overflow-hidden">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-100 bg-white/10 px-3.5 py-1 rounded-full">
              Taxonomy Catalog
            </span>

            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl mt-4">
              Manage Subcategories
            </h1>

            <p className="text-sm text-emerald-100 mt-2">
              Manage product subcategories separately.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openAddPanel}
              className="px-5 py-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl flex items-center gap-2 text-xs font-bold border border-white/10"
            >
              <Plus size={16} />
              New Subcategory
            </button>

            <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 text-sm font-bold">
              <Calendar size={16} />

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
              onClick={fetchSubcategories}
              disabled={isRefreshing}
              className="p-3 bg-white/10 border border-white/15 rounded-2xl hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  isRefreshing
                    ? 'animate-spin'
                    : ''
                }
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

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">

          <div className="p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 shadow-sm">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
              Total Subcategories
            </p>

            <h3 className="text-3xl font-black text-slate-900 mt-2">
              {loading ? '...' : subcategories.length}
            </h3>
          </div>

          <div className="p-6 rounded-3xl border border-teal-500/20 bg-teal-500/10 shadow-sm">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
              Active
            </p>

            <h3 className="text-3xl font-black text-slate-900 mt-2">
              {loading ? '...' : activeCount}
            </h3>
          </div>

          <div className="p-6 rounded-3xl border border-amber-500/20 bg-amber-500/10 shadow-sm">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
              Inactive
            </p>

            <h3 className="text-3xl font-black text-slate-900 mt-2">
              {loading
                ? '...'
                : subcategories.length - activeCount}
            </h3>
          </div>

        </section>

        <section className="bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">

            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3.5 top-3.5 text-slate-400"
                size={16}
              />

              <input
                type="text"
                placeholder="Search subcategories..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white"
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
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${
                        statusFilter === status
                          ? 'bg-white text-emerald-800 shadow-sm'
                          : 'text-slate-500'
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
              Loading subcategories...
            </div>
          ) : filteredSubcategories.length === 0 ? (
            <div className="py-16 text-center">
              <Tag
                size={40}
                className="mx-auto text-slate-300 mb-3"
              />

              <p className="text-sm font-bold text-slate-500">
                No subcategories found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left border-collapse">

                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase font-bold tracking-widest text-slate-400">

                    <th className="pb-4 pl-2">
                      Subcategory
                    </th>

                    <th className="pb-4">
                      Category
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

                  {filteredSubcategories.map(
                    (subcategory, index) => {
                      const id =
                        getSubcategoryId(
                          subcategory
                        );

                      const status =
                        getSubcategoryStatus(
                          subcategory
                        );

                      return (
                        <tr
                          key={id || index}
                          className="text-sm font-semibold text-slate-600 hover:bg-emerald-50/20"
                        >

                          <td className="py-5 pl-2">

                            <div className="flex items-center gap-3">

                              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <Tag
                                  size={19}
                                  className="text-emerald-600"
                                />
                              </div>

                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {getSubcategoryName(
                                    subcategory
                                  )}
                                </span>

                                <span className="text-[10px] text-slate-400">
                                  Subcategory
                                </span>
                              </div>

                            </div>

                          </td>

                          <td className="py-5">
                            <span className="text-xs text-slate-600 font-semibold">
                              {getCategoryName(
                                subcategory
                              ) || 'N/A'}
                            </span>
                          </td>

                          <td className="py-5">

                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
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
                                  openEditPanel(
                                    subcategory
                                  )
                                }
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600"
                                title="Edit"
                              >
                                <Edit3 size={15} />
                              </button>

                              <button
                                onClick={() =>
                                  handleToggleStatus(
                                    subcategory
                                  )
                                }
                                disabled={isRefreshing}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 disabled:opacity-50"
                                title={
                                  status === 'Active'
                                    ? 'Deactivate'
                                    : 'Activate'
                                }
                              >
                                <Power size={15} />
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {isPanelOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8">

              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">

                <h3 className="text-lg font-black text-slate-900">
                  {editingSubcategory
                    ? 'Update Subcategory'
                    : 'Create Subcategory'}
                </h3>

                <button
                  onClick={() => {
                    setIsPanelOpen(false);
                    setEditingSubcategory(null);
                  }}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-lg"
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
                    Category ID
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="Enter category ID"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryId:
                          e.target.value
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-700 font-semibold"
                  />

                </div>

                <div>

                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Subcategory Name
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="Enter subcategory name"
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

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">

                  <button
                    type="button"
                    onClick={() =>
                      setIsPanelOpen(false)
                    }
                    disabled={saving}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      !formData.name.trim() ||
                      !formData.categoryId.trim()
                    }
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold"
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
                      : editingSubcategory
                        ? 'Update Subcategory'
                        : 'Create Subcategory'}
                  </button>

                </div>

              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}