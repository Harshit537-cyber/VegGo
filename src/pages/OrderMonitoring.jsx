
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Calendar,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Truck,
  ShieldAlert,
  Eye,
  PhoneCall,
  MapPin,
  Activity,
  Thermometer,
  ArrowUpRight,
  ArrowDownRight,
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

    if (Number.isNaN(targetNum)) {
      setDisplayValue(stringValue);
      return;
    }

    const isDecimal = rawNumberStr.includes('.');
    const hasComma = match[1].includes(',');
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
        formatted = currentVal.toFixed(1);
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

export default function OrderMonitoring() {
  const [currentTab, setCurrentTab] =
    useState('order-monitoring');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [alertFilter, setAlertFilter] =
    useState('All');

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [monitoredOrders, setMonitoredOrders] =
    useState([
      {
        id: 'ORD-9021',
        customer: 'Rahul Kulkarni',
        rider: 'Sohan Singh',
        temp: '4.2°C',
        status: 'On Track',
        eta: '12 mins',
        alert: 'Normal'
      },
      {
        id: 'ORD-9022',
        customer: 'Meera Nair',
        rider: 'Vikram Dutt',
        temp: '8.4°C',
        status: 'Delayed',
        eta: '28 mins',
        alert: 'Critical'
      },
      {
        id: 'ORD-9023',
        customer: 'Aniket Goel',
        rider: 'Rajesh Kumar',
        temp: '5.1°C',
        status: 'On Track',
        eta: '8 mins',
        alert: 'Normal'
      },
      {
        id: 'ORD-9024',
        customer: 'Pooja Hegde',
        rider: 'Amit Joshi',
        temp: '6.8°C',
        status: 'Stuck in Traffic',
        eta: '35 mins',
        alert: 'Warning'
      },
      {
        id: 'ORD-9025',
        customer: 'Kabir Thapar',
        rider: 'Devendra Pal',
        temp: '9.2°C',
        status: 'Delayed',
        eta: '42 mins',
        alert: 'Critical'
      },
      {
        id: 'ORD-9026',
        customer: 'Aditi Rao',
        rider: 'Harpreet Singh',
        temp: '4.8°C',
        status: 'On Track',
        eta: '15 mins',
        alert: 'Normal'
      }
    ]);

  const handleReassign = (id) => {
    setMonitoredOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              rider: 'Reassigned (Auto)',
              alert: 'Normal',
              status: 'On Track',
              temp: '4.5°C'
            }
          : order
      )
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const criticalCount =
    monitoredOrders.filter(
      (order) => order.alert === 'Critical'
    ).length;

  const warningCount =
    monitoredOrders.filter(
      (order) => order.alert === 'Warning'
    ).length;

  const activeRidersCount =
    monitoredOrders.length;

  const monitoringStats = [
    {
      label: 'Critical Thresholds',
      value: `${criticalCount}`,
      suffix: ' Incidents',
      change: '+12.4%',
      up: false,
      accentColor: 'bg-emerald-600',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: ShieldAlert
    },
    {
      label: 'Warning Thresholds',
      value: `${warningCount}`,
      suffix: ' Transits',
      change: '+8.2%',
      up: true,
      accentColor: 'bg-teal-600',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: AlertTriangle
    },
    {
      label: 'Average ETA Target',
      value: '26.4',
      suffix: ' mins',
      change: '+5.6%',
      up: true,
      accentColor: 'bg-emerald-500',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: Clock
    },
    {
      label: 'Monitored Fleets',
      value: `${activeRidersCount}`,
      suffix: ' Couriers',
      change: '+15.5%',
      up: true,
      accentColor: 'bg-green-700',
      iconBg:
        'bg-green-50 text-green-700',
      tagColor:
        'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: Truck,
      highlight: true
    }
  ];

  const filteredMonitoredOrders =
    monitoredOrders.filter((order) => {
      const query =
        searchQuery.toLowerCase();

      const matchesSearch =
        order.customer
          .toLowerCase()
          .includes(query) ||
        order.id
          .toLowerCase()
          .includes(query) ||
        order.rider
          .toLowerCase()
          .includes(query);

      const matchesAlert =
        alertFilter === 'All' ||
        order.alert === alertFilter;

      return matchesSearch && matchesAlert;
    });

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">

      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-18 sm:pt-20 lg:pt-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">

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
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:18px_18px]" />

          <div className="space-y-2.5 z-10">

            <div className="flex flex-wrap items-center gap-2.5">

              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm backdrop-blur-md">
                <Zap
                  size={12}
                  className="text-emerald-400 animate-bounce"
                />
                Operations Logistics Center
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
              Logistics & Order Monitoring

              <Sparkles className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </h1>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center z-10">

            <div className="bg-emerald-900/60 border border-emerald-800 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-100 shadow-inner backdrop-blur-sm">

              <Calendar
                size={14}
                className="text-emerald-400"
              />

              <span>
                {new Date().toLocaleDateString(
                  'en-IN',
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
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner group/btn disabled:opacity-50"
              title="Refresh Monitoring"
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

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

          {monitoringStats.map((stat, idx) => {
            const IconComponent = stat.icon;

            return (
              <motion.div
                key={`${idx}-${refreshKey}`}
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
                  delay: idx * 0.1
                }}
                whileHover={{
                  y: -6,
                  transition: {
                    duration: 0.2
                  }
                }}
                className={`
                  bg-white
                  p-5 sm:p-6
                  rounded-3xl
                  border
                  ${
                    stat.highlight
                      ? 'border-emerald-300'
                      : 'border-slate-200/80'
                  }
                  shadow-sm
                  hover:shadow-xl
                  hover:border-emerald-300
                  transition-all
                  duration-300
                  relative
                  overflow-hidden
                  flex
                  flex-col
                  justify-between
                  group
                  cursor-pointer
                `}
              >

                <div
                  className={`
                    absolute
                    top-0
                    left-0
                    right-0
                    h-1.5
                    ${stat.accentColor}
                    transition-all
                    duration-300
                    group-hover:h-2
                  `}
                />

                <div
                  className={`
                    absolute
                    -right-6
                    -bottom-6
                    w-24
                    h-24
                    bg-emerald-50
                    rounded-full
                    transition-all
                    duration-500
                    pointer-events-none
                    ${
                      stat.highlight
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }
                    group-hover:scale-125
                  `}
                />

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
                      <IconComponent size={18} />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-semibold text-black tracking-tight font-mono group-hover:text-emerald-800 transition-colors duration-200">
                    <AnimatedValue
                      value={`${stat.value}${stat.suffix}`}
                      key={refreshKey}
                    />
                  </h3>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between relative z-10">

                  <span
                    className={`
                      flex
                      items-center
                      gap-1
                      text-xs
                      font-semibold
                      px-2.5
                      py-1
                      rounded-full
                      border
                      transition-transform
                      duration-300
                      group-hover:scale-105
                      ${stat.tagColor}
                    `}
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
                    Live Period
                  </span>
                </div>
              </motion.div>
            );
          })}
        </section>

        <section className="w-full">

          <motion.div
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
              delay: 0.3
            }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
          >

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <Activity size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Real-Time Dispatch Health
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Live logistics and order monitoring directory
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">

                <div className="relative flex-1 sm:w-60">

                  <Search
                    className="absolute left-3 top-2.5 text-slate-400"
                    size={15}
                  />

                  <input
                    type="text"
                    placeholder="Search monitored orders..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5">

                  <Filter
                    size={13}
                    className="text-slate-400 ml-2"
                  />

                  {[
                    'All',
                    'Normal',
                    'Warning',
                    'Critical'
                  ].map((level) => (
                    <button
                      key={level}
                      onClick={() =>
                        setAlertFilter(level)
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                        alertFilter === level
                          ? 'bg-white text-emerald-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden md:block overflow-x-auto">

              <table className="w-full text-left border-collapse">

                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">

                    <th className="py-3.5 px-4 rounded-l-xl">
                      Order ID
                    </th>

                    <th className="py-3.5 px-4">
                      Customer Details
                    </th>

                    <th className="py-3.5 px-4">
                      Assigned Rider
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Transit Temperature
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Delivery Status
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      ETA Window
                    </th>

                    <th className="py-3.5 px-4 text-right rounded-r-xl min-w-[220px]">
                      Emergency Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredMonitoredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-12 text-center"
                      >
                        <Activity
                          size={35}
                          className="mx-auto text-slate-300 mb-3"
                        />

                        <p className="text-xs font-semibold text-slate-400">
                          No tracked transits matched filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredMonitoredOrders.map(
                      (order, idx) => (
                        <motion.tr
                          key={order.id}
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
                              0.3 + idx * 0.05
                          }}
                          className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group"
                        >

                          <td className="py-3.5 px-4">

                            <div className="flex flex-col">

                              <span className="font-mono font-semibold text-black group-hover:text-emerald-700 transition-colors">
                                {order.id}
                              </span>

                              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                Monitored Order
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:border-emerald-300 transition-colors">
                                <MapPin
                                  size={16}
                                  className="text-emerald-600"
                                />
                              </div>

                              <div className="flex flex-col">

                                <span className="font-semibold text-black group-hover:text-emerald-700 transition-colors">
                                  {order.customer}
                                </span>

                                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                  <Activity
                                    size={10}
                                    className="text-slate-400"
                                  />
                                  Active Transit
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">

                            <div className="flex items-center gap-2">

                              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                <Truck
                                  size={14}
                                  className="text-emerald-600"
                                />
                              </div>

                              <div className="flex flex-col">
                                <span className="font-semibold text-black">
                                  {order.rider}
                                </span>

                                <span className="text-[10px] text-slate-400 font-semibold">
                                  Assigned Rider
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">

                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                                parseFloat(order.temp) >= 8
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              <Thermometer
                                size={13}
                              />

                              {order.temp}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">

                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                order.status === 'On Track'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : order.status === 'Delayed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-teal-50 text-teal-700 border-teal-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  order.status === 'On Track'
                                    ? 'bg-emerald-500'
                                    : order.status === 'Delayed'
                                    ? 'bg-emerald-500'
                                    : 'bg-teal-500'
                                }`}
                              />

                              {order.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">

                            <span className="text-[10px] font-semibold text-slate-500">
                              {order.eta}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">

                            <div className="flex items-center justify-end gap-2 min-w-[200px]">

                              <button
                                onClick={() =>
                                  setSelectedOrder(
                                    order
                                  )
                                }
                                className="w-9 h-9 flex items-center justify-center shrink-0 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-xl transition-all"
                                title="View Monitoring"
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                className="w-9 h-9 flex items-center justify-center shrink-0 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-xl transition-all"
                                title="Contact Rider"
                              >
                                <PhoneCall
                                  size={15}
                                />
                              </button>

                              {order.alert ===
                                'Critical' && (
                                <button
                                  onClick={() =>
                                    handleReassign(
                                      order.id
                                    )
                                  }
                                  className="w-[112px] h-9 flex items-center justify-center shrink-0 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all"
                                >
                                  Auto-Reassign
                                </button>
                              )}

                              {order.alert ===
                                'Warning' && (
                                <button
                                  onClick={() =>
                                    handleReassign(
                                      order.id
                                    )
                                  }
                                  className="w-[112px] h-9 flex items-center justify-center shrink-0 px-3 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 hover:border-teal-300 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all"
                                >
                                  Reassign
                                </button>
                              )}

                              {order.alert ===
                                'Normal' && (
                                <button
                                  disabled
                                  className="w-[112px] h-9 flex items-center justify-center shrink-0 px-3 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl text-[10px] font-semibold whitespace-nowrap cursor-not-allowed"
                                >
                                  Stable
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">

              {filteredMonitoredOrders.length === 0 ? (
                <div className="py-10 text-center">

                  <Activity
                    size={35}
                    className="mx-auto text-slate-300 mb-3"
                  />

                  <p className="text-xs font-semibold text-slate-400">
                    No tracked transits matched filters.
                  </p>
                </div>
              ) : (
                filteredMonitoredOrders.map(
                  (order) => (
                    <motion.div
                      key={order.id}
                      initial={{
                        opacity: 0,
                        y: 10
                      }}
                      animate={{
                        opacity: 1,
                        y: 0
                      }}
                      whileHover={{
                        scale: 1.01
                      }}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group"
                    >

                      <div className="flex items-center justify-between gap-3">

                        <div className="flex items-center gap-2 min-w-0">

                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <Activity size={16} />
                          </div>

                          <div className="min-w-0">

                            <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700 transition-colors truncate">
                              {order.customer}
                            </h4>

                            <p className="text-[10px] font-mono text-slate-400 truncate">
                              {order.id}
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 bg-emerald-50 text-emerald-700 border-emerald-200">

                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

                          {order.alert}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">

                        <Truck
                          size={13}
                          className="text-slate-400"
                        />

                        <p className="text-[11px] text-slate-500 font-semibold">
                          {order.rider}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">

                        <div className="p-3 rounded-xl bg-white border border-slate-200">

                          <span className="text-[10px] uppercase font-semibold text-black block mb-1">
                            Temperature
                          </span>

                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">

                            <Thermometer
                              size={13}
                            />

                            {order.temp}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-slate-200">

                          <span className="text-[10px] uppercase font-semibold text-black block mb-1">
                            ETA Window
                          </span>

                          <span className="text-xs font-semibold text-slate-600">
                            {order.eta}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60">

                        <span className="text-[10px] uppercase font-semibold text-black block mb-1">
                          Delivery Status
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">

                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

                          {order.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">

                        <button
                          onClick={() =>
                            setSelectedOrder(
                              order
                            )
                          }
                          className="w-9 h-9 flex items-center justify-center shrink-0 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-xl transition-all"
                          title="View Monitoring"
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          className="w-9 h-9 flex items-center justify-center shrink-0 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-xl transition-all"
                          title="Contact Rider"
                        >
                          <PhoneCall
                            size={15}
                          />
                        </button>

                        {order.alert ===
                          'Critical' && (
                          <button
                            onClick={() =>
                              handleReassign(
                                order.id
                              )
                            }
                            className="w-[112px] h-9 flex items-center justify-center shrink-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all"
                          >
                            Auto-Reassign
                          </button>
                        )}

                        {order.alert ===
                          'Warning' && (
                          <button
                            onClick={() =>
                              handleReassign(
                                order.id
                              )
                            }
                            className="w-[112px] h-9 flex items-center justify-center shrink-0 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all"
                          >
                            Reassign
                          </button>
                        )}

                        {order.alert ===
                          'Normal' && (
                          <button
                            disabled
                            className="w-[112px] h-9 flex items-center justify-center shrink-0 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl text-[10px] font-semibold whitespace-nowrap cursor-not-allowed"
                          >
                            Stable
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                )
              )}
            </div>
          </motion.div>
        </section>
      </main>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4"
            onClick={() =>
              setSelectedOrder(null)
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            >

              <div className="p-6 bg-emerald-950 text-white relative overflow-hidden">

                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex items-center justify-between">

                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-emerald-300">
                      Monitoring Details
                    </span>

                    <h3 className="text-xl font-semibold mt-1">
                      {selectedOrder.id}
                    </h3>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedOrder(null)
                    }
                    className="w-9 h-9 rounded-xl bg-emerald-900 border border-emerald-800 hover:bg-emerald-800 flex items-center justify-center text-white text-xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">

                <div className="grid grid-cols-2 gap-3">

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Customer
                    </span>

                    <p className="text-sm font-semibold text-black mt-1">
                      {selectedOrder.customer}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Rider
                    </span>

                    <p className="text-sm font-semibold text-black mt-1">
                      {selectedOrder.rider}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Temperature
                    </span>

                    <p className="text-sm font-semibold text-emerald-700 mt-1">
                      {selectedOrder.temp}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      ETA
                    </span>

                    <p className="text-sm font-semibold text-black mt-1">
                      {selectedOrder.eta}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white">

                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Current Status
                  </span>

                  <div className="flex items-center justify-between mt-2">

                    <span className="text-sm font-semibold text-black">
                      {selectedOrder.status}
                    </span>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                      {selectedOrder.alert}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">

                  {selectedOrder.alert !==
                    'Normal' && (
                    <button
                      onClick={() => {
                        handleReassign(
                          selectedOrder.id
                        );
                        setSelectedOrder(null);
                      }}
                      className="flex-1 h-10 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-all"
                    >
                      Reassign Rider
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setSelectedOrder(null)
                    }
                    className="flex-1 h-10 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

