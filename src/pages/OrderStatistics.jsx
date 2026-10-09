import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  Percent,
  CheckCircle2,
  Clock,
  ShoppingCart,
  Activity,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    const stringValue = String(value ?? '');
    const match = stringValue.match(/([₹\d,.]+)\s*(.*)/);
    if (!match) {
      setDisplayValue(stringValue);
      return;
    }

    const isRupee = stringValue.startsWith('₹');
    const rawNumberStr = match[1].replace(/[₹,]/g, '');
    const targetNum = parseFloat(rawNumberStr);
    const suffix = match[2] || '';
    const isDecimal = rawNumberStr.includes('.');
    const hasComma = match[1].includes(',');

    if (Number.isNaN(targetNum)) {
      setDisplayValue(stringValue);
      return;
    }

    const duration = 1000;
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
        setDisplayValue(stringValue);
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
      accentColor: 'bg-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-700',
      tagColor: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: ShoppingCart
    },
    { 
      label: 'Pending Processing', 
      value: '312', 
      change: '-4.8%', 
      up: false,
      accentColor: 'bg-teal-600',
      iconBg: 'bg-teal-50 text-teal-700',
      tagColor: 'text-rose-700 bg-rose-50/80 border-rose-200/80',
      icon: Clock
    },
    { 
      label: 'In-Transit / Shipped', 
      value: '840', 
      change: '+8.2%', 
      up: true,
      accentColor: 'bg-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-700',
      tagColor: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Activity
    },
    { 
      label: 'Fulfilled Orders', 
      value: '13,668', 
      change: '+14.5%', 
      up: true,
      accentColor: 'bg-green-700',
      iconBg: 'bg-green-50 text-green-700',
      tagColor: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: CheckCircle2
    }
  ];

  const orderBreakdown = [
    { source: 'Organic Vegetables', amount: '6,240 Orders', share: '42.1%', status: 'High Demand', trendUp: true, percentage: 42.1 },
    { source: 'Fresh Fruits', amount: '4,150 Orders', share: '28.0%', status: 'High Demand', trendUp: true, percentage: 28.0 },
    { source: 'Wholesale Bundles', amount: '2,960 Orders', share: '20.0%', status: 'Moderate', trendUp: true, percentage: 20.0 },
    { source: 'Exotic Greens', amount: '1,470 Orders', share: '9.9%', status: 'Low Demand', trendUp: false, percentage: 9.9 }
  ];

  const recentOrdersLog = [
    { id: 'ORD-99120', customer: 'Sarah Jenkins', amount: 'Baby Spinach, Red Tomatoes', commission: '₹42.30', netRevenue: '12 mins ago', status: 'In-Transit' },
    { id: 'ORD-99119', customer: 'Metro Grocers Corp', amount: 'Broccoli Wholesale (40kg)', commission: '₹136.00', netRevenue: '24 mins ago', status: 'Delivered' },
    { id: 'ORD-99118', customer: 'David Miller', amount: 'Avocados, Baby Carrots', commission: '₹28.90', netRevenue: '40 mins ago', status: 'Processing' },
    { id: 'ORD-99117', customer: 'Harbor Greens Market', amount: 'Sweet Potatoes (100kg)', commission: '₹115.00', netRevenue: '1 hr ago', status: 'Delivered' },
    { id: 'ORD-99116', customer: 'Elena Rostova', amount: 'Fresh Spinach, Strawberries', commission: '₹19.50', netRevenue: '2 hrs ago', status: 'Failed' },
    { id: 'ORD-99115', customer: 'James Cooper', amount: 'Organic Lettuce, Broccolini', commission: '₹31.20', netRevenue: '2 hrs ago', status: 'Processing' }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">
        
        {/* Animated Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900 relative overflow-hidden group"
        >
          {/* Subtle Dynamic Ambient Lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm backdrop-blur-md">
                <Zap size={12} className="text-emerald-400 animate-bounce" />
                Order Operations Dashboard
              </span>
              
              <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-900/80 px-3 py-1 rounded-full text-rose-300 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white">LIVE ADMIN VEG GO</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white flex items-center gap-3">
              Order Statistics
              <Sparkles className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </h1>
          </div>
          
          <div className="flex items-center gap-3 self-start lg:self-center z-10">
            <div className="bg-emerald-900/60 border border-emerald-800 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-100 shadow-inner backdrop-blur-sm">
              <Calendar size={14} className="text-emerald-400" />
              <span>Oct 12, 2026</span>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner group/btn"
              title="Refresh Data"
            >
              <RefreshCw size={15} className={`text-emerald-300 transition-transform duration-700 ${isRefreshing ? 'rotate-180 scale-110' : 'group-hover/btn:rotate-45'}`} />
            </motion.button>
          </div>
        </motion.header>

        {/* Stats Grid with Staggered Entrance & Interactive Hover */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {orderStats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accentColor} transition-all duration-300 group-hover:h-2`} />
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:scale-125" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-black uppercase tracking-wider group-hover:text-emerald-700 transition-colors duration-200">
                      {stat.label}
                    </span>
                    <motion.div 
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      className={`${stat.iconBg} p-2.5 rounded-2xl transition-all shadow-xs`}
                    >
                      <IconComponent size={18} />
                    </motion.div>
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl font-semibold text-black tracking-tight font-mono group-hover:text-emerald-800 transition-colors duration-200">
                    <AnimatedValue value={stat.value} key={refreshKey} />
                  </h3>
                </div>
                
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between relative z-10">
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-transform duration-300 group-hover:scale-105 ${stat.tagColor}`}>
                    {stat.up ? (
                      <ArrowUpRight size={13} className="text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    ) : (
                      <ArrowDownRight size={13} className="text-rose-600 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                    )}
                    {stat.change}
                  </span>
                  <span className="text-[11px] text-black font-semibold">Monthly Period</span>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Dynamic Breakdown & Settlement Tables */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Revenue / Order Breakdown */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-1 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <Percent size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-black tracking-tight">Category Distribution</h2>
                  <p className="text-xs font-semibold text-black">Stream contribution analysis</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {orderBreakdown.map((stream, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.02, x: 2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="p-4 rounded-2xl border border-slate-200/70 bg-slate-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-black group-hover:text-emerald-700 transition-colors duration-200">{stream.source}</span>
                      <span className="text-[10px] font-semibold bg-white border border-slate-200 text-black px-2.5 py-0.5 rounded-full shadow-2xs">
                        {stream.share}
                      </span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full bg-slate-200/70 rounded-full h-1.5 mb-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stream.percentage}%` }}
                        transition={{ duration: 1.2, delay: 0.2 + idx * 0.1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${stream.trendUp ? 'bg-emerald-600' : 'bg-slate-400'}`}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-semibold text-black">{stream.amount}</span>
                      <span className={`flex items-center gap-1 text-[11px] font-semibold ${stream.trendUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {stream.trendUp ? <TrendingUp size={13} className="animate-pulse" /> : <TrendingDown size={13} />}
                        {stream.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Table Container */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                    <Package size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-black tracking-tight">Recent Order Activity Ledger</h2>
                    <p className="text-xs font-semibold text-black">Latest transaction updates</p>
                  </div>
                </div>
                
                <motion.button 
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 px-3.5 py-2 rounded-xl transition-all self-start sm:self-auto group"
                >
                  <span>Export Transactions</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </motion.button>
              </div>

              {/* Desktop Dynamic Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">
                      <th className="py-3.5 px-3 rounded-l-xl">Order ID</th>
                      <th className="py-3.5 px-3">Customer</th>
                      <th className="py-3.5 px-3">Items Summary</th>
                      <th className="py-3.5 px-3 text-center">Total Amount</th>
                      <th className="py-3.5 px-3">Timestamp</th>
                      <th className="py-3.5 px-3 text-right rounded-r-xl">Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrdersLog.map((payout, idx) => (
                      <motion.tr 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + idx * 0.05 }}
                        className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                      >
                        <td className="py-3.5 px-3 font-mono text-black font-semibold group-hover:text-emerald-700 transition-colors">{payout.id}</td>
                        <td className="py-3.5 px-3 font-semibold text-black group-hover:translate-x-1 group-hover:text-emerald-700 transition-all duration-200">{payout.customer}</td>
                        <td className="py-3.5 px-3 font-mono text-black">{payout.amount}</td>
                        <td className="py-3.5 px-3 font-mono text-center text-black">{payout.commission}</td>
                        <td className="py-3.5 px-3 font-mono text-emerald-700 font-semibold">{payout.netRevenue}</td>
                        <td className="py-3.5 px-3 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border transition-all duration-300 group-hover:scale-105 ${
                            payout.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs'
                              : payout.status === 'Processing'
                              ? 'bg-blue-50 text-blue-700 border-blue-200/80 shadow-2xs'
                              : payout.status === 'In-Transit'
                              ? 'bg-amber-50 text-amber-700 border-amber-200/80 shadow-2xs'
                              : 'bg-rose-50 text-rose-700 border-rose-200/80 shadow-2xs'
                          }`}>
                            {payout.status === 'Delivered' ? (
                              <CheckCircle2 size={12} className="text-emerald-600" />
                            ) : (
                              <Clock size={12} className="text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
                            )}
                            {payout.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden space-y-3">
                {recentOrdersLog.map((payout, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-black font-semibold">{payout.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        payout.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : payout.status === 'Processing'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : payout.status === 'In-Transit'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {payout.status === 'Delivered' ? (
                          <CheckCircle2 size={11} className="text-emerald-600" />
                        ) : (
                          <Clock size={11} className="text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
                        )}
                        {payout.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700 transition-colors duration-200">{payout.customer}</h4>
                      <p className="text-xs text-black mt-0.5">{payout.amount}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">Total Amount</span>
                        <span className="font-mono font-semibold text-black">{payout.commission}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">Timestamp</span>
                        <span className="font-medium text-black">{payout.netRevenue}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}