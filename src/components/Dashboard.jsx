import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import { getAdminDashboard } from '../Api/dashboardService/dashboardService'
import { motion } from 'framer-motion'
import {
  Calendar,
  RefreshCw,
  Users,
  Activity,
  ShieldCheck,
  Server,
  CheckCircle2,
  AlertCircle,
  UserRound,
  Database,
  CircleCheck,
  Clock3
} from 'lucide-react'

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      setDisplayValue('')
      return
    }

    const targetNum = Number(value)

    if (Number.isNaN(targetNum)) {
      setDisplayValue(String(value))
      return
    }

    const duration = 900
    const startTime = performance.now()
    let animationFrameId

    const updateCount = (timestamp) => {
      const elapsed = timestamp - startTime
      const progress = Math.min(
        elapsed / duration,
        1
      )

      const easeProgress =
        progress === 1
          ? 1
          : 1 - Math.pow(2, -10 * progress)

      const currentValue = Math.floor(
        easeProgress * targetNum
      )

      setDisplayValue(
        currentValue.toLocaleString('en-IN')
      )

      if (progress < 1) {
        animationFrameId =
          requestAnimationFrame(updateCount)
      } else {
        setDisplayValue(
          targetNum.toLocaleString('en-IN')
        )
      }
    }

    animationFrameId =
      requestAnimationFrame(updateCount)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [value])

  return <span>{displayValue}</span>
}

const formatDisplayText = (value) => {
  if (!value) return 'N/A'

  return String(value)
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    )
}

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Unable to load dashboard data.'
  )
}

export default function Dashboard() {
  const [currentTab, setCurrentTab] =
    useState('dashboard')

  const [dashboardData, setDashboardData] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [isRefreshing, setIsRefreshing] =
    useState(false)

  const [error, setError] =
    useState('')

  const fetchDashboardData = async () => {
    setIsRefreshing(true)
    setError('')

    try {
      const response =
        await getAdminDashboard()

      if (response?.success) {
        setDashboardData(
          response?.data || null
        )
      } else {
        setDashboardData(null)
        setError(
          response?.message ||
            'Failed to load dashboard data.'
        )
      }
    } catch (err) {
      setDashboardData(null)
      setError(
        getErrorMessage(err)
      )
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const totalCustomers =
    dashboardData?.totalCustomers ?? 0

  const totalUsers =
    dashboardData?.totalUsers ?? 0

  const systemStatus =
    dashboardData?.systemStatus || ''

  const environment =
    dashboardData?.environment || ''

  const isHealthy =
    systemStatus.toLowerCase() ===
    'healthy'

  const stats = [
    {
      label: 'Total Customers',
      value: totalCustomers,
      description:
        'Registered customers on platform',
      icon: Users,
      iconBg:
        'bg-emerald-50 text-emerald-700',
      accent:
        'bg-emerald-600'
    },
    {
      label: 'Total Users',
      value: totalUsers,
      description:
        'Total users registered in system',
      icon: UserRound,
      iconBg:
        'bg-teal-50 text-teal-700',
      accent:
        'bg-teal-600'
    },
    {
      label: 'System Status',
      value: formatDisplayText(
        systemStatus
      ),
      description:
        'Current platform health status',
      icon: ShieldCheck,
      iconBg:
        isHealthy
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-rose-50 text-rose-700',
      accent:
        isHealthy
          ? 'bg-emerald-500'
          : 'bg-rose-500'
    },
    {
      label: 'Environment',
      value: formatDisplayText(
        environment
      ),
      description:
        'Current deployment environment',
      icon: Server,
      iconBg:
        'bg-green-50 text-green-700',
      accent:
        'bg-green-700'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">

      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">

        <div className="space-y-6 sm:space-y-7">

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
            className="relative overflow-hidden rounded-3xl bg-emerald-950 text-white p-5 sm:p-7 lg:p-8 shadow-xl shadow-emerald-950/20 border border-emerald-900"
          >

            <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">

              <div className="space-y-3">

                <div className="flex flex-wrap items-center gap-2">

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/90 border border-emerald-800 text-emerald-300 text-[10px] font-bold tracking-widest uppercase">
                    <Activity size={11} />
                    Operations Center
                  </span>

                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-900 text-white text-[10px] font-bold tracking-widest uppercase">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 animate-ping opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                    </span>

                    LIVE ADMIN VEG GO
                  </span>

                </div>

                <div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
                    Platform Dashboard
                  </h1>

                  <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-emerald-100/60">
                    Monitor customers, users and
                    platform health from one place.
                  </p>

                </div>

              </div>

              <div className="flex flex-wrap items-center gap-2.5">

                <div className="flex items-center gap-2 bg-emerald-900/70 border border-emerald-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-emerald-100">

                  <Calendar
                    size={14}
                    className="text-emerald-400"
                  />

                  {new Date().toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }
                  )}

                </div>

                <motion.button
                  whileHover={{
                    scale: 1.05
                  }}
                  whileTap={{
                    scale: 0.95
                  }}
                  onClick={
                    fetchDashboardData
                  }
                  disabled={isRefreshing}
                  className="p-2.5 rounded-2xl bg-emerald-900/70 border border-emerald-800 hover:bg-emerald-800 transition-all disabled:opacity-50"
                  title="Refresh Dashboard"
                >
                  <RefreshCw
                    size={15}
                    className={`text-emerald-300 ${
                      isRefreshing
                        ? 'animate-spin'
                        : ''
                    }`}
                  />
                </motion.button>

              </div>

            </div>

          </motion.header>

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5"
            >

              <div className="flex items-start gap-3">

                <div className="p-2 rounded-xl bg-white border border-rose-100">
                  <AlertCircle
                    size={17}
                    className="text-rose-600"
                  />
                </div>

                <div>

                  <p className="text-xs font-bold text-rose-800">
                    Dashboard data unavailable
                  </p>

                  <p className="mt-0.5 text-[11px] font-medium text-rose-600">
                    {error}
                  </p>

                </div>

              </div>

              <button
                onClick={
                  fetchDashboardData
                }
                className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 text-[11px] font-bold hover:bg-rose-100 transition"
              >
                Retry
              </button>

            </motion.div>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">

            {stats.map(
              (stat, index) => {
                const Icon =
                  stat.icon

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
                      delay:
                        index * 0.08
                    }}
                    whileHover={{
                      y: -5
                    }}
                    className="relative overflow-hidden bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 p-5 sm:p-6 group"
                  >

                    <div
                      className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accent}`}
                    />

                    <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-emerald-50 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                    <div className="relative z-10">

                      <div className="flex items-center justify-between gap-3">

                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                          {stat.label}
                        </span>

                        <div
                          className={`p-2.5 rounded-2xl ${stat.iconBg} border border-slate-100`}
                        >
                          <Icon size={18} />
                        </div>

                      </div>

                      <h3 className="mt-6 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">

                        {loading ? (
                          <span className="text-slate-300 animate-pulse">
                            ...
                          </span>
                        ) : (
                          typeof stat.value ===
                          'number' ? (
                            <AnimatedValue
                              value={
                                stat.value
                              }
                            />
                          ) : (
                            stat.value
                          )
                        )}

                      </h3>

                      <div className="mt-5 pt-3.5 border-t border-slate-100">

                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold">
                          {stat.description}
                        </span>

                      </div>

                    </div>

                  </motion.div>
                )
              }
            )}

          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">

            <motion.div
              initial={{
                opacity: 0,
                x: -20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              transition={{
                duration: 0.5
              }}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
            >

              <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100">

                <div className="flex items-center gap-3">

                  <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700">
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      System Health
                    </h2>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Current platform health
                    </p>
                  </div>

                </div>

                {!loading && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold ${
                      isHealthy
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >

                    <span
                      className={`w-2 h-2 rounded-full ${
                        isHealthy
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-rose-500'
                      }`}
                    />

                    {formatDisplayText(
                      systemStatus
                    )}

                  </span>
                )}

              </div>

              <div className="mt-6">

                <div className="flex items-center gap-4">

                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      isHealthy
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isHealthy ? (
                      <CheckCircle2
                        size={30}
                      />
                    ) : (
                      <AlertCircle
                        size={30}
                      />
                    )}
                  </div>

                  <div>

                    <p className="text-base font-bold text-slate-900">

                      {loading
                        ? 'Checking system...'
                        : isHealthy
                          ? 'All systems operational'
                          : 'System requires attention'}

                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Status received from
                      the dashboard API
                    </p>

                  </div>

                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">

                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">

                    <div className="flex items-center gap-2">

                      <CircleCheck
                        size={15}
                        className="text-emerald-600"
                      />

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </span>

                    </div>

                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {loading
                        ? '...'
                        : formatDisplayText(
                            systemStatus
                          )}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">

                    <div className="flex items-center gap-2">

                      <Clock3
                        size={15}
                        className="text-teal-600"
                      />

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Environment
                      </span>

                    </div>

                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {loading
                        ? '...'
                        : formatDisplayText(
                            environment
                          )}
                    </p>

                  </div>

                </div>

              </div>

            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              transition={{
                duration: 0.5
              }}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
            >

              <div className="flex items-center gap-3 pb-5 border-b border-slate-100">

                <div className="p-2.5 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700">
                  <Database size={18} />
                </div>

                <div>

                  <h2 className="text-lg font-semibold text-slate-900">
                    Platform Overview
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    Live statistics from API
                  </p>

                </div>

              </div>

              <div className="mt-6 space-y-4">

                <div className="flex items-center justify-between rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-700 border border-emerald-100">
                      <Users size={18} />
                    </div>

                    <div>

                      <p className="text-xs font-bold text-slate-700">
                        Customers
                      </p>

                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Registered customers
                      </p>

                    </div>

                  </div>

                  <p className="text-xl font-bold text-slate-900">
                    {loading ? (
                      '...'
                    ) : (
                      <AnimatedValue
                        value={
                          totalCustomers
                        }
                      />
                    )}
                  </p>

                </div>

                <div className="flex items-center justify-between rounded-2xl bg-teal-50/70 border border-teal-100 p-4">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-teal-700 border border-teal-100">
                      <UserRound size={18} />
                    </div>

                    <div>

                      <p className="text-xs font-bold text-slate-700">
                        Total Users
                      </p>

                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Platform users
                      </p>

                    </div>

                  </div>

                  <p className="text-xl font-bold text-slate-900">
                    {loading ? (
                      '...'
                    ) : (
                      <AnimatedValue
                        value={
                          totalUsers
                        }
                      />
                    )}
                  </p>

                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-700 border border-slate-100">
                      <Server size={18} />
                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="text-xs font-bold text-slate-700">
                        Deployment Environment
                      </p>

                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Current API environment
                      </p>

                    </div>

                    <span className="shrink-0 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                      {loading
                        ? '...'
                        : formatDisplayText(
                            environment
                          )}
                    </span>

                  </div>

                </div>

              </div>

            </motion.div>

          </section>

          <motion.section
            initial={{
              opacity: 0,
              y: 15
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.5
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center gap-4 shadow-sm">

              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <Users size={20} />
              </div>

              <div className="min-w-0">

                <p className="text-[10px] tracking-wider font-bold text-slate-400 uppercase">
                  Customer Network
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-1">

                  {loading ? (
                    '...'
                  ) : (
                    <AnimatedValue
                      value={
                        totalCustomers
                      }
                    />
                  )}

                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Live customer count
                </p>

              </div>

            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center gap-4 shadow-sm">

              <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
                <Activity size={20} />
              </div>

              <div className="min-w-0">

                <p className="text-[10px] tracking-wider font-bold text-slate-400 uppercase">
                  Platform Users
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-1">

                  {loading ? (
                    '...'
                  ) : (
                    <AnimatedValue
                      value={
                        totalUsers
                      }
                    />
                  )}

                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Live platform user count
                </p>

              </div>

            </div>

          </motion.section>

        </div>

      </main>

    </div>
  )
}