import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Calendar, RefreshCw, Check, X, ShieldAlert, Store, Clock, Eye } from 'lucide-react';

export default function ShopApproval() {
  const [currentTab, setCurrentTab] = useState('shop-approval');

  const [applications, setApplications] = useState([
    { id: 'REQ-1094', name: 'Golden Harvest Co.', owner: 'David Sterling', category: 'Organic Vegetables', date: 'Oct 10, 2026', status: 'Pending' },
    { id: 'REQ-1095', name: 'Premium Dairy Labs', owner: 'Amara Walker', category: 'Dairy Products', date: 'Oct 11, 2026', status: 'Pending' },
    { id: 'REQ-1096', name: 'Alpine Berry Orchards', owner: 'Gregory Peck', category: 'Fresh Fruits', date: 'Oct 11, 2026', status: 'Pending' },
    { id: 'REQ-1097', name: 'MicroGreens Express', owner: 'Julianne Moore', category: 'Exotics & Greens', date: 'Oct 12, 2026', status: 'Pending' }
  ]);

  const handleAction = (id, nextStatus) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };

  const pendingCount = applications.length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/60">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Vendor Onboarding Hub
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Shop Approvals</h1>
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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Awaiting Decisions</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{pendingCount} Requests</h3>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-600">
              <Clock size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Today</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">18 Shops</h3>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
              <Check size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rejection Rate</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">2.4% Average</h3>
            </div>
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600">
              <X size={24} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">Pending Application Registry</h2>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Queue: {pendingCount}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase font-black tracking-wider text-slate-400">
                  <th className="pb-4">Proposed Shop</th>
                  <th className="pb-4">Request ID</th>
                  <th className="pb-4">Authorized Agent</th>
                  <th className="pb-4">Category Sector</th>
                  <th className="pb-4">Application Date</th>
                  <th className="pb-4 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 font-semibold">
                      No pending applications remaining.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4.5 font-bold text-slate-900">{app.name}</td>
                      <td className="py-4.5 font-mono text-xs font-semibold text-slate-400">{app.id}</td>
                      <td className="py-4.5 text-slate-500">{app.owner}</td>
                      <td className="py-4.5">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          {app.category}
                        </span>
                      </td>
                      <td className="py-4.5 text-xs text-slate-400 font-normal">{app.date}</td>
                      <td className="py-4.5 text-right space-x-2">
                        <button className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleAction(app.id, 'Approved')}
                          className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-600 border border-emerald-200/50 transition-colors"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleAction(app.id, 'Rejected')}
                          className="inline-flex items-center justify-center p-2 rounded-xl bg-rose-50 hover:bg-rose-100/80 text-rose-600 border border-rose-200/50 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}