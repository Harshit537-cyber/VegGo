import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Store,
  Power,
  X,
  Save,
  CheckCircle2,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Eye,
  MapPin,
  Star,
  ShoppingBag,
  Clock,
  ShieldCheck
} from 'lucide-react'

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    const stringValue = String(value ?? '')
    const match = stringValue.match(/([\d,.]+)\s*(.*)/)

    if (!match) {
      setDisplayValue(stringValue)
      return
    }

    const rawNumberStr = match[1].replace(/,/g, '')
    const targetNum = parseFloat(rawNumberStr)
    const suffix = match[2] || ''

    if (isNaN(targetNum)) {
      setDisplayValue(stringValue)
      return
    }

    const isDecimal = rawNumberStr.includes('.')
    const hasComma = match[1].includes(',')
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
        parts[0] = parseInt(parts[0], 10).toLocaleString('en-IN')
        formatted = parts.join('.')
      }

      setDisplayValue(
        `${formatted}${suffix ? ` ${suffix}` : ''}`
      )

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount)
      } else {
        setDisplayValue(stringValue)
      }
    }

    animationFrameId = requestAnimationFrame(updateCount)

    return () => cancelAnimationFrame(animationFrameId)
  }, [value])

  return <span>{displayValue}</span>
}

const initialVendors = [
  {
    id: 'VEN-001',
    name: 'Green Valley Farms',
    category: 'Fresh Produce',
    location: 'Dehradun',
    orders: 428,
    rating: 4.8,
    status: 'Active',
    products: 86,
    joined: '12 Jan 2026',
    phone: '+91 98765 42101',
    email: 'greenvalley@example.com',
    description: 'Fresh vegetables and farm produce supplier serving local customers.'
  },
  {
    id: 'VEN-002',
    name: 'Fresh Dairy House',
    category: 'Dairy',
    location: 'Haridwar',
    orders: 356,
    rating: 4.7,
    status: 'Active',
    products: 54,
    joined: '24 Jan 2026',
    phone: '+91 98765 42102',
    email: 'freshdairy@example.com',
    description: 'Daily dairy products including milk, curd, paneer and butter.'
  },
  {
    id: 'VEN-003',
    name: 'Daily Basket Store',
    category: 'Grocery',
    location: 'Rishikesh',
    orders: 291,
    rating: 4.5,
    status: 'Active',
    products: 68,
    joined: '03 Feb 2026',
    phone: '+91 98765 42103',
    email: 'dailybasket@example.com',
    description: 'General grocery vendor providing household and daily-use products.'
  },
  {
    id: 'VEN-004',
    name: 'Organic Harvest',
    category: 'Organic',
    location: 'Dehradun',
    orders: 214,
    rating: 4.6,
    status: 'Pending',
    products: 40,
    joined: '17 Feb 2026',
    phone: '+91 98765 42104',
    email: 'organicharvest@example.com',
    description: 'Organic food and naturally sourced products from verified suppliers.'
  },
  {
    id: 'VEN-005',
    name: 'Nature Fresh Mart',
    category: 'Fresh Produce',
    location: 'Roorkee',
    orders: 187,
    rating: 4.3,
    status: 'Active',
    products: 47,
    joined: '28 Feb 2026',
    phone: '+91 98765 42105',
    email: 'naturefresh@example.com',
    description: 'Fresh fruits, vegetables and seasonal produce vendor.'
  },
  {
    id: 'VEN-006',
    name: 'Premium Grocery Hub',
    category: 'Grocery',
    location: 'Mussoorie',
    orders: 143,
    rating: 4.2,
    status: 'Suspended',
    products: 31,
    joined: '08 Mar 2026',
    phone: '+91 98765 42106',
    email: 'premiumhub@example.com',
    description: 'Premium grocery and packaged food supplier for local customers.'
  },
  {
    id: 'VEN-007',
    name: 'Himalayan Fresh Foods',
    category: 'Fresh Produce',
    location: 'Dehradun',
    orders: 319,
    rating: 4.9,
    status: 'Active',
    products: 73,
    joined: '15 Mar 2026',
    phone: '+91 98765 42107',
    email: 'himalayanfresh@example.com',
    description: 'Regional fresh food vendor focused on quality and fast fulfillment.'
  },
  {
    id: 'VEN-008',
    name: 'Pure Kitchen Essentials',
    category: 'Household',
    location: 'Haridwar',
    orders: 168,
    rating: 4.4,
    status: 'Pending',
    products: 29,
    joined: '22 Mar 2026',
    phone: '+91 98765 42108',
    email: 'purekitchen@example.com',
    description: 'Household essentials and kitchen-use products supplier.'
  }
]

const vendorChartData = [
  { month: 'May', vendors: 182, active: 141 },
  { month: 'Jun', vendors: 194, active: 152 },
  { month: 'Jul', vendors: 207, active: 164 },
  { month: 'Aug', vendors: 221, active: 176 },
  { month: 'Sep', vendors: 235, active: 187 },
  { month: 'Oct', vendors: 248, active: 196 }
]

const vendorDistribution = [
  {
    name: 'Fresh Produce',
    total: 86,
    active: 72,
    share: 35
  },
  {
    name: 'Dairy',
    total: 54,
    active: 43,
    share: 22
  },
  {
    name: 'Grocery',
    total: 68,
    active: 51,
    share: 27
  },
  {
    name: 'Specialty',
    total: 40,
    active: 30,
    share: 16
  }
]

export default function Vendor() {
  const [currentTab, setCurrentTab] = useState('vendors')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [vendors, setVendors] = useState(initialVendors)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState(null)

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    location: '',
    products: 0,
    status: 'Active',
    phone: '',
    email: '',
    description: ''
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  const clearMessages = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const getVendorStatus = (vendor) => {
    return vendor?.status || 'Active'
  }

  const handleRefresh = () => {
    clearMessages()
    setIsRefreshing(true)

    setTimeout(() => {
      setVendors([...initialVendors])
      setRefreshKey((prev) => prev + 1)
      setIsRefreshing(false)
      setSuccessMessage('Vendor data refreshed successfully')

      setTimeout(() => {
        setSuccessMessage('')
      }, 2500)
    }, 700)
  }

  const openAddPanel = () => {
    clearMessages()

    setEditingVendor(null)

    setFormData({
      id: '',
      name: '',
      category: '',
      location: '',
      products: 0,
      status: 'Active',
      phone: '',
      email: '',
      description: ''
    })

    setIsPanelOpen(true)
  }

  const openEditPanel = (vendor) => {
    clearMessages()

    setEditingVendor(vendor.id)

    setFormData({
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
      location: vendor.location,
      products: vendor.products,
      status: vendor.status,
      phone: vendor.phone,
      email: vendor.email,
      description: vendor.description
    })

    setIsPanelOpen(true)
  }

  const handleToggleStatus = (vendor) => {
    clearMessages()

    const newStatus =
      vendor.status === 'Active'
        ? 'Suspended'
        : 'Active'

    setVendors((prev) =>
      prev.map((item) =>
        item.id === vendor.id
          ? {
            ...item,
            status: newStatus
          }
          : item
      )
    )

    setSuccessMessage(
      newStatus === 'Active'
        ? 'Vendor activated successfully'
        : 'Vendor suspended successfully'
    )
  }

  const handleDelete = (vendor) => {
    clearMessages()

    if (vendor.status === 'Suspended') {
      setErrorMessage('Vendor is already suspended')
      return
    }

    setVendors((prev) =>
      prev.map((item) =>
        item.id === vendor.id
          ? {
            ...item,
            status: 'Suspended'
          }
          : item
      )
    )

    setSuccessMessage('Vendor suspended successfully')
  }

  const handleSave = (e) => {
    e.preventDefault()

    clearMessages()
    setSaving(true)

    setTimeout(() => {
      if (editingVendor) {
        setVendors((prev) =>
          prev.map((vendor) =>
            vendor.id === editingVendor
              ? {
                ...vendor,
                name: formData.name.trim(),
                category: formData.category.trim(),
                location: formData.location.trim(),
                products: Number(formData.products) || 0,
                status: formData.status,
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                description: formData.description.trim()
              }
              : vendor
          )
        )

        setSuccessMessage('Vendor updated successfully')
      } else {
        const newVendor = {
          id: `VEN-${String(vendors.length + 1).padStart(3, '0')}`,
          name: formData.name.trim(),
          category: formData.category.trim(),
          location: formData.location.trim(),
          products: Number(formData.products) || 0,
          orders: 0,
          rating: 0,
          status: formData.status,
          joined: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          description: formData.description.trim()
        }

        setVendors((prev) => [newVendor, ...prev])
        setSuccessMessage('Vendor created successfully')
      }

      setIsPanelOpen(false)
      setEditingVendor(null)
      setSaving(false)
    }, 700)
  }

  const filteredVendors = vendors.filter((vendor) => {
    const query = searchQuery.toLowerCase()

    const matchesSearch =
      vendor.name.toLowerCase().includes(query) ||
      vendor.id.toLowerCase().includes(query) ||
      vendor.category.toLowerCase().includes(query) ||
      vendor.location.toLowerCase().includes(query)

    const matchesStatus =
      statusFilter === 'All' ||
      vendor.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalVendors = vendors.length

  const activeVendors = vendors.filter(
    (vendor) => vendor.status === 'Active'
  ).length

  const pendingVendors = vendors.filter(
    (vendor) => vendor.status === 'Pending'
  ).length

  const suspendedVendors = vendors.filter(
    (vendor) => vendor.status === 'Suspended'
  ).length

  const totalProducts = vendors.reduce(
    (total, vendor) =>
      total + Number(vendor.products || 0),
    0
  )

  const totalOrders = vendors.reduce(
    (total, vendor) =>
      total + Number(vendor.orders || 0),
    0
  )

  const averageRating =
    vendors.length > 0
      ? (
        vendors.reduce(
          (total, vendor) =>
            total + Number(vendor.rating || 0),
          0
        ) / vendors.length
      ).toFixed(1)
      : '0.0'

  const vendorStats = [
    {
      label: 'Total Vendors',
      value: `${totalVendors}`,
      change: '+12.8%',
      up: true,
      accentColor: 'bg-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Users,
      suffix: ' Vendors'
    },
    {
      label: 'Active Vendors',
      value: `${activeVendors}`,
      change: '+8.4%',
      up: true,
      accentColor: 'bg-teal-600',
      iconBg: 'bg-teal-50 text-teal-700',
      tagColor:
        'text-teal-700 bg-teal-50/80 border-teal-200/80',
      icon: CheckCircle2,
      suffix: ' Active'
    },
    {
      label: 'Pending Verification',
      value: `${pendingVendors}`,
      change: '-5.2%',
      up: false,
      accentColor: 'bg-amber-500',
      iconBg: 'bg-amber-50 text-amber-700',
      tagColor:
        'text-amber-700 bg-amber-50/80 border-amber-200/80',
      icon: Clock,
      suffix: ' Pending'
    },
    {
      label: 'Suspended Vendors',
      value: `${suspendedVendors}`,
      change: '-2.8%',
      up: false,
      accentColor: 'bg-rose-500',
      iconBg: 'bg-rose-50 text-rose-700',
      tagColor:
        'text-rose-700 bg-rose-50/80 border-rose-200/80',
      icon: ShieldCheck,
      suffix: ' Suspended'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-18 sm:pt-20 lg:pt-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: 'easeOut'
          }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm backdrop-blur-md">
                <Zap
                  size={12}
                  className="text-emerald-400 animate-bounce"
                />
                Vendor Management Report
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
              Vendor Report

              <Sparkles className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </h1>

            <p className="text-xs text-emerald-200/80 font-medium">
              Dummy vendor performance and management overview
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center z-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAddPanel}
              className="px-4 py-2.5 bg-emerald-500/20 border border-emerald-700 rounded-2xl hover:bg-emerald-500/30 transition-all text-xs font-semibold text-emerald-100 flex items-center gap-2"
            >
              <Plus size={15} />
              New Vendor
            </motion.button>

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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white shadow-inner group/btn disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw
                size={15}
                className={`text-emerald-300 transition-transform duration-700 ${isRefreshing
                  ? 'rotate-180 animate-spin'
                  : 'group-hover/btn:rotate-45'
                  }`}
              />
            </motion.button>
          </div>
        </motion.header>

        <AnimatePresence>
          {(errorMessage || successMessage) && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -10
              }}
              className={`px-5 py-3.5 rounded-2xl border text-xs font-semibold ${errorMessage
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
            >
              {errorMessage || successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {vendorStats.map((stat, idx) => {
            const IconComponent = stat.icon

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
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accentColor} transition-all duration-300 group-hover:h-2`}
                />

                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:scale-125" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-black uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
                      {stat.label}
                    </span>

                    <motion.div
                      whileHover={{
                        rotate: 12,
                        scale: 1.1
                      }}
                      className={`${stat.iconBg} p-2.5 rounded-2xl shadow-xs`}
                    >
                      <IconComponent size={18} />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-semibold text-black tracking-tight font-mono group-hover:text-emerald-800 transition-colors">
                    {loading ? (
                      <span className="text-slate-300">
                        ...
                      </span>
                    ) : (
                      <>
                        <AnimatedValue value={stat.value} />

                        <span className="text-base ml-1 font-sans">
                          {stat.suffix}
                        </span>
                      </>
                    )}
                  </h3>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between relative z-10">
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${stat.tagColor}`}
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

                  <span className="text-[11px] text-black font-semibold">
                    Monthly Period
                  </span>
                </div>
              </motion.div>
            )
          })}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
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
              duration: 0.5
            }}
            className="xl:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-black">
                  Vendor Growth Overview
                </h2>

                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Monthly vendor registration and active vendor trend
                </p>
              </div>

              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                <Users size={18} />
              </div>
            </div>

            <div className="h-64 flex items-end gap-3 sm:gap-5 border-b border-slate-100 pb-4">
              {vendorChartData.map((item, index) => {
                const maxValue = 260
                const vendorHeight =
                  (item.vendors / maxValue) * 100
                const activeHeight =
                  (item.active / maxValue) * 100

                return (
                  <div
                    key={item.month}
                    className="flex-1 h-full flex flex-col justify-end items-center gap-2"
                  >
                    <div className="w-full h-full flex items-end justify-center gap-1">
                      <motion.div
                        initial={{
                          height: 0
                        }}
                        animate={{
                          height: `${vendorHeight}%`
                        }}
                        transition={{
                          duration: 0.8,
                          delay: index * 0.08
                        }}
                        className="w-1/2 max-w-8 bg-emerald-200 rounded-t-lg"
                        title={`${item.vendors} vendors`}
                      />

                      <motion.div
                        initial={{
                          height: 0
                        }}
                        animate={{
                          height: `${activeHeight}%`
                        }}
                        transition={{
                          duration: 0.8,
                          delay: index * 0.08 + 0.1
                        }}
                        className="w-1/2 max-w-8 bg-emerald-600 rounded-t-lg"
                        title={`${item.active} active`}
                      />
                    </div>

                    <span className="text-[10px] font-semibold text-slate-500">
                      {item.month}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-center gap-5 mt-5">
              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                <span className="w-3 h-3 rounded bg-emerald-200" />
                Total Vendors
              </div>

              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                <span className="w-3 h-3 rounded bg-emerald-600" />
                Active Vendors
              </div>
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
              duration: 0.5,
              delay: 0.1
            }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-black">
                  Vendor Distribution
                </h2>

                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Category-wise vendor presence
                </p>
              </div>

              <div className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl">
                <Store size={18} />
              </div>
            </div>

            <div className="space-y-4">
              {vendorDistribution.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-black">
                      {item.name}
                    </span>

                    <span className="text-[10px] font-mono font-bold text-emerald-700">
                      {item.share}%
                    </span>
                  </div>

                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{
                        width: 0
                      }}
                      animate={{
                        width: `${item.share}%`
                      }}
                      transition={{
                        duration: 0.8
                      }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>

                  <div className="flex justify-between mt-1.5">
                    <span className="text-[9px] text-slate-400 font-semibold">
                      {item.total} total
                    </span>

                    <span className="text-[9px] text-emerald-700 font-semibold">
                      {item.active} active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  Vendor Growth
                </p>

                <h3 className="text-2xl font-bold text-black mt-2">
                  +12.8%
                </h3>

                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  Compared to previous period
                </p>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                <ArrowUpRight size={19} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  Average Vendor Rating
                </p>

                <h3 className="text-2xl font-bold text-black mt-2 flex items-center gap-2">
                  {averageRating}
                  <Star
                    size={18}
                    className="text-amber-500 fill-amber-500"
                  />
                </h3>

                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  Based on vendor performance
                </p>
              </div>

              <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
                <Star size={19} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  Total Vendor Orders
                </p>

                <h3 className="text-2xl font-bold text-black mt-2">
                  {totalOrders.toLocaleString('en-IN')}
                </h3>

                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  Orders fulfilled by vendors
                </p>
              </div>

              <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">
                <ShoppingBag size={19} />
              </div>
            </div>
          </div>
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
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <Store size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Vendor Records
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Vendor management and performance directory
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 sm:w-64">
                  <Search
                    className="absolute left-3 top-2.5 text-slate-400"
                    size={15}
                  />

                  <input
                    type="text"
                    placeholder="Search vendors..."
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
                    'Active',
                    'Pending',
                    'Suspended'
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        setStatusFilter(status)
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${statusFilter === status
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
                      Vendor
                    </th>

                    <th className="py-3.5 px-4">
                      Category
                    </th>

                    <th className="py-3.5 px-4">
                      Location
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Orders
                    </th>

                    <th className="py-3.5 px-4 text-center">
                      Rating
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
                        className="py-12 text-center text-xs font-semibold text-slate-400"
                      >
                        Loading vendors...
                      </td>
                    </tr>
                  ) : filteredVendors.length > 0 ? (
                    filteredVendors.map(
                      (vendor, idx) => (
                        <motion.tr
                          key={vendor.id}
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
                          className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:border-emerald-300 transition-colors">
                                <Store
                                  size={17}
                                  className="text-emerald-600"
                                />
                              </div>

                              <div className="flex flex-col">
                                <span className="font-semibold text-black group-hover:text-emerald-700 transition-colors">
                                  {vendor.name}
                                </span>

                                <span className="text-[10px] text-slate-500 font-mono">
                                  {vendor.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600 font-semibold">
                              {vendor.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold">
                              <MapPin
                                size={12}
                                className="text-emerald-600"
                              />
                              {vendor.location}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1.5 font-mono text-emerald-700 font-semibold">
                              <ShoppingBag size={13} />
                              {vendor.orders}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 font-mono font-semibold text-black">
                              {vendor.rating}
                              <Star
                                size={12}
                                className="text-amber-500 fill-amber-500"
                              />
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${vendor.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                : vendor.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                                  : 'bg-rose-50 text-rose-700 border-rose-200/80'
                                }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${vendor.status === 'Active'
                                  ? 'bg-emerald-500'
                                  : vendor.status === 'Pending'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                  }`}
                              />

                              {vendor.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  setSelectedVendor(
                                    vendor
                                  )
                                }
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="View Vendor"
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                onClick={() =>
                                  handleToggleStatus(
                                    vendor
                                  )
                                }
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title={
                                  vendor.status ===
                                    'Active'
                                    ? 'Suspend'
                                    : 'Activate'
                                }
                              >
                                <Power size={15} />
                              </button>

                              <button
                                onClick={() =>
                                  openEditPanel(
                                    vendor
                                  )
                                }
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit3 size={15} />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    vendor
                                  )
                                }
                                disabled={
                                  vendor.status ===
                                  'Suspended'
                                }
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-40"
                                title="Suspend Vendor"
                              >
                                <Trash2 size={15} />
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
                        className="py-12 text-center"
                      >
                        <Store
                          size={35}
                          className="mx-auto text-slate-300 mb-3"
                        />

                        <p className="text-xs font-semibold text-slate-400">
                          No matching vendor records found.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {loading ? (
                <div className="py-10 text-center text-xs font-semibold text-slate-400">
                  Loading vendors...
                </div>
              ) : filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <motion.div
                    key={vendor.id}
                    whileHover={{
                      scale: 1.01
                    }}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                          <Store size={16} />
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700">
                            {vendor.name}
                          </h4>

                          <p className="text-[10px] font-mono text-slate-400">
                            {vendor.id}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${vendor.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : vendor.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${vendor.status === 'Active'
                            ? 'bg-emerald-500'
                            : vendor.status === 'Pending'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                            }`}
                        />

                        {vendor.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      {vendor.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">
                          Category
                        </span>

                        <span className="font-semibold text-black">
                          {vendor.category}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">
                          Location
                        </span>

                        <span className="font-semibold text-black">
                          {vendor.location}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">
                          Orders
                        </span>

                        <span className="font-mono font-semibold text-emerald-700">
                          {vendor.orders}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">
                          Rating
                        </span>

                        <span className="font-mono font-semibold text-black flex items-center gap-1">
                          {vendor.rating}
                          <Star
                            size={11}
                            className="text-amber-500 fill-amber-500"
                          />
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-1 pt-2">
                      <button
                        onClick={() =>
                          setSelectedVendor(vendor)
                        }
                        className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        onClick={() =>
                          openEditPanel(vendor)
                        }
                        className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        onClick={() =>
                          handleToggleStatus(vendor)
                        }
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                      >
                        <Power size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <Store
                    size={35}
                    className="mx-auto text-slate-300 mb-3"
                  />

                  <p className="text-xs font-semibold text-slate-400">
                    No vendors found.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </section>
      </main>

      <AnimatePresence>
        {selectedVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 10
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 10
              }}
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 relative"
            >
              <button
                onClick={() =>
                  setSelectedVendor(null)
                }
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-2xl flex items-center justify-center">
                  <Store size={21} />
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                    {selectedVendor.id}
                  </span>

                  <h3 className="text-lg font-bold text-black">
                    {selectedVendor.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                      <ShoppingBag size={16} />
                    </div>

                    <span className="text-xs font-semibold text-black">
                      Total Orders
                    </span>
                  </div>

                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {selectedVendor.orders}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                      <Star size={16} />
                    </div>

                    <span className="text-xs font-semibold text-black">
                      Vendor Rating
                    </span>
                  </div>

                  <span className="font-mono font-bold text-black text-sm flex items-center gap-1">
                    {selectedVendor.rating}
                    <Star
                      size={12}
                      className="text-amber-500 fill-amber-500"
                    />
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                      <Store size={16} />
                    </div>

                    <span className="text-xs font-semibold text-black">
                      Products Listed
                    </span>
                  </div>

                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {selectedVendor.products}
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-1">
                    Category
                  </span>

                  <p className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    {selectedVendor.category}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-1">
                    Location
                  </span>

                  <p className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    {selectedVendor.location}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-1">
                    Description
                  </span>

                  <p className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl p-3 leading-relaxed">
                    {selectedVendor.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-black uppercase tracking-wider">
                  Status
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${selectedVendor.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedVendor.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${selectedVendor.status === 'Active'
                      ? 'bg-emerald-500'
                      : selectedVendor.status === 'Pending'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                      }`}
                  />

                  {selectedVendor.status}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPanelOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 10
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 10
              }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => {
                  setIsPanelOpen(false)
                  setEditingVendor(null)
                }}
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-2xl flex items-center justify-center">
                  {editingVendor ? (
                    <Edit3 size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                    Vendor Management
                  </span>

                  <h3 className="text-lg font-bold text-black">
                    {editingVendor
                      ? 'Update Vendor'
                      : 'Create Vendor'}
                  </h3>
                </div>
              </div>

              <form
                onSubmit={handleSave}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Vendor Name
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="e.g. Green Valley Farms"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Category
                    </label>

                    <input
                      required
                      type="text"
                      placeholder="Fresh Produce"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Location
                    </label>

                    <input
                      required
                      type="text"
                      placeholder="Dehradun"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: e.target.value
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Products
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={formData.products}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          products: e.target.value
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Status
                    </label>

                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-emerald-500 focus:bg-white"
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Suspended">
                        Suspended
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Phone
                    </label>

                    <input
                      type="text"
                      placeholder="+91 98765 42101"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                      Email
                    </label>

                    <input
                      type="email"
                      placeholder="vendor@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
                    Description
                  </label>

                  <textarea
                    rows="4"
                    placeholder="Provide vendor information..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-black focus:outline-none focus:border-emerald-500 focus:bg-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPanelOpen(false)
                      setEditingVendor(null)
                    }}
                    disabled={saving}
                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      !formData.name.trim() ||
                      !formData.category.trim() ||
                      !formData.location.trim()
                    }
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm"
                  >
                    {saving ? (
                      <RefreshCw
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={14} />
                    )}

                    {saving
                      ? 'Saving...'
                      : editingVendor
                        ? 'Update Vendor'
                        : 'Create Vendor'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}