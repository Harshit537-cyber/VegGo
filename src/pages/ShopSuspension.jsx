import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Calendar, RefreshCw, Store, AlertTriangle, CheckCircle, ShieldAlert, XCircle, Search } from 'lucide-react';

export default function ShopSuspension() {
  const [currentTab, setCurrentTab] = useState('shop-suspension');
  const [searchQuery, setSearchQuery] = useState('');

  const [shops, setShops] = useState([
    { id: 'SH-5012', name: 'Organic Valley Farms', owner: 'David Sterling', flags: 0, reason: 'None', status: 'Active' },
    { id: 'SH-5013', name: 'Premium Dairy Labs', owner: 'Amara Walker', flags: 4, reason: 'Cold chain temperature deviation', status: 'Active' },
    { id: 'SH-5014', name: 'Alpine Berry Orchards', owner: 'Gregory Peck', flags: 9, reason: 'Quality reports and customer disputes', status: 'Suspended' },
    { id: 'SH-5015', name: 'MicroGreens Express', owner: 'Julianne Moore', flags: 1, reason: 'Slight delay in logistics dispatch', status: 'Active' },
    { id: 'SH-5016', name: 'Naturals Fruit Farm', owner: 'Barton Fink', flags: 12, reason: 'Counterfeit organic certification labels', status: 'Suspended' },
    { id: 'SH-5017', name: 'Evergreen Hydroponics', owner: 'Sarah Cooper', flags: 0, reason: 'None', status: 'Active' }
  ]);

  const toggleShopStatus = (id) => {
    setShops(prev => prev.map(shop => {
      if (shop.id === id) {
        const nextStatus = shop.status === 'Active' ? 'Suspended' : 'Active';
        return {
          ...shop,
          status: nextStatus,
          flags: nextStatus === 'Active' ? 0 : shop.flags
        };
      }
      return shop;
    }));
  };

  const activeCount = shops.filter(s => s.status === 'Active').length;
  const suspendedCount = shops.filter(s => s.status === 'Suspended').length;
  const flaggedCount = shops.filter(s => s.flags > 0 && s.status === 'Active').length;

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/60">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Infrastructure Control Panel
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Shop Suspensions</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm text-sm font-semibold text-slate-600">
              <Calendar size={18} className="text-slate-400" />
              <span>Oct 12, 2026</span>
            </div>
            <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unrestricted Shops</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{activeCount} Profiles</h3>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suspended Stores</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{suspendedCount} Accounts</h3>
            </div>
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600">
              <XCircle size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flagged Warnings</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{flaggedCount} Warnings</h3>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-600">
              <ShieldAlert size={24} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-xl font-bold text-slate-900">Vendor Enforcement Registry</h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase font-black tracking-wider text-slate-400">
                  <th className="pb-4">Shop Details</th>
                  <th className="pb-4">Shop ID</th>
                  <th className="pb-4">Quality Warnings</th>
                  <th className="pb-4">Primary Infraction</th>
                  <th className="pb-4">Onboarding State</th>
                  <th className="pb-4 text-right">Operational Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredShops.map((shop) => (
                  <tr key={shop.id} className="text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{shop.name}</span>
                        <span className="text-xs text-slate-400 font-normal">{shop.owner}</span>
                      </div>
                    </td>
                    <td className="py-4.5 font-mono text-xs font-semibold text-slate-400">{shop.id}</td>
                    <td className="py-4.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        shop.flags >= 8 ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        shop.flags > 0 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {shop.flags} Warnings
                      </span>
                    </td>
                    <td className="py-4.5 text-slate-500 font-normal">{shop.reason}</td>
                    <td className="py-4.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        shop.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/40' :
                        'bg-rose-50 text-rose-600 border border-rose-200/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${shop.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {shop.status}
                      </span>
                    </td>
                    <td className="py-4.5 text-right">
                      <button
                        onClick={() => toggleShopStatus(shop.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          shop.status === 'Active'
                            ? 'bg-rose-50 hover:bg-rose-100/80 text-rose-600 border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-600 border-emerald-200'
                        }`}
                      >
                        {shop.status === 'Active' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        {shop.status === 'Active' ? 'Suspend Shop' : 'Restore Shop'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}