import React, { useState } from 'react';
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
  CircleDollarSign
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

  const handleSave = (e) => {
    e.preventDefault();

    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const activeGateways = [
    {
      name: 'Razorpay API',
      description: 'Primary payment gateway',
      active: razorpayActive,
      toggle: () => setRazorpayActive(!razorpayActive)
    },
    {
      name: 'Stripe System',
      description: 'International payment gateway',
      active: stripeActive,
      toggle: () => setStripeActive(!stripeActive)
    },
    {
      name: 'Cash on Delivery',
      description: 'Offline payment channel',
      active: codActive,
      toggle: () => setCodActive(!codActive)
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">

      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8 relative">

        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{
                opacity: 0,
                y: -20,
                x: 20
              }}
              animate={{
                opacity: 1,
                y: 0,
                x: 0
              }}
              exit={{
                opacity: 0,
                y: -20,
                x: 20
              }}
              className="fixed top-6 right-6 z-[100] flex items-center gap-3 bg-emerald-950 text-white px-5 py-4 rounded-2xl shadow-2xl border border-emerald-800"
            >
              <div className="p-1.5 rounded-full bg-emerald-500/20">
                <CheckCircle2
                  size={17}
                  className="text-emerald-400"
                />
              </div>

              <span className="text-xs font-bold">
                Payment parameters updated successfully
              </span>
            </motion.div>
          )}
        </AnimatePresence>

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

          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />

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

          <div className="space-y-2.5 z-10">

            <div className="flex flex-wrap items-center gap-2.5">

              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm backdrop-blur-md">

                <Zap
                  size={12}
                  className="text-emerald-400"
                />

                Financial Management Directory

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

              Payment & Commissions

              <Sparkles className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            </h1>

            <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl font-medium">
              Configure settlement policies, platform fees, taxes, and payment processing rules.
            </p>

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
              type="button"
              onClick={() => window.location.reload()}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white shadow-inner"
              title="Refresh"
            >
              <RefreshCw
                size={15}
                className="text-emerald-300"
              />
            </motion.button>

          </div>

        </motion.header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

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
              duration: 0.4
            }}
            whileHover={{
              y: -6
            }}
            className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden group"
          >

            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600 group-hover:h-2 transition-all" />

            <div className="flex items-center justify-between mb-5">

              <span className="text-[11px] font-semibold text-black uppercase tracking-wider">
                Platform Commission
              </span>

              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
                <Percent size={18} />
              </div>

            </div>

            <h3 className="text-3xl font-semibold text-black tracking-tight font-mono">
              {platformCommission}%
            </h3>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">

              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Default Rate
              </span>

              <span className="text-[10px] text-black font-semibold">
                Vendor Fees
              </span>

            </div>

          </motion.div>

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
              duration: 0.4,
              delay: 0.1
            }}
            whileHover={{
              y: -6
            }}
            className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden group"
          >

            <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-600 group-hover:h-2 transition-all" />

            <div className="flex items-center justify-between mb-5">

              <span className="text-[11px] font-semibold text-black uppercase tracking-wider">
                Transaction Fee
              </span>

              <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700">
                <DollarSign size={18} />
              </div>

            </div>

            <h3 className="text-3xl font-semibold text-black tracking-tight font-mono">
              ₹{fixedFee}
            </h3>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">

              <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Fixed
              </span>

              <span className="text-[10px] text-black font-semibold">
                Per Transaction
              </span>

            </div>

          </motion.div>

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
              duration: 0.4,
              delay: 0.2
            }}
            whileHover={{
              y: -6
            }}
            className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden group"
          >

            <div className="absolute top-0 left-0 right-0 h-1.5 bg-green-700 group-hover:h-2 transition-all" />

            <div className="flex items-center justify-between mb-5">

              <span className="text-[11px] font-semibold text-black uppercase tracking-wider">
                Operational Tax
              </span>

              <div className="p-2.5 rounded-2xl bg-green-50 text-green-700">
                <TrendingUp size={18} />
              </div>

            </div>

            <h3 className="text-3xl font-semibold text-black tracking-tight font-mono">
              {gstPercentage}%
            </h3>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">

              <span className="text-[11px] text-green-700 font-semibold bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                GST
              </span>

              <span className="text-[10px] text-black font-semibold">
                Tax Rate
              </span>

            </div>

          </motion.div>

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
              duration: 0.4,
              delay: 0.3
            }}
            whileHover={{
              y: -6
            }}
            className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden group"
          >

            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500 group-hover:h-2 transition-all" />

            <div className="flex items-center justify-between mb-5">

              <span className="text-[11px] font-semibold text-black uppercase tracking-wider">
                Payout Threshold
              </span>

              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
                <Wallet size={18} />
              </div>

            </div>

            <h3 className="text-3xl font-semibold text-black tracking-tight font-mono">
              ₹{payoutLimit.toLocaleString('en-IN')}
            </h3>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">

              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Minimum
              </span>

              <span className="text-[10px] text-black font-semibold">
                Vendor Payout
              </span>

            </div>

          </motion.div>

        </section>

        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8"
        >

          <div className="lg:col-span-2 space-y-6">

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
                delay: 0.3
              }}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
            >

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">

                <div className="flex items-center gap-3">

                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                    <Percent size={18} />
                  </div>

                  <div>

                    <h2 className="text-lg font-semibold text-black tracking-tight">
                      Commission Configuration
                    </h2>

                    <p className="text-xs font-semibold text-black">
                      Configure platform fees and transaction charges
                    </p>

                  </div>

                </div>

                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  <ShieldCheck size={12} />
                  SECURED
                </span>

              </div>

              <div className="space-y-5">

                <div className="flex justify-between items-center">

                  <div>

                    <label className="text-[11px] font-bold text-black uppercase tracking-wider">
                      Default Platform Commission
                    </label>

                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      Applied to vendor earnings on completed orders
                    </p>

                  </div>

                  <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-mono">
                    {platformCommission}%
                  </span>

                </div>

                <input
                  type="range"
                  min="0"
                  max="40"
                  value={platformCommission}
                  onChange={(e) =>
                    setPlatformCommission(
                      Number(e.target.value)
                    )
                  }
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />

                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                  <span>0%</span>
                  <span>10%</span>
                  <span>20%</span>
                  <span>30%</span>
                  <span>40%</span>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7 pt-6 border-t border-slate-100">

                <div className="space-y-2">

                  <label className="text-[11px] font-bold text-black uppercase tracking-wider flex items-center gap-2">
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
                        setFixedFee(
                          Number(e.target.value)
                        )
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />

                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      INR
                    </span>

                  </div>

                </div>

                <div className="space-y-2">

                  <label className="text-[11px] font-bold text-black uppercase tracking-wider flex items-center gap-2">
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
                      value={gstPercentage}
                      onChange={(e) =>
                        setGstPercentage(
                          Number(e.target.value)
                        )
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />

                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      %
                    </span>

                  </div>

                </div>

              </div>

            </motion.section>

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
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
            >

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">

                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <Building size={18} />
                </div>

                <div>

                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Payout & Settlement Parameters
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Configure vendor payout thresholds and settlement cycles
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="space-y-2">

                  <label className="text-[11px] font-bold text-black uppercase tracking-wider">
                    Minimum Vendor Payout Balance
                  </label>

                  <div className="relative">

                    <input
                      type="number"
                      min="0"
                      value={payoutLimit}
                      onChange={(e) =>
                        setPayoutLimit(
                          Number(e.target.value)
                        )
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />

                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      INR
                    </span>

                  </div>

                  <p className="text-[10px] text-slate-400 font-medium">
                    Minimum balance required before vendor payout.
                  </p>

                </div>

                <div className="space-y-2">

                  <label className="text-[11px] font-bold text-black uppercase tracking-wider">
                    Automated Settlement Cycle
                  </label>

                  <select
                    value={settlementCycle}
                    onChange={(e) =>
                      setSettlementCycle(
                        e.target.value
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  >

                    <option value="weekly">
                      Weekly settlements
                    </option>

                    <option value="biweekly">
                      Bi-weekly settlements
                    </option>

                    <option value="monthly">
                      Monthly settlements
                    </option>

                  </select>

                  <p className="text-[10px] text-slate-400 font-medium">
                    Defines how frequently vendor balances are settled.
                  </p>

                </div>

              </div>

            </motion.section>

          </div>

          <div className="space-y-6">

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
                  <CreditCard size={18} />
                </div>

                <div>

                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Payment Gateways
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Active payment processing channels
                  </p>

                </div>

              </div>

              <div className="space-y-3">

                {activeGateways.map(
                  (gateway, index) => (
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
                        delay:
                          0.1 * index
                      }}
                      className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 hover:bg-white hover:border-emerald-200 transition-all"
                    >

                      <div className="flex items-center gap-3">

                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                            gateway.active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                        >
                          {gateway.name.includes(
                            'Razorpay'
                          ) ? (
                            <CircleDollarSign
                              size={16}
                            />
                          ) : gateway.name.includes(
                              'Stripe'
                            ) ? (
                            <CreditCard
                              size={16}
                            />
                          ) : (
                            <Wallet
                              size={16}
                            />
                          )}
                        </div>

                        <div>

                          <p className="text-xs font-bold text-black">
                            {gateway.name}
                          </p>

                          <p
                            className={`text-[9px] font-bold uppercase mt-0.5 ${
                              gateway.active
                                ? 'text-emerald-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {gateway.active
                              ? 'Active'
                              : 'Offline'}
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={gateway.toggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                          gateway.active
                            ? 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`}
                      >

                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            gateway.active
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />

                      </button>

                    </motion.div>
                  )
                )}

              </div>

            </motion.section>

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
                delay: 0.6
              }}
              className="bg-emerald-50/70 p-5 rounded-3xl border border-emerald-100 flex gap-3"
            >

              <div className="p-2 bg-emerald-100 rounded-xl h-fit">
                <AlertCircle
                  size={16}
                  className="text-emerald-700"
                />
              </div>

              <div>

                <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-1">
                  Financial Policy Notice
                </p>

                <p className="text-[11px] text-emerald-800/80 leading-relaxed font-semibold">
                  Changing system financial metrics immediately adjusts all pending and future transaction balances globally.
                </p>

              </div>

            </motion.div>

            <motion.button
              whileHover={{
                y: -2
              }}
              whileTap={{
                scale: 0.98
              }}
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all duration-300"
            >

              <Save size={16} />

              Save Payment Rules

            </motion.button>

          </div>

        </form>

      </main>
    </div>
  );
}