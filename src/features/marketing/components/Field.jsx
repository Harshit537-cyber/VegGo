
export const inputClass =
  'w-full h-[38px] px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400 placeholder:font-medium';

export const selectClass =
  'w-full h-[38px] px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

export const textareaClass =
  'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400 placeholder:font-medium';

export function Field({ label, hint, required = false, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10px] font-medium text-slate-500 leading-snug">{hint}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all shrink-0 disabled:opacity-60 disabled:cursor-not-allowed ${
        checked ? 'bg-emerald-600' : 'bg-slate-300'
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}

export function ToggleRow({ title, subtitle, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
      <div>
        <span className="text-[10px] font-bold text-black uppercase tracking-wider block">{title}</span>
        {subtitle && <span className="text-[10px] text-slate-500 font-medium">{subtitle}</span>}
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}
