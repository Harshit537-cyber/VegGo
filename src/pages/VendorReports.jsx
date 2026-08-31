
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';

import {
  Calendar,
  RefreshCw,
  FileSpreadsheet,
  Store,
  TrendingUp,
  Star,
  Percent,
  ShieldCheck,
  ChevronDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Activity,
  BarChart3,
  CircleDollarSign
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

      const easeProgress =
        progress === 1
          ? 1
          : 1 - Math.pow(2, -10 * progress);

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

      setDisplayValue(
        `${isRupee ? '₹' : ''}${formatted}${
          suffix ? ' ' + suffix : ''
        }`
      );

      if (progress < 1) {
        animationFrameId =
          requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId =
      requestAnimationFrame(updateCount);

    return () =>
      cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{displayValue}</span>;
}

export default function VendorReports() {
  const [currentTab, setCurrentTab] =
    useState('vendor-reports');

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [selectedRange, setSelectedRange] =
    useState('Quarter 3, 2026');

  const vendorStats = [
    {
      label: 'Settled Vendor Volume',
      value: '₹14,24,800.00',
      change: '+16.5%',
      up: true,
      accent: 'bg-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-700',
      tag: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: TrendingUp
    },
    {
      label: 'Fulfillment Rate',
      value: '98.4%',
      change: '+0.8%',
      up: true,
      accent: 'bg-teal-600',
      iconBg: 'bg-teal-50 text-teal-700',
      tag: 'text-teal-700 bg-teal-50 border-teal-200',
      icon: ShieldCheck
    },
    {
      label: 'Avg Commission Fee',
      value: '11.4%',
      change: '+1.2%',
      up: true,
      accent: 'bg-amber-600',
      iconBg: 'bg-amber-50 text-amber-700',
      tag: 'text-amber-700 bg-amber-50 border-amber-200',
      icon: Percent
    },
    {
      label: 'Onboarding SLA',
      value: '1.8 Days',
      change: '-0.3%',
      up: false,
      accent: 'bg-rose-600',
      iconBg: 'bg-rose-50 text-rose-700',
      tag: 'text-rose-700 bg-rose-50 border-rose-200',
      icon: Store
    }
  ];

  const vendorPerformanceReport = [
    {
      name: 'Organic Valley Farms',
      productCount: '82 SKUs',
      GTV: '₹6,40,900.00',
      returnRate: '0.4%',
      rating: '4.9',
      payoutStatus: 'Cleared'
    },
    {
      name: 'Greenhouse Co-op',
      productCount: '41 SKUs',
      GTV: '₹3,20,500.00',
      returnRate: '1.2%',
      rating: '4.8',
      payoutStatus: 'Cleared'
    },
    {
      name: 'Sunshine Orchards',
      productCount: '65 SKUs',
      GTV: '₹2,84,100.00',
      returnRate: '0.8%',
      rating: '4.7',
      payoutStatus: 'Pending'
    },
    {
      name: 'Purely Plants Co.',
      productCount: '28 SKUs',
      GTV: '₹1,12,300.00',
      returnRate: '1.5%',
      rating: '4.9',
      payoutStatus: 'Cleared'
    },
    {
      name: 'Evergreen Hydroponics',
      productCount: '19 SKUs',
      GTV: '₹67,000.00',
      returnRate: '4.2%',
      rating: '4.4',
      payoutStatus: 'On Hold'
    }
  ];

  const satisfactionBreakdown = [
    {
      label: 'High Rating (4.5 - 5.0)',
      percentage: 82,
      color: 'bg-emerald-500'
    },
    {
      label: 'Moderate Rating (3.5 - 4.4)',
      percentage: 14,
      color: 'bg-amber-500'
    },
    {
      label: 'Low Rating (< 3.5)',
      percentage: 4,
      color: 'bg-rose-500'
    }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">

      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">

        {/* ================= HEADER ================= */}

        <motion.header
          initial={{
            opacity: 0,
            y: -20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.5,
            ease: 'easeOut'
          }}
          className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 sm:p-7 rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900 overflow-hidden group"
        >

          {/* Background Effects */}

          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="absolute inset-0 opacity-[0.025] pointer-events-none">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  'linear-gradient(to right,#ffffff 1px,transparent 1px),linear-gradient(to bottom,#ffffff 1px,transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />
          </div>

          {/* Header Left */}

          <div className="space-y-2.5 z-10">

            <div className="flex flex-wrap items-center gap-2.5">

              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm backdrop-blur-md">

                <BarChart3 size={12} />

                Vendor Analytics Engine

              </span>

              <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-900/80 px-3 py-1 rounded-full text-rose-300 shadow-sm">

                <span className="relative flex h-2 w-2">

                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />

                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />

                </span>

                <span className="text-[10px] font-semibold uppercase tracking-widest text-white">
                  LIVE ADMIN VEG GO
                </span>

              </div>

            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white flex items-center gap-3">

              Vendor Performance Reports

              <Activity
                className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />

            </h1>

            <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl font-medium">
              Monitor vendor settlements, fulfillment performance,
              commissions, ratings, onboarding efficiency and payout health.
            </p>

          </div>

          {/* Header Right */}

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center z-10">

            <button
              type="button"
              className="px-4 sm:px-5 py-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-800 transition-all shadow-inner"
            >

              <FileSpreadsheet
                size={15}
                className="text-emerald-400"
              />

              Export Statement

            </button>

            <div className="bg-emerald-900/60 border border-emerald-800 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-xs font-semibold text-emerald-100 shadow-inner backdrop-blur-sm">

              <Calendar
                size={14}
                className="text-emerald-400"
              />

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

            <motion.button
              whileHover={{
                scale: 1.05
              }}
              whileTap={{
                scale: 0.95
              }}
              type="button"
              onClick={handleRefresh}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white shadow-inner"
              title="Refresh"
            >

              <RefreshCw
                size={15}
                className={`text-emerald-300 transition-transform duration-700 ${
                  isRefreshing
                    ? 'rotate-180'
                    : ''
                }`}
              />

            </motion.button>

          </div>

        </motion.header>

        {/* ================= STAT CARDS ================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

          {vendorStats.map((stat, index) => {

            const IconComponent = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1
                }}
                whileHover={{
                  y: -6
                }}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden group"
              >

                {/* Top Accent */}

                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accent} group-hover:h-2 transition-all`}
                />

                <div className="flex items-center justify-between mb-5">

                  <span className="text-[11px] font-semibold text-black uppercase tracking-wider">

                    {stat.label}

                  </span>

                  <div
                    className={`p-2.5 rounded-2xl ${stat.iconBg}`}
                  >

                    <IconComponent size={18} />

                  </div>

                </div>

                <h3 className="text-2xl sm:text-3xl font-semibold text-black tracking-tight font-mono">

                  <AnimatedValue
                    value={stat.value}
                    key={refreshKey}
                  />

                </h3>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">

                  <span
                    className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${stat.tag}`}
                  >

                    {stat.up ? (
                      <ArrowUpRight size={13} />
                    ) : (
                      <ArrowDownRight size={13} />
                    )}

                    {stat.change}

                  </span>

                  <span className="text-[10px] text-black font-semibold">
                    Quarterly Period
                  </span>

                </div>

              </motion.div>
            );
          })}

        </section>

        {/* ================= MAIN CONTENT ================= */}

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">

          {/* ================= VENDOR MATRIX ================= */}

          <motion.section
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.5,
              delay: 0.4
            }}
            className="xl:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
          >

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">

                  <Layers size={18} />

                </div>

                <div>

                  <h2 className="text-lg sm:text-xl font-semibold text-black tracking-tight">
                    Active Vendor Metrics Matrix
                  </h2>

                  <p className="text-[10px] sm:text-xs font-semibold text-black">
                    Vendor settlement and performance tracking
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <select
                  value={selectedRange}
                  onChange={(e) =>
                    setSelectedRange(e.target.value)
                  }
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                >

                  <option>Quarter 3, 2026</option>
                  <option>Quarter 2, 2026</option>
                  <option>Quarter 1, 2026</option>
                  <option>This Year</option>

                </select>

                <div className="hidden sm:flex items-center justify-center w-9 h-9 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">

                  <ChevronDown size={15} />

                </div>

              </div>

            </div>

            {/* Table */}

            <div className="overflow-x-auto">

              <table className="w-full text-left border-collapse">

                <thead>

                  <tr className="border-b border-slate-100 text-[10px] sm:text-[11px] uppercase font-bold tracking-widest text-slate-400">

                    <th className="pb-4 pr-4 whitespace-nowrap">
                      Shop Name
                    </th>

                    <th className="pb-4 pr-4 whitespace-nowrap">
                      Product Catalog
                    </th>

                    <th className="pb-4 pr-4 whitespace-nowrap">
                      Gross Trade Value
                    </th>

                    <th className="pb-4 pr-4 whitespace-nowrap">
                      Return Rate
                    </th>

                    <th className="pb-4 pr-4 whitespace-nowrap">
                      Rating
                    </th>

                    <th className="pb-4 text-right whitespace-nowrap">
                      Settlement
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100/70">

                  {vendorPerformanceReport.map(
                    (vendor, idx) => (

                      <motion.tr
                        key={idx}
                        initial={{
                          opacity: 0,
                          x: 10
                        }}
                        animate={{
                          opacity: 1,
                          x: 0
                        }}
                        transition={{
                          delay: 0.1 * idx
                        }}
                        className="text-sm font-semibold text-slate-600 hover:bg-emerald-50/40 transition-colors"
                      >

                        <td className="py-4 pr-4">

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center flex-shrink-0">

                              <Store size={15} />

                            </div>

                            <div className="min-w-0">

                              <p className="font-bold text-black truncate max-w-[170px]">
                                {vendor.name}
                              </p>

                              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">
                                Verified Vendor
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="py-4 pr-4">

                          <span className="font-mono text-slate-500 font-bold text-xs">

                            {vendor.productCount}

                          </span>

                        </td>

                        <td className="py-4 pr-4">

                          <span className="font-mono text-black font-extrabold text-xs">

                            {vendor.GTV}

                          </span>

                        </td>

                        <td className="py-4 pr-4">

                          <span
                            className={`font-mono font-bold text-xs ${
                              parseFloat(vendor.returnRate) > 3
                                ? 'text-rose-600'
                                : 'text-emerald-700'
                            }`}
                          >

                            {vendor.returnRate}

                          </span>

                        </td>

                        <td className="py-4 pr-4">

                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">

                            <Star
                              size={12}
                              className="fill-amber-500 text-amber-500"
                            />

                            {vendor.rating}

                          </span>

                        </td>

                        <td className="py-4 text-right">

                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${
                              vendor.payoutStatus === 'Cleared'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : vendor.payoutStatus === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >

                            {vendor.payoutStatus}

                          </span>

                        </td>

                      </motion.tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </motion.section>

          {/* ================= SATISFACTION ================= */}

          <motion.section
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.5,
              delay: 0.5
            }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
          >

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">

              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">

                <Sparkles size={18} />

              </div>

              <div>

                <h2 className="text-lg sm:text-xl font-semibold text-black tracking-tight">
                  Satisfaction Breakdown
                </h2>

                <p className="text-[10px] sm:text-xs font-semibold text-black">
                  Vendor quality distribution
                </p>

              </div>

            </div>

            {/* Overall Score */}

            <div className="p-5 rounded-2xl bg-emerald-950 text-white relative overflow-hidden mb-5">

              <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />

              <div className="relative z-10">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold">
                      Overall Vendor Score
                    </p>

                    <p className="text-3xl font-black mt-2">
                      4.8
                    </p>

                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-300/20 flex items-center justify-center">

                    <Star
                      size={24}
                      className="fill-amber-400 text-amber-400"
                    />

                  </div>

                </div>

                <div className="flex items-center gap-1 mt-3">

                  {[1, 2, 3, 4, 5].map((item) => (
                    <Star
                      key={item}
                      size={13}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}

                  <span className="text-[10px] text-emerald-200 ml-2 font-semibold">
                    Excellent performance
                  </span>

                </div>

              </div>

            </div>

            <div className="space-y-5">

              {satisfactionBreakdown.map(
                (item, idx) => (

                  <motion.div
                    key={idx}
                    initial={{
                      opacity: 0,
                      x: 10
                    }}
                    animate={{
                      opacity: 1,
                      x: 0
                    }}
                    transition={{
                      delay: 0.15 * idx
                    }}
                    className="space-y-2"
                  >

                    <div className="flex justify-between items-center">

                      <span className="text-[11px] font-bold text-slate-600">
                        {item.label}
                      </span>

                      <span className="text-xs font-black text-black">
                        {item.percentage}%
                      </span>

                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">

                      <motion.div
                        initial={{
                          width: 0
                        }}
                        animate={{
                          width: `${item.percentage}%`
                        }}
                        transition={{
                          duration: 0.9,
                          delay: 0.2 + idx * 0.1
                        }}
                        className={`${item.color} h-full rounded-full`}
                      />

                    </div>

                  </motion.div>

                )
              )}

            </div>

          </motion.section>

        </section>

        {/* ================= BOTTOM SUMMARY ================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.5,
            delay: 0.6
          }}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6"
        >

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">

                <Activity size={18} />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-black">
                  Vendor Operations Overview
                </h2>

                <p className="text-[10px] sm:text-xs font-semibold text-black">
                  Current vendor ecosystem health
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-bold uppercase">

              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />

              Vendor Network Healthy

            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">

              <div className="flex items-center justify-between">

                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Settlement Growth
                </p>

                <TrendingUp
                  size={16}
                  className="text-emerald-600"
                />

              </div>

              <p className="text-xl font-semibold text-black mt-2 font-mono">
                +16.5%
              </p>

              <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                Compared to previous period
              </p>

            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-200 hover:bg-teal-50/30 transition-all">

              <div className="flex items-center justify-between">

                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Fulfillment Health
                </p>

                <ShieldCheck
                  size={16}
                  className="text-teal-600"
                />

              </div>

              <p className="text-xl font-semibold text-black mt-2 font-mono">
                98.4%
              </p>

              <p className="text-[10px] text-teal-600 font-semibold mt-1">
                Vendor fulfillment efficiency
              </p>

            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-200 hover:bg-amber-50/30 transition-all">

              <div className="flex items-center justify-between">

                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Average Rating
                </p>

                <Star
                  size={16}
                  className="fill-amber-400 text-amber-400"
                />

              </div>

              <p className="text-xl font-semibold text-black mt-2 font-mono">
                4.8 / 5
              </p>

              <p className="text-[10px] text-amber-600 font-semibold mt-1">
                Excellent vendor satisfaction
              </p>

            </div>

          </div>

        </motion.section>

      </main>

    </div>
  );
}

