/**
 * Unified Professional Green Theme System for VegGo Admin
 * Soft, balanced, and cohesive green aesthetics across all pages.
 */

export const THEME_COLORS = Object.freeze({
  EMERALD: {
    LIGHT: '#f2fbf7',
    SOFT: '#e1f7ec',
    BORDER: '#bbf0d7',
    TEXT: '#065f46',
  },
  TEAL: {
    LIGHT: '#f0fdf9',
    SOFT: '#daf8f2',
    BORDER: '#b2eee3',
    TEXT: '#115e59',
  },
  SAGE: {
    LIGHT: '#f4f8f5',
    SOFT: '#e5eee7',
    BORDER: '#c9ded0',
    TEXT: '#22543d',
  },
  MINT: {
    LIGHT: '#f0fdf4',
    SOFT: '#dcfce7',
    BORDER: '#bbf7d0',
    TEXT: '#15803d',
  },
  FOREST: {
    LIGHT: '#ecfdf5',
    SOFT: '#d1fae5',
    BORDER: '#a7f3d0',
    TEXT: '#047857',
  },
  SLATE: {
    LIGHT: '#f8fafc',
    SOFT: '#f1f5f9',
    BORDER: '#e2e8f0',
    TEXT: '#334155',
  },
});

export const STATUS_BADGE_CLASSES = Object.freeze({
  ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  INACTIVE: 'bg-slate-50 text-slate-700 border-slate-200/80',
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200/80',
  REJECTED: 'bg-rose-50 text-rose-800 border-rose-200/80',
  BLOCKED: 'bg-rose-50 text-rose-800 border-rose-200/80',
});

// Subtle, soft green header & accent stripes
export const LIGHT_ACCENTS = Object.freeze({
  TOP_STRIPE: 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400',
  HEADER_BG: 'bg-gradient-to-r from-emerald-50/40 via-teal-50/20 to-white',
  CONTAINER_BG: 'bg-[#f6f9f7]',
});

// Cohesive, balanced green dashboard metric card themes
export const DASHBOARD_METRIC_THEMES = Object.freeze({
  CUSTOMERS: {
    iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    cardBg: 'bg-gradient-to-br from-emerald-50/40 via-white to-white hover:from-emerald-50/60 hover:to-white border-emerald-100/90 shadow-2xs',
    rowBg: 'hover:bg-emerald-50/30',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/70',
    dot: 'bg-emerald-500',
    textColor: 'text-emerald-950',
  },
  USERS: {
    iconBg: 'bg-teal-50 text-teal-700 border border-teal-200/80',
    cardBg: 'bg-gradient-to-br from-teal-50/35 via-white to-white hover:from-teal-50/55 hover:to-white border-teal-100/90 shadow-2xs',
    rowBg: 'hover:bg-teal-50/30',
    badge: 'bg-teal-50 text-teal-800 border-teal-200/70',
    dot: 'bg-teal-500',
    textColor: 'text-teal-950',
  },
  STATUS_HEALTHY: {
    iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    cardBg: 'bg-gradient-to-br from-emerald-50/40 via-white to-white hover:from-emerald-50/60 hover:to-white border-emerald-100/90 shadow-2xs',
    rowBg: 'hover:bg-emerald-50/30',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/70',
    dot: 'bg-emerald-500',
    textColor: 'text-emerald-950',
  },
  STATUS_DEGRADED: {
    iconBg: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    cardBg: 'bg-gradient-to-br from-rose-50/30 via-white to-white hover:from-rose-50/50 hover:to-white border-rose-100/80 shadow-2xs',
    rowBg: 'hover:bg-rose-50/30',
    badge: 'bg-rose-50 text-rose-800 border-rose-200/70',
    dot: 'bg-rose-500',
    textColor: 'text-rose-950',
  },
  ENVIRONMENT: {
    iconBg: 'bg-emerald-50/90 text-emerald-800 border border-emerald-200/80',
    cardBg: 'bg-gradient-to-br from-emerald-50/30 via-white to-white hover:from-emerald-50/50 hover:to-white border-emerald-100/90 shadow-2xs',
    rowBg: 'hover:bg-emerald-50/30',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/70',
    dot: 'bg-emerald-500',
    textColor: 'text-emerald-950',
  },
});

export default {
  THEME_COLORS,
  STATUS_BADGE_CLASSES,
  LIGHT_ACCENTS,
  DASHBOARD_METRIC_THEMES,
};
