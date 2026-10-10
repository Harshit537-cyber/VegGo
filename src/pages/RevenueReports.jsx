
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../Common/PageHeader';
import { motion } from 'framer-motion';

import {
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  FileSpreadsheet,
  Percent,
  TrendingDown,
  PieChart,
  BarChart3,
  Activity,
  Wallet,
  CircleDollarSign,
  Sparkles,
  Zap
} from 'lucide-react';

/* =========================================================
   ANIMATED VALUE
========================================================= */

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

        parts[0] = parseInt(
          parts[0],
          10
        ).toLocaleString('en-IN');

        formatted = parts.join('.');
      }

      setDisplayValue(
        `${isRupee ? '₹' : ''}${formatted}${
          suffix ? ` ${suffix}` : ''
        }`
      );

      if (progress < 1) {
        animationFrameId =
          requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(stringValue);
      }
    };

    animationFrameId =
      requestAnimationFrame(updateCount);

    return () =>
      cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{displayValue}</span>;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function RevenueReports() {
  const [currentTab, setCurrentTab] =
    useState('revenue-reports');

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [selectedMonth, setSelectedMonth] =
    useState('Last 6 Months');

  /* =========================================================
     REPORT STATS
  ========================================================= */

  const reportStats = [
    {
      label: 'Net Platform Profit',
      value: '₹8,42,190.00',
      change: '+14.2%',
      up: true,
      accentColor: 'bg-emerald-600',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: TrendingUp,
      suffix: ''
    },

    {
      label: 'Tax / GST Collected',
      value: '₹42,120.00',
      change: '+8.6%',
      up: true,
      accentColor: 'bg-teal-600',
      iconBg:
        'bg-teal-50 text-teal-700',
      tagColor:
        'text-teal-700 bg-teal-50/80 border-teal-200/80',
      icon: Percent,
      suffix: ''
    },

    {
      label: 'Total Payouts Done',
      value: '₹6,80,240.00',
      change: '+11.5%',
      up: true,
      accentColor: 'bg-emerald-500',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Wallet,
      suffix: ''
    },

    {
      label: 'Operational Overhead',
      value: '₹18,400.00',
      change: '-2.4%',
      up: false,
      accentColor: 'bg-emerald-700',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-rose-700 bg-rose-50/80 border-rose-200/80',
      icon: TrendingDown,
      suffix: ''
    }
  ];

  /* =========================================================
     CHART DATA
  ========================================================= */

  const chartData = [
    {
      month: 'May',
      revenue: 75,
      profit: 45
    },
    {
      month: 'Jun',
      revenue: 88,
      profit: 54
    },
    {
      month: 'Jul',
      revenue: 95,
      profit: 62
    },
    {
      month: 'Aug',
      revenue: 110,
      profit: 72
    },
    {
      month: 'Sep',
      revenue: 135,
      profit: 84
    },
    {
      month: 'Oct',
      revenue: 155,
      profit: 98
    }
  ];

  /* =========================================================
     LEDGER
  ========================================================= */

  const subLedger = [
    {
      type: 'B2C Sales Revenue',
      gross: '₹12,40,900.00',
      net: '₹1,24,090.00',
      tax: '₹62,045.00',
      share: '78%'
    },
    {
      type: 'Corporate Contracts',
      gross: '₹3,10,200.00',
      net: '₹31,020.00',
      tax: '₹15,510.00',
      share: '15%'
    },
    {
      type: 'SaaS Store Subscriptions',
      gross: '₹84,000.00',
      net: '₹84,000.00',
      tax: '₹4,200.00',
      share: '7%'
    }
  ];

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="min-h-dvh bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-18 sm:pt-20 lg:pt-8 overflow-y-auto max-h-dvh w-full space-y-6 sm:space-y-8">

        {/* =====================================================
            HEADER
        ===================================================== */}
        <PageHeader 
          badge="Financial Reports Engine"
          badgeIcon={Wallet}
          title="Revenue Reports"
          subtitle="Monitor platform revenue, transaction performance, payouts, taxes, and operational financial metrics."
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          actions={
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-all text-xs font-semibold text-white flex items-center gap-2"
            >
              <FileSpreadsheet size={15} className="text-emerald-400" />
              <span>Export Statement</span>
            </motion.button>
          }
        />

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

          {reportStats.map(
            (stat, index) => {

              const IconComponent =
                stat.icon;

              return (
                <motion.div
                  key={`${stat.label}-${refreshKey}`}
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
                    y: -6,
                    transition: {
                      duration: 0.2
                    }
                  }}
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer"
                >

                  {/* Accent */}

                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accentColor} transition-all duration-300 group-hover:h-2`}
                  />

                  {/* Hover Decoration */}

                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:scale-125" />

                  <div className="relative z-10">

                    <div className="flex items-center justify-between mb-4">

                      <span className="text-[11px] font-semibold text-black uppercase tracking-wider group-hover:text-emerald-700 transition-colors duration-200">

                        {stat.label}

                      </span>

                      <motion.div
                        whileHover={{
                          rotate: 12,
                          scale: 1.1
                        }}
                        className={`${stat.iconBg} p-2.5 rounded-2xl transition-all shadow-xs`}
                      >

                        <IconComponent
                          size={18}
                        />

                      </motion.div>

                    </div>

                    <h3 className="text-2xl sm:text-3xl font-semibold text-black tracking-tight font-mono group-hover:text-emerald-800 transition-colors duration-200">

                      <AnimatedValue
                        value={stat.value}
                        key={refreshKey}
                      />

                    </h3>

                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between relative z-10">

                    <span
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-transform duration-300 group-hover:scale-105 ${stat.tagColor}`}
                    >

                      {stat.up ? (
                        <ArrowUpRight
                          size={13}
                          className="text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      ) : (
                        <ArrowDownRight
                          size={13}
                          className="text-rose-600 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                        />
                      )}

                      {stat.change}

                    </span>

                    <span className="text-[11px] text-black font-semibold">
                      Monthly Period
                    </span>

                  </div>

                </motion.div>
              );
            }
          )}

        </section>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">

          {/* ===================================================
              REVENUE CHART
          =================================================== */}

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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">

                  <BarChart3
                    size={18}
                  />

                </div>

                <div>

                  <h2 className="text-lg font-semibold text-black tracking-tight">

                    Platform Sales Revenue Curve

                  </h2>

                  <p className="text-xs font-semibold text-black">

                    GTV & profit tracking trend

                  </p>

                </div>

              </div>

              <select
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(
                    e.target.value
                  )
                }
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              >

                <option>
                  Last 6 Months
                </option>

                <option>
                  Last 3 Months
                </option>

                <option>
                  This Year
                </option>

              </select>

            </div>

            {/* Chart */}

            <div className="relative h-64 sm:h-72 w-full px-2 sm:px-5 pt-6">

              {/* Grid */}

              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">

                <div className="border-t border-slate-100 w-full" />
                <div className="border-t border-slate-100 w-full" />
                <div className="border-t border-slate-100 w-full" />
                <div className="border-t border-slate-100 w-full" />
                <div className="border-t border-slate-100 w-full" />

              </div>

              {/* Bars */}

              <div className="relative h-full flex items-end justify-between gap-2 sm:gap-5">

                {chartData.map(
                  (data, index) => (

                    <div
                      key={data.month}
                      className="flex flex-col items-center justify-end flex-1 h-full group"
                    >

                      <div className="flex items-end justify-center gap-1.5 sm:gap-2 w-full h-52">

                        {/* Revenue */}

                        <motion.div
                          initial={{
                            height: 0
                          }}
                          animate={{
                            height: `${
                              (data.revenue /
                                170) *
                              100
                            }%`
                          }}
                          transition={{
                            duration: 0.8,
                            delay:
                              0.1 * index,
                            ease: 'easeOut'
                          }}
                          className="w-4 sm:w-6 bg-emerald-600 rounded-t-lg relative group-hover:bg-emerald-700 transition-colors"
                        >

                          <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 -translate-x-1/2 bg-emerald-950 text-white text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-20 shadow-lg">

                            ₹{data.revenue}K

                          </div>

                        </motion.div>

                        {/* Profit */}

                        <motion.div
                          initial={{
                            height: 0
                          }}
                          animate={{
                            height: `${
                              (data.profit /
                                170) *
                              100
                            }%`
                          }}
                          transition={{
                            duration: 0.8,
                            delay:
                              0.1 * index +
                              0.1,
                            ease: 'easeOut'
                          }}
                          className="w-4 sm:w-6 bg-teal-500 rounded-t-lg relative group-hover:bg-teal-600 transition-colors"
                        >

                          <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 -translate-x-1/2 bg-emerald-950 text-white text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-20 shadow-lg">

                            ₹{data.profit}K

                          </div>

                        </motion.div>

                      </div>

                      <span className="text-[10px] sm:text-xs font-semibold text-black mt-3">

                        {data.month}

                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* Legend */}

            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 mt-6 pt-4 border-t border-slate-100">

              <div className="flex items-center gap-2">

                <div className="w-3 h-3 rounded-full bg-emerald-600" />

                <span className="text-[10px] sm:text-xs font-semibold text-black">

                  Gross Transaction Volume

                </span>

              </div>

              <div className="flex items-center gap-2">

                <div className="w-3 h-3 rounded-full bg-teal-500" />

                <span className="text-[10px] sm:text-xs font-semibold text-black">

                  Net Platform Profit

                </span>

              </div>

            </div>

          </motion.section>

          {/* ===================================================
              LEDGER STREAMS
          =================================================== */}

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

            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">

              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">

                <PieChart
                  size={18}
                />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-black tracking-tight">

                  Ledger Streams

                </h2>

                <p className="text-xs font-semibold text-black">

                  Revenue source distribution

                </p>

              </div>

            </div>

            <div className="space-y-3">

              {subLedger.map(
                (stream, index) => (

                  <motion.div
                    key={stream.type}
                    initial={{
                      opacity: 0,
                      x: 10
                    }}
                    animate={{
                      opacity: 1,
                      x: 0
                    }}
                    transition={{
                      delay:
                        0.1 * index
                    }}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all group"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex items-center gap-2.5 min-w-0">

                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:border-emerald-300 transition-colors">

                          {index === 0 ? (
                            <CircleDollarSign
                              size={15}
                            />
                          ) : index === 1 ? (
                            <TrendingUp
                              size={15}
                            />
                          ) : (
                            <Wallet
                              size={15}
                            />
                          )}

                        </div>

                        <span className="text-xs sm:text-sm font-bold text-black truncate group-hover:text-emerald-700 transition-colors">

                          {stream.type}

                        </span>

                      </div>

                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full flex-shrink-0">

                        {stream.share}

                      </span>

                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200">

                      <div>

                        <span className="block font-mono text-slate-800 font-bold text-xs">

                          {stream.gross}

                        </span>

                        <span className="text-[9px] text-slate-400 font-semibold uppercase">

                          Gross GTV

                        </span>

                      </div>

                      <div className="text-right">

                        <span className="block font-mono text-emerald-700 font-bold text-xs">

                          {stream.net}

                        </span>

                        <span className="text-[9px] text-slate-400 font-semibold uppercase">

                          Platform Net

                        </span>

                      </div>

                    </div>

                    {/* Progress */}

                    <div className="mt-3">

                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">

                        <motion.div
                          initial={{
                            width: 0
                          }}
                          animate={{
                            width:
                              stream.share
                          }}
                          transition={{
                            duration: 0.8,
                            delay:
                              0.2 +
                              index * 0.1
                          }}
                          className="h-full bg-emerald-500 rounded-full"
                        />

                      </div>

                    </div>

                  </motion.div>
                )
              )}

            </div>

          </motion.section>

        </section>

        {/* =====================================================
            FINANCIAL PERFORMANCE
        ===================================================== */}

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
          className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
        >

          {/* Section Header */}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">

            <div className="flex items-center gap-3">

              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">

                <Activity
                  size={18}
                />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-black tracking-tight">

                  Financial Performance Overview

                </h2>

                <p className="text-xs font-semibold text-black">

                  Current platform financial health

                </p>

              </div>

            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-bold uppercase">

              <span className="relative flex h-2 w-2">

                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />

                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />

              </span>

              Financial System Healthy

            </div>

          </div>

          {/* Summary Cards */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Revenue Growth */}

            <motion.div
              whileHover={{
                y: -4
              }}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all group"
            >

              <div className="flex items-center justify-between">

                <p className="text-[10px] uppercase tracking-wider font-bold text-black group-hover:text-emerald-700 transition-colors">

                  Revenue Growth

                </p>

                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">

                  <TrendingUp
                    size={14}
                  />

                </div>

              </div>

              <p className="text-xl font-semibold text-black mt-3 font-mono">

                +14.2%

              </p>

              <p className="text-[10px] text-emerald-600 font-semibold mt-1">

                Compared to previous period

              </p>

            </motion.div>

            {/* Tax */}

            <motion.div
              whileHover={{
                y: -4
              }}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all group"
            >

              <div className="flex items-center justify-between">

                <p className="text-[10px] uppercase tracking-wider font-bold text-black group-hover:text-emerald-700 transition-colors">

                  Total Tax Collected

                </p>

                <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">

                  <Percent
                    size={14}
                  />

                </div>

              </div>

              <p className="text-xl font-semibold text-black mt-3 font-mono">

                ₹42,120

              </p>

              <p className="text-[10px] text-teal-600 font-semibold mt-1">

                GST contribution

              </p>

            </motion.div>

            {/* Operational Cost */}

            <motion.div
              whileHover={{
                y: -4
              }}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all group"
            >

              <div className="flex items-center justify-between">

                <p className="text-[10px] uppercase tracking-wider font-bold text-black group-hover:text-emerald-700 transition-colors">

                  Operational Cost

                </p>

                <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">

                  <TrendingDown
                    size={14}
                  />

                </div>

              </div>

              <p className="text-xl font-semibold text-black mt-3 font-mono">

                ₹18,400

              </p>

              <p className="text-[10px] text-rose-600 font-semibold mt-1">

                -2.4% from previous period

              </p>

            </motion.div>

          </div>

        </motion.section>

      </main>

    </div>
  );
}
