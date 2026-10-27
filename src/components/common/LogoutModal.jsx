import React from 'react';
import { LogOut, X } from 'lucide-react';

function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-sm bg-white border border-slate-200/80 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-slate-950/20 z-10"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <X size={17} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl mb-4">
            <LogOut size={26} />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1.5">
            Confirm Logout
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 max-w-[240px]">
            Are you sure you want to end your current admin session?
          </p>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(LogoutModal);