import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';

import {
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Sparkles,
  Store,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Zap,
} from 'lucide-react';

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (!value) {
      setDisplayValue('0');
      return;
    }

    const strVal = String(value);
    const match = strVal.match(/([\d,.]+)\s*(.*)/);

    if (!match) {
      setDisplayValue(strVal);
      return;
    }

    const rawNumberStr = match[1].replace(/,/g, '');
    const targetNum = parseFloat(rawNumberStr);
    const suffix = match[2] || '';

    const isDecimal = rawNumberStr.includes('.');
    const hasComma = match[1].includes(',');

    if (isNaN(targetNum)) {
      setDisplayValue(strVal);
      return;
    }

    const duration = 1000;
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
        `${formatted}${suffix ? ' ' + suffix : ''}`
      );

      if (progress < 1) {
        animationFrameId =
          requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(strVal);
      }
    };

    animationFrameId =
      requestAnimationFrame(updateCount);

    return () =>
      cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{displayValue}</span>;
}

export default function ShopSuspension() {
  const [currentTab, setCurrentTab] =
    useState('shop-suspension');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [shops, setShops] = useState([
    {
      id: 'SH-5012',
      name: 'Organic Valley Farms',
      owner: 'David Sterling',
      flags: 0,
      reason: 'None',
      status: 'Active',
    },
    {
      id: 'SH-5013',
      name: 'Premium Dairy Labs',
      owner: 'Amara Walker',
      flags: 4,
      reason: 'Cold chain temperature deviation',
      status: 'Active',
    },
    {
      id: 'SH-5014',
      name: 'Alpine Berry Orchards',
      owner: 'Gregory Peck',
      flags: 9,
      reason: 'Quality reports and customer disputes',
      status: 'Suspended',
    },
    {
      id: 'SH-5015',
      name: 'MicroGreens Express',
      owner: 'Julianne Moore',
      flags: 1,
      reason: 'Slight delay in logistics dispatch',
      status: 'Active',
    },
    {
      id: 'SH-5016',
      name: 'Naturals Fruit Farm',
      owner: 'Barton Fink',
      flags: 12,
      reason: 'Counterfeit organic certification labels',
      status: 'Suspended',
    },
    {
      id: 'SH-5017',
      name: 'Evergreen Hydroponics',
      owner: 'Sarah Cooper',
      flags: 0,
      reason: 'None',
      status: 'Active',
    },
  ]);

  const toggleShopStatus = (id) => {
    setShops((prev) =>
      prev.map((shop) => {
        if (shop.id === id) {
          const nextStatus =
            shop.status === 'Active'
              ? 'Suspended'
              : 'Active';

          return {
            ...shop,
            status: nextStatus,
            flags:
              nextStatus === 'Active'
                ? 0
                : shop.flags,
          };
        }

        return shop;
      })
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const activeCount = shops.filter(
    (shop) => shop.status === 'Active'
  ).length;

  const suspendedCount = shops.filter(
    (shop) => shop.status === 'Suspended'
  ).length;

  const flaggedCount = shops.filter(
    (shop) =>
      shop.flags > 0 &&
      shop.status === 'Active'
  ).length;

  const filteredShops = shops.filter(
    (shop) => {
      const query =
        searchQuery.toLowerCase();

      return (
        shop.name
          .toLowerCase()
          .includes(query) ||
        shop.owner
          .toLowerCase()
          .includes(query) ||
        shop.id
          .toLowerCase()
          .includes(query) ||
        shop.reason
          .toLowerCase()
          .includes(query)
      );
    }
  );

  const suspensionStats = [
    {
      label: 'Unrestricted Shops',
      value: `${activeCount}`,
      change: '+8.4%',
      up: true,
      accentColor: 'bg-emerald-600',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Store,
    },
    {
      label: 'Suspended Stores',
      value: `${suspendedCount}`,
      change: '-4.5%',
      up: false,
      accentColor: 'bg-teal-600',
      iconBg:
        'bg-teal-50 text-teal-700',
      tagColor:
        'text-rose-700 bg-rose-50/80 border-rose-200/80',
      icon: XCircle,
    },
    {
      label: 'Flagged Warnings',
      value: `${flaggedCount}`,
      change: '+10.2%',
      up: true,
      accentColor: 'bg-green-700',
      iconBg:
        'bg-green-50 text-green-700',
      tagColor:
        'text-amber-700 bg-amber-50/80 border-amber-200/80',
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">

      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">

        {/* HEADER — SAME AS SHOP APPROVAL */}
        <motion.header
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            ease: 'easeOut',
          }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900 relative overflow-hidden group"
        >

          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />

          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 z-10">

            <div className="flex flex-wrap items-center gap-2.5">

              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm backdrop-blur-md">

                <Zap
                  size={12}
                  className="text-emerald-400 animate-bounce"
                />

                Vendor Management Directory

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

              Shop Suspensions

              <Sparkles className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            </h1>

          </div>

          <div className="flex items-center gap-3 self-start lg:self-center z-10">

            <div className="bg-emerald-900/60 border border-emerald-800 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-100 shadow-inner backdrop-blur-sm">

              <Calendar
                size={14}
                className="text-emerald-400"
              />

              <span>Oct 12, 2026</span>

            </div>

            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={handleRefresh}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner group/btn"
              title="Refresh Data"
            >

              <RefreshCw
                size={15}
                className={`text-emerald-300 transition-transform duration-700 ${
                  isRefreshing
                    ? 'rotate-180 scale-110'
                    : 'group-hover/btn:rotate-45'
                }`}
              />

            </motion.button>

          </div>

        </motion.header>

        {/* STATS — SAME AS SHOP APPROVAL */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

          {suspensionStats.map(
            (stat, idx) => {
              const IconComponent = stat.icon;

              return (
                <motion.div
                  key={idx}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: idx * 0.1,
                  }}
                  whileHover={{
                    y: -6,
                    transition: {
                      duration: 0.2,
                    },
                  }}
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer"
                >

                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accentColor} transition-all duration-300 group-hover:h-2`}
                  />

                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:scale-125" />

                  <div className="relative z-10">

                    <div className="flex items-center justify-between mb-4">

                      <span className="text-[11px] font-semibold text-black uppercase tracking-wider group-hover:text-emerald-700 transition-colors duration-200">

                        {stat.label}

                      </span>

                      <motion.div
                        whileHover={{
                          rotate: 12,
                          scale: 1.1,
                        }}
                        className={`${stat.iconBg} p-2.5 rounded-2xl transition-all shadow-xs`}
                      >

                        <IconComponent size={18} />

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

        {/* TABLE — SAME CONTAINER AS SHOP APPROVAL */}
        <section className="w-full">

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.3,
            }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6 flex flex-col justify-between"
          >

            <div>

              {/* SAME TABLE TOP HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">

                <div className="flex items-center gap-3">

                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">

                    <Store size={18} />

                  </div>

                  <div>

                    <h2 className="text-lg font-semibold text-black tracking-tight">
                      Shop Suspensions
                    </h2>

                    <p className="text-xs font-semibold text-black">
                      Vendor shop suspension and enforcement directory
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-2">

                  <div className="relative flex-1 sm:w-64">

                    <Search
                      className="absolute left-3 top-2.5 text-slate-400"
                      size={15}
                    />

                    <input
                      type="text"
                      placeholder="Search shops..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(
                          e.target.value
                        )
                      }
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />

                  </div>

                </div>

              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">

                <table className="w-full text-left border-collapse">

                  <thead>

                    <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">

                      <th className="py-3.5 px-4 rounded-l-xl">
                        Shop ID
                      </th>

                      <th className="py-3.5 px-4">
                        Shop Details
                      </th>

                      <th className="py-3.5 px-4">
                        Quality Warnings
                      </th>

                      <th className="py-3.5 px-4">
                        Primary Infraction
                      </th>

                      <th className="py-3.5 px-4 text-center">
                        Status
                      </th>

                      <th className="py-3.5 px-4 text-right rounded-r-xl">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredShops.length > 0 ? (
                      filteredShops.map(
                        (shop, idx) => (

                          <motion.tr
                            key={shop.id}
                            initial={{
                              opacity: 0,
                              y: 10,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              duration: 0.3,
                              delay:
                                0.3 +
                                idx * 0.05,
                            }}
                            className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                          >

                            <td className="py-3.5 px-4 font-mono text-black font-semibold group-hover:text-emerald-700 transition-colors">

                              {shop.id}

                            </td>

                            <td className="py-3.5 px-4">

                              <div className="flex flex-col">

                                <span className="font-semibold text-black group-hover:translate-x-0.5 group-hover:text-emerald-700 transition-all duration-200">

                                  {shop.name}

                                </span>

                                <span className="text-[10px] text-slate-500">

                                  {shop.owner}

                                </span>

                              </div>

                            </td>

                            <td className="py-3.5 px-4">

                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                                  shop.flags >= 8
                                    ? 'bg-rose-50 text-rose-700 border-rose-100/50'
                                    : shop.flags > 0
                                    ? 'bg-amber-50 text-amber-700 border-amber-100/50'
                                    : 'bg-slate-50 text-slate-500 border-slate-100'
                                }`}
                              >

                                {shop.flags}{' '}
                                Warnings

                              </span>

                            </td>

                            <td className="py-3.5 px-4 text-slate-600 font-medium">

                              {shop.reason}

                            </td>

                            <td className="py-3.5 px-4 text-center">

                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  shop.status ===
                                  'Active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                    : 'bg-rose-50 text-rose-700 border-rose-200/80'
                                }`}
                              >

                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    shop.status ===
                                    'Active'
                                      ? 'bg-emerald-500'
                                      : 'bg-rose-500'
                                  }`}
                                />

                                {shop.status}

                              </span>

                            </td>

                            <td className="py-3.5 px-4 text-right">

                              <div className="flex items-center justify-end">

                                <button
                                  onClick={() =>
                                    toggleShopStatus(
                                      shop.id
                                    )
                                  }
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all border ${
                                    shop.status ===
                                    'Active'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  }`}
                                >

                                  {shop.status ===
                                  'Active' ? (
                                    <XCircle
                                      size={13}
                                    />
                                  ) : (
                                    <CheckCircle2
                                      size={13}
                                    />
                                  )}

                                  {shop.status ===
                                  'Active'
                                    ? 'Suspend Shop'
                                    : 'Restore Shop'}

                                </button>

                              </div>

                            </td>

                          </motion.tr>

                        )
                      )
                    ) : (

                      <tr>

                        <td
                          colSpan="6"
                          className="py-8 text-center text-slate-400 text-xs"
                        >
                          No matching shop records found.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

              {/* MOBILE — SAME STYLE */}
              <div className="md:hidden space-y-3">

                {filteredShops.length > 0 ? (
                  filteredShops.map(
                    (shop) => (

                      <motion.div
                        key={shop.id}
                        whileHover={{
                          scale: 1.01,
                        }}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group cursor-pointer"
                      >

                        <div className="flex items-center justify-between">

                          <span className="font-mono text-xs text-black font-semibold">

                            {shop.id}

                          </span>

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              shop.status ===
                              'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >

                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                shop.status ===
                                'Active'
                                  ? 'bg-emerald-500'
                                  : 'bg-rose-500'
                              }`}
                            />

                            {shop.status}

                          </span>

                        </div>

                        <div>

                          <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700 transition-colors duration-200">

                            {shop.name}

                          </h4>

                          <p className="text-xs text-slate-500">

                            {shop.owner}

                          </p>

                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">

                          <div>

                            <span className="text-[10px] uppercase font-semibold text-black block">

                              Warnings

                            </span>

                            <span
                              className={`inline-block mt-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                                shop.flags >= 8
                                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                                  : shop.flags > 0
                                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                                  : 'bg-slate-50 text-slate-500 border-slate-100'
                              }`}
                            >

                              {shop.flags} Warnings

                            </span>

                          </div>

                          <div>

                            <span className="text-[10px] uppercase font-semibold text-black block">

                              Infraction

                            </span>

                            <span className="font-semibold text-slate-600">

                              {shop.reason}

                            </span>

                          </div>

                        </div>

                        <div className="flex items-center justify-end gap-1 pt-1">

                          <button
                            onClick={() =>
                              toggleShopStatus(
                                shop.id
                              )
                            }
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all border ${
                              shop.status ===
                              'Active'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >

                            {shop.status ===
                            'Active' ? (
                              <XCircle
                                size={13}
                              />
                            ) : (
                              <CheckCircle2
                                size={13}
                              />
                            )}

                            {shop.status ===
                            'Active'
                              ? 'Suspend Shop'
                              : 'Restore Shop'}

                          </button>

                        </div>

                      </motion.div>

                    )
                  )
                ) : (

                  <div className="py-8 text-center text-slate-400 text-xs">
                    No matching shop records found.
                  </div>

                )}

              </div>

            </div>

          </motion.div>

        </section>

      </main>

    </div>
  );
}