import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Percent,
  DollarSign,
  CreditCard,
  Save,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Building,
  Calendar,
  RefreshCw,
  Zap,
  Sparkles,
  ShieldCheck,
  Wallet,
  CircleDollarSign,
  ChevronDown,
  Check
} from 'lucide-react';

export default function PaymentCommissions() {
  const [currentTab, setCurrentTab] = useState('payment-methods');
  const [showNotification, setShowNotification] = useState(false);
  const [platformCommission, setPlatformCommission] = useState(12);
  const [payoutLimit, setPayoutLimit] = useState(1500);
  const [fixedFee, setFixedFee] = useState(15);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [razorpayActive, setRazorpayActive] = useState(true);
  const [stripeActive, setStripeActive] = useState(false);
  const [codActive, setCodActive] = useState(true);
  const [settlementCycle, setSettlementCycle] = useState('weekly');
  const [isCycleOpen, setIsCycleOpen] = useState(false);

  const cycleRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (cycleRef.current && !cycleRef.current.contains(event.target)) {
        setIsCycleOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const settlementOptions = [
    {
      value: 'weekly',
      label: 'Weekly settlements'
    },
    {
      value: 'biweekly',
      label: 'Bi-weekly settlements'
    },
    {
      value: 'monthly',
      label: 'Monthly settlements'
    }
  ];

  const selectedCycle =
    settlementOptions.find((item) => item.value === settlementCycle) ||
    settlementOptions[0];

  const activeGateways = [
    {
      name: 'Razorpay API',
      description: 'Primary payment gateway',
      active: razorpayActive,
      toggle: () => setRazorpayActive((value) => !value)
    },
    {
      name: 'Stripe System',
      description: 'International payment gateway',
      active: stripeActive,
      toggle: () => setStripeActive((value) => !value)
    },
    {
      name: 'Cash on Delivery',
      description: 'Offline payment channel',
      active: codActive,
      toggle: () => setCodActive((value) => !value)
    }
  ];

  const inputClass =
    'w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all';

  return (
    <div className="min-h-screen bg-[#f4f8f7] flex flex-col md:flex-row font-sans antialiased text-slate-800">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 min-w-0 w-full overflow-y-auto max-h-screen p-3 sm:p-5 lg:p-7">
        <div className="w-full max-w-[1700px] mx-auto space-y-5 sm:space-y-6">
          <AnimatePresence>
            {showNotification && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.96 }}
                className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[100] max-w-[calc(100vw-32px)] flex items-center gap-3 bg-[#003c31] text-white px-4 sm:px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-800"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-400/15 flex items-center justify-center shrink-0">
                  <CheckCircle2
                    size={17}
                    className="text-emerald-300"
                  />
                </div>

                <span className="text-xs sm:text-sm font-bold">
                  Payment parameters updated successfully
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.header
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#003f34] via-[#005445] to-[#00755b] p-5 sm:p-6 lg:p-7 text-white shadow-[0_18px_45px_rgba(0,75,60,0.18)]"
          >
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-300/10 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 w-80 h-80 rounded-full bg-teal-300/10 blur-3xl" />

            <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-[9px] sm:text-[10px] font-bold tracking-[0.14em] uppercase text-emerald-100">
                    <Zap size={12} />
                    Financial Management
                  </span>

                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-300/15 text-[9px] sm:text-[10px] font-bold tracking-[0.12em] uppercase">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-rose-300 animate-ping opacity-70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
                    </span>
                    Live Admin
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                    Payment & Commissions
                  </h1>

                  <Sparkles className="hidden sm:block w-5 h-5 lg:w-6 lg:h-6 text-emerald-300" />
                </div>

                <p className="mt-2 text-xs sm:text-sm text-emerald-50/75 max-w-2xl leading-relaxed">
                  Configure settlement policies, platform fees, taxes, and payment processing rules.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 rounded-2xl bg-white/10 border border-white/10 px-3.5 py-2.5 backdrop-blur-md">
                  <Calendar
                    size={14}
                    className="text-emerald-200"
                  />

                  <span className="text-[11px] sm:text-xs font-semibold text-emerald-50">
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
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 border border-white/10 hover:bg-white/15 transition-all"
                  title="Refresh"
                >
                  <RefreshCw
                    size={15}
                    className="text-emerald-100"
                  />
                </motion.button>
              </div>
            </div>
          </motion.header>

          <section className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.35 }}
              className="relative overflow-hidden bg-white rounded-[22px] border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Platform Commission
                  </p>

                  <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">
                    {platformCommission}%
                  </h3>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <Percent size={18} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[9px] sm:text-[10px] font-bold text-emerald-700">
                  Default Rate
                </span>

                <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400">
                  Vendor Fees
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="relative overflow-hidden bg-white rounded-[22px] border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Transaction Fee
                  </p>

                  <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">
                    ₹{fixedFee}
                  </h3>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                  <DollarSign size={18} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100 text-[9px] sm:text-[10px] font-bold text-teal-700">
                  Fixed
                </span>

                <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400">
                  Per Transaction
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="relative overflow-hidden bg-white rounded-[22px] border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-600" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Operational Tax
                  </p>

                  <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">
                    {gstPercentage}%
                  </h3>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-700">
                  <TrendingUp size={18} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full bg-green-50 border border-green-100 text-[9px] sm:text-[10px] font-bold text-green-700">
                  GST
                </span>

                <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400">
                  Tax Rate
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="relative overflow-hidden bg-white rounded-[22px] border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Payout Threshold
                  </p>

                  <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">
                    ₹{payoutLimit.toLocaleString('en-IN')}
                  </h3>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <Wallet size={18} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[9px] sm:text-[10px] font-bold text-emerald-700">
                  Minimum
                </span>

                <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400">
                  Vendor Payout
                </span>
              </div>
            </motion.div>
          </section>

          <form
            onSubmit={handleSave}
            className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6"
          >
            <div className="xl:col-span-2 space-y-5 sm:space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="bg-white rounded-[24px] border border-slate-200/80 shadow-sm overflow-visible"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                        <Percent size={19} />
                      </div>

                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                          Commission Configuration
                        </h2>

                        <p className="mt-0.5 text-[10px] sm:text-xs font-medium text-slate-500">
                          Configure platform fees and transaction charges
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[9px] font-bold text-emerald-700">
                      <ShieldCheck size={12} />
                      SECURED
                    </span>
                  </div>

                  <div className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <label className="text-[10px] sm:text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                          Default Platform Commission
                        </label>

                        <p className="mt-1 text-[10px] text-slate-400 font-medium">
                          Applied to vendor earnings on completed orders
                        </p>
                      </div>

                      <span className="w-fit text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                        {platformCommission}%
                      </span>
                    </div>

                    <div className="mt-6">
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={platformCommission}
                        onChange={(e) =>
                          setPlatformCommission(Number(e.target.value))
                        }
                        className="payment-range w-full cursor-pointer"
                      />

                      <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-400">
                        <span>0%</span>
                        <span>10%</span>
                        <span>20%</span>
                        <span>30%</span>
                        <span>40%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-7 pt-6 border-t border-slate-100">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        <DollarSign
                          size={14}
                          className="text-emerald-600"
                        />
                        Fixed Transaction Fee
                      </label>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={fixedFee}
                          onChange={(e) =>
                            setFixedFee(Number(e.target.value))
                          }
                          className={`${inputClass} pr-16`}
                        />

                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">
                          INR
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        <TrendingUp
                          size={14}
                          className="text-emerald-600"
                        />
                        Operational Tax (GST)
                      </label>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={gstPercentage}
                          onChange={(e) =>
                            setGstPercentage(Number(e.target.value))
                          }
                          className={`${inputClass} pr-12`}
                        />

                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.3 }}
                className="bg-white rounded-[24px] border border-slate-200/80 shadow-sm overflow-visible"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-3 pb-5 border-b border-slate-100">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                      <Building size={19} />
                    </div>

                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        Payout & Settlement Parameters
                      </h2>

                      <p className="mt-0.5 text-[10px] sm:text-xs font-medium text-slate-500">
                        Configure vendor payout thresholds and settlement cycles
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        Minimum Vendor Payout Balance
                      </label>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={payoutLimit}
                          onChange={(e) =>
                            setPayoutLimit(Number(e.target.value))
                          }
                          className={`${inputClass} pr-16`}
                        />

                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">
                          INR
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        Minimum balance required before vendor payout.
                      </p>
                    </div>

                    <div
                      className="space-y-2 relative"
                      ref={cycleRef}
                    >
                      <label className="text-[10px] sm:text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        Automated Settlement Cycle
                      </label>

                      <button
                        type="button"
                        onClick={() => setIsCycleOpen((value) => !value)}
                        className={`w-full h-12 px-4 rounded-2xl border text-left flex items-center justify-between gap-3 text-sm font-semibold transition-all ${
                          isCycleOpen
                            ? 'bg-white border-emerald-500 ring-4 ring-emerald-500/10'
                            : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <span className="truncate text-slate-900">
                          {selectedCycle.label}
                        </span>

                        <ChevronDown
                          size={17}
                          className={`text-emerald-600 shrink-0 transition-transform duration-200 ${
                            isCycleOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {isCycleOpen && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              y: -5,
                              scale: 0.98
                            }}
                            animate={{
                              opacity: 1,
                              y: 4,
                              scale: 1
                            }}
                            exit={{
                              opacity: 0,
                              y: -5,
                              scale: 0.98
                            }}
                            transition={{ duration: 0.16 }}
                            className="absolute z-[60] left-0 right-0 top-full mt-1 rounded-2xl border border-emerald-100 bg-white p-1.5 shadow-[0_15px_35px_rgba(0,80,60,0.16)]"
                          >
                            {settlementOptions.map((option) => {
                              const active =
                                settlementCycle === option.value;

                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    setSettlementCycle(option.value);
                                    setIsCycleOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all ${
                                    active
                                      ? 'bg-emerald-600 text-white'
                                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                                  }`}
                                >
                                  <span>{option.label}</span>

                                  {active && <Check size={15} />}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        Defines how frequently vendor balances are settled.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>
            </div>

            <div className="space-y-5 sm:space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.4 }}
                className="bg-white rounded-[24px] border border-slate-200/80 shadow-sm overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-3 pb-5 border-b border-slate-100">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                      <CreditCard size={19} />
                    </div>

                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        Payment Gateways
                      </h2>

                      <p className="mt-0.5 text-[10px] sm:text-xs font-medium text-slate-500">
                        Active payment processing channels
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 space-y-3">
                    {activeGateways.map((gateway, index) => (
                      <motion.div
                        key={gateway.name}
                        initial={{
                          opacity: 0,
                          x: 10
                        }}
                        animate={{
                          opacity: 1,
                          x: 0
                        }}
                        transition={{
                          delay: index * 0.08
                        }}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                              gateway.active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}
                          >
                            {gateway.name.includes('Razorpay') ? (
                              <CircleDollarSign size={17} />
                            ) : gateway.name.includes('Stripe') ? (
                              <CreditCard size={17} />
                            ) : (
                              <Wallet size={17} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                              {gateway.name}
                            </p>

                            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">
                              {gateway.description}
                            </p>

                            <p
                              className={`text-[8px] font-bold uppercase mt-1 ${
                                gateway.active
                                  ? 'text-emerald-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              {gateway.active ? 'Active' : 'Offline'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={gateway.toggle}
                          aria-label={`Toggle ${gateway.name}`}
                          className={`relative w-11 h-6 rounded-full shrink-0 transition-all duration-300 ${
                            gateway.active
                              ? 'bg-emerald-500'
                              : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
                              gateway.active ? 'left-6' : 'left-1'
                            }`}
                          />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.5 }}
                className="rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-5"
              >
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-emerald-100 flex items-center justify-center shrink-0">
                    <AlertCircle
                      size={16}
                      className="text-emerald-700"
                    />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold text-emerald-900 uppercase tracking-[0.12em]">
                      Financial Policy Notice
                    </p>

                    <p className="mt-1.5 text-[10px] sm:text-[11px] text-emerald-800/75 leading-relaxed font-medium">
                      Changing system financial metrics immediately adjusts all pending and future transaction balances globally.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full h-12 sm:h-13 flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-[0_10px_25px_rgba(5,150,105,0.2)] transition-all"
              >
                <Save size={16} />
                Save Payment Rules
              </motion.button>
            </div>
          </form>
        </div>

        <style>{`
          input[type="number"] {
            -moz-appearance: textfield;
            appearance: textfield;
          }

          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }

          .payment-range {
            appearance: none;
            height: 7px;
            border-radius: 999px;
            background: linear-gradient(
              to right,
              #059669 0%,
              #059669 ${(platformCommission / 40) * 100}%,
              #e2e8f0 ${(platformCommission / 40) * 100}%,
              #e2e8f0 100%
            );
            outline: none;
          }

          .payment-range::-webkit-slider-thumb {
            appearance: none;
            width: 19px;
            height: 19px;
            border-radius: 50%;
            background: #ffffff;
            border: 4px solid #059669;
            box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
            cursor: pointer;
          }

          .payment-range::-moz-range-thumb {
            width: 19px;
            height: 19px;
            border-radius: 50%;
            background: #ffffff;
            border: 4px solid #059669;
            box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
            cursor: pointer;
          }

          @media (max-width: 639px) {
            .payment-range::-webkit-slider-thumb {
              width: 18px;
              height: 18px;
            }

            .payment-range::-moz-range-thumb {
              width: 18px;
              height: 18px;
            }
          }
        `}</style>
      </main>
    </div>
  );
}