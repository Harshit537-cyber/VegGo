import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ShopDetailModal from '../Models/ShopDetailModal';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Sparkles,
  Eye,
  X,
  Store,
  Zap,
  CheckCircle2,
  Clock,
  XCircle,
  Check
} from 'lucide-react';

// Animated Value Counter Component
function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (!value) {
      setDisplayValue('0');
      return;
    }

    const strVal = String(value);
    const match = strVal.match(/([₹\d,.]+)\s*(.*)/);

    if (!match) {
      setDisplayValue(strVal);
      return;
    }

    const isRupee = strVal.startsWith('₹');
    const rawNumberStr = match[1].replace(/[₹,]/g, '');
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
        `${isRupee ? '₹' : ''}${formatted}${
          suffix ? ' ' + suffix : ''
        }`
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

export default function ShopApproval() {
  const [currentTab, setCurrentTab] =
    useState('shop-approval');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [applications, setApplications] = useState([
    {
      id: 'REQ-1094',
      name: 'Golden Harvest Co.',
      owner: 'David Sterling',
      category: 'Organic Vegetables',
      date: 'Oct 10, 2026',
      status: 'Pending'
    },
    {
      id: 'REQ-1095',
      name: 'Premium Dairy Labs',
      owner: 'Amara Walker',
      category: 'Dairy Products',
      date: 'Oct 11, 2026',
      status: 'Pending'
    },
    {
      id: 'REQ-1096',
      name: 'Alpine Berry Orchards',
      owner: 'Gregory Peck',
      category: 'Fresh Fruits',
      date: 'Oct 11, 2026',
      status: 'Pending'
    },
    {
      id: 'REQ-1097',
      name: 'MicroGreens Express',
      owner: 'Julianne Moore',
      category: 'Exotics & Greens',
      date: 'Oct 12, 2026',
      status: 'Pending'
    }
  ]);

  // Top Key Metrics
  const approvalStats = [
    {
      label: 'Pending Applications',
      value: `${applications.length}`,
      change: '+8.4%',
      up: true,
      accentColor: 'bg-emerald-600',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Store
    },
    {
      label: 'Approved Today',
      value: '18',
      change: '+10.2%',
      up: true,
      accentColor: 'bg-teal-600',
      iconBg:
        'bg-teal-50 text-teal-700',
      tagColor:
        'text-teal-700 bg-teal-50/80 border-teal-200/80',
      icon: CheckCircle2
    },
    {
      label: 'Rejected Today',
      value: '2',
      change: '-4.5%',
      up: false,
      accentColor: 'bg-emerald-500',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-rose-700 bg-rose-50/80 border-rose-200/80',
      icon: XCircle
    },
    {
      label: 'Approval Rate',
      value: '97.6%',
      change: '+2.1%',
      up: true,
      accentColor: 'bg-green-700',
      iconBg:
        'bg-green-50 text-green-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Check
    }
  ];

  const filteredApplications =
    applications.filter(
      (application) =>
        application.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        application.owner
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        application.id
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        application.category
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleAction = (id, nextStatus) => {
    setApplications((prev) =>
      prev.filter((application) => application.id !== id)
    );

    setSelectedApplication(null);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">

      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">

        {/* Animated Header */}
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

          {/* Ambient Lighting */}
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

              Shop Approvals

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
                scale: 1.05
              }}
              whileTap={{
                scale: 0.95
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

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

          {approvalStats.map((stat, idx) => {

            const IconComponent = stat.icon;

            return (
              <motion.div
                key={idx}
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
                        scale: 1.1
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
          })}

        </section>

        {/* Full Width Application Table Container */}
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
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6 flex flex-col justify-between"
          >

            <div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">

                <div className="flex items-center gap-3">

                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">

                    <Store size={18} />

                  </div>

                  <div>

                    <h2 className="text-lg font-semibold text-black tracking-tight">
                      Shop Applications
                    </h2>

                    <p className="text-xs font-semibold text-black">
                      Pending vendor shop approval directory
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
                      placeholder="Search applications..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />

                  </div>

                </div>

              </div>

              {/* Desktop Dynamic Table */}
              <div className="hidden md:block overflow-x-auto">

                <table className="w-full text-left border-collapse">

                  <thead>

                    <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">

                      <th className="py-3.5 px-4 rounded-l-xl">
                        Request ID
                      </th>

                      <th className="py-3.5 px-4">
                        Shop Details
                      </th>

                      <th className="py-3.5 px-4">
                        Authorized Agent
                      </th>

                      <th className="py-3.5 px-4">
                        Category
                      </th>

                      <th className="py-3.5 px-4">
                        Applied Date
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

                    {filteredApplications.length > 0 ? (

                      filteredApplications.map(
                        (application, idx) => (

                          <motion.tr
                            key={application.id}
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
                            className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                          >

                            <td className="py-3.5 px-4 font-mono text-black font-semibold group-hover:text-emerald-700 transition-colors">

                              {application.id}

                            </td>

                            <td className="py-3.5 px-4">

                              <div className="flex flex-col">

                                <span className="font-semibold text-black group-hover:translate-x-0.5 group-hover:text-emerald-700 transition-all duration-200">

                                  {application.name}

                                </span>

                                <span className="text-[10px] text-slate-500">

                                  Vendor Shop Application

                                </span>

                              </div>

                            </td>

                            <td className="py-3.5 px-4 text-slate-600">

                              {application.owner}

                            </td>

                            <td className="py-3.5 px-4">

                              <span className="bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-lg text-[10px] font-bold">

                                {application.category}

                              </span>

                            </td>

                            <td className="py-3.5 px-4 text-slate-500">

                              {application.date}

                            </td>

                            <td className="py-3.5 px-4 text-center">

                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200/80 shadow-2xs">

                                <Clock
                                  size={11}
                                  className="text-amber-600"
                                />

                                {application.status}

                              </span>

                            </td>

                            <td className="py-3.5 px-4 text-right">

                              <div className="flex items-center justify-end gap-1">

                                <button
                                  onClick={() =>
                                    setSelectedApplication(
                                      application
                                    )
                                  }
                                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="View Info"
                                >

                                  <Eye size={15} />

                                </button>

                                <button
                                  onClick={() =>
                                    handleAction(
                                      application.id,
                                      'Approved'
                                    )
                                  }
                                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Approve Shop"
                                >

                                  <Check size={16} />

                                </button>

                                <button
                                  onClick={() =>
                                    handleAction(
                                      application.id,
                                      'Rejected'
                                    )
                                  }
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Reject Shop"
                                >

                                  <X size={16} />

                                </button>

                              </div>

                            </td>

                          </motion.tr>

                        )
                      )

                    ) : (

                      <tr>

                        <td
                          colSpan="7"
                          className="py-8 text-center text-slate-400 text-xs"
                        >

                          {applications.length === 0
                            ? 'No pending applications remaining.'
                            : 'No matching shop applications found.'}

                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden space-y-3">

                {filteredApplications.length > 0 ? (

                  filteredApplications.map(
                    (application) => (

                      <motion.div
                        key={application.id}
                        whileHover={{
                          scale: 1.01
                        }}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group cursor-pointer"
                      >

                        <div className="flex items-center justify-between">

                          <span className="font-mono text-xs text-black font-semibold">

                            {application.id}

                          </span>

                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">

                            <Clock size={10} />

                            {application.status}

                          </span>

                        </div>

                        <div>

                          <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700 transition-colors duration-200">

                            {application.name}

                          </h4>

                          <p className="text-xs text-slate-500">

                            {application.owner}

                          </p>

                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">

                          <div>

                            <span className="text-[10px] uppercase font-semibold text-black block">

                              Category

                            </span>

                            <span className="font-semibold text-slate-600">

                              {application.category}

                            </span>

                          </div>

                          <div>

                            <span className="text-[10px] uppercase font-semibold text-black block">

                              Applied Date

                            </span>

                            <span className="font-semibold text-slate-600">

                              {application.date}

                            </span>

                          </div>

                        </div>

                        <div className="flex items-center justify-end gap-1 pt-1">

                          <button
                            onClick={() =>
                              setSelectedApplication(
                                application
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View Info"
                          >

                            <Eye size={15} />

                          </button>

                          <button
                            onClick={() =>
                              handleAction(
                                application.id,
                                'Approved'
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve Shop"
                          >

                            <Check size={16} />

                          </button>

                          <button
                            onClick={() =>
                              handleAction(
                                application.id,
                                'Rejected'
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Reject Shop"
                          >

                            <X size={16} />

                          </button>

                        </div>

                      </motion.div>

                    )

                  )

                ) : (

                  <div className="py-8 text-center text-slate-400 text-xs">

                    {applications.length === 0
                      ? 'No pending applications remaining.'
                      : 'No matching shop applications found.'}

                  </div>

                )}

              </div>

            </div>

          </motion.div>

        </section>

      </main>

      {/* Shop Detail Modal */}
      <AnimatePresence>

        {selectedApplication && (

          <ShopDetailModal
            isOpen={!!selectedApplication}
            application={selectedApplication}
            onClose={() =>
              setSelectedApplication(null)
            }
          />

        )}

      </AnimatePresence>

    </div>
  );
}