import React, { useState } from 'react';
import Sidebar from '../../../layouts/Sidebar';
import PageHeader from '../../../components/common/PageHeader';
import { 
  Calendar, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart2, 
  IndianRupee, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  FileText,
  Boxes,
  Zap,
  Leaf
} from 'lucide-react';

export default function MarketMetrics() {
  const [currentTab, setCurrentTab] = useState('analytics');

  const marketStats = [
    { 
      label: 'Weekly Gross Trade Value', 
      value: '₹8,84,290', 
      change: '+14.2%', 
      up: true,
      icon: IndianRupee,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      gradient: 'from-emerald-500 via-teal-400 to-emerald-400',
      valueColor: 'text-slate-900',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    { 
      label: 'Average Wholesale Rate', 
      value: '₹42.50 / kg', 
      change: '-1.8%', 
      up: false,
      icon: Activity,
      iconBg: 'bg-violet-50 text-violet-700 border-violet-200/80',
      gradient: 'from-violet-500 via-purple-400 to-indigo-400',
      valueColor: 'text-slate-900',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    { 
      label: 'Active Wholesale Demands', 
      value: '41 Contracts', 
      change: '+8.3%', 
      up: true,
      icon: FileText,
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      gradient: 'from-amber-500 via-orange-400 to-amber-400',
      valueColor: 'text-slate-900',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    { 
      label: 'Export Fulfillment Margin', 
      value: '94.6%', 
      change: '+0.5%', 
      up: true,
      icon: ShieldCheck,
      iconBg: 'bg-sky-50 text-sky-700 border-sky-200/80',
      gradient: 'from-sky-500 via-teal-400 to-blue-500',
      valueColor: 'text-slate-900',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200'
    }
  ];

  const cropMarkets = [
    { 
      name: 'Fresh Spinach', 
      category: 'Leafy Green',
      rate: '₹35.00/kg', 
      weeklyVolume: '8,400 kg', 
      demand: 'High', 
      supply: 'Deficit', 
      trendUp: true,
      dotColor: 'bg-emerald-500',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    { 
      name: 'Broccoli Heads', 
      category: 'Cruciferous',
      rate: '₹65.00/kg', 
      weeklyVolume: '4,100 kg', 
      demand: 'Moderate', 
      supply: 'Stable', 
      trendUp: false,
      dotColor: 'bg-teal-500',
      tagColor: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    { 
      name: 'Sweet Potatoes', 
      category: 'Root Crop',
      rate: '₹28.00/kg', 
      weeklyVolume: '14,800 kg', 
      demand: 'High', 
      supply: 'Surplus', 
      trendUp: true,
      dotColor: 'bg-amber-500',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    { 
      name: 'Avocados', 
      category: 'Subtropical',
      rate: '₹140.00/kg', 
      weeklyVolume: '2,900 kg', 
      demand: 'Extreme', 
      supply: 'Deficit', 
      trendUp: true,
      dotColor: 'bg-purple-500',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    { 
      name: 'Red Tomatoes', 
      category: 'Nightshade',
      rate: '₹32.00/kg', 
      weeklyVolume: '9,200 kg', 
      demand: 'Moderate', 
      supply: 'Stable', 
      trendUp: false,
      dotColor: 'bg-rose-500',
      tagColor: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    { 
      name: 'Baby Carrots', 
      category: 'Root Crop',
      rate: '₹45.00/kg', 
      weeklyVolume: '6,300 kg', 
      demand: 'Stable', 
      supply: 'Surplus', 
      trendUp: false,
      dotColor: 'bg-orange-500',
      tagColor: 'bg-orange-50 text-orange-700 border-orange-200'
    }
  ];

  return (
    <div className="min-h-dvh bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto max-h-dvh space-y-6 sm:space-y-8">
        <PageHeader 
          badge="Financial & Demand Core"
          badgeIcon={BarChart2}
          title="Market Pricing Analytics"
          subtitle="Real-time crop rates, supply and demand metrics, wholesale contract trends, and volume shifts."
          onRefresh={() => window.location.reload()}
        />

        {/* 4 Multi-Color Executive KPI Stat Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-8">
          {marketStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx} 
                className="relative overflow-hidden bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                {/* Multi-color top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />

                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <div className={`p-2.5 rounded-2xl border ${stat.iconBg} shadow-2xs group-hover:scale-105 transition-transform duration-200`}>
                      <Icon size={19} />
                    </div>
                  </div>

                  <h3 className={`text-2xl sm:text-3xl font-extrabold ${stat.valueColor} tracking-tight font-sans`}>
                    {stat.value}
                  </h3>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                    stat.up ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' : 'bg-rose-50 text-rose-700 border-rose-200/80'
                  }`}>
                    {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {stat.change}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Weekly Shift</span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Wholesale Crop Market Ledger */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 overflow-hidden relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                <Boxes size={22} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Wholesale Crop Market Ledger</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Live benchmark price spreads & warehouse inventory status</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200/70 px-3 py-1.5 rounded-xl shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                Live Spot Rates
              </span>
              <button 
                type="button"
                className="text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                Export Live Feeds
              </button>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[760px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase font-bold tracking-wider text-slate-500 bg-slate-50/70">
                  <th className="py-3.5 px-4 rounded-l-xl">Produce Variety</th>
                  <th className="py-3.5 px-4">Wholesale Rate</th>
                  <th className="py-3.5 px-4">Active Weekly Vol</th>
                  <th className="py-3.5 px-4">Demand Index</th>
                  <th className="py-3.5 px-4">Supply Standing</th>
                  <th className="py-3.5 px-4 text-right rounded-r-xl">Trend Direction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cropMarkets.map((crop, idx) => (
                  <tr key={idx} className="text-sm font-medium text-slate-700 hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${crop.dotColor} shrink-0 shadow-2xs`} />
                        <span className="group-hover:text-emerald-700 transition-colors font-extrabold">{crop.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${crop.tagColor}`}>
                          {crop.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-emerald-800 font-extrabold">
                      {crop.rate}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700 font-mono text-xs">
                      {crop.weeklyVolume}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold border ${
                        crop.demand === 'Extreme' ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-2xs' :
                        crop.demand === 'High' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs' :
                        crop.demand === 'Moderate' ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-2xs' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {crop.demand}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold border ${
                        crop.supply === 'Deficit' ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs' :
                        crop.supply === 'Surplus' ? 'bg-teal-50 text-teal-700 border-teal-200 shadow-2xs' :
                        'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                      }`}>
                        {crop.supply}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                        crop.trendUp 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90 shadow-2xs' 
                          : 'bg-rose-50 text-rose-700 border-rose-200/90 shadow-2xs'
                      }`}>
                        {crop.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {crop.trendUp ? 'Escalating' : 'Contracting'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {cropMarkets.map((crop, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${crop.dotColor} shrink-0`} />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{crop.name}</h4>
                      <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md border ${crop.tagColor}`}>
                        {crop.category}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    crop.trendUp 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90' 
                      : 'bg-rose-50 text-rose-700 border-rose-200/90'
                  }`}>
                    {crop.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {crop.trendUp ? 'Escalating' : 'Contracting'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Wholesale Rate</span>
                    <span className="font-mono font-extrabold text-emerald-800 text-sm mt-0.5 block">{crop.rate}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Weekly Volume</span>
                    <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">{crop.weeklyVolume}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Demand:</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      crop.demand === 'Extreme' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      crop.demand === 'High' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      crop.demand === 'Moderate' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {crop.demand}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Supply:</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      crop.supply === 'Deficit' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      crop.supply === 'Surplus' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {crop.supply}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}