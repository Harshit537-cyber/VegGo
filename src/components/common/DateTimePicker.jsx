import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Zap,
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const pad2 = (n) => String(n).padStart(2, '0');

/**
 * Format string "YYYY-MM-DDTHH:mm" to user-friendly string
 * e.g., "2026-11-01T14:30" -> "01 Nov 2026, 02:30 PM"
 */
export const formatDisplayDateTime = (val) => {
  if (!val) return '';
  try {
    const [datePart, timePart] = String(val).split('T');
    if (!datePart) return val;
    const [y, m, d] = datePart.split('-').map(Number);
    if (!y || !m || !d) return val;

    let timeStr = '';
    if (timePart) {
      const [h24, min] = timePart.split(':').map(Number);
      const period = h24 >= 12 ? 'PM' : 'AM';
      const h12 = h24 % 12 || 12;
      timeStr = `, ${pad2(h12)}:${pad2(min ?? 0)} ${period}`;
    }

    const monthStr = MONTH_NAMES_SHORT[m - 1] || pad2(m);
    return `${pad2(d)} ${monthStr} ${y}${timeStr}`;
  } catch {
    return String(val);
  }
};

/**
 * Convert 12-hour format + AM/PM to 24-hour number
 */
const to24Hour = (h12, period) => {
  const h = Number(h12) || 12;
  if (period === 'PM') {
    return h === 12 ? 12 : h + 12;
  }
  return h === 12 ? 0 : h;
};

/**
 * Convert 24-hour number to 12-hour number + AM/PM
 */
const from24Hour = (h24) => {
  const h = Number(h24) || 0;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return { h12, period };
};

/**
 * Modern DateTimePicker component tailored for VegGo Admin
 *
 * @param {string} value - ISO datetime string "YYYY-MM-DDTHH:mm" (or empty string)
 * @param {Function} onChange - Callback receiving updated "YYYY-MM-DDTHH:mm" or ""
 * @param {string} placeholder - Input placeholder text
 * @param {string} min - Optional minimum selectable datetime string
 * @param {string} max - Optional maximum selectable datetime string
 * @param {string} align - Dropdown alignment ('left' | 'right'), default: 'left'
 * @param {boolean} disabled - Whether the input is disabled
 */
export default function DateTimePicker({
  value = '',
  onChange,
  placeholder = 'Select date & time...',
  min,
  max,
  align = 'left',
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse incoming value into date/time parts
  const parsed = useMemo(() => {
    if (!value || typeof value !== 'string') return null;
    const [datePart, timePart] = value.split('T');
    if (!datePart) return null;
    const [y, m, d] = datePart.split('-').map(Number);
    if (!y || !m || !d) return null;

    let h24 = 0;
    let min = 0;
    if (timePart) {
      const parts = timePart.split(':').map(Number);
      h24 = parts[0] || 0;
      min = parts[1] || 0;
    }
    const { h12, period } = from24Hour(h24);

    return {
      year: y,
      month: m - 1, // 0-indexed for JS Date
      day: d,
      hours24: h24,
      hours12: h12,
      minutes: min,
      period,
    };
  }, [value]);

  // Current calendar view month & year
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(() => parsed?.year || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (parsed ? parsed.month : today.getMonth()));

  // Local draft time selector
  const [selectedHour12, setSelectedHour12] = useState(() => parsed?.hours12 || 12);
  const [selectedMinute, setSelectedMinute] = useState(() => parsed?.minutes || 0);
  const [selectedPeriod, setSelectedPeriod] = useState(() => parsed?.period || 'AM');

  // When value changes externally, synchronize view and time states
  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
      setSelectedHour12(parsed.hours12);
      setSelectedMinute(parsed.minutes);
      setSelectedPeriod(parsed.period);
    }
  }, [parsed]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Month navigation
  const prevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Build "YYYY-MM-DDTHH:mm" string from parts
  const emitValue = (year, month, day, h12, min, period) => {
    const h24 = to24Hour(h12, period);
    const dateStr = `${year}-${pad2(month + 1)}-${pad2(day)}`;
    const timeStr = `${pad2(h24)}:${pad2(min)}`;
    const result = `${dateStr}T${timeStr}`;
    onChange?.(result);
  };

  // Day selection in grid
  const handleSelectDay = (day) => {
    emitValue(viewYear, viewMonth, day, selectedHour12, selectedMinute, selectedPeriod);
  };

  // Time selector changes
  const handleHourChange = (newHour12) => {
    const h = Number(newHour12);
    setSelectedHour12(h);
    if (parsed) {
      emitValue(parsed.year, parsed.month, parsed.day, h, selectedMinute, selectedPeriod);
    }
  };

  const handleMinuteChange = (newMinute) => {
    const m = Number(newMinute);
    setSelectedMinute(m);
    if (parsed) {
      emitValue(parsed.year, parsed.month, parsed.day, selectedHour12, m, selectedPeriod);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
    if (parsed) {
      emitValue(parsed.year, parsed.month, parsed.day, selectedHour12, selectedMinute, newPeriod);
    }
  };

  // Quick Preset Actions
  const handlePresetNow = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    const h24 = now.getHours();
    const min = now.getMinutes();
    const { h12, period } = from24Hour(h24);

    setViewYear(y);
    setViewMonth(m);
    setSelectedHour12(h12);
    setSelectedMinute(min);
    setSelectedPeriod(period);
    emitValue(y, m, d, h12, min, period);
  };

  const handlePresetEndOfToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    setViewYear(y);
    setViewMonth(m);
    setSelectedHour12(11);
    setSelectedMinute(59);
    setSelectedPeriod('PM');
    emitValue(y, m, d, 11, 59, 'PM');
  };

  const handlePresetDaysFromNow = (days) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    const y = target.getFullYear();
    const m = target.getMonth();
    const d = target.getDate();

    setViewYear(y);
    setViewMonth(m);
    emitValue(y, m, d, selectedHour12, selectedMinute, selectedPeriod);
  };

  const handleClear = (e) => {
    e?.stopPropagation();
    onChange?.('');
    setIsOpen(false);
  };

  // Calendar days grid calculation
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Leading days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isPrev: true,
      });
    }

    // Days in current month
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const isSelected = Boolean(
        parsed &&
        parsed.year === viewYear &&
        parsed.month === viewMonth &&
        parsed.day === i
      );

      const isCurrentDay =
        today.getFullYear() === viewYear &&
        today.getMonth() === viewMonth &&
        today.getDate() === i;

      // Check min/max boundary
      let isDisabled = false;
      const cellDateStr = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(i)}`;
      if (min && min.slice(0, 10) > cellDateStr) {
        isDisabled = true;
      }
      if (max && max.slice(0, 10) < cellDateStr) {
        isDisabled = true;
      }

      days.push({
        day: i,
        isCurrentMonth: true,
        isSelected,
        isToday: isCurrentDay,
        isDisabled,
      });
    }

    // Trailing days to complete the 7-column grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        isNext: true,
      });
    }

    return days;
  }, [viewYear, viewMonth, parsed, today, min, max]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full min-h-[42px] px-3.5 py-2 rounded-xl border bg-white flex items-center justify-between text-xs font-semibold cursor-pointer transition-all select-none shadow-2xs group ${
          isOpen
            ? 'border-emerald-600 ring-2 ring-emerald-500/20'
            : 'border-slate-200 hover:border-emerald-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <CalendarIcon
            size={15}
            className={`shrink-0 transition-colors ${
              value ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'
            }`}
          />
          <span
            className={`truncate block ${
              value ? 'text-slate-900 font-bold tracking-tight' : 'text-slate-400 font-medium'
            }`}
          >
            {value ? formatDisplayDateTime(value) : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Clear date"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Modern Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 z-50 w-[310px] sm:w-[330px] p-3.5 bg-white rounded-2xl shadow-2xl border border-slate-200/90 text-slate-800 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePresetNow}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/70 transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <Zap size={10} className="text-emerald-600 fill-emerald-600" />
              Now
            </button>
            <button
              type="button"
              onClick={handlePresetEndOfToday}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              End Today (23:59)
            </button>
            <button
              type="button"
              onClick={() => handlePresetDaysFromNow(7)}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              +7 Days
            </button>
            <button
              type="button"
              onClick={() => handlePresetDaysFromNow(30)}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              +30 Days
            </button>
          </div>

          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between py-2.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map((w, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-0.5"
              >
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, idx) => {
              if (!item.isCurrentMonth) {
                return (
                  <span
                    key={idx}
                    className="py-1.5 text-xs text-slate-300 font-medium select-none"
                  >
                    {item.day}
                  </span>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={item.isDisabled}
                  onClick={() => handleSelectDay(item.day)}
                  className={`py-1.5 text-xs rounded-xl font-semibold transition-all cursor-pointer relative ${
                    item.isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-xs hover:bg-emerald-700 ring-2 ring-emerald-600/30'
                      : item.isDisabled
                        ? 'opacity-30 cursor-not-allowed text-slate-400'
                        : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  <span>{item.day}</span>
                  {item.isToday && !item.isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Time Picker Section */}
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-emerald-600" />
                Time (IST)
              </span>
              <span className="text-[10px] text-slate-400 font-medium">12-Hour format</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Hour Dropdown */}
              <div className="flex-1">
                <select
                  value={selectedHour12}
                  onChange={(e) => handleHourChange(e.target.value)}
                  className="w-full h-8 px-2 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>
                      {pad2(h)} hr
                    </option>
                  ))}
                </select>
              </div>

              <span className="font-bold text-slate-400">:</span>

              {/* Minute Dropdown (00 to 55 with 5-min intervals + fine steps) */}
              <div className="flex-1">
                <select
                  value={selectedMinute}
                  onChange={(e) => handleMinuteChange(e.target.value)}
                  className="w-full h-8 px-2 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                    <option key={m} value={m}>
                      {pad2(m)} min
                    </option>
                  ))}
                </select>
              </div>

              {/* AM / PM Toggle */}
              <div className="flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => handlePeriodChange('AM')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    selectedPeriod === 'AM'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodChange('PM')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    selectedPeriod === 'PM'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Check size={12} />
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
