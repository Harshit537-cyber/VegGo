import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function SuccessModal({ isOpen }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0, transition: { type: 'spring', duration: 0.5 } }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-md bg-white rounded-[32px] p-8 md:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-100 flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 bg-emerald-50 rounded-full border border-emerald-100"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 relative z-10"
          >
            <Check className="text-white" size={32} strokeWidth={3} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0.5, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.4 }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
            className="absolute inset-0 border-2 border-emerald-400 rounded-full"
          />
        </div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-black text-slate-900 tracking-tight mb-2"
        >
          Access Granted
        </motion.h3>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-500 text-sm md:text-base leading-relaxed max-w-xs"
        >
          Your credentials are secure. Redirecting to the admin dashboard.
        </motion.p>

        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}