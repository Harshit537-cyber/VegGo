/**
 * Standardized UI Design Tokens & Component Styles for VegGo Admin
 * Provides unified classes for tables, badges, avatars, counters, and action buttons.
 */

export const UI_TABLE = Object.freeze({
  container: 'bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden',
  scrollWrapper: 'overflow-x-auto',
  table: 'w-full min-w-[840px] text-left border-collapse',
  thead: 'border-b border-slate-200 text-[11px] uppercase font-bold tracking-wider text-slate-500 bg-slate-50/90',
  th: 'py-3.5 px-4 text-[11px] uppercase font-bold tracking-wider text-slate-500 bg-slate-50/90 border-b border-slate-200',
  thCenter: 'py-3.5 px-4 text-[11px] uppercase font-bold tracking-wider text-slate-500 bg-slate-50/90 border-b border-slate-200 text-center',
  thRight: 'py-3.5 px-4 text-[11px] uppercase font-bold tracking-wider text-slate-500 bg-slate-50/90 border-b border-slate-200 text-right',
  tr: 'text-xs font-semibold text-black hover:bg-emerald-50/40 group',
  td: 'py-3.5 px-4 align-middle',
  tdCenter: 'py-3.5 px-4 align-middle text-center',
  tdRight: 'py-3.5 px-4 align-middle text-right',
});

export const UI_BADGES = Object.freeze({
  // Status Badges
  statusActive: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs',
  statusInactive: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-rose-50 text-rose-700 border-rose-200/80 shadow-2xs',
  statusBlocked: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-rose-50 text-rose-700 border-rose-200/80 shadow-2xs',
  statusPending: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-amber-50 text-amber-800 border-amber-200/80 shadow-2xs',

  // Status Indicator Dots
  statusDotActive: 'w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500',
  statusDotInactive: 'w-1.5 h-1.5 rounded-full shrink-0 bg-rose-500',
  statusDotBlocked: 'w-1.5 h-1.5 rounded-full shrink-0 bg-rose-500',
  statusDotPending: 'w-1.5 h-1.5 rounded-full shrink-0 bg-amber-500',

  // Metric Counter Badges (Orders, Complaints, Flags)
  counterNeutral: 'inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-lg text-xs font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs',
  counterActive: 'inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-lg text-xs font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs',
  counterWarning: 'inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-lg text-xs font-bold font-mono bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs',
  counterAlert: 'inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-lg text-xs font-bold font-mono bg-rose-50 text-rose-700 border border-rose-200/90 shadow-2xs',

  // Category & Taxonomy Badges
  category: 'inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-2xs truncate max-w-full tracking-tight',
  subcategory: 'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200/90 truncate max-w-full',

  // Unit standard pill
  unit: 'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 font-mono',
});

export const UI_BUTTONS = Object.freeze({
  view: 'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-40',
  edit: 'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200/90 hover:border-emerald-600 text-xs font-bold shadow-2xs hover:shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-40',
  success: 'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200/90 hover:border-emerald-600 text-xs font-bold shadow-2xs hover:shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-40',
  warning: 'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white border border-amber-200/90 hover:border-amber-600 text-xs font-bold shadow-2xs hover:shadow-amber-600/20 transition-all cursor-pointer disabled:opacity-40',
  danger: 'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200/90 hover:border-rose-600 text-xs font-bold shadow-2xs hover:shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-40',
});

export const UI_AVATAR = Object.freeze({
  container: 'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs border overflow-hidden',
});

/**
 * Deterministically generates harmonious avatar background/border/text colors
 * based on the user's name so initial avatars look distinct and vibrant.
 */
export const getAvatarColor = (name = '') => {
  const palette = [
    'bg-emerald-50 text-emerald-800 border-emerald-200/90',
    'bg-teal-50 text-teal-800 border-teal-200/90',
    'bg-sky-50 text-sky-800 border-sky-200/90',
    'bg-indigo-50 text-indigo-800 border-indigo-200/90',
    'bg-purple-50 text-purple-800 border-purple-200/90',
    'bg-amber-50 text-amber-800 border-amber-200/90',
    'bg-rose-50 text-rose-800 border-rose-200/90',
  ];

  if (!name) return palette[0];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return palette[Math.abs(hash) % palette.length];
};

export default {
  UI_TABLE,
  UI_BADGES,
  UI_BUTTONS,
  UI_AVATAR,
  getAvatarColor,
};
