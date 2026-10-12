import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import PageHeader from '../Common/PageHeader'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Truck,
  IndianRupee,
  Clock,
  RotateCcw,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Sparkles,
  ShieldCheck,
  Timer
} from 'lucide-react'

import {
  getPlatformSettings,
  updatePlatformSettings
} from '../Api/settingsService/settingsService'

const KNOWN_FIELDS = {
  deliveryRadiusKm: {
    label: 'Delivery Radius',
    suffix: 'KM',
    icon: Truck,
    step: '0.1',
    ceilingKey: 'maxDeliveryRadiusKm',
    description: 'Maximum delivery coverage radius from store'
  },
  platformFeeAmount: {
    label: 'Platform Fee',
    suffix: '₹',
    icon: IndianRupee,
    step: '0.01',
    ceilingKey: 'maxPlatformFeeAmount',
    description: 'Fixed platform service fee charged per order'
  },
  deliveryFeeAmount: {
    label: 'Delivery Fee',
    suffix: '₹',
    icon: IndianRupee,
    step: '0.01',
    ceilingKey: 'maxDeliveryFeeAmount',
    description: 'Base customer delivery fee charged per order'
  },
  vendorAcceptTimeoutSeconds: {
    label: 'Vendor Accept Timeout',
    suffix: 'Seconds',
    icon: Clock,
    step: '1',
    ceilingKey: 'maxAcceptTimeoutSeconds',
    description: 'Time allocated for vendors to accept incoming orders'
  },
  deliveryAcceptTimeoutSeconds: {
    label: 'Delivery Accept Timeout',
    suffix: 'Seconds',
    icon: Clock,
    step: '1',
    ceilingKey: 'maxAcceptTimeoutSeconds',
    description: 'Time window for riders to claim dispatch tasks'
  },
  rebroadcastMaxRounds: {
    label: 'Maximum Rebroadcast Rounds',
    suffix: 'Rounds',
    icon: RotateCcw,
    step: '1',
    ceilingKey: 'maxRebroadcastRounds',
    description: 'Maximum order re-dispatch cycles before escalation'
  },
  rebroadcastMaxElapsedMinutes: {
    label: 'Maximum Rebroadcast Time',
    suffix: 'Minutes',
    icon: RotateCcw,
    step: '1',
    ceilingKey: 'maxRebroadcastElapsedMinutes',
    description: 'Total elapsed minutes allowed for dispatch retries'
  },
  otpExpiryMinutes: {
    label: 'OTP Expiry',
    suffix: 'Minutes',
    icon: Timer,
    step: '1',
    ceilingKey: null,
    description: 'Time-to-live for customer and delivery OTP codes'
  }
}

const DEFAULT_CEILINGS = {
  maxDeliveryRadiusKm: null,
  maxPlatformFeeAmount: null,
  maxDeliveryFeeAmount: null,
  maxAcceptTimeoutSeconds: null,
  maxRebroadcastRounds: null,
  maxRebroadcastElapsedMinutes: null
}

const Settings = () => {
  const [settings, setSettings] = useState({})
  const [supportedKeys, setSupportedKeys] = useState([])
  const [ceilings, setCeilings] = useState(DEFAULT_CEILINGS)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const applyResponseData = (data) => {
    if (!data || typeof data !== 'object') return

    // 1. Ceilings extraction
    setCeilings({
      maxDeliveryRadiusKm: data.ceilings?.maxDeliveryRadiusKm ?? null,
      maxPlatformFeeAmount: data.ceilings?.maxPlatformFeeAmount ?? null,
      maxDeliveryFeeAmount: data.ceilings?.maxDeliveryFeeAmount ?? null,
      maxAcceptTimeoutSeconds: data.ceilings?.maxAcceptTimeoutSeconds ?? null,
      maxRebroadcastRounds: data.ceilings?.maxRebroadcastRounds ?? null,
      maxRebroadcastElapsedMinutes:
        data.ceilings?.maxRebroadcastElapsedMinutes ?? null
    })

    // 2. Identify and populate only supported fields from API data
    // Explicitly exclude metadata and unsupported extra fields
    const ignoredKeys = new Set([
      'ceilings',
      'id',
      '_id',
      'createdAt',
      'updatedAt',
      '__v',
      'platformCommissionPercent'
    ])

    const nextSettings = {}
    const activeKeys = []

    // Populate known fields in stable order
    Object.keys(KNOWN_FIELDS).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        nextSettings[key] = data[key]
        activeKeys.push(key)
      }
    })

    // Include any additional dynamic fields provided by the backend
    Object.keys(data).forEach((key) => {
      if (
        !ignoredKeys.has(key) &&
        !activeKeys.includes(key) &&
        typeof data[key] !== 'object'
      ) {
        nextSettings[key] = data[key]
        activeKeys.push(key)
      }
    })

    setSupportedKeys(activeKeys)
    setSettings(nextSettings)
  }

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError('')
      setMessage('')

      const response = await getPlatformSettings()

      if (response?.success && response?.data) {
        applyResponseData(response.data)
      } else {
        setError(
          response?.message || 'Unable to load platform settings.'
        )
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to load platform settings.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleRefresh = async () => {
    if (saving || refreshing) return
    setRefreshing(true)
    await loadSettings()
  }

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }))
    setMessage('')
    setError('')
  }

  const validateSettings = () => {
    if (supportedKeys.length === 0) {
      return 'No configurable platform settings available to save.'
    }

    // 1. Check for empty fields
    const emptyKey = supportedKeys.find(
      (key) =>
        settings[key] === '' ||
        settings[key] === null ||
        settings[key] === undefined
    )

    if (emptyKey) {
      const label = KNOWN_FIELDS[emptyKey]?.label || emptyKey
      return `Please enter a value for ${label}.`
    }

    // 2. Check for positive numeric values
    for (const key of supportedKeys) {
      const val = Number(settings[key])
      if (!Number.isFinite(val) || val < 0) {
        const label = KNOWN_FIELDS[key]?.label || key
        return `Please enter a valid positive number for ${label}.`
      }
    }

    // 3. Check against supported ceilings
    if (
      ceilings.maxDeliveryRadiusKm !== null &&
      supportedKeys.includes('deliveryRadiusKm') &&
      Number(settings.deliveryRadiusKm) > ceilings.maxDeliveryRadiusKm
    ) {
      return `Delivery radius cannot exceed ${ceilings.maxDeliveryRadiusKm} KM.`
    }

    if (
      ceilings.maxPlatformFeeAmount !== null &&
      supportedKeys.includes('platformFeeAmount') &&
      Number(settings.platformFeeAmount) > ceilings.maxPlatformFeeAmount
    ) {
      return `Platform fee cannot exceed ₹${ceilings.maxPlatformFeeAmount}.`
    }

    if (
      ceilings.maxDeliveryFeeAmount !== null &&
      supportedKeys.includes('deliveryFeeAmount') &&
      Number(settings.deliveryFeeAmount) > ceilings.maxDeliveryFeeAmount
    ) {
      return `Delivery fee cannot exceed ₹${ceilings.maxDeliveryFeeAmount}.`
    }

    if (
      ceilings.maxAcceptTimeoutSeconds !== null &&
      supportedKeys.includes('vendorAcceptTimeoutSeconds') &&
      Number(settings.vendorAcceptTimeoutSeconds) >
        ceilings.maxAcceptTimeoutSeconds
    ) {
      return `Vendor accept timeout cannot exceed ${ceilings.maxAcceptTimeoutSeconds} seconds.`
    }

    if (
      ceilings.maxAcceptTimeoutSeconds !== null &&
      supportedKeys.includes('deliveryAcceptTimeoutSeconds') &&
      Number(settings.deliveryAcceptTimeoutSeconds) >
        ceilings.maxAcceptTimeoutSeconds
    ) {
      return `Delivery accept timeout cannot exceed ${ceilings.maxAcceptTimeoutSeconds} seconds.`
    }

    if (
      ceilings.maxRebroadcastRounds !== null &&
      supportedKeys.includes('rebroadcastMaxRounds') &&
      Number(settings.rebroadcastMaxRounds) > ceilings.maxRebroadcastRounds
    ) {
      return `Rebroadcast rounds cannot exceed ${ceilings.maxRebroadcastRounds}.`
    }

    if (
      ceilings.maxRebroadcastElapsedMinutes !== null &&
      supportedKeys.includes('rebroadcastMaxElapsedMinutes') &&
      Number(settings.rebroadcastMaxElapsedMinutes) >
        ceilings.maxRebroadcastElapsedMinutes
    ) {
      return `Rebroadcast elapsed time cannot exceed ${ceilings.maxRebroadcastElapsedMinutes} minutes.`
    }

    return null
  }

  const handleSave = async () => {
    const validationError = validateSettings()

    if (validationError) {
      setError(validationError)
      setMessage('')
      return
    }

    try {
      setSaving(true)
      setMessage('')
      setError('')

      // Build payload containing ONLY supported fields from the API
      const payload = {}
      supportedKeys.forEach((key) => {
        payload[key] = Number(settings[key])
      })

      const response = await updatePlatformSettings(payload)

      if (response?.success && response?.data) {
        applyResponseData(response.data)
        setMessage(
          response.message || 'Platform settings updated successfully.'
        )
      } else {
        setError(
          response?.message || 'Failed to update platform settings.'
        )
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to update platform settings.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800">
        <Sidebar />

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-6 py-4 shadow-sm">
            <Loader2
              size={20}
              className="animate-spin text-emerald-600"
            />

            <span className="text-sm font-semibold text-slate-600">
              Loading platform settings...
            </span>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto max-h-dvh w-full space-y-6 sm:space-y-8">
        <PageHeader
          badge="Platform Configuration"
          badgeIcon={Zap}
          title="Platform Settings"
          subtitle="Configure delivery radius, acceptance timeout thresholds, dispatch rebroadcast cycles, and OTP parameters."
          onRefresh={handleRefresh}
          isRefreshing={refreshing || saving}
        />

        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700 shadow-sm"
          >
            <div className="p-2 rounded-xl bg-emerald-100">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold">Settings Updated</p>
              <p className="text-xs mt-0.5 text-emerald-600">{message}</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700 shadow-sm"
          >
            <div className="p-2 rounded-xl bg-rose-100">
              <AlertCircle size={18} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold">Configuration Notice</p>
              <p className="text-xs mt-0.5 text-rose-600">{error}</p>
            </div>

            {supportedKeys.length === 0 && (
              <button
                onClick={loadSettings}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Retry
              </button>
            )}
          </motion.div>
        )}

        {supportedKeys.length > 0 ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {supportedKeys.map((key) => {
              const meta = KNOWN_FIELDS[key] || {
                label: key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase()),
                suffix: '',
                icon: SettingsIcon,
                step: '1',
                ceilingKey: null,
                description: 'Operational platform parameter'
              }

              const maxLimit = meta.ceilingKey
                ? ceilings[meta.ceilingKey]
                : null

              return (
                <SettingCard
                  key={key}
                  icon={meta.icon}
                  label={meta.label}
                  description={meta.description}
                  value={settings[key] ?? ''}
                  suffix={meta.suffix}
                  max={maxLimit}
                  step={meta.step}
                  onChange={(val) => handleChange(key, val)}
                />
              )
            })}
          </section>
        ) : (
          !loading && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <SettingsIcon size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No Settings Fields Found
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                The platform settings API did not return any configurable fields.
              </p>
              <button
                onClick={loadSettings}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <RefreshCw size={14} />
                Reload Settings
              </button>
            </div>
          )
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                <SettingsIcon size={18} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-black tracking-tight">
                  Configuration Controls
                </h2>

                <p className="text-xs font-semibold text-slate-500">
                  Update operational settings using live platform APIs
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold uppercase tracking-wider">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              API Connected
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Configuration Status
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {supportedKeys.length > 0
                      ? `${supportedKeys.length} operational parameters synchronized from VegGo Admin API.`
                      : 'Connecting to platform settings service...'}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={16} />
                  Ready
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 sm:px-6 py-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Review your values before saving
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                Only supported live settings are submitted back to the server.
              </p>
            </div>

            <motion.button
              type="button"
              onClick={handleSave}
              disabled={saving || supportedKeys.length === 0}
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Settings
                </>
              )}
            </motion.button>
          </div>
        </motion.section>
      </main>
    </div>
  )
}

const SettingCard = ({
  icon: Icon,
  label,
  description,
  value,
  suffix,
  max,
  step,
  onChange
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600 transition-all duration-300 group-hover:h-1.5" />
      <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:scale-125" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0 pr-2">
            <span className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider group-hover:text-emerald-700 transition-colors truncate block">
              {label}
            </span>

            <p className="text-[10px] text-slate-400 mt-0.5 font-medium line-clamp-1">
              {description}
            </p>
          </div>

          <motion.div
            whileHover={{ rotate: 8, scale: 1.05 }}
            className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0"
          >
            <Icon size={18} />
          </motion.div>
        </div>

        <div className="relative">
          <input
            type="number"
            value={value}
            min="0"
            max={max ?? undefined}
            step={step}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-24 text-xl font-semibold text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100/70 group-hover:border-slate-300"
          />

          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {suffix}
          </span>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 font-semibold">
            Ceiling Limit
          </span>

          <span className="text-[11px] text-emerald-700 font-bold">
            {max !== null && max !== undefined
              ? `${max} ${suffix}`
              : 'Not capped'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default Settings