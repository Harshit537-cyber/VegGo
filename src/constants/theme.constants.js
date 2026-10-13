/**
 * Design & Theme Palette Constants
 * Pure light, soft pastel aesthetics for clean & modern SaaS presentation
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
  ORANGE: {
    LIGHT: '#fffaf5',
    SOFT: '#fff1e6',
    BORDER: '#fed7aa',
    TEXT: '#9a3412',
  },
  PINK: {
    LIGHT: '#fdf4f8',
    SOFT: '#fce7f3',
    BORDER: '#fbcfe8',
    TEXT: '#9d174d',
  },
  AMBER: {
    LIGHT: '#fffdf5',
    SOFT: '#fef3c7',
    BORDER: '#fde68a',
    TEXT: '#92400e',
  },
  ROSE: {
    LIGHT: '#fff5f6',
    SOFT: '#ffe4e6',
    BORDER: '#fecdd3',
    TEXT: '#9f1239',
  },
  SLATE: {
    LIGHT: '#f8fafc',
    SOFT: '#f1f5f9',
    BORDER: '#e2e8f0',
    TEXT: '#334155',
  },
});

export const STATUS_BADGE_CLASSES = Object.freeze({
  ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
  INACTIVE: 'bg-slate-50 text-slate-700 border-slate-200/60',
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200/60',
  REJECTED: 'bg-rose-50 text-rose-800 border-rose-200/60',
  BLOCKED: 'bg-rose-50 text-rose-800 border-rose-200/60',
});

// Soft light border and header accents using light pastel orange and light pink
export const LIGHT_ACCENTS = Object.freeze({
  TOP_STRIPE: 'bg-gradient-to-r from-orange-200/50 via-rose-200/40 to-pink-200/50',
  HEADER_BG: 'bg-gradient-to-r from-orange-50/25 via-pink-50/20 to-white',
  CONTAINER_BG: 'bg-white',
});

// Pure soft light pastel themes with light orange and light pink
export const DASHBOARD_METRIC_THEMES = Object.freeze({
  CUSTOMERS: {
    iconBg: 'bg-emerald-50/80 text-emerald-700 border border-emerald-100/80',
    cardBg: 'bg-gradient-to-br from-emerald-50/30 to-white hover:from-emerald-50/50 hover:to-white border-emerald-100/70 shadow-2xs',
    rowBg: 'hover:bg-emerald-50/30',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/50',
    dot: 'bg-emerald-400',
    textColor: 'text-emerald-900',
  },
  USERS: {
    iconBg: 'bg-orange-50/80 text-orange-700 border border-orange-100/80',
    cardBg: 'bg-gradient-to-br from-orange-50/30 to-white hover:from-orange-50/50 hover:to-white border-orange-100/70 shadow-2xs',
    rowBg: 'hover:bg-orange-50/30',
    badge: 'bg-orange-50 text-orange-800 border-orange-200/50',
    dot: 'bg-orange-300',
    textColor: 'text-orange-900',
  },
  STATUS_HEALTHY: {
    iconBg: 'bg-teal-50/80 text-teal-700 border border-teal-100/80',
    cardBg: 'bg-gradient-to-br from-teal-50/30 to-white hover:from-teal-50/50 hover:to-white border-teal-100/70 shadow-2xs',
    rowBg: 'hover:bg-teal-50/30',
    badge: 'bg-teal-50 text-teal-800 border-teal-200/50',
    dot: 'bg-teal-400',
    textColor: 'text-teal-900',
  },
  STATUS_DEGRADED: {
    iconBg: 'bg-rose-50/80 text-rose-700 border border-rose-100/80',
    cardBg: 'bg-gradient-to-br from-rose-50/30 to-white hover:from-rose-50/50 hover:to-white border-rose-100/70 shadow-2xs',
    rowBg: 'hover:bg-rose-50/30',
    badge: 'bg-rose-50 text-rose-800 border-rose-200/50',
    dot: 'bg-rose-300',
    textColor: 'text-rose-900',
  },
  ENVIRONMENT: {
    iconBg: 'bg-pink-50/80 text-pink-700 border border-pink-100/80',
    cardBg: 'bg-gradient-to-br from-pink-50/30 to-white hover:from-pink-50/50 hover:to-white border-pink-100/70 shadow-2xs',
    rowBg: 'hover:bg-pink-50/30',
    badge: 'bg-pink-50 text-pink-800 border-pink-200/50',
    dot: 'bg-pink-300',
    textColor: 'text-pink-900',
  },
});

export default {
  THEME_COLORS,
  STATUS_BADGE_CLASSES,
  LIGHT_ACCENTS,
  DASHBOARD_METRIC_THEMES,
};
