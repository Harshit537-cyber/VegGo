import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Truck,
  Percent,
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

const DEFAULT_SETTINGS = {
  deliveryRadiusKm: '',
  platformCommissionPercent: '',
  platformFeeAmount: 5,
  deliveryFeeAmount: 25,
  vendorAcceptTimeoutSeconds: '',
  deliveryAcceptTimeoutSeconds: '',
  rebroadcastMaxRounds: '',
  rebroadcastMaxElapsedMinutes: '',
  otpExpiryMinutes: ''
}

const DEFAULT_CEILINGS = {
  maxDeliveryRadiusKm: null,
  maxPlatformCommissionPercent: null,
  maxAcceptTimeoutSeconds: null,
  maxRebroadcastRounds: null,
  maxRebroadcastElapsedMinutes: null
}

const Settings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [ceilings, setCeilings] = useState(DEFAULT_CEILINGS)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const applyResponseData = (data) => {
    if (!data) return

    setSettings({
      deliveryRadiusKm: data.deliveryRadiusKm ?? '',
      platformCommissionPercent:
        data.platformCommissionPercent ?? '',
      platformFeeAmount:
        data.platformFeeAmount ?? 5,
      deliveryFeeAmount:
        data.deliveryFeeAmount ?? 25,
      vendorAcceptTimeoutSeconds:
        data.vendorAcceptTimeoutSeconds ?? '',
      deliveryAcceptTimeoutSeconds:
        data.deliveryAcceptTimeoutSeconds ?? '',
      rebroadcastMaxRounds:
        data.rebroadcastMaxRounds ?? '',
      rebroadcastMaxElapsedMinutes:
        data.rebroadcastMaxElapsedMinutes ?? '',
      otpExpiryMinutes:
        data.otpExpiryMinutes ?? ''
    })

    if (data.ceilings) {
      setCeilings({
        maxDeliveryRadiusKm:
          data.ceilings.maxDeliveryRadiusKm ?? null,
        maxPlatformCommissionPercent:
          data.ceilings.maxPlatformCommissionPercent ?? null,
        maxAcceptTimeoutSeconds:
          data.ceilings.maxAcceptTimeoutSeconds ?? null,
        maxRebroadcastRounds:
          data.ceilings.maxRebroadcastRounds ?? null,
        maxRebroadcastElapsedMinutes:
          data.ceilings.maxRebroadcastElapsedMinutes ?? null
      })
    }
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
          response?.message ||
          'Unable to load platform settings'
        )
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load platform settings'
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
    if (saving) return

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
    const fields = [
      'deliveryRadiusKm',
      'platformCommissionPercent',
      'platformFeeAmount',
      'deliveryFeeAmount',
      'vendorAcceptTimeoutSeconds',
      'deliveryAcceptTimeoutSeconds',
      'rebroadcastMaxRounds',
      'rebroadcastMaxElapsedMinutes',
      'otpExpiryMinutes'
    ]

    const hasEmptyValue = fields.some(
      (field) =>
        settings[field] === '' ||
        settings[field] === null ||
        settings[field] === undefined
    )

    if (hasEmptyValue) {
      return 'Please fill all platform settings fields.'
    }

    const values = {}

    fields.forEach((field) => {
      values[field] = Number(settings[field])
    })

    if (
      Object.values(values).some(
        (value) =>
          !Number.isFinite(value) ||
          value < 0
      )
    ) {
      return 'Please enter valid positive values.'
    }

    if (
      ceilings.maxDeliveryRadiusKm !== null &&
      values.deliveryRadiusKm >
        ceilings.maxDeliveryRadiusKm
    ) {
      return `Delivery radius cannot exceed ${ceilings.maxDeliveryRadiusKm} KM.`
    }

    if (
      ceilings.maxPlatformCommissionPercent !== null &&
      values.platformCommissionPercent >
        ceilings.maxPlatformCommissionPercent
    ) {
      return `Platform commission cannot exceed ${ceilings.maxPlatformCommissionPercent}%.`
    }

    if (
      ceilings.maxAcceptTimeoutSeconds !== null &&
      values.vendorAcceptTimeoutSeconds >
        ceilings.maxAcceptTimeoutSeconds
    ) {
      return `Vendor accept timeout cannot exceed ${ceilings.maxAcceptTimeoutSeconds} seconds.`
    }

    if (
      ceilings.maxAcceptTimeoutSeconds !== null &&
      values.deliveryAcceptTimeoutSeconds >
        ceilings.maxAcceptTimeoutSeconds
    ) {
      return `Delivery accept timeout cannot exceed ${ceilings.maxAcceptTimeoutSeconds} seconds.`
    }

    if (
      ceilings.maxRebroadcastRounds !== null &&
      values.rebroadcastMaxRounds >
        ceilings.maxRebroadcastRounds
    ) {
      return `Rebroadcast rounds cannot exceed ${ceilings.maxRebroadcastRounds}.`
    }

    if (
      ceilings.maxRebroadcastElapsedMinutes !== null &&
      values.rebroadcastMaxElapsedMinutes >
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

      const payload = {
        deliveryRadiusKm: Number(
          settings.deliveryRadiusKm
        ),
        platformCommissionPercent: Number(
          settings.platformCommissionPercent
        ),
        platformFeeAmount: Number(
          settings.platformFeeAmount
        ),
        deliveryFeeAmount: Number(
          settings.deliveryFeeAmount
        ),
        vendorAcceptTimeoutSeconds: Number(
          settings.vendorAcceptTimeoutSeconds
        ),
        deliveryAcceptTimeoutSeconds: Number(
          settings.deliveryAcceptTimeoutSeconds
        ),
        rebroadcastMaxRounds: Number(
          settings.rebroadcastMaxRounds
        ),
        rebroadcastMaxElapsedMinutes: Number(
          settings.rebroadcastMaxElapsedMinutes
        ),
        otpExpiryMinutes: Number(
          settings.otpExpiryMinutes
        )
      }

      const response =
        await updatePlatformSettings(payload)

      if (response?.success && response?.data) {
        applyResponseData(response.data)

        setMessage(
          response.message ||
          'Platform settings updated successfully'
        )
      } else {
        setError(
          response?.message ||
          'Failed to update settings'
        )
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update platform settings'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800">
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
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar />

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
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 sm:p-7 rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm">
                <Zap
                  size={12}
                  className="text-emerald-400"
                />
                Platform Configuration
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
              Platform Settings

              <Sparkles className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/70 max-w-2xl">
              Manage delivery radius, commission, platform fees,
              delivery fees, acceptance, rebroadcast and OTP configuration.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center z-10">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-900/60 border border-emerald-800 rounded-2xl px-4 py-2 text-xs font-semibold text-emerald-100 shadow-inner">
              <ShieldCheck
                size={14}
                className="text-emerald-400"
              />

              <span>Live API Configuration</span>
            </div>

            <motion.button
              whileHover={{
                scale: 1.05
              }}
              whileTap={{
                scale: 0.95
              }}
              onClick={handleRefresh}
              disabled={
                refreshing ||
                saving
              }
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner disabled:opacity-60"
              title="Refresh Settings"
            >
              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? 'animate-spin text-emerald-300'
                    : 'text-emerald-300'
                }
              />
            </motion.button>
          </div>
        </motion.header>

        {message && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700 shadow-sm"
          >
            <div className="p-2 rounded-xl bg-emerald-100">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Settings Updated
              </p>

              <p className="text-xs mt-0.5 text-emerald-600">
                {message}
              </p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700 shadow-sm"
          >
            <div className="p-2 rounded-xl bg-rose-100">
              <AlertCircle size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Configuration Error
              </p>

              <p className="text-xs mt-0.5 text-rose-600">
                {error}
              </p>
            </div>
          </motion.div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

          <SettingCard
            icon={Truck}
            label="Delivery Radius"
            value={settings.deliveryRadiusKm}
            suffix="KM"
            max={ceilings.maxDeliveryRadiusKm}
            step="0.1"
            onChange={(value) =>
              handleChange(
                'deliveryRadiusKm',
                value
              )
            }
          />

          <SettingCard
            icon={Percent}
            label="Platform Commission"
            value={
              settings.platformCommissionPercent
            }
            suffix="%"
            max={
              ceilings.maxPlatformCommissionPercent
            }
            step="0.01"
            onChange={(value) =>
              handleChange(
                'platformCommissionPercent',
                value
              )
            }
          />

          <SettingCard
            icon={IndianRupee}
            label="Platform Fee"
            value={settings.platformFeeAmount}
            suffix="₹"
            max={null}
            step="0.01"
            onChange={(value) =>
              handleChange(
                'platformFeeAmount',
                value
              )
            }
          />

          <SettingCard
            icon={IndianRupee}
            label="Delivery Fee"
            value={settings.deliveryFeeAmount}
            suffix="₹"
            max={null}
            step="0.01"
            onChange={(value) =>
              handleChange(
                'deliveryFeeAmount',
                value
              )
            }
          />

          <SettingCard
            icon={Clock}
            label="Vendor Accept Timeout"
            value={
              settings.vendorAcceptTimeoutSeconds
            }
            suffix="Seconds"
            max={
              ceilings.maxAcceptTimeoutSeconds
            }
            step="1"
            onChange={(value) =>
              handleChange(
                'vendorAcceptTimeoutSeconds',
                value
              )
            }
          />

          <SettingCard
            icon={Clock}
            label="Delivery Accept Timeout"
            value={
              settings.deliveryAcceptTimeoutSeconds
            }
            suffix="Seconds"
            max={
              ceilings.maxAcceptTimeoutSeconds
            }
            step="1"
            onChange={(value) =>
              handleChange(
                'deliveryAcceptTimeoutSeconds',
                value
              )
            }
          />

          <SettingCard
            icon={RotateCcw}
            label="Maximum Rebroadcast Rounds"
            value={
              settings.rebroadcastMaxRounds
            }
            suffix="Rounds"
            max={
              ceilings.maxRebroadcastRounds
            }
            step="1"
            onChange={(value) =>
              handleChange(
                'rebroadcastMaxRounds',
                value
              )
            }
          />

          <SettingCard
            icon={RotateCcw}
            label="Maximum Rebroadcast Time"
            value={
              settings.rebroadcastMaxElapsedMinutes
            }
            suffix="Minutes"
            max={
              ceilings.maxRebroadcastElapsedMinutes
            }
            step="1"
            onChange={(value) =>
              handleChange(
                'rebroadcastMaxElapsedMinutes',
                value
              )
            }
          />

          <SettingCard
            icon={Timer}
            label="OTP Expiry"
            value={
              settings.otpExpiryMinutes
            }
            suffix="Minutes"
            max={null}
            step="1"
            onChange={(value) =>
              handleChange(
                'otpExpiryMinutes',
                value
              )
            }
          />

        </section>

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
            delay: 0.2
          }}
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
                    Platform settings are managed through the VegGoFresh Admin API.
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
                Values are validated against limits provided by the API.
              </p>
            </div>

            <motion.button
              type="button"
              onClick={handleSave}
              disabled={saving}
              whileHover={{
                scale: saving ? 1 : 1.02
              }}
              whileTap={{
                scale: saving ? 1 : 0.98
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
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
  value,
  suffix,
  max,
  step,
  onChange
}) => {
  return (
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
        y: -4,
        transition: {
          duration: 0.2
        }
      }}
      className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600 transition-all duration-300 group-hover:h-1.5" />

      <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:scale-125" />

      <div className="relative z-10">

        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[11px] font-semibold text-black uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
              {label}
            </span>

            <p className="text-[10px] text-slate-400 mt-1 font-semibold">
              Platform configuration
            </p>
          </div>

          <motion.div
            whileHover={{
              rotate: 8,
              scale: 1.05
            }}
            className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100"
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
            onChange={(e) =>
              onChange(e.target.value)
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-4 pr-24 text-xl font-semibold text-black outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100/70 group-hover:border-slate-300"
          />

          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {suffix}
          </span>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 font-semibold">
            Maximum allowed
          </span>

          <span className="text-[11px] text-emerald-700 font-bold">
            {max !== null &&
            max !== undefined
              ? `${max} ${suffix}`
              : 'API limit unavailable'}
          </span>
        </div>

      </div>
    </motion.div>
  )
}

export default Settings