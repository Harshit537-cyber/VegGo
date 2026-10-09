
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Check,
  Leaf,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ForgotPasswordModal from '../Models/ForgotPasswordModal';
import { adminLogin } from '../Api/authService/authService';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('remember_admin_email') || '';
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    return Boolean(localStorage.getItem('remember_admin_email'));
  });
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token && token !== 'undefined' && token !== 'null') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) return;

    setErrorMessage('');
    setLoading(true);

    try {
      const response = await adminLogin({ email: cleanEmail, password });

      if (response?.success && response?.data) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);

        if (rememberMe) {
          localStorage.setItem('remember_admin_email', cleanEmail);
        } else {
          localStorage.removeItem('remember_admin_email');
        }

        navigate('/dashboard', { replace: true });
      } else {
        setErrorMessage(
          response?.message || 'Login failed. Please verify your credentials.'
        );
      }
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const leftPanelVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-emerald-50/50 to-slate-200 flex items-center justify-center p-3 sm:p-5 lg:p-8 overflow-x-hidden">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-5xl bg-white rounded-3xl lg:rounded-[30px] shadow-[0_20px_70px_rgba(15,23,42,0.12)] border border-slate-200 overflow-hidden flex flex-col md:flex-row relative"
      >
        <motion.div
          variants={leftPanelVariants}
          className="w-full md:w-[44%] lg:w-[45%] bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col relative overflow-hidden"
        >
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              x: [0, 10, 0],
              y: [0, -10, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"
          />

          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              x: [0, -12, 0],
              y: [0, 12, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1
            }}
            className="absolute -bottom-28 -right-28 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none"
          />

          <div className="relative z-10 flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 8 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-500/5 border border-emerald-400/20 backdrop-blur-md"
            >
              <Leaf
                size={24}
                className="sm:w-7 sm:h-7 text-emerald-400"
              />
            </motion.div>

            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="text-2xl sm:text-3xl font-black tracking-tight text-white"
            >
              VegGo
              <span className="text-emerald-400 font-medium">Fresh</span>
            </motion.span>
          </div>

          <div className="relative z-10 flex-1 flex items-center justify-center py-8 sm:py-10 md:py-8 lg:py-10">
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[330px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  System Status
                </span>

                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              </div>

              <div className="space-y-3">
                <motion.div
                  whileHover={{
                    x: 4,
                    backgroundColor: 'rgba(255,255,255,0.08)'
                  }}
                  className="bg-white/5 rounded-xl p-3.5 sm:p-4 flex items-center justify-between border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/20 shrink-0">
                      <Shield
                        className="text-emerald-400"
                        size={19}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        SSL Encryption
                      </p>
                      <p className="text-[10px] sm:text-xs text-emerald-300/60 mt-0.5">
                        Active & Secure
                      </p>
                    </div>
                  </div>

                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check
                      size={12}
                      className="text-emerald-400"
                    />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{
                    x: 4,
                    backgroundColor: 'rgba(255,255,255,0.08)'
                  }}
                  className="bg-white/5 rounded-xl p-3.5 sm:p-4 flex items-center justify-between border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/20 shrink-0">
                      <div className="w-4 h-4 rounded-full border-2 border-dashed border-emerald-400 animate-spin" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        Cold Chain Logistics
                      </p>
                      <p className="text-[10px] sm:text-xs text-emerald-300/60 mt-0.5">
                        Optimized Nodes
                      </p>
                    </div>
                  </div>

                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check
                      size={12}
                      className="text-emerald-400"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
              Admin Console
            </h2>

            <p className="text-sm sm:text-base text-emerald-100/70 leading-relaxed max-w-md">
              Access the unified supply control center. Monitor fresh stock
              levels, logistic flows, and live marketplace metrics.
            </p>
          </div>
        </motion.div>

        <div className="w-full md:w-[56%] lg:w-[55%] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-14 lg:py-12 flex items-center justify-center bg-white">
          <div className="w-full max-w-[410px]">
            <motion.div
              variants={itemVariants}
              className="mb-7 sm:mb-8"
            >
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
                Welcome back
              </h2>

              <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                Enter your credentials to manage the platform operations.
              </p>
            </motion.div>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium"
              >
                {errorMessage}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <motion.div variants={itemVariants}>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Email Address
                </label>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none">
                    <Mail
                      className="text-slate-400 group-focus-within:text-emerald-600 transition-colors"
                      size={20}
                    />
                  </div>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 sm:pl-12 pr-4 py-3.5 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-slate-800 text-sm sm:text-base font-medium placeholder:text-slate-400"
                    placeholder="admin@veg.go"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(true)}
                    className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none">
                    <Lock
                      className="text-slate-400 group-focus-within:text-emerald-600 transition-colors"
                      size={20}
                    />
                  </div>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3.5 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-slate-800 text-sm sm:text-base font-medium placeholder:text-slate-400"
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 sm:pr-4 flex items-center text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    <AnimatePresence
                      mode="wait"
                      initial={false}
                    >
                      <motion.div
                        key={showPassword ? 'eye-off' : 'eye'}
                        initial={{
                          opacity: 0,
                          scale: 0.8
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.8
                        }}
                        transition={{ duration: 0.15 }}
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </button>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-center"
              >
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2.5 select-none text-left focus:outline-none cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      rememberMe
                        ? 'bg-emerald-600 border-emerald-600 shadow-md shadow-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {rememberMe && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 30
                        }}
                      >
                        <Check
                          size={12}
                          className="text-white stroke-[3px]"
                        />
                      </motion.div>
                    )}
                  </div>

                  <span className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
                    Keep me signed in
                  </span>
                </button>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                  className="w-full py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 transition-all text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-xl shadow-emerald-600/15 flex items-center justify-center gap-2.5 group cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      Sign In to Dashboard
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform duration-200"
                      />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isForgotOpen && (
          <ForgotPasswordModal
            isOpen={isForgotOpen}
            onClose={() => setIsForgotOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

