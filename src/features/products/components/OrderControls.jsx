import { ChevronUp, ChevronDown, GripVertical } from 'lucide-react';

/**
 * Shows the current position and (when reordering is allowed) the
 * move-up / move-down buttons and an optional drag handle.
 * Position itself is owned by the server - this only asks it to move items.
 */
export default function OrderControls({
  order,
  canReorder,
  busy = false,
  upDisabled = false,
  downDisabled = false,
  onUp,
  onDown,
  dragHandleProps
}) {
  const arrowClass =
    'p-1 rounded-md text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent';

  return (
    <div className="inline-flex items-center gap-1">
      {canReorder && dragHandleProps && (
        <span
          {...dragHandleProps}
          draggable={!busy}
          title="Drag to reorder"
          className="p-1 text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </span>
      )}

      {canReorder && (
        <button
          type="button"
          onClick={onUp}
          disabled={busy || upDisabled}
          title="Move up"
          className={arrowClass}
        >
          <ChevronUp size={14} />
        </button>
      )}

      <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[10px]">
        {order ?? '-'}
      </span>

      {canReorder && (
        <button
          type="button"
          onClick={onDown}
          disabled={busy || downDisabled}
          title="Move down"
          className={arrowClass}
        >
          <ChevronDown size={14} />
        </button>
      )}
    </div>
  );
}
