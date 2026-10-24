import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Server-side pagination footer (0-based `page`).
 */
export default function PaginationBar({
  page,
  totalPages,
  totalElements,
  pageSize,
  itemsOnPage,
  disabled = false,
  label = 'records',
  onPageChange
}) {
  if (!totalElements) return null;

  const from = page * pageSize + 1;
  const to = page * pageSize + (itemsOnPage ?? pageSize);
  const isFirst = page <= 0;
  const isLast = page >= totalPages - 1;

  const buttonClass =
    'inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-white text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100">
      <p className="text-[11px] font-semibold text-slate-500">
        Showing {from}-{Math.min(to, totalElements)} of {totalElements} {label}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || isFirst}
          className={buttonClass}
        >
          <ChevronLeft size={14} />
          <span>Prev</span>
        </button>

        <span className="text-[11px] font-bold text-black px-2">
          Page {page + 1} of {Math.max(1, totalPages)}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || isLast}
          className={buttonClass}
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
