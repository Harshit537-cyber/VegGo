import React, { useState, useEffect, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import ShopDetailModal from '../Models/ShopDetailModal'
import { motion, AnimatePresence } from 'framer-motion'

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
} from 'lucide-react'

import {
  getPendingVendorKyc,
  getVendorKycDetails,
  approveVendorKyc,
  rejectVendorKyc
} from '../Api/vendorKycService/vendorKycService'

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    if (!value) {
      setDisplayValue('0')
      return
    }

    const strVal = String(value)
    const match = strVal.match(/([₹\d,.]+)\s*(.*)/)

    if (!match) {
      setDisplayValue(strVal)
      return
    }

    const isRupee = strVal.startsWith('₹')
    const rawNumberStr = match[1].replace(/[₹,]/g, '')
    const targetNum = parseFloat(rawNumberStr)
    const suffix = match[2] || ''
    const isDecimal = rawNumberStr.includes('.')
    const hasComma = match[1].includes(',')

    if (isNaN(targetNum)) {
      setDisplayValue(strVal)
      return
    }

    const duration = 1000
    const startTime = performance.now()
    let animationFrameId

    const updateCount = (timestamp) => {
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      const easeProgress =
        progress === 1
          ? 1
          : 1 - Math.pow(2, -10 * progress)

      const currentVal = easeProgress * targetNum

      let formatted

      if (isDecimal) {
        formatted = currentVal.toFixed(2)
      } else {
        formatted = Math.floor(currentVal).toString()
      }

      if (hasComma) {
        const parts = formatted.split('.')
        parts[0] = parseInt(
          parts[0],
          10
        ).toLocaleString('en-IN')
        formatted = parts.join('.')
      }

      setDisplayValue(
        `${isRupee ? '₹' : ''}${formatted}${
          suffix ? ' ' + suffix : ''
        }`
      )

      if (progress < 1) {
        animationFrameId =
          requestAnimationFrame(updateCount)
      } else {
        setDisplayValue(strVal)
      }
    }

    animationFrameId =
      requestAnimationFrame(updateCount)

    return () =>
      cancelAnimationFrame(animationFrameId)
  }, [value])

  return <span>{displayValue}</span>
}

const getValue = (obj, keys, fallback = '-') => {
  for (const key of keys) {
    const value = key
      .split('.')
      .reduce((acc, part) => acc?.[part], obj)

    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      return value
    }
  }

  return fallback
}

const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const normalizeVendor = (item) => {
  const shopId = getValue(
    item,
    [
      'shopId',
      'vendorShopId',
      'id',
      'vendorId'
    ],
    ''
  )

  const shopName = getValue(
    item,
    [
      'shopName',
      'storeName',
      'businessName',
      'name',
      'vendorName'
    ]
  )

  const ownerName = getValue(
    item,
    [
      'ownerName',
      'vendorName',
      'fullName',
      'owner',
      'userName',
      'username'
    ]
  )

  const category = getValue(
    item,
    [
      'categoryName',
      'category',
      'businessCategory',
      'shopCategory'
    ]
  )

  const createdAt = getValue(
    item,
    [
      'createdAt',
      'appliedAt',
      'submittedAt',
      'applicationDate',
      'date'
    ],
    null
  )

  const status = getValue(
    item,
    [
      'status',
      'kycStatus',
      'applicationStatus'
    ],
    'PENDING'
  )

  return {
    ...item,
    id: String(shopId),
    shopId,
    name: shopName,
    owner: ownerName,
    category,
    date: formatDate(createdAt),
    status:
      String(status).toUpperCase() === 'PENDING'
        ? 'Pending'
        : status
  }
}

const extractList = (response) => {
  const possibleLists = [
    response?.data?.content,
    response?.data?.items,
    response?.data?.vendors,
    response?.data?.shops,
    response?.data?.applications,
    response?.content,
    response?.items,
    response?.vendors,
    response?.shops,
    response?.applications,
    response?.data
  ]

  for (const list of possibleLists) {
    if (Array.isArray(list)) {
      return list
    }
  }

  return []
}

export default function ShopApproval() {
  const [currentTab, setCurrentTab] =
    useState('shop-approval')

  const [searchQuery, setSearchQuery] =
    useState('')

  const [isRefreshing, setIsRefreshing] =
    useState(false)

  const [refreshKey, setRefreshKey] =
    useState(0)

  const [selectedApplication, setSelectedApplication] =
    useState(null)

  const [applications, setApplications] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  const [actionLoading, setActionLoading] =
    useState(null)

  const [error, setError] =
    useState('')

  const [approvedToday, setApprovedToday] =
    useState(0)

  const [rejectedToday, setRejectedToday] =
    useState(0)

  const fetchPendingVendors = async () => {
    try {
      setLoading(true)
      setError('')

      const response =
        await getPendingVendorKyc({
          page: 0,
          size: 20
        })

      const vendors = extractList(response)

      const normalizedVendors =
        vendors.map(normalizeVendor)

      setApplications(normalizedVendors)
    } catch (error) {
      console.error(
        'Vendor KYC Pending List Error:',
        error
      )

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Unable to load pending vendor applications.'
      )

      setApplications([])
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPendingVendors()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setRefreshKey((prev) => prev + 1)
    await fetchPendingVendors()
  }

  const handleView = async (application) => {
    const shopId =
      application?.shopId ||
      application?.id ||
      application?.vendorShopId

    if (!shopId) {
      return
    }

    try {
      setActionLoading(`view-${shopId}`)

      const response =
        await getVendorKycDetails(shopId)

      const details =
        response?.data ||
        response?.vendor ||
        response?.shop ||
        response

      setSelectedApplication({
        ...application,
        ...details,
        id:
          details?.shopId ||
          details?.vendorShopId ||
          details?.id ||
          application.id,
        shopId:
          details?.shopId ||
          details?.vendorShopId ||
          details?.id ||
          application.shopId
      })
    } catch (error) {
      console.error(
        'Vendor KYC Detail Error:',
        error
      )

      window.alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Unable to load vendor KYC details.'
      )
    } finally {
      setActionLoading(null)
    }
  }

  const handleApprove = async (application) => {
    const shopId =
      application?.shopId ||
      application?.id ||
      application?.vendorShopId

    if (!shopId) {
      return
    }

    const confirmed = window.confirm(
      `Approve ${application.name || 'this vendor shop'}?`
    )

    if (!confirmed) {
      return
    }

    try {
      setActionLoading(`approve-${shopId}`)
      setError('')

      await approveVendorKyc(shopId)

      setApprovedToday((prev) => prev + 1)

      setApplications((prev) =>
        prev.filter(
          (item) =>
            String(item.shopId || item.id) !==
            String(shopId)
        )
      )

      if (
        String(
          selectedApplication?.shopId ||
            selectedApplication?.id
        ) === String(shopId)
      ) {
        setSelectedApplication(null)
      }
    } catch (error) {
      console.error(
        'Vendor KYC Approve Error:',
        error
      )

      window.alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Unable to approve vendor KYC.'
      )
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (application) => {
    const shopId =
      application?.shopId ||
      application?.id ||
      application?.vendorShopId

    if (!shopId) {
      return
    }

    const reason = window.prompt(
      'Enter rejection reason:',
      'Document unclear'
    )

    if (reason === null) {
      return
    }

    const trimmedReason = reason.trim()

    if (!trimmedReason) {
      window.alert(
        'Rejection reason is required.'
      )
      return
    }

    try {
      setActionLoading(`reject-${shopId}`)
      setError('')

      await rejectVendorKyc(
        shopId,
        trimmedReason
      )

      setRejectedToday((prev) => prev + 1)

      setApplications((prev) =>
        prev.filter(
          (item) =>
            String(item.shopId || item.id) !==
            String(shopId)
        )
      )

      if (
        String(
          selectedApplication?.shopId ||
            selectedApplication?.id
        ) === String(shopId)
      ) {
        setSelectedApplication(null)
      }
    } catch (error) {
      console.error(
        'Vendor KYC Reject Error:',
        error
      )

      window.alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Unable to reject vendor KYC.'
      )
    } finally {
      setActionLoading(null)
    }
  }

  const filteredApplications = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase()

    if (!query) {
      return applications
    }

    return applications.filter(
      (application) =>
        String(application.name || '')
          .toLowerCase()
          .includes(query) ||
        String(application.owner || '')
          .toLowerCase()
          .includes(query) ||
        String(application.id || '')
          .toLowerCase()
          .includes(query) ||
        String(application.category || '')
          .toLowerCase()
          .includes(query)
    )
  }, [applications, searchQuery])

  const approvalStats = [
    {
      label: 'Pending Applications',
      value: `${applications.length}`,
      change: '',
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
      value: `${approvedToday}`,
      change: '',
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
      value: `${rejectedToday}`,
      change: '',
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
      value:
        applications.length > 0
          ? 'Pending'
          : '0%',
      change: '',
      up: true,
      accentColor: 'bg-green-700',
      iconBg:
        'bg-green-50 text-green-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Check
    }
  ]

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
              <span>
                {new Date().toLocaleDateString(
                  'en-IN',
                  {
                    day: '2-digit',
                    month: 'short',
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
              disabled={isRefreshing || loading}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner group/btn disabled:opacity-60"
              title="Refresh Data"
            >
              <RefreshCw
                size={15}
                className={`text-emerald-300 transition-transform duration-700 ${
                  isRefreshing || loading
                    ? 'animate-spin'
                    : 'group-hover/btn:rotate-45'
                }`}
              />
            </motion.button>
          </div>
        </motion.header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {approvalStats.map((stat, idx) => {
            const IconComponent = stat.icon

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
                  {stat.change ? (
                    <span
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-transform duration-300 group-hover:scale-105 ${stat.tagColor}`}
                    >
                      {stat.up ? (
                        <ArrowUpRight
                          size={13}
                          className="text-emerald-600"
                        />
                      ) : (
                        <ArrowDownRight
                          size={13}
                          className="text-rose-600"
                        />
                      )}
                      {stat.change}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-semibold">
                      Live API Data
                    </span>
                  )}

                  <span className="text-[11px] text-black font-semibold">
                    Current Period
                  </span>
                </div>
              </motion.div>
            )
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
                        setSearchQuery(
                          e.target.value
                        )
                      }
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

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
                    {loading ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="py-12 text-center text-slate-400 text-xs"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw
                              size={15}
                              className="animate-spin text-emerald-600"
                            />
                            Loading pending applications...
                          </div>
                        </td>
                      </tr>
                    ) : filteredApplications.length > 0 ? (
                      filteredApplications.map(
                        (application, idx) => {
                          const shopId =
                            application.shopId ||
                            application.id

                          return (
                            <motion.tr
                              key={shopId}
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
                              <td className="py-3.5 px-4 font-mono text-black font-semibold group-hover:text-emerald-700 transition-colors">
                                {application.id}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-black group-hover:text-emerald-700 transition-all duration-200">
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
                                      handleView(
                                        application
                                      )
                                    }
                                    disabled={
                                      actionLoading ===
                                      `view-${shopId}`
                                    }
                                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="View Info"
                                  >
                                    {actionLoading ===
                                    `view-${shopId}` ? (
                                      <RefreshCw
                                        size={15}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Eye
                                        size={15}
                                      />
                                    )}
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleApprove(
                                        application
                                      )
                                    }
                                    disabled={
                                      actionLoading ===
                                      `approve-${shopId}`
                                    }
                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Approve Shop"
                                  >
                                    {actionLoading ===
                                    `approve-${shopId}` ? (
                                      <RefreshCw
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Check
                                        size={16}
                                      />
                                    )}
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleReject(
                                        application
                                      )
                                    }
                                    disabled={
                                      actionLoading ===
                                      `reject-${shopId}`
                                    }
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Reject Shop"
                                  >
                                    {actionLoading ===
                                    `reject-${shopId}` ? (
                                      <RefreshCw
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <X
                                        size={16}
                                      />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          )
                        }
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="py-12 text-center text-slate-400 text-xs"
                        >
                          {searchQuery
                            ? 'No matching shop applications found.'
                            : 'No pending applications remaining.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {loading ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw
                        size={15}
                        className="animate-spin text-emerald-600"
                      />
                      Loading pending applications...
                    </div>
                  </div>
                ) : filteredApplications.length > 0 ? (
                  filteredApplications.map(
                    (application) => {
                      const shopId =
                        application.shopId ||
                        application.id

                      return (
                        <motion.div
                          key={shopId}
                          whileHover={{
                            scale: 1.01
                          }}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group"
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
                                handleView(
                                  application
                                )
                              }
                              disabled={
                                actionLoading ===
                                `view-${shopId}`
                              }
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                              title="View Info"
                            >
                              {actionLoading ===
                              `view-${shopId}` ? (
                                <RefreshCw
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <Eye size={15} />
                              )}
                            </button>

                            <button
                              onClick={() =>
                                handleApprove(
                                  application
                                )
                              }
                              disabled={
                                actionLoading ===
                                `approve-${shopId}`
                              }
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve Shop"
                            >
                              {actionLoading ===
                              `approve-${shopId}` ? (
                                <RefreshCw
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Check size={16} />
                              )}
                            </button>

                            <button
                              onClick={() =>
                                handleReject(
                                  application
                                )
                              }
                              disabled={
                                actionLoading ===
                                `reject-${shopId}`
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject Shop"
                            >
                              {actionLoading ===
                              `reject-${shopId}` ? (
                                <RefreshCw
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <X size={16} />
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )
                    }
                  )
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    {searchQuery
                      ? 'No matching shop applications found.'
                      : 'No pending applications remaining.'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </section>
      </main>

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
  )
}