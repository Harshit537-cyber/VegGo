import React from 'react';
import { LogOut, X } from 'lucide-react';

function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/20 rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-950/40 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 p-2 text-emerald-400/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300"
        >
          <X size={16} />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-3xl mb-5 shadow-inner">
            <LogOut size={28} />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Confirm Logout</h3>
          <p className="text-xs text-emerald-100/50 leading-relaxed mb-8 max-w-[240px]">
            Are you sure you want to log out of the VegGoFresh admin portal?
          </p>
          
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 px-4 bg-white/5 hover:bg-white/10 text-emerald-200/80 hover:text-white rounded-2xl text-xs font-bold border border-white/5 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-500/20 transition-all duration-300"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;