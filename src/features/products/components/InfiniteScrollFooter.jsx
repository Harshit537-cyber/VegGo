import React, { useEffect, useRef } from 'react';
import { Loader2, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

/**
 * Modern Infinite Scroll Footer component
 * Automatically detects when user scrolls near the bottom using IntersectionObserver.
 * Displays:
 *  - Loading spinner when fetching more items
 *  - Error state with a "Retry" button
 *  - Clean completion state ("All X {label} loaded") when no more items exist
 */
function InfiniteScrollFooter({
  loading = false,
  hasMore = false,
  error = null,
  totalElements = 0,
  loadedCount = 0,
  label = 'records',
  onLoadMore,
  onRetry
}) {
  const sentinelRef = useRef(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          if (typeof onLoadMoreRef.current === 'function') {
            onLoadMoreRef.current();
          }
        }
      },
      {
        root: null,
        rootMargin: '250px',
        threshold: 0
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, error]);

  if (loadedCount === 0 && !loading && !error) {
    return null;
  }

  return (
    <div className="w-full mt-4 pt-3 border-t border-slate-100 flex flex-col items-center">
      {/* Invisible Sentinel Element to trigger load when scrolled into view */}
      {hasMore && !loading && !error && (
        <div ref={sentinelRef} className="h-4 w-full pointer-events-none opacity-0" />
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="py-4 flex items-center justify-center gap-2.5 text-xs font-bold text-emerald-700">
          <Loader2 size={16} className="animate-spin text-emerald-600" />
          <span>Loading more {label}...</span>
        </div>
      )}

      {/* Error State with Retry Button */}
      {error && !loading && (
        <div className="w-full max-w-md p-3.5 my-2 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2 text-rose-800 font-semibold min-w-0">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span className="truncate">{error || `Failed to load more ${label}.`}</span>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* End of List Completion Indicator */}
      {!hasMore && !loading && !error && loadedCount > 0 && (
        <div className="py-3 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400 select-none">
          <CheckCircle2 size={13} className="text-emerald-500" />
          <span>
            All {totalElements > 0 ? totalElements : loadedCount} {label} loaded
          </span>
        </div>
      )}
    </div>
  );
}

export default React.memo(InfiniteScrollFooter);
