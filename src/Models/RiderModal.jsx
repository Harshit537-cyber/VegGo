import React from 'react';
import { X, Shield, Phone, Mail, MapPin, Truck, Calendar, User } from 'lucide-react';

export default function RiderModal({ rider, isOpen, onClose, onApprove, onReject }) {
  if (!isOpen || !rider) return null;

  const mockDetails = {
    phone: '+91 98765 43210',
    email: `${rider.name.toLowerCase().replace(/\s+/g, '.')}@veggogo.com`,
    licenseNo: 'DL-14202609845',
    experience: '3 Years',
    bgStatus: 'Verified',
    insuranceExpiry: 'Dec 2027',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="relative p-6 bg-gradient-to-r from-emerald-800 to-teal-800 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-4 mt-2">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
              <User size={32} className="text-emerald-100" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200 bg-white/10 px-2 py-0.5 rounded-md">
                {rider.id}
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1">{rider.name}</h3>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Truck size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Vehicle</p>
                <p className="text-xs font-bold text-slate-800">{rider.vehicle}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Region</p>
                <p className="text-xs font-bold text-slate-800">{rider.city}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-400 font-semibold flex items-center gap-2">
                <Mail size={14} /> Email
              </span>
              <span className="font-bold text-slate-800">{mockDetails.email}</span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-400 font-semibold flex items-center gap-2">
                <Phone size={14} /> Contact Number
              </span>
              <span className="font-bold text-slate-800">{mockDetails.phone}</span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-400 font-semibold flex items-center gap-2">
                <Shield size={14} /> DL Number
              </span>
              <span className="font-mono font-bold text-slate-800">{mockDetails.licenseNo}</span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-400 font-semibold flex items-center gap-2">
                <Calendar size={14} /> Applied On
              </span>
              <span className="font-bold text-slate-800">{rider.date}</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-emerald-700 font-black uppercase tracking-wider">Background Screening</p>
              <p className="text-xs font-bold text-slate-600 mt-0.5">Automated document check passed</p>
            </div>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
              {mockDetails.bgStatus}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onReject(rider.id)}
              className="flex-1 py-3 px-4 rounded-xl border border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition-colors"
            >
              Reject Application
            </button>
            <button
              onClick={() => onApprove(rider.id)}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/10 transition-colors"
            >
              Approve Rider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}