import React from 'react';
import { Calendar, RefreshCw, Activity, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PageHeader({
  badge = 'Console',
  badgeIcon: BadgeIcon = Activity,
  title,
  subtitle,
  children,
  onRefresh,
  isRefreshing = false,
  showDate = true,
  rightActions,
  actions,
  liveText = 'LIVE ADMIN VEG GO',
  className = ''
}) {
  const effectiveActions = actions || rightActions;

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-sm shadow-slate-200/50 p-5 sm:p-6 lg:p-7 ${className}`}
    >
      {/* Top vibrant multi-color gradient accent bar matching Sign In identity */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />

      {/* Soft decorative luminous ambient glow in corner */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-300/15 via-teal-100/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Titles & Badges */}
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[11px] font-bold tracking-wide uppercase shadow-2xs">
              {BadgeIcon && <BadgeIcon size={13} className="text-emerald-600" />}
              {badge}
            </span>

            {liveText && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold tracking-wide shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                {liveText}
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions, Date & Refresh */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
          {effectiveActions}

          {showDate && (
            <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              <Calendar size={14} className="text-emerald-600" />
              <span>
                {new Date().toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}

          {onRefresh && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
              title="Refresh Data"
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-600'}
              />
            </motion.button>
          )}

          {children}
        </div>
      </div>
    </motion.header>
  );
}
