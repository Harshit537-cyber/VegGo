/**
 * Shared helpers for the Marketing module (coupons + banners)
 */

// Server error envelope -> readable message (branch on errorCode if ever needed)
export const getErrorMessage = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.message || error?.message || fallback;

export const getErrorCode = (error) => error?.response?.data?.errorCode || null;

// ---- numbers -------------------------------------------------------------
export const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const n = Number(value);
  if (Number.isNaN(n)) return '-';
  return `₹${n.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

// ---- dates ---------------------------------------------------------------
// Server sends UTC ("...Z") plus *Ist fields ("2026-11-01T00:00:00", no offset).
// Dates we SEND without an offset are read as IST, so the form works in IST.

const DATE_OPTS = { day: '2-digit', month: 'short', year: 'numeric' };
const TIME_OPTS = { hour: '2-digit', minute: '2-digit', hour12: true };

// "2026-11-01T00:00:00" (IST wall-clock) -> "01 Nov 2026, 12:00 AM"
export const formatIstString = (istString) => {
  if (!istString) return '';
  const d = new Date(istString); // no offset => parsed as local wall-clock, formatted back as-is
  if (Number.isNaN(d.getTime())) return String(istString);
  return `${d.toLocaleDateString('en-GB', DATE_OPTS)}, ${d.toLocaleTimeString('en-US', TIME_OPTS)}`;
};

// UTC instant -> IST display
export const formatUtcAsIst = (utcString) => {
  if (!utcString) return '-';
  const d = new Date(utcString);
  if (Number.isNaN(d.getTime())) return '-';
  const date = d.toLocaleDateString('en-GB', { ...DATE_OPTS, timeZone: 'Asia/Kolkata' });
  const time = d.toLocaleTimeString('en-US', { ...TIME_OPTS, timeZone: 'Asia/Kolkata' });
  return `${date}, ${time}`;
};

// "2026-11-01T00:00:00" -> value for <input type="datetime-local"> ("2026-11-01T00:00")
export const toInputDateTime = (istString) => (istString ? String(istString).slice(0, 16) : '');

// <input type="datetime-local"> value -> API value (no offset => IST)
export const fromInputDateTime = (value) => {
  if (!value) return undefined;
  return value.length === 16 ? `${value}:00` : value;
};

// Treat a datetime-local value as IST and return epoch ms (for client-side checks)
export const istInputToMs = (value) => {
  if (!value) return NaN;
  const v = value.length === 16 ? `${value}:00` : value;
  return new Date(`${v}+05:30`).getTime();
};

export const formatSchedule = (startsAtIst, endsAtIst) => {
  if (!startsAtIst && !endsAtIst) return 'Always on';
  const from = startsAtIst ? formatIstString(startsAtIst) : 'Now';
  const to = endsAtIst ? formatIstString(endsAtIst) : 'No end';
  return `${from}  →  ${to}`;
};

// ---- status styling ------------------------------------------------------
export const STATUS_STYLES = Object.freeze({
  LIVE: { label: 'Live', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  SCHEDULED: { label: 'Scheduled', badge: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  EXPIRED: { label: 'Expired', badge: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  DISABLED: { label: 'Disabled', badge: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  USED_UP: { label: 'Used up', badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  MISSING: { label: 'Deleted', badge: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
});

export const AUDIENCE_LABELS = Object.freeze({
  EVERYONE: 'Everyone',
  NEW_CUSTOMERS: 'New customers',
  RETURNING_CUSTOMERS: 'Returning customers',
});

export const PERIOD_LABELS = Object.freeze({
  DAY: 'per day',
  WEEK: 'per week',
  MONTH: 'per month',
  LIFETIME: 'lifetime',
});

// Pull a PageResponse out of the envelope
export const extractPage = (response) => {
  const data = response?.data || {};
  const content = Array.isArray(data) ? data : Array.isArray(data.content) ? data.content : [];
  return {
    content,
    page: Number(data.page) || 0,
    size: Number(data.size) || content.length,
    totalElements: Number(data.totalElements) || content.length,
    totalPages: Number(data.totalPages) || 1,
  };
};
