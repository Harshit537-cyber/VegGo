import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Calendar, RefreshCw, TrendingUp, TrendingDown, Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MarketMetrics() {
  const [currentTab, setCurrentTab] = useState('analytics');

  const marketStats = [
    { label: 'Weekly Gross Trade Value', value: '₹8,84,290', change: '+14.2%', up: true },
    { label: 'Average Wholesale Rate', value: '₹42.50 / kg', change: '-1.8%', up: false },
    { label: 'Active Wholesale Demands', value: '41 Contracts', change: '+8.3%', up: true },
    { label: 'Export Fulfillment Margin', value: '94.6%', change: '+0.5%', up: true }
  ];

  const cropMarkets = [
    { name: 'Fresh Spinach', rate: '₹35.00/kg', weeklyVolume: '8,400 kg', demand: 'High', supply: 'Deficit', trendUp: true },
    { name: 'Broccoli Heads', rate: '₹65.00/kg', weeklyVolume: '4,100 kg', demand: 'Moderate', supply: 'Stable', trendUp: false },
    { name: 'Sweet Potatoes', rate: '₹28.00/kg', weeklyVolume: '14,800 kg', demand: 'High', supply: 'Surplus', trendUp: true },
    { name: 'Avocados', rate: '₹140.00/kg', weeklyVolume: '2,900 kg', demand: 'Extreme', supply: 'Deficit', trendUp: true },
    { name: 'Red Tomatoes', rate: '₹32.00/kg', weeklyVolume: '9,200 kg', demand: 'Moderate', supply: 'Stable', trendUp: false },
    { name: 'Baby Carrots', rate: '₹45.00/kg', weeklyVolume: '6,300 kg', demand: 'Stable', supply: 'Surplus', trendUp: false }
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-18 sm:pt-20 lg:pt-8 overflow-y-auto max-h-screen">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/60">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Financial & Demand Core
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Market Pricing Analytics</h1>
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
          {marketStats.map((stat, idx) => (
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
                <span className="text-xs text-slate-400 font-medium">Weekly Shift</span>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">Wholesale Crop Market Ledger</h2>
            <span className="text-sm font-semibold text-emerald-600 hover:underline cursor-pointer">Export Live Feeds</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase font-black tracking-wider text-slate-400">
                  <th className="pb-4">Produce Variety</th>
                  <th className="pb-4">Wholesale Rate</th>
                  <th className="pb-4">Active Weekly Vol</th>
                  <th className="pb-4">Demand Index</th>
                  <th className="pb-4">Supply Standing</th>
                  <th className="pb-4 text-right">Trend Direction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cropMarkets.map((crop, idx) => (
                  <tr key={idx} className="text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4.5 font-bold text-slate-900">{crop.name}</td>
                    <td className="py-4.5 font-mono text-slate-900 font-bold">{crop.rate}</td>
                    <td className="py-4.5">{crop.weeklyVolume}</td>
                    <td className="py-4.5">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        crop.demand === 'Extreme' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        crop.demand === 'High' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {crop.demand}
                      </span>
                    </td>
                    <td className="py-4.5">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        crop.supply === 'Deficit' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        crop.supply === 'Surplus' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {crop.supply}
                      </span>
                    </td>
                    <td className="py-4.5 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        crop.trendUp ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/40' :
                        'bg-rose-50 text-rose-600 border border-rose-200/40'
                      }`}>
                        {crop.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {crop.trendUp ? 'Escalating' : 'Contracting'}
                      </span>
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