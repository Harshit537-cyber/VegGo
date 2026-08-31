
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';

import {
  Calendar,
  RefreshCw,
  FileSpreadsheet,
  Truck,
  Clock,
  CheckCircle2,
  Star,
  ShieldCheck,
  ChevronDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  TrendingUp,
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

    if (isNaN(targetNum)) {
      setDisplayValue(stringValue);
      return;
    }

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

export default function DeliveryReports() {
  const [currentTab, setCurrentTab] =
    useState('delivery-reports');

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [selectedZone, setSelectedZone] =
    useState('All Regions');

  /* =========================================================
     DELIVERY STATS
  ========================================================= */

  const deliveryStats = [
    {
      label: 'Completed Dispatches',
      value: '18,420 Orders',
      change: '+14.2%',
      up: true,
      accentColor: 'bg-emerald-600',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: CheckCircle2
    },

    {
      label: 'On-Time Performance',
      value: '99.1%',
      change: '+0.5%',
      up: true,
      accentColor: 'bg-teal-600',
      iconBg:
        'bg-teal-50 text-teal-700',
      tagColor:
        'text-teal-700 bg-teal-50/80 border-teal-200/80',
      icon: ShieldCheck
    },

    {
      label: 'Avg Transit Duration',
      value: '24.5 Mins',
      change: '-1.8%',
      up: false,
      accentColor: 'bg-emerald-500',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Clock
    },

    {
      label: 'Rider Payout Incentives',
      value: '₹4,12,090.00',
      change: '+18.4%',
      up: true,
      accentColor: 'bg-emerald-700',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Truck
    }
  ];

  /* =========================================================
     RIDER PERFORMANCE
  ========================================================= */

  const riderPerformanceReport = [
    {
      name: 'Sohan Singh',
      zone: 'North Delhi',
      vehicle: 'Electric Bike',
      deliveries: '412',
      rating: '4.9',
      status: 'Excellent'
    },
    {
      name: 'Vikram Dutt',
      zone: 'South Bangalore',
      vehicle: 'Refrigerated Van',
      deliveries: '385',
      rating: '4.8',
      status: 'Excellent'
    },
    {
      name: 'Rajesh Kumar',
      zone: 'Central Mumbai',
      vehicle: 'Motorcycle',
      deliveries: '320',
      rating: '4.6',
      status: 'Good'
    },
    {
      name: 'Amit Joshi',
      zone: 'West Kolkata',
      vehicle: 'Electric Bike',
      deliveries: '298',
      rating: '4.7',
      status: 'Excellent'
    },
    {
      name: 'Harpreet Singh',
      zone: 'East Chandigarh',
      vehicle: 'Motorcycle',
      deliveries: '185',
      rating: '4.3',
      status: 'Average'
    }
  ];

  /* =========================================================
     TRANSIT EFFICIENCY
  ========================================================= */

  const transitEfficiency = [
    {
      range: '0 - 15 Mins (Fast Track)',
      percentage: 68,
      color: 'bg-emerald-500'
    },
    {
      range: '16 - 30 Mins (Standard Window)',
      percentage: 27,
      color: 'bg-teal-500'
    },
    {
      range: '31+ Mins (Traffic Delays)',
      percentage: 5,
      color: 'bg-emerald-300'
    }
  ];

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = () => {
    setIsRefreshing(true);

    setRefreshKey(
      (prev) => prev + 1
    );

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

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
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900 relative overflow-hidden group"
        >

          {/* Background Effects */}

          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />

          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header Content */}

          <div className="space-y-2.5 z-10">

            <div className="flex flex-wrap items-center gap-2.5">

              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm backdrop-blur-md">

                <Zap
                  size={12}
                  className="text-emerald-400 animate-bounce"
                />

                Logistics Analytics Center

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

              Delivery Performance Reports

              <Sparkles className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            </h1>

            <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl font-medium">
              Monitor delivery operations, rider efficiency,
              transit performance, dispatch volume, and payout
              incentives across the platform.
            </p>

          </div>

          {/* Header Actions */}

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center z-10">

            <motion.button
              whileHover={{
                scale: 1.05
              }}
              whileTap={{
                scale: 0.95
              }}
              type="button"
              className="px-4 py-2.5 bg-emerald-500/20 border border-emerald-700 rounded-2xl hover:bg-emerald-500/30 transition-all text-xs font-semibold text-emerald-100 flex items-center gap-2"
            >

              <FileSpreadsheet
                size={15}
                className="text-emerald-400"
              />

              Export Statement

            </motion.button>

            <div className="bg-emerald-900/60 border border-emerald-800 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-100 shadow-inner backdrop-blur-sm">

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
              disabled={isRefreshing}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner group/btn disabled:opacity-50"
              title="Refresh Data"
            >

              <RefreshCw
                size={15}
                className={`text-emerald-300 transition-transform duration-700 ${
                  isRefreshing
                    ? 'rotate-180'
                    : 'group-hover/btn:rotate-45'
                }`}
              />

            </motion.button>

          </div>

        </motion.header>

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

          {deliveryStats.map(
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

                  {/* Decoration */}

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

                  {/* Bottom */}

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
                          className="text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"
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
            REPORT CONTENT
        ===================================================== */}

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">

          {/* ===================================================
              RIDER PERFORMANCE
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

            {/* Header */}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">

                  <Layers
                    size={18}
                  />

                </div>

                <div>

                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Fleet Efficiency Ledger
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Rider delivery performance directory
                  </p>

                </div>

              </div>

              {/* Region */}

              <button
                type="button"
                onClick={() =>
                  setSelectedZone(
                    selectedZone === 'All Regions'
                      ? 'North Delhi'
                      : 'All Regions'
                  )
                }
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-black hover:bg-white hover:border-emerald-300 transition-all"
              >

                <MapPin
                  size={13}
                  className="text-emerald-600"
                />

                <span>
                  {selectedZone}
                </span>

                <ChevronDown
                  size={14}
                  className="text-slate-400"
                />

              </button>

            </div>

            {/* Desktop Table */}

            <div className="hidden md:block overflow-x-auto">

              <table className="w-full text-left border-collapse">

                <thead>

                  <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">

                    <th className="py-3.5 px-4 rounded-l-xl">
                      Courier Driver
                    </th>

                    <th className="py-3.5 px-4">
                      Active Region
                    </th>

                    <th className="py-3.5 px-4">
                      Vehicle Category
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Completed Deliveries
                    </th>

                    <th className="py-3.5 px-4">
                      Rider Rating
                    </th>

                    <th className="py-3.5 px-4 text-right rounded-r-xl">
                      Performance SLA
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {riderPerformanceReport.map(
                    (rider, idx) => (

                      <motion.tr
                        key={idx}
                        initial={{
                          opacity: 0,
                          y: 10
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        transition={{
                          duration: 0.3,
                          delay:
                            0.3 +
                            idx * 0.05
                        }}
                        className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group"
                      >

                        <td className="py-3.5 px-4">

                          <span className="font-semibold text-black group-hover:text-emerald-700 transition-colors">

                            {rider.name}

                          </span>

                        </td>

                        <td className="py-3.5 px-4">

                          <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">

                            <MapPin
                              size={12}
                              className="text-emerald-500"
                            />

                            {rider.zone}

                          </span>

                        </td>

                        <td className="py-3.5 px-4">

                          <span className="text-[10px] text-slate-600 font-semibold">

                            {rider.vehicle}

                          </span>

                        </td>

                        <td className="py-3.5 px-4 text-center">

                          <span className="inline-flex items-center gap-1.5 font-mono text-emerald-700 font-semibold">

                            <Truck
                              size={13}
                            />

                            {rider.deliveries}

                          </span>

                        </td>

                        <td className="py-3.5 px-4">

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">

                            <Star
                              size={12}
                              className="fill-emerald-500 text-emerald-500"
                            />

                            {rider.rating}

                          </span>

                        </td>

                        <td className="py-3.5 px-4 text-right">

                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              rider.status === 'Excellent'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                : rider.status === 'Good'
                                ? 'bg-teal-50 text-teal-700 border-teal-200/80'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                            }`}
                          >

                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                rider.status === 'Excellent'
                                  ? 'bg-emerald-500'
                                  : rider.status === 'Good'
                                  ? 'bg-teal-500'
                                  : 'bg-emerald-400'
                              }`}
                            />

                            {rider.status}

                          </span>

                        </td>

                      </motion.tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* Mobile Cards */}

            <div className="md:hidden space-y-3">

              {riderPerformanceReport.map(
                (rider, idx) => (

                  <motion.div
                    key={idx}
                    initial={{
                      opacity: 0,
                      y: 10
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      duration: 0.3,
                      delay:
                        idx * 0.05
                    }}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all space-y-3 group"
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700 transition-colors">

                          {rider.name}

                        </h4>

                        <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">

                          <MapPin
                            size={10}
                            className="text-emerald-500"
                          />

                          {rider.zone}

                        </p>

                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          rider.status === 'Excellent'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : rider.status === 'Good'
                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >

                        {rider.status}

                      </span>

                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">

                      <div>

                        <span className="text-[10px] uppercase font-semibold text-black block">
                          Vehicle
                        </span>

                        <span className="text-xs font-semibold text-slate-600">
                          {rider.vehicle}
                        </span>

                      </div>

                      <div>

                        <span className="text-[10px] uppercase font-semibold text-black block">
                          Deliveries
                        </span>

                        <span className="font-mono font-semibold text-emerald-700">
                          {rider.deliveries}
                        </span>

                      </div>

                    </div>

                    <div className="flex justify-between items-center pt-2">

                      <span className="text-[10px] uppercase font-semibold text-black">
                        Rider Rating
                      </span>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">

                        <Star
                          size={11}
                          className="fill-emerald-500 text-emerald-500"
                        />

                        {rider.rating}

                      </span>

                    </div>

                  </motion.div>
                )
              )}

            </div>

          </motion.section>

          {/* ===================================================
              TRANSIT TIME
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

                <TrendingUp
                  size={18}
                />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-black tracking-tight">
                  Transit Time Slices
                </h2>

                <p className="text-xs font-semibold text-black">
                  Delivery speed distribution
                </p>

              </div>

            </div>

            {/* Progress */}

            <div className="space-y-5">

              {transitEfficiency.map(
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
                      duration: 0.4,
                      delay:
                        0.5 +
                        idx * 0.1
                    }}
                    className="space-y-2.5"
                  >

                    <div className="flex justify-between items-center gap-3">

                      <span className="text-[10px] font-semibold text-black leading-relaxed">

                        {item.range}

                      </span>

                      <span className="text-xs font-mono font-bold text-emerald-700 shrink-0">

                        {item.percentage}%

                      </span>

                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">

                      <motion.div
                        initial={{
                          width: 0
                        }}
                        animate={{
                          width:
                            `${item.percentage}%`
                        }}
                        transition={{
                          duration: 1,
                          delay:
                            0.4 +
                            idx * 0.15
                        }}
                        className={`${item.color} h-full rounded-full`}
                      />

                    </div>

                  </motion.div>
                )
              )}

            </div>

            {/* Summary */}

            <div className="mt-6 pt-4 border-t border-slate-100">

              <div className="flex items-center justify-between">

                <span className="text-[10px] uppercase tracking-wider font-semibold text-black">
                  Overall Efficiency
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">

                  <CheckCircle2
                    size={12}
                  />

                  Excellent

                </span>

              </div>

            </div>

          </motion.section>

        </section>

        {/* =====================================================
            DELIVERY HEALTH OVERVIEW
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

                <Truck
                  size={18}
                />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-black tracking-tight">
                  Delivery Operations Overview
                </h2>

                <p className="text-xs font-semibold text-black">
                  Current logistics performance health
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-bold uppercase">

              <span className="relative flex h-2 w-2">

                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />

                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />

              </span>

              Logistics System Healthy

            </div>

          </div>

          {/* Summary Cards */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Dispatch Growth */}

            <motion.div
              whileHover={{
                y: -4
              }}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all group"
            >

              <div className="flex items-center justify-between">

                <p className="text-[10px] uppercase tracking-wider font-bold text-black group-hover:text-emerald-700 transition-colors">
                  Dispatch Growth
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

            {/* On-Time Rate */}

            <motion.div
              whileHover={{
                y: -4
              }}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all group"
            >

              <div className="flex items-center justify-between">

                <p className="text-[10px] uppercase tracking-wider font-bold text-black group-hover:text-emerald-700 transition-colors">
                  On-Time Delivery Rate
                </p>

                <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">

                  <ShieldCheck
                    size={14}
                  />

                </div>

              </div>

              <p className="text-xl font-semibold text-black mt-3 font-mono">
                99.1%
              </p>

              <p className="text-[10px] text-teal-600 font-semibold mt-1">
                Within delivery SLA
              </p>

            </motion.div>

            {/* Payout */}

            <motion.div
              whileHover={{
                y: -4
              }}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all group"
            >

              <div className="flex items-center justify-between">

                <p className="text-[10px] uppercase tracking-wider font-bold text-black group-hover:text-emerald-700 transition-colors">
                  Rider Incentives
                </p>

                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">

                  <Truck
                    size={14}
                  />

                </div>

              </div>

              <p className="text-xl font-semibold text-black mt-3 font-mono">
                ₹4,12,090
              </p>

              <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                +18.4% from previous period
              </p>

            </motion.div>

          </div>

        </motion.section>

      </main>

    </div>
  );
}

