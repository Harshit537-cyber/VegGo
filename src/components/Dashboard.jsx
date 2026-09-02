import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { getAdminDashboard } from '../Api/dashboardService/dashboardService';
import {
  Calendar,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  ShieldCheck,
  Activity,
  Package,
  Users,
  Server,
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (!value) {
      setDisplayValue('');
      return;
    }

    const match = String(value).match(/([\d,.]+)\s*(.*)/);

    if (!match) {
      setDisplayValue(String(value));
      return;
    }

    const rawNumberStr = match[1].replace(/,/g, '');
    const targetNum = parseFloat(rawNumberStr);
    const suffix = match[2] || '';
    const isDecimal = rawNumberStr.includes('.');
    const hasComma = match[1].includes(',');

    const duration = 1000;
    const startTime = performance.now();
    let animationFrameId;

    const updateCount = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress =
        progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const currentVal = easeProgress * targetNum;

      let formatted;

      if (isDecimal) {
        formatted = currentVal.toFixed(1);
      } else {
        formatted = Math.floor(currentVal).toString();
      }

      if (hasComma) {
        const parts = formatted.split('.');
        parts[0] = parseInt(parts[0], 10).toLocaleString('en-US');
        formatted = parts.join('.');
      }

      setDisplayValue(
        `${formatted}${suffix ? ` ${suffix}` : ''}`
      );

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(String(value));
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{displayValue}</span>;
}

const formatDisplayText = (value) => {
  if (!value) return value;

  return String(value)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function Dashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);

    try {
      const response = await getAdminDashboard();

      if (response?.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: 'Total Customers',
      value: dashboardData?.totalCustomers
        ? String(dashboardData.totalCustomers)
        : '0',
      change: '+100%',
      desc: 'Active registered clients',
      icon: Users,
      accent: 'bg-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-700'
    },
    {
      label: 'Total Users',
      value: dashboardData?.totalUsers
        ? String(dashboardData.totalUsers)
        : '0',
      change: '+100%',
      desc: 'System users',
      icon: Activity,
      accent: 'bg-teal-600',
      iconBg: 'bg-teal-50 text-teal-700'
    },
    {
      label: 'System Status',
      value: dashboardData?.systemStatus
        ? formatDisplayText(dashboardData.systemStatus)
        : 'Unknown',
      change: '100%',
      desc: 'All services running',
      icon: ShieldCheck,
      accent: 'bg-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-700'
    },
    {
      label: 'Environment',
      value: dashboardData?.environment
        ? formatDisplayText(dashboardData.environment)
        : 'N/A',
      change: 'Active',
      desc: 'Current deployment env',
      icon: Server,
      accent: 'bg-green-700',
      iconBg: 'bg-green-50 text-green-700'
    }
  ];

  const recentOrders = [
    {
      id: '#VGF-2918',
      client: 'Green Grocers Inc.',
      produce: 'Fresh Spinach',
      quantity: '1,200 kg',
      status: 'Shipped',
      temp: '4.1°C'
    },
    {
      id: '#VGF-2917',
      client: 'Organic Harvest Co.',
      produce: 'Broccoli Heads',
      quantity: '850 kg',
      status: 'Processing',
      temp: '4.4°C'
    },
    {
      id: '#VGF-2916',
      client: 'Super Foods Depot',
      produce: 'Sweet Potatoes',
      quantity: '3,400 kg',
      status: 'Shipped',
      temp: '6.0°C'
    },
    {
      id: '#VGF-2915',
      client: 'Healthy Living Market',
      produce: 'Avocados',
      quantity: '500 kg',
      status: 'Delayed',
      temp: '8.2°C'
    },
    {
      id: '#VGF-2914',
      client: 'Nature Express Hub',
      produce: 'Red Tomatoes',
      quantity: '2,100 kg',
      status: 'Shipped',
      temp: '5.1°C'
    }
  ];

  const getStatusStyle = (status) => {
    if (status === 'Shipped') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }

    if (status === 'Processing') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }

    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'Shipped') {
      return <CheckCircle2 size={12} />;
    }

    if (status === 'Processing') {
      return <Layers size={12} />;
    }

    return <AlertCircle size={12} />;
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
        <div className="space-y-6 sm:space-y-7">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-emerald-950 text-white p-5 sm:p-6 lg:p-7 shadow-xl shadow-emerald-950/15 border border-emerald-900"
          >
            <div className="absolute -top-32 -right-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900 border border-emerald-800 text-emerald-300 text-[10px] font-bold tracking-widest">
                    <Zap size={11} />
                    Operations Center
                  </span>

                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950 border border-rose-900 text-white text-[10px] font-bold tracking-widest">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 animate-ping opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                    </span>
                    Live Admin Veg Go
                  </span>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
                    Real-time Platform Metrics
                  </h1>

                  <p className="mt-1.5 text-xs sm:text-sm text-emerald-100/55">
                    Monitor customers, users and system operations from one place.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 bg-emerald-900/70 border border-emerald-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-emerald-100">
                  <Calendar size={14} className="text-emerald-400" />
                  <span>
                    {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchDashboardData}
                  disabled={isRefreshing}
                  className="p-2.5 rounded-2xl bg-emerald-900/70 border border-emerald-800 hover:bg-emerald-800 transition-all disabled:opacity-50"
                >
                  <RefreshCw
                    size={15}
                    className={`text-emerald-300 ${
                      isRefreshing ? 'animate-spin' : ''
                    }`}
                  />
                </motion.button>
              </div>
            </div>
          </motion.header>

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08
                  }}
                  whileHover={{ y: -5 }}
                  className="relative overflow-hidden bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 p-5 sm:p-6 group"
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accent}`}
                  />

                  <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-emerald-50 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider">
                        {stat.label}
                      </span>

                      <div className={`p-2.5 rounded-2xl ${stat.iconBg}`}>
                        <Icon size={18} />
                      </div>
                    </div>

                    <h3 className="mt-5 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                      {loading ? (
                        <span className="text-slate-300 animate-pulse">
                          ...
                        </span>
                      ) : (
                        <AnimatedValue value={stat.value} />
                      )}
                    </h3>

                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold">
                        <ArrowUpRight size={12} />
                        {stat.change}
                      </span>

                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold text-right">
                        {stat.desc}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="xl:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700">
                    <Package size={18} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Recent Supply Dispatches
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Latest active thermal transit lanes
                    </p>
                  </div>
                </div>

                <button className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 text-xs font-semibold transition-all">
                  Export Ledger
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] tracking-wider text-slate-400 font-bold">
                      <th className="py-4 pr-4">Reference</th>
                      <th className="py-4 px-4">Client</th>
                      <th className="py-4 px-4">Produce</th>
                      <th className="py-4 px-4 text-center">Quantity</th>
                      <th className="py-4 px-4 text-center">Temperature</th>
                      <th className="py-4 pl-4 text-right">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          delay: index * 0.06
                        }}
                        className="text-xs font-medium text-slate-600 hover:bg-emerald-50/40 transition-colors"
                      >
                        <td className="py-4 pr-4 font-mono font-bold text-slate-900">
                          {order.id}
                        </td>

                        <td className="py-4 px-4 font-semibold text-slate-700">
                          {order.client}
                        </td>

                        <td className="py-4 px-4">
                          {order.produce}
                        </td>

                        <td className="py-4 px-4 text-center font-mono">
                          {order.quantity}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold font-mono text-slate-600">
                            <Thermometer
                              size={12}
                              className="text-emerald-500"
                            />
                            {order.temp}
                          </span>
                        </td>

                        <td className="py-4 pl-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${getStatusStyle(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden mt-5 space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {order.id}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {order.client}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {order.produce}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200">
                      <div>
                        <p className="text-[9px] tracking-wider font-bold text-slate-400">
                          Quantity
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-700">
                          {order.quantity}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] tracking-wider font-bold text-slate-400">
                          Temperature
                        </p>
                        <p className="mt-1 text-xs font-semibold text-emerald-700">
                          {order.temp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 flex flex-col"
            >
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Thermal Health
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cold-chain consistency
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <ShieldCheck size={18} />
                </div>
              </div>

              <div className="mt-5 relative min-h-[260px] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 flex items-center justify-center p-6">
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-400/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full bg-teal-400/10 blur-3xl" />

                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:20px_20px]" />

                <div className="relative z-10 text-center">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center"
                  >
                    <TrendingUp
                      size={30}
                      className="text-emerald-400"
                    />
                  </motion.div>

                  <p className="mt-5 text-[11px] tracking-widest font-bold text-emerald-200">
                    Operational Consistency
                  </p>

                  <p className="mt-2 text-xs text-emerald-100/55 leading-5 max-w-[220px] mx-auto">
                    All active nodes are operating inside targeted temperature bounds.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-300">
                      99.8% Reliability
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">
                    Standard Deviations
                  </span>

                  <span className="font-bold text-slate-900">
                    0.12 °C Max
                  </span>
                </div>

                <div className="mt-3 w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '95%' }}
                    transition={{
                      duration: 1.2,
                      ease: 'easeOut'
                    }}
                    className="h-full rounded-full bg-emerald-500"
                  />
                </div>
              </div>

              <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-600">
                    Cold Storage Nodes
                  </span>
                </div>

                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                  4 / 4 Active
                </span>
              </div>
            </motion.div>
          </section>

          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Users size={17} />
              </div>

              <div>
                <p className="text-[10px] tracking-wider font-bold text-slate-400">
                  Customer Network
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  Growing
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
                <Activity size={17} />
              </div>

              <div>
                <p className="text-[10px] tracking-wider font-bold text-slate-400">
                  Platform Activity
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  Operational
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-50 text-green-600">
                <Server size={17} />
              </div>

              <div>
                <p className="text-[10px] tracking-wider font-bold text-slate-400">
                  Infrastructure
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  Healthy
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}