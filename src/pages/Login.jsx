import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Leaf,
  ShieldCheck,
  ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ForgotPasswordModal from '../Models/ForgotPasswordModal'
import { adminLogin } from '../Api/authService/authService'
import { isTokenUsable, clearAuthSession } from '../components/ProtectedRoute'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('remember_admin_email') || ''
  })
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(() => {
    return Boolean(localStorage.getItem('remember_admin_email'))
  })
  const [isForgotOpen, setIsForgotOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const token =
      localStorage.getItem('token') || localStorage.getItem('accessToken')
    if (token) {
      if (isTokenUsable(token)) {
        navigate('/dashboard', { replace: true })
      } else {
        clearAuthSession()
      }
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cleanEmail = email.trim()
    if (!cleanEmail || !password) return

    setErrorMessage('')
    setLoading(true)

    try {
      const response = await adminLogin({ email: cleanEmail, password })

      if (response?.success && response?.data) {
        localStorage.setItem('token', response.data.accessToken)
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)

        if (rememberMe) {
          localStorage.setItem('remember_admin_email', cleanEmail)
        } else {
          localStorage.removeItem('remember_admin_email')
        }

        navigate('/dashboard', { replace: true })
      } else {
        setErrorMessage(
          response?.message || 'Invalid credentials. Please verify your details.'
        )
      }
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Invalid email or password'
      )
    } finally {
      setLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.06
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' }
    }
  }

  return (
    <div className="min-h-dvh w-full bg-gradient-to-br from-emerald-100/70 via-slate-50 to-amber-100/50 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto select-none relative">
      {/* Decorative ambient color orbs for luminous beauty */}
      <div className="absolute top-10 left-12 w-96 h-96 bg-gradient-to-tr from-emerald-400/25 to-teal-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-12 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-orange-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Sign-In Card (Wider horizontal stretch & rich colorful styling) */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-xl sm:max-w-[570px] bg-white/95 backdrop-blur-2xl border border-emerald-200/70 rounded-3xl shadow-2xl shadow-emerald-950/15 overflow-hidden relative z-10"
      >
        {/* Top vibrant multi-color gradient accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />

        {/* Soft decorative ambient glow in top-right corner */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-300/20 via-teal-100/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="p-7 sm:p-10 lg:p-11 relative z-10">
          {/* Brand Logo & Name */}
          <motion.div variants={itemVariants} className="flex items-center gap-3.5 mb-6">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 6 }}
              className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0"
            >
              <Leaf size={24} className="drop-shadow-xs" />
            </motion.div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 block leading-tight">
                VegGo<span className="text-emerald-600 font-extrabold">Fresh</span>
              </span>
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-widest">
                Admin Platform
              </span>
            </div>
          </motion.div>

          {/* Header */}
          <motion.div variants={itemVariants} className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Sign in to console
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 font-medium leading-relaxed">
              Operational console for farm sourcing, distribution hubs & settlements.
            </p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                role="alert"
                className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-sm shadow-xs"
              >
                <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-xs sm:text-sm font-medium">{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="admin-email"
                className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Mail size={19} />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@veggo.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all shadow-2xs"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="admin-password"
                  className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Lock size={19} />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer focus:outline-none"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </motion.div>

            {/* Remember Me */}
            <motion.div variants={itemVariants} className="flex items-center pt-0.5">
              <label className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30 cursor-pointer accent-emerald-600"
                />
                <span>Remember this device</span>
              </label>
            </motion.div>

            {/* Submit Button (Vibrant & Eye-catching) */}
            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.012 }}
                whileTap={{ scale: loading ? 1 : 0.988 }}
                className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-400 active:from-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/25"
              >
                {loading ? (
                  <>
                    <Loader2 size={19} className="animate-spin text-white" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Bottom Security Note */}
          <div className="mt-7 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2.5 text-xs font-medium text-slate-400">
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50/90 border border-teal-200/70 px-2.5 py-0.5 rounded-md">
              Secure Gateway
            </span>
            <div className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Encrypted session • Authorized admin access only</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <ForgotPasswordModal
          isOpen={isForgotOpen}
          onClose={() => setIsForgotOpen(false)}
        />
      )}
    </div>
  )
}
