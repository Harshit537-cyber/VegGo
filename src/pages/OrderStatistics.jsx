import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Calendar, 
  RefreshCw, 
  ShoppingCart, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp,
  Package,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    const match = value.match(/([₹\d,.]+)\s*(.*)/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const isRupee = value.startsWith('₹');
    const rawNumberStr = match[1].replace(/[₹,]/g, '');
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

      setDisplayValue(`${isRupee ? '₹' : ''}${formatted}${suffix ? ' ' + suffix : ''}`);

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

export default function OrderStatistics() {
  const [currentTab, setCurrentTab] = useState('order-statistics');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const orderStats = [
    { 
      label: 'Total Placed Orders', 
      value: '14,820', 
      change: '+12.4%', 
      up: true,
      cardBg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent',
      cardBorder: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-700',
      tagColor: 'text-emerald-800 bg-emerald-50 border-emerald-100/50',
      icon: ShoppingCart
    },
    { 
      label: 'Pending Processing', 
      value: '312', 
      change: '-4.8%', 
      up: false,
      cardBg: 'bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent',
      cardBorder: 'border-amber-500/20',
      iconBg: 'bg-amber-500/15 text-amber-700',
      tagColor: 'text-amber-800 bg-amber-50 border-amber-100/50',
      icon: Clock
    },
    { 
      label: 'In-Transit / Shipped', 
      value: '840', 
      change: '+8.2%', 
      up: true,
      cardBg: 'bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-transparent',
      cardBorder: 'border-teal-500/20',
      iconBg: 'bg-teal-500/15 text-teal-700',
      tagColor: 'text-teal-800 bg-teal-50 border-teal-100/50',
      icon: Activity
    },
    { 
      label: 'Fulfilled Orders', 
      value: '13,668', 
      change: '+14.5%', 
      up: true,
      cardBg: 'bg-gradient-to-br from-green-600/10 via-green-500/5 to-transparent',
      cardBorder: 'border-green-600/20',
      iconBg: 'bg-green-600/15 text-green-700',
      tagColor: 'text-green-800 bg-green-50 border-green-100/50',
      icon: CheckCircle2
    }
  ];

  const orderBreakdown = [
    { category: 'Organic Vegetables', count: '6,240 Orders', portion: '42.1%', health: 'High' },
    { category: 'Fresh Fruits', count: '4,150 Orders', portion: '28.0%', health: 'High' },
    { category: 'Wholesale Bundles', count: '2,960 Orders', portion: '20.0%', health: 'Moderate' },
    { category: 'Exotic Greens', count: '1,470 Orders', portion: '9.9%', health: 'Low' }
  ];

  const recentOrdersLog = [
    { id: 'ORD-99120', customer: 'Sarah Jenkins', items: 'Baby Spinach, Red Tomatoes', amount: '₹42.30', status: 'In-Transit', time: '12 mins ago' },
    { id: 'ORD-99119', customer: 'Metro Grocers Corp', items: 'Broccoli Wholesale (40kg)', amount: '₹136.00', status: 'Delivered', time: '24 mins ago' },
    { id: 'ORD-99118', customer: 'David Miller', items: 'Avocados, Baby Carrots', amount: '₹28.90', status: 'Processing', time: '40 mins ago' },
    { id: 'ORD-99117', customer: 'Harbor Greens Market', items: 'Sweet Potatoes (100kg)', amount: '₹115.00', status: 'Delivered', time: '1 hr ago' },
    { id: 'ORD-99116', customer: 'Elena Rostova', items: 'Fresh Spinach, Strawberries', amount: '₹19.50', status: 'Failed', time: '2 hrs ago' },
    { id: 'ORD-99115', customer: 'James Cooper', items: 'Organic Lettuce, Broccolini', amount: '₹31.20', status: 'Processing', time: '2 hrs ago' }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

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
                Real-time Order Operations
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
              Order Statistics
            </h1>
          </div>
          
          <div className="flex items-center gap-3 z-10">
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
          {orderStats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={idx} 
                className={`${stat.cardBg} ${stat.cardBorder} p-6 rounded-3xl border shadow-sm hover:shadow-xl hover:shadow-emerald-950/[0.02] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125 pointer-events-none" />
                
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest group-hover:text-slate-700 transition-colors">
                      {stat.label}
                    </span>
                    <div className={`${stat.iconBg} p-2.5 rounded-2xl transition-colors duration-300`}>
                      <IconComponent size={18} />
                    </div>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 mt-4 tracking-tight">
                    <AnimatedValue value={stat.value} key={refreshKey} />
                  </h3>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100/50 flex items-center justify-between">
                  <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${stat.tagColor}`}>
                    {stat.up ? <ArrowUpRight size={14} className="text-emerald-600" /> : <ArrowDownRight size={14} className="text-rose-600" />}
                    {stat.change}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">Daily Dynamics</span>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={20} className="text-emerald-600" />
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Category Distribution</h2>
              </div>
              
              <div className="space-y-4">
                {orderBreakdown.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-100 hover:bg-emerald-50/25 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">{item.category}</span>
                      <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">{item.portion}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-mono text-sm font-bold text-slate-500">{item.count}</span>
                      <span className={`px-2.5 py-1 text-[10px] rounded-lg font-bold border ${
                        item.health === 'High' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' :
                        item.health === 'Moderate' ? 'bg-amber-50 text-amber-700 border-amber-100/50' :
                        'bg-rose-50 text-rose-700 border-rose-100/50'
                      }`}>
                        {item.health} Demand
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Package size={20} className="text-emerald-600" />
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Recent Order Activity Ledger</h2>
                </div>
                <span className="text-sm font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer transition-colors">View All Orders</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase font-bold tracking-widest text-slate-400">
                      <th className="pb-4">Order ID</th>
                      <th className="pb-4">Customer</th>
                      <th className="pb-4">Items Summary</th>
                      <th className="pb-4">Total Amount</th>
                      <th className="pb-4">Timestamp</th>
                      <th className="pb-4 text-right">Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {recentOrdersLog.map((order, idx) => (
                      <tr key={idx} className="text-sm font-semibold text-slate-600 hover:bg-emerald-50/20 transition-colors">
                        <td className="py-4 font-mono text-slate-400 font-bold">{order.id}</td>
                        <td className="py-4 font-bold text-slate-900">{order.customer}</td>
                        <td className="py-4 max-w-[180px] truncate text-slate-500">{order.items}</td>
                        <td className="py-4 font-mono text-slate-800 font-extrabold">{order.amount}</td>
                        <td className="py-4 text-xs text-slate-400 font-medium">{order.time}</td>
                        <td className="py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                            order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            order.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            order.status === 'In-Transit' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              order.status === 'Delivered' ? 'bg-emerald-500' :
                              order.status === 'Processing' ? 'bg-blue-500' :
                              order.status === 'In-Transit' ? 'bg-amber-500' :
                              'bg-rose-500'
                            }`} />
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}