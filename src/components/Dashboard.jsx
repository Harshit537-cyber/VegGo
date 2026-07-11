import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, Layers, CheckCircle2, AlertCircle, Thermometer, ShieldCheck } from 'lucide-react';

export default function Dashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = [
    { label: 'Fresh Dispatch Orders', value: '14,820 kg', change: '+12.4%', up: true, desc: 'Compared to yesterday' },
    { label: 'Active Supply Lines', value: '34 active', change: '+3.2%', up: true, desc: '2 cold rooms standby' },
    { label: 'Ambient Temperature Average', value: '4.2 °C', change: '-0.8%', up: false, desc: 'Targeting 3.5 - 5 °C' },
    { label: 'Estimated Profit Margin', value: '87.4%', change: '+1.5%', up: true, desc: 'Excluding freight costs' }
  ];

  const recentOrders = [
    { id: '#VGF-2918', client: 'Green Grocers Inc.', produce: 'Fresh Spinach', quantity: '1,200 kg', status: 'Shipped', temp: '4.1°C' },
    { id: '#VGF-2917', client: 'Organic Harvest Co.', produce: 'Broccoli Heads', quantity: '850 kg', status: 'Processing', temp: '4.4°C' },
    { id: '#VGF-2916', client: 'Super Foods Depot', produce: 'Sweet Potatoes', quantity: '3,400 kg', status: 'Shipped', temp: '6.0°C' },
    { id: '#VGF-2915', client: 'Healthy Living Market', produce: 'Avocados', quantity: '500 kg', status: 'Delayed', temp: '8.2°C' },
    { id: '#VGF-2914', client: 'Nature Express Hub', produce: 'Red Tomatoes', quantity: '2,100 kg', status: 'Shipped', temp: '5.1°C' }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans antialiased">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto max-h-screen">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50/80 px-2.5 py-1 rounded-md">
                Operations Center
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-3">
              Real-time Platform Metrics
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm hover:shadow transition-shadow text-sm font-semibold text-slate-600">
              <Calendar size={16} className="text-slate-400" />
              <span>Oct 12, 2026</span>
            </div>
            <button 
              onClick={handleRefresh}
              className="p-3 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <RefreshCw size={16} className={`text-slate-500 transition-transform duration-700 ${isRefreshing ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-500 transition-colors">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-3 tracking-tight">
                  {stat.value}
                </h3>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
                  stat.up ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                }`}>
                  {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </span>
                <span className="text-xs text-slate-400 font-medium">{stat.desc}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Supply Line Dispatches</h2>
                <p className="text-xs text-slate-400 mt-1">Live status of active thermal transit lanes</p>
              </div>
              <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-3 py-1.5 rounded-lg">
                Export Ledger
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    <th className="pb-3.5">Reference</th>
                    <th className="pb-3.5">Contract Name</th>
                    <th className="pb-3.5">Produce</th>
                    <th className="pb-3.5 text-center">Batch Temp</th>
                    <th className="pb-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="text-sm font-medium text-slate-600 hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 font-bold text-slate-900">{order.id}</td>
                      <td className="py-4 text-slate-700">{order.client}</td>
                      <td className="py-4">{order.produce}</td>
                      <td className="py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100/80 text-xs font-mono font-bold text-slate-600 border border-slate-200/20">
                          <Thermometer size={12} className="text-slate-400" />
                          {order.temp}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold border ${
                          order.status === 'Shipped' ? 'bg-emerald-50/60 text-emerald-700 border-emerald-100' :
                          order.status === 'Processing' ? 'bg-amber-50/60 text-amber-700 border-amber-100' :
                          'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {order.status === 'Shipped' && <CheckCircle2 size={12} className="text-emerald-600" />}
                          {order.status === 'Processing' && <Layers size={12} className="text-amber-600" />}
                          {order.status === 'Delayed' && <AlertCircle size={12} className="text-rose-600" />}
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Thermal Health Distribution</h2>
                  <p className="text-xs text-slate-400 mt-1">Consistency metrics across operations</p>
                </div>
                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                  <ShieldCheck size={18} />
                </div>
              </div>

              <div className="relative aspect-video w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex flex-col items-center justify-center p-6 border border-slate-800 overflow-hidden group shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />
                <TrendingUp size={36} className="text-emerald-400 mb-3 group-hover:scale-105 transition-transform duration-500" />
                <p className="text-sm font-semibold text-slate-100 z-10">Operational Consistency</p>
                <p className="text-[11px] text-slate-400 mt-1.5 text-center max-w-[200px] z-10 leading-relaxed">
                  All active nodes are functioning inside targeted temperature bounds.
                </p>
                <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 border-t border-slate-800 p-2 text-center">
                  <span className="text-[11px] font-bold text-emerald-400">99.8% Reliability Rating</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Standard Deviations</span>
                  <span className="font-bold text-slate-700">0.12 °C Max</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[95%] rounded-full" />
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-600">Cold Storage Nodes</span>
              </div>
              <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                4 / 4 Active
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}