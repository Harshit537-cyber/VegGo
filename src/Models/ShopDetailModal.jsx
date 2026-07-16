import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Store, 
  User, 
  Tag, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  FileCheck 
} from 'lucide-react';

export default function ShopDetailModal({ isOpen, onClose, application }) {
  if (!isOpen || !application) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0, transition: { type: 'spring', duration: 0.4 } }}
        exit={{ scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-white rounded-[32px] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-100 relative overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Store size={26} />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-400 block tracking-wider">
              {application.id}
            </span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {application.name}
            </h3>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <User size={14} className="text-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Authorized Agent</span>
              </div>
              <span className="text-sm font-extrabold text-slate-800">{application.owner}</span>
            </div>

            <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Tag size={14} className="text-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Category Sector</span>
              </div>
              <span className="text-sm font-extrabold text-slate-800">{application.category}</span>
            </div>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
              Operational Credentials
            </h4>
            
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
              <Calendar size={16} className="text-slate-400" />
              <span>Applied on: {application.date}</span>
            </div>

            <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
              <MapPin size={16} className="text-slate-400" />
              <span>Verification Zone: Sector 42, Hub Delhi</span>
            </div>

            <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
              <Phone size={16} className="text-slate-400" />
              <span>+91 98765 43210</span>
            </div>

            <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
              <Mail size={16} className="text-slate-400" />
              <span>contact@{application.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</span>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 flex items-start gap-3.5 mt-2">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-700 rounded-lg">
              <FileCheck size={16} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-800">Pre-Screening Complete</h5>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                FSSAI certificate, GSTIN identification, and storage quality checks match criteria regulations.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm rounded-2xl border border-slate-100 transition-all active:scale-95"
          >
            Close Sheet
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}