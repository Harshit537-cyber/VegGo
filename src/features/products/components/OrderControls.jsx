import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, GripVertical, Loader2 } from 'lucide-react';

/**
 * Shows the current position and (when reordering is allowed) the
 * move-up / move-down buttons, an optional drag handle, and an
 * editable position number input where users can type a specific position
 * (e.g. typing 1 when currently at 99 to jump straight to position 1).
 */
export default function OrderControls({
  order,
  canReorder,
  busy = false,
  isMoving = false,
  upDisabled = false,
  downDisabled = false,
  onUp,
  onDown,
  onMoveToPosition,
  dragHandleProps
}) {
  const [inputValue, setInputValue] = useState(order ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const isCommittingRef = useRef(false);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(order ?? '');
    }
  }, [order, isEditing]);

  const commitChange = () => {
    if (isCommittingRef.current) return;

    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < 1) {
      setInputValue(order ?? '');
      setIsEditing(false);
      return;
    }

    if (parsed !== Number(order) && typeof onMoveToPosition === 'function') {
      isCommittingRef.current = true;
      setIsEditing(false);
      onMoveToPosition(parsed);

      setTimeout(() => {
        isCommittingRef.current = false;
      }, 700);
    } else {
      setInputValue(order ?? '');
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitChange();
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setInputValue(order ?? '');
      setIsEditing(false);
      e.currentTarget.blur();
    }
  };

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
          title="Move up (1 step)"
          className={arrowClass}
        >
          <ChevronUp size={14} />
        </button>
      )}

      {isMoving ? (
        <div className="w-12 h-8 flex items-center justify-center bg-emerald-50 border border-emerald-300 rounded-lg shadow-2xs">
          <Loader2 size={13} className="animate-spin text-emerald-600" />
        </div>
      ) : canReorder && typeof onMoveToPosition === 'function' ? (
        <div className="relative group/pos">
          <input
            type="number"
            min="1"
            value={inputValue}
            disabled={busy || isMoving}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              isCommittingRef.current = false;
              setIsEditing(true);
            }}
            onBlur={() => {
              if (!isCommittingRef.current) {
                commitChange();
              }
            }}
            onKeyDown={handleKeyDown}
            title="Type a position number and press Enter to jump to that position"
            className="w-12 h-8 px-1 text-center bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 rounded-lg font-mono text-[11px] font-bold text-slate-800 focus:outline-none transition-all appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs cursor-text"
          />
        </div>
      ) : (
        <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700 font-bold">
          {order ?? '-'}
        </span>
      )}

      {canReorder && (
        <button
          type="button"
          onClick={onDown}
          disabled={busy || downDisabled}
          title="Move down (1 step)"
          className={arrowClass}
        >
          <ChevronDown size={14} />
        </button>
      )}
    </div>
  );
}
