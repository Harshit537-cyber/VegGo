import React from 'react';
import { X, User, MapPin, ShoppingBag, Clock, IndianRupee, ShieldCheck } from 'lucide-react';

export default function OrderDetailModal({ order, isOpen, onClose, onAction }) {
  if (!isOpen || !order) return null;

  const mockPhone = '+91 99887 76655';
  const parsedAmount = parseFloat(order.amount.replace(/[₹,]/g, ''));
  const deliveryCharge = 40.00;
  const subtotal = parsedAmount - deliveryCharge;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="relative p-6 bg-gradient-to-r from-emerald-800 to-teal-850 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-4 mt-2">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
              <ShoppingBag size={28} className="text-emerald-100" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200 bg-white/10 px-2.5 py-1 rounded-md">
                {order.id}
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1">Live Order Status</h3>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <User size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Customer</p>
                <p className="text-sm font-bold text-slate-800">{order.customer}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-200/50">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <MapPin size={16} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Delivery Address</p>
                <p className="text-xs font-semibold text-slate-600 mt-0.5 leading-relaxed">{order.address}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] uppercase font-black tracking-widest text-slate-400 mb-3">Cart Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm py-2 px-3 bg-slate-50/50 rounded-xl border border-slate-100">
                <span className="text-slate-600 font-semibold">{order.items}</span>
                <span className="font-bold text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-xs px-3 text-slate-400">
                <span>Delivery Charge</span>
                <span>₹{deliveryCharge.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-base font-black pt-3 px-3 border-t border-slate-100 text-slate-900">
                <span>Total Received</span>
                <span className="font-mono text-emerald-700">₹{parsedAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-amber-50/40 rounded-2xl border border-amber-100 flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Order Age</p>
                <p className="text-xs font-bold text-amber-800">{order.time}</p>
              </div>
            </div>

            <div className="p-3.5 bg-teal-50/40 rounded-2xl border border-teal-100 flex items-center gap-3">
              <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">State</p>
                <p className="text-xs font-bold text-teal-800">{order.status}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm"
            >
              Close Window
            </button>
            
            {order.status === 'Incoming' && (
              <button
                onClick={() => onAction(order.id, 'Processing')}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/10 transition-colors text-sm"
              >
                Accept Order
              </button>
            )}
            
            {order.status === 'Processing' && (
              <button
                onClick={() => onAction(order.id, 'Out for Delivery')}
                className="flex-1 py-3 px-4 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-md shadow-teal-600/10 transition-colors text-sm"
              >
                Assign Dispatch
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}