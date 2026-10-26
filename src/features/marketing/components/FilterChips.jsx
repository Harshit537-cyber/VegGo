
/**
 * Simple server-side status filter (no counts: the API only returns one page).
 */
export default function FilterChips({ options = [], value, onChange, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 py-1 ${className}`}>
      {options.map((opt) => {
        const active = value === opt.id;

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${
              active
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white hover:bg-emerald-50/70 hover:border-emerald-300 text-slate-600 border border-emerald-100/90'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
