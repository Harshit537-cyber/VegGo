import React from 'react';
import { ShieldAlert, ShieldCheck, X } from 'lucide-react';

function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'danger' 
}) {
  if (!isOpen) return null;

  const isDanger = type === 'danger';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
    >
      <div
        className="w-full max-w-md max-h-[90dvh] overflow-y-auto bg-white rounded-3xl sm:rounded-[32px] p-5 sm:p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-100 relative"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
            isDanger ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            {isDanger ? <ShieldAlert size={28} /> : <ShieldCheck size={28} />}
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-8">
            {message}
          </p>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm rounded-2xl border border-slate-100 transition-all active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3.5 text-white font-bold text-sm rounded-2xl shadow-lg transition-all active:scale-95 ${
                isDanger 
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/15' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/15'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ConfirmModal);