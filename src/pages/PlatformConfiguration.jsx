
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Settings,
  Mail,
  Database,
  Shield,
  Smartphone,
  Cpu,
  Save,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Zap,
  Sparkles,
  Calendar,
  ShieldCheck,
  Server,
  KeyRound
} from 'lucide-react';

export default function SystemSettings() {
  const [currentTab, setCurrentTab] = useState('general-settings');
  const [showNotification, setShowNotification] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const [smtpHost, setSmtpHost] = useState('smtp.sendgrid.net');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smsGateway, setSmsGateway] = useState('twilio');
  const [minAndroidVersion, setMinAndroidVersion] = useState('2.4.1');
  const [minIosVersion, setMinIosVersion] = useState('2.3.0');
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  const handleSaveSettings = (e) => {
    e.preventDefault();

    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleDatabaseBackup = () => {
    setIsBackingUp(true);

    setTimeout(() => {
      setIsBackingUp(false);
      setShowNotification(true);

      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }, 2000);
  };

  const inputClass =
    'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all';

  const sectionClass =
    'bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6';

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
                System configurations updated successfully
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

                SYSTEM MANAGEMENT
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

              System Settings

              <Sparkles className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            </h1>

            <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl font-medium">
              Control system integrations, environment configurations, security policies, and application performance parameters.
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
                Mail Service
              </span>

              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
                <Mail size={18} />
              </div>

            </div>

            <h3 className="text-xl sm:text-2xl font-semibold text-black tracking-tight">
              SendGrid SMTP
            </h3>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">

              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Connected
              </span>

              <span className="text-[10px] text-black font-semibold">
                Port {smtpPort}
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
                SMS Gateway
              </span>

              <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700">
                <Smartphone size={18} />
              </div>

            </div>

            <h3 className="text-xl sm:text-2xl font-semibold text-black tracking-tight capitalize">
              {smsGateway}
            </h3>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">

              <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Active
              </span>

              <span className="text-[10px] text-black font-semibold">
                OTP Service
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
                Security
              </span>

              <div className="p-2.5 rounded-2xl bg-green-50 text-green-700">
                <Shield size={18} />
              </div>

            </div>

            <h3 className="text-xl sm:text-2xl font-semibold text-black tracking-tight">
              {twoFactorAuth ? '2FA Enabled' : '2FA Disabled'}
            </h3>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">

              <span className="text-[11px] text-green-700 font-semibold bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                Protected
              </span>

              <span className="text-[10px] text-black font-semibold">
                Admin Login
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
                App Version
              </span>

              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
                <Smartphone size={18} />
              </div>

            </div>

            <h3 className="text-xl sm:text-2xl font-semibold text-black tracking-tight">
              Android {minAndroidVersion}
            </h3>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">

              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Minimum
              </span>

              <span className="text-[10px] text-black font-semibold">
                iOS {minIosVersion}
              </span>

            </div>

          </motion.div>

        </section>

        <form
          onSubmit={handleSaveSettings}
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
              className={sectionClass}
            >

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">

                <div className="flex items-center gap-3">

                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                    <Mail size={18} />
                  </div>

                  <div>

                    <h2 className="text-lg font-semibold text-black tracking-tight">
                      SMTP & Mail Integrations
                    </h2>

                    <p className="text-xs font-semibold text-black">
                      Configure outgoing email delivery services
                    </p>

                  </div>

                </div>

                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  <ShieldCheck size={12} />
                  SECURED
                </span>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="space-y-2">

                  <label className="text-[11px] font-bold text-black uppercase tracking-wider">
                    SMTP Host
                  </label>

                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className={inputClass}
                  />

                </div>

                <div className="space-y-2">

                  <label className="text-[11px] font-bold text-black uppercase tracking-wider">
                    SMTP Port
                  </label>

                  <input
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    className={inputClass}
                  />

                </div>

                <div className="space-y-2">

                  <label className="text-[11px] font-bold text-black uppercase tracking-wider">
                    Sender Email Address
                  </label>

                  <input
                    type="email"
                    defaultValue="no-reply@veggofresh.com"
                    className={inputClass}
                  />

                </div>

                <div className="space-y-2">

                  <label className="text-[11px] font-bold text-black uppercase tracking-wider">
                    SMTP Encryption
                  </label>

                  <select
                    defaultValue="tls"
                    className={inputClass}
                  >
                    <option value="tls">
                      TLS (Recommended)
                    </option>

                    <option value="ssl">
                      SSL
                    </option>

                    <option value="none">
                      None
                    </option>
                  </select>

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
              className={sectionClass}
            >

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">

                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <Smartphone size={18} />
                </div>

                <div>

                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Mobile Application Version Control
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Define minimum supported application versions
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="space-y-2">

                  <label className="text-[11px] font-bold text-black uppercase tracking-wider">
                    Minimum Android Version
                  </label>

                  <input
                    type="text"
                    value={minAndroidVersion}
                    onChange={(e) =>
                      setMinAndroidVersion(e.target.value)
                    }
                    className={inputClass}
                  />

                  <p className="text-[10px] text-slate-400 font-medium">
                    Users below this version will be required to update.
                  </p>

                </div>

                <div className="space-y-2">

                  <label className="text-[11px] font-bold text-black uppercase tracking-wider">
                    Minimum iOS Version
                  </label>

                  <input
                    type="text"
                    value={minIosVersion}
                    onChange={(e) =>
                      setMinIosVersion(e.target.value)
                    }
                    className={inputClass}
                  />

                  <p className="text-[10px] text-slate-400 font-medium">
                    Minimum supported iOS application version.
                  </p>

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
                delay: 0.5
              }}
              className={sectionClass}
            >

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">

                <div className="flex items-center gap-3">

                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                    <Cpu size={18} />
                  </div>

                  <div>

                    <h2 className="text-lg font-semibold text-black tracking-tight">
                      Third Party API Integrations
                    </h2>

                    <p className="text-xs font-semibold text-black">
                      Configure external services and API credentials
                    </p>

                  </div>

                </div>

                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  <KeyRound size={12} />
                  API READY
                </span>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="space-y-2">

                  <label className="text-[11px] font-bold text-black uppercase tracking-wider">
                    SMS Gateway Provider
                  </label>

                  <select
                    value={smsGateway}
                    onChange={(e) =>
                      setSmsGateway(e.target.value)
                    }
                    className={inputClass}
                  >

                    <option value="twilio">
                      Twilio SMS
                    </option>

                    <option value="msg91">
                      MSG91 Gateway
                    </option>

                    <option value="firebase">
                      Firebase OTP
                    </option>

                  </select>

                </div>

                <div className="space-y-2">

                  <label className="text-[11px] font-bold text-black uppercase tracking-wider">
                    Google Maps API Key
                  </label>

                  <div className="relative">

                    <KeyRound
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600"
                    />

                    <input
                      type="password"
                      defaultValue="AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4"
                      className={`${inputClass} pl-10`}
                    />

                  </div>

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
                delay: 0.4
              }}
              className={sectionClass}
            >

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">

                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <Database size={18} />
                </div>

                <div>

                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Database Maintenance
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Server backup and maintenance tools
                  </p>

                </div>

              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 mb-5">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                    <Server size={17} />
                  </div>

                  <div>

                    <p className="text-xs font-bold text-black">
                      Production Database
                    </p>

                    <p className="text-[9px] text-emerald-600 font-bold uppercase mt-0.5">
                      System Operational
                    </p>

                  </div>

                </div>

              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-medium mb-5">
                Create offline server backups and clean transaction logs to keep server performance optimized.
              </p>

              <motion.button
                whileHover={{
                  y: -2
                }}
                whileTap={{
                  scale: 0.98
                }}
                type="button"
                onClick={handleDatabaseBackup}
                disabled={isBackingUp}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-black rounded-2xl text-xs font-bold transition-all duration-300 active:scale-95 border border-slate-200 disabled:opacity-60"
              >

                <RefreshCw
                  size={14}
                  className={
                    isBackingUp
                      ? 'animate-spin text-emerald-600'
                      : 'text-slate-600'
                  }
                />

                {isBackingUp
                  ? 'Backing Up Database...'
                  : 'Run Standard Backup'}

              </motion.button>

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
                delay: 0.5
              }}
              className={sectionClass}
            >

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">

                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <Shield size={18} />
                </div>

                <div>

                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Security Environment
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Manage administrator security policies
                  </p>

                </div>

              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/70">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                    <ShieldCheck size={16} />
                  </div>

                  <div>

                    <p className="text-xs font-bold text-black">
                      Two-Factor Auth (2FA)
                    </p>

                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                      Required for Admin Login
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setTwoFactorAuth(!twoFactorAuth)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                    twoFactorAuth
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`}
                >

                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      twoFactorAuth
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />

                </button>

              </div>

              <div className="mt-4 flex items-center justify-between">

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Current Status
                </span>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    twoFactorAuth
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-slate-500 bg-slate-100 border-slate-200'
                  }`}
                >
                  {twoFactorAuth ? 'SECURE' : 'DISABLED'}
                </span>

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

                <Settings
                  size={16}
                  className="text-emerald-700"
                />

              </div>

              <div>

                <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-1">
                  System Policy Notice
                </p>

                <p className="text-[11px] text-emerald-800/80 leading-relaxed font-semibold">
                  Changes to system configurations can affect authentication, integrations, application compatibility, and server operations.
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

              Save System Settings

            </motion.button>

          </div>

        </form>

      </main>

    </div>
  );
}
