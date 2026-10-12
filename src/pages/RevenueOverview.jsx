import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../Common/PageHeader';
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
  DollarSign,
  Briefcase,
  Layers,
  Award,
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

export default function RevenueOverview() {
  const [currentTab, setCurrentTab] = useState('revenue-overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const revenueStats = [
    { 
      label: 'Total Gross Revenue', 
      value: '₹1,48,290.45', 
      change: '+18.4%', 
      up: true,
      accentColor: 'bg-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-700',
      tagColor: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: DollarSign
    },
    { 
      label: 'Average Order Value', 
      value: '₹422.50', 
      change: '+3.1%', 
      up: true,
      accentColor: 'bg-teal-600',
      iconBg: 'bg-teal-50 text-teal-700',
      tagColor: 'text-teal-700 bg-teal-50/80 border-teal-200/80',
      icon: Award
    },
    { 
      label: 'Vendor Commissions', 
      value: '₹22,243.80', 
      change: '+12.7%', 
      up: true,
      accentColor: 'bg-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-700',
      tagColor: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Briefcase
    },
    { 
      label: 'Platform Fees', 
      value: '₹8,140.20', 
      change: '-1.2%', 
      up: false,
      accentColor: 'bg-green-700',
      iconBg: 'bg-green-50 text-green-700',
      tagColor: 'text-rose-700 bg-rose-50/80 border-rose-200/80',
      icon: Layers
    }
  ];

  const revenueStreams = [
    { source: 'Direct B2C Orders', amount: '₹94,500.00', share: '63.7%', status: 'Active', trendUp: true, percentage: 63.7 },
    { source: 'Wholesale Group Buys', amount: '₹31,240.45', share: '21.1%', status: 'Growing', trendUp: true, percentage: 21.1 },
    { source: 'Vendor Subscription plans', amount: '₹14,410.00', share: '9.7%', status: 'Stable', trendUp: false, percentage: 9.7 },
    { source: 'Delivery Surcharge', amount: '₹8,140.00', share: '5.5%', status: 'Declined', trendUp: false, percentage: 5.5 }
  ];

  const recentPayouts = [
    { id: 'PAY-89302', vendor: 'Organic Valley Farms', amount: '₹12,480.00', commission: '12%', netRevenue: '₹1,497.60', status: 'Completed' },
    { id: 'PAY-89303', vendor: 'Greenhouse Co-op', amount: '₹8,320.50', commission: '10%', netRevenue: '₹832.05', status: 'Completed' },
    { id: 'PAY-89304', vendor: 'Sunshine Orchards', amount: '₹15,100.00', commission: '12%', netRevenue: '₹1,812.00', status: 'Processing' },
    { id: 'PAY-89305', vendor: 'Purely Plants Co.', amount: '₹4,890.00', commission: '8%', netRevenue: '₹391.20', status: 'Completed' },
    { id: 'PAY-89306', vendor: 'Evergreen Hydroponics', amount: '₹9,150.00', commission: '12%', netRevenue: '₹1,098.00', status: 'Completed' },
    { id: 'PAY-89307', vendor: 'Valley Herbals LLC', amount: '₹3,410.00', commission: '10%', netRevenue: '₹341.00', status: 'Processing' }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="min-h-dvh bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto max-h-dvh w-full space-y-6 sm:space-y-8">
        
        {/* Modern Executive Header */}
        <PageHeader 
          badge="Financial Performance"
          badgeIcon={DollarSign}
          title="Revenue Overview"
          subtitle="Consolidated gross merchandise value, platform margins, active settlements, and GMV growth."
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Stats Grid with Staggered Entrance & Interactive Hover */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {revenueStats.map((stat, idx) => {
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
          
          {/* Revenue Breakdown */}
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
                  <h2 className="text-lg font-semibold text-black tracking-tight">Revenue Breakdown</h2>
                  <p className="text-xs font-semibold text-black">Stream contribution analysis</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {revenueStreams.map((stream, idx) => (
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
                    <h2 className="text-lg font-semibold text-black tracking-tight">Recent Vendor Settlements</h2>
                    <p className="text-xs font-semibold text-black">Latest payout transactions</p>
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
                      <th className="py-3.5 px-3 rounded-l-xl">Transaction ID</th>
                      <th className="py-3.5 px-3">Vendor Partner</th>
                      <th className="py-3.5 px-3">Gross Vol</th>
                      <th className="py-3.5 px-3 text-center">Fee Rate</th>
                      <th className="py-3.5 px-3">Net Revenue</th>
                      <th className="py-3.5 px-3 text-right rounded-r-xl">Settlement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentPayouts.map((payout, idx) => (
                      <motion.tr 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + idx * 0.05 }}
                        className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                      >
                        <td className="py-3.5 px-3 font-mono text-black font-semibold group-hover:text-emerald-700 transition-colors">{payout.id}</td>
                        <td className="py-3.5 px-3 font-semibold text-black group-hover:translate-x-1 group-hover:text-emerald-700 transition-all duration-200">{payout.vendor}</td>
                        <td className="py-3.5 px-3 font-mono text-black">{payout.amount}</td>
                        <td className="py-3.5 px-3 font-mono text-center text-black">{payout.commission}</td>
                        <td className="py-3.5 px-3 font-mono text-emerald-700 font-semibold">{payout.netRevenue}</td>
                        <td className="py-3.5 px-3 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border transition-all duration-300 group-hover:scale-105 ${
                            payout.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs'
                              : 'bg-amber-50 text-amber-700 border-amber-200/80 shadow-2xs'
                          }`}>
                            {payout.status === 'Completed' ? (
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
                {recentPayouts.map((payout, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-black font-semibold">{payout.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        payout.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {payout.status === 'Completed' ? (
                          <CheckCircle2 size={11} className="text-emerald-600" />
                        ) : (
                          <Clock size={11} className="text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
                        )}
                        {payout.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700 transition-colors duration-200">{payout.vendor}</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">Gross Vol</span>
                        <span className="font-mono font-semibold text-black">{payout.amount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">Fee Rate</span>
                        <span className="font-mono font-semibold text-black">{payout.commission}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">Net Rev</span>
                        <span className="font-mono font-semibold text-emerald-700">{payout.netRevenue}</span>
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