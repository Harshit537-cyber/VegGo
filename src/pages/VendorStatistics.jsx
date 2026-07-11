import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Calendar, RefreshCw, Store, CheckCircle, AlertTriangle, Clock, ArrowUpRight, ArrowDownRight, Star } from 'lucide-react';

export default function VendorStatistics() {
  const [currentTab, setCurrentTab] = useState('vendor-statistics');

  const vendorStats = [
    { label: 'Active Registered Shops', value: '1,248', change: '+8.6%', up: true },
    { label: 'Pending Approvals', value: '42 Shops', change: '-12.3%', up: false },
    { label: 'Suspended Accounts', value: '14', change: '+1.4%', up: true },
    { label: 'Avg Vendor Rating', value: '4.82 / 5.0', change: '+0.4%', up: true }
  ];

  const categoryShare = [
    { type: 'Organic Produce', count: '512 Farms', percentage: '41%', trend: 'Stable' },
    { type: 'Dairy & Poultry', count: '340 Farms', percentage: '27%', trend: 'Upward' },
    { type: 'Exotics & Microgreens', count: '216 Farms', percentage: '17%', trend: 'Upward' },
    { type: 'Dry Fruits & Grains', count: '180 Farms', percentage: '15%', trend: 'Stable' }
  ];

  const vendorPerformance = [
    { name: 'Organic Valley Farms', owner: 'Arthur Pendelton', products: '82 Items', monthlySales: '$14,820', rating: '4.9', status: 'Active' },
    { name: 'Greenhouse Co-op', owner: 'Clara Oswald', products: '41 Items', monthlySales: '$12,300', rating: '4.8', status: 'Active' },
    { name: 'Sunshine Orchards', owner: 'Marcus Aurelius', products: '65 Items', monthlySales: '$9,120', rating: '4.7', status: 'Active' },
    { name: 'Purely Plants Co.', owner: 'Sarah Connor', products: '28 Items', monthlySales: '$7,840', rating: '4.9', status: 'Active' },
    { name: 'Evergreen Hydroponics', owner: 'Bruce Wayne', products: '19 Items', monthlySales: '$6,900', rating: '4.4', status: 'Warning' },
    { name: 'Valley Herbals LLC', owner: 'Selina Kyle', products: '34 Items', monthlySales: '$4,110', rating: '4.6', status: 'Active' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/60">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Vendor Infrastructure Core
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Vendor Statistics</h1>
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

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {vendorStats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-3">{stat.value}</h3>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className={`flex items-center gap-1 text-sm font-bold ${stat.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stat.up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {stat.change}
                </span>
                <span className="text-xs text-slate-400 font-medium">Monthly Progress</span>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-1 bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-6">Vendor Segments</h2>
              <div className="space-y-4">
                {categoryShare.map((category, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">{category.type}</span>
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">{category.percentage}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-sm text-slate-500">{category.count}</span>
                      <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                        category.trend === 'Upward' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {category.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">Top Performing Shops Ledger</h2>
              <span className="text-sm font-semibold text-emerald-600 hover:underline cursor-pointer">Export Vendors</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase font-black tracking-wider text-slate-400">
                    <th className="pb-4">Shop Name</th>
                    <th className="pb-4">Primary Contact</th>
                    <th className="pb-4">Catalog Vol</th>
                    <th className="pb-4">Monthly GTV</th>
                    <th className="pb-4">Rating Index</th>
                    <th className="pb-4 text-right">Shop Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendorPerformance.map((vendor, idx) => (
                    <tr key={idx} className="text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4.5 font-bold text-slate-900">{vendor.name}</td>
                      <td className="py-4.5 text-slate-500">{vendor.owner}</td>
                      <td className="py-4.5 font-mono text-slate-600">{vendor.products}</td>
                      <td className="py-4.5 font-mono text-slate-900 font-bold">{vendor.monthlySales}</td>
                      <td className="py-4.5">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                          <Star size={12} className="fill-amber-500 text-amber-500" />
                          {vendor.rating}
                        </span>
                      </td>
                      <td className="py-4.5 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          vendor.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/40' :
                          'bg-amber-50 text-amber-600 border border-amber-200/40'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${vendor.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {vendor.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}