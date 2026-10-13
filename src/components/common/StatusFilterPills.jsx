import React from 'react';

export default function StatusFilterPills({
  filters = [],
  activeFilter,
  onFilterChange,
  className = ''
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 py-1 ${className}`}>
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;

        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white hover:bg-emerald-50/70 hover:border-emerald-300 text-slate-600 border border-emerald-100/90'
            }`}
          >
            <span>{filter.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                isActive
                  ? 'bg-emerald-800 text-emerald-100'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {filter.count ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
