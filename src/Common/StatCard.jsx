import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'bg-emerald-500',
  iconBg = 'bg-emerald-50 text-emerald-600',
  subtext,
  trend,
  trendPositive = true,
  loading = false,
  onClick,
  index = 0
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: onClick ? -3 : -2 }}
      onClick={onClick}
      className={`relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 p-5 group ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Top accent line */}
      {accent && <div className={`absolute top-0 left-0 right-0 h-1 ${accent}`} />}

      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
          {label}
        </span>

        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconBg} border border-slate-100/80 shrink-0 group-hover:scale-105 transition-transform duration-200`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
          {loading ? (
            <span className="text-slate-300 animate-pulse text-xl">Loading...</span>
          ) : (
            value ?? '0'
          )}
        </h3>

        {(subtext || trend) && (
          <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
            {trend && (
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  trendPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {trend}
              </span>
            )}
            {subtext && <span className="truncate">{subtext}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}
