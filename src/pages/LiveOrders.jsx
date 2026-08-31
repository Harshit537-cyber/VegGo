import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import OrderDetailModal from '../Models/OrderDetailModal';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Calendar,
  RefreshCw,
  ShoppingCart,
  Clock,
  Truck,
  CheckCircle2,
  Eye,
  MapPin,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Package
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

export default function LiveOrders() {
  const [currentTab, setCurrentTab] =
    useState('live-orders');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('All');

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [orders, setOrders] = useState([
    {
      id: 'ORD-4091',
      customer: 'Rohan Sharma',
      address: 'Connaught Place, New Delhi',
      items:
        'Organic Spinach (2kg), Red Tomatoes (3kg)',
      amount: '₹340.00',
      status: 'Incoming',
      time: 'Just now'
    },
    {
      id: 'ORD-4092',
      name: 'Priyan Sen',
      customer: 'Priya Sen',
      address: 'Salt Lake, Kolkata',
      items:
        'Fresh Broccoli (1.5kg), Strawberries (1 Box)',
      amount: '₹520.00',
      status: 'Processing',
      time: '8 mins ago'
    },
    {
      id: 'ORD-4093',
      customer: 'Amit Verma',
      address: 'Indiranagar, Bengaluru',
      items:
        'Sweet Potatoes (5kg), Fresh Mint (2 Bunches)',
      amount: '₹380.00',
      status: 'Out for Delivery',
      time: '14 mins ago'
    },
    {
      id: 'ORD-4094',
      customer: 'Sneha Patel',
      address: 'Andheri West, Mumbai',
      items:
        'Button Mushrooms (1kg), Avocados (2 Units)',
      amount: '₹490.00',
      status: 'Processing',
      time: '22 mins ago'
    },
    {
      id: 'ORD-4095',
      customer: 'Vikram Malhotra',
      address: 'Banjara Hills, Hyderabad',
      items:
        'Exotic Salad Box (2 Units)',
      amount: '₹600.00',
      status: 'Incoming',
      time: '29 mins ago'
    },
    {
      id: 'ORD-4096',
      customer: 'Ananya Roy',
      address: 'Gariahat, Kolkata',
      items:
        'Fresh Basil (1 Bunch), Cherry Tomatoes (2 Boxes)',
      amount: '₹290.00',
      status: 'Out for Delivery',
      time: '35 mins ago'
    }
  ]);

  const handleAction = (id, nextStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              status: nextStatus
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

  const incomingCount = orders.filter(
    (order) => order.status === 'Incoming'
  ).length;

  const processingCount = orders.filter(
    (order) => order.status === 'Processing'
  ).length;

  const deliveryCount = orders.filter(
    (order) =>
      order.status === 'Out for Delivery'
  ).length;

  const totalRevenue = orders.reduce(
    (sum, order) => {
      const numericValue = parseFloat(
        order.amount.replace(/[₹,]/g, '')
      );

      return sum + numericValue;
    },
    0
  );

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      order.customer
        .toLowerCase()
        .includes(query) ||
      order.id
        .toLowerCase()
        .includes(query) ||
      order.items
        .toLowerCase()
        .includes(query);

    const matchesStatus =
      statusFilter === 'All' ||
      order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const liveStats = [
    {
      label: 'Incoming Requests',
      value: `${incomingCount}`,
      suffix: ' Pending',
      change: '+12.4%',
      up: true,
      accentColor: 'bg-emerald-600',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: Clock
    },
    {
      label: 'Processing Batch',
      value: `${processingCount}`,
      suffix: ' Orders',
      change: '+8.2%',
      up: true,
      accentColor: 'bg-teal-600',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: ShoppingCart
    },
    {
      label: 'Out For Delivery',
      value: `${deliveryCount}`,
      suffix: ' Active',
      change: '+5.6%',
      up: true,
      accentColor: 'bg-emerald-500',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: Truck
    },
    {
      label: 'Total Active Value',
      value: `₹${totalRevenue.toFixed(2)}`,
      suffix: '',
      change: '+15.5%',
      up: true,
      accentColor: 'bg-green-700',
      iconBg:
        'bg-green-50 text-green-700',
      tagColor:
        'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: CheckCircle2,
      highlight: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">

      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">

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
                Real-time Order Operations
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
              Live Orders Feed
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
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner group/btn disabled:opacity-50"
              title="Refresh Orders"
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
          {liveStats.map((stat, idx) => {
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
                  <ShoppingCart size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Active Operations Ledger
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Real-time live order management directory
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
                    placeholder="Search active orders..."
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
                    'Incoming',
                    'Processing',
                    'Out for Delivery'
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        setStatusFilter(status)
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                        statusFilter === status
                          ? 'bg-white text-emerald-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {status}
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
                      Items Summary
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Total Amount
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Order Age
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Execution State
                    </th>

                    <th className="py-3.5 px-4 text-right rounded-r-xl min-w-[215px]">
                      Operational Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-12 text-center"
                      >
                        <ShoppingCart
                          size={35}
                          className="mx-auto text-slate-300 mb-3"
                        />

                        <p className="text-xs font-semibold text-slate-400">
                          No matching active live orders.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order, idx) => (
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
                              Live Order
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:border-emerald-300 transition-colors">
                              <ShoppingCart
                                size={16}
                                className="text-emerald-600"
                              />
                            </div>

                            <div className="flex flex-col">
                              <span className="font-semibold text-black group-hover:text-emerald-700 transition-colors">
                                {order.customer}
                              </span>

                              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                <MapPin
                                  size={10}
                                  className="text-slate-400"
                                />
                                {order.address}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-[10px] text-slate-500 font-semibold line-clamp-2 max-w-[260px]">
                            {order.items}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 font-mono text-black font-semibold">
                            <Package
                              size={13}
                              className="text-emerald-600"
                            />
                            {order.amount}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[10px] font-semibold text-slate-500">
                            {order.time}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all duration-300 group-hover:scale-105 ${
                              order.status === 'Incoming'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : order.status === 'Processing'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-teal-50 text-teal-700 border-teal-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                order.status === 'Incoming'
                                  ? 'bg-emerald-500'
                                  : order.status === 'Processing'
                                  ? 'bg-emerald-500'
                                  : 'bg-teal-500'
                              }`}
                            />

                            {order.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-end gap-2 min-w-[190px]">
                            <button
                              onClick={() =>
                                setSelectedOrder(order)
                              }
                              className="w-9 h-9 flex items-center justify-center shrink-0 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-xl transition-all"
                              title="View Order"
                            >
                              <Eye size={15} />
                            </button>

                            {order.status === 'Incoming' && (
                              <button
                                onClick={() =>
                                  handleAction(
                                    order.id,
                                    'Processing'
                                  )
                                }
                                className="w-[112px] h-9 flex items-center justify-center shrink-0 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all"
                              >
                                Accept Order
                              </button>
                            )}

                            {order.status === 'Processing' && (
                              <button
                                onClick={() =>
                                  handleAction(
                                    order.id,
                                    'Out for Delivery'
                                  )
                                }
                                className="w-[112px] h-9 flex items-center justify-center shrink-0 px-3 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 hover:border-teal-300 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all"
                              >
                                Assign Dispatch
                              </button>
                            )}

                            {order.status === 'Out for Delivery' && (
                              <button
                                disabled
                                className="w-[112px] h-9 flex items-center justify-center shrink-0 px-3 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl text-[10px] font-semibold whitespace-nowrap cursor-not-allowed"
                              >
                                Dispatched
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="py-10 text-center">
                  <ShoppingCart
                    size={35}
                    className="mx-auto text-slate-300 mb-3"
                  />

                  <p className="text-xs font-semibold text-slate-400">
                    No matching active live orders.
                  </p>
                </div>
              ) : (
                filteredOrders.map((order) => (
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
                          <ShoppingCart size={16} />
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

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${
                          order.status === 'Incoming'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : order.status === 'Processing'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-teal-50 text-teal-700 border-teal-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            order.status === 'Incoming'
                              ? 'bg-emerald-500'
                              : order.status === 'Processing'
                              ? 'bg-emerald-500'
                              : 'bg-teal-500'
                          }`}
                        />

                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin
                        size={13}
                        className="text-slate-400 mt-0.5 shrink-0"
                      />

                      <p className="text-[11px] text-slate-500 font-semibold">
                        {order.address}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-black block mb-1">
                        Items
                      </span>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        {order.items}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">
                          Total Amount
                        </span>

                        <span className="font-mono font-semibold text-emerald-700">
                          {order.amount}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">
                          Order Age
                        </span>

                        <span className="font-semibold text-slate-600">
                          {order.time}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() =>
                          setSelectedOrder(order)
                        }
                        className="w-9 h-9 flex items-center justify-center shrink-0 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-xl transition-all"
                        title="View Order"
                      >
                        <Eye size={15} />
                      </button>

                      {order.status === 'Incoming' && (
                        <button
                          onClick={() =>
                            handleAction(
                              order.id,
                              'Processing'
                            )
                          }
                          className="w-[112px] h-9 flex items-center justify-center shrink-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all"
                        >
                          Accept Order
                        </button>
                      )}

                      {order.status === 'Processing' && (
                        <button
                          onClick={() =>
                            handleAction(
                              order.id,
                              'Out for Delivery'
                            )
                          }
                          className="w-[112px] h-9 flex items-center justify-center shrink-0 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all"
                        >
                          Assign Dispatch
                        </button>
                      )}

                      {order.status === 'Out for Delivery' && (
                        <button
                          disabled
                          className="w-[112px] h-9 flex items-center justify-center shrink-0 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl text-[10px] font-semibold whitespace-nowrap cursor-not-allowed"
                        >
                          Dispatched
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </section>
      </main>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            isOpen={!!selectedOrder}
            onClose={() =>
              setSelectedOrder(null)
            }
            onAction={(id, nextStatus) => {
              handleAction(id, nextStatus);
              setSelectedOrder(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}