import React, { useState } from 'react';
import { X, Shield, Phone, Truck, Calendar, User, Loader2 } from 'lucide-react';
import {
  approveDeliveryKyc,
  rejectDeliveryKyc
} from '../Api/deliveryPartnerKyc/deliveryPartnerKycService';

export default function RiderModal({
  rider,
  isOpen,
  onClose,
  onApprove,
  onReject
}) {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !rider) return null;

  const handleApprove = async () => {
    try {
      setLoading(true);
      setAction('approve');
      setErrorMsg('');

      await approveDeliveryKyc(rider.userId);

      onApprove(rider.userId);
    } catch (error) {
      console.error('Failed to approve delivery partner KYC:', error);
      setErrorMsg(
        error?.response?.data?.message ||
        'Failed to approve delivery partner KYC'
      );
    } finally {
      setLoading(false);
      setAction('');
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      setAction('reject');
      setErrorMsg('');

      await rejectDeliveryKyc(rider.userId);

      onReject(rider.userId);
    } catch (error) {
      console.error('Failed to reject delivery partner KYC:', error);
      setErrorMsg(
        error?.response?.data?.message ||
        'Failed to reject delivery partner KYC'
      );
    } finally {
      setLoading(false);
      setAction('');
    }
  };

  const formattedDate = rider.submittedAt
    ? new Date(rider.submittedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="relative p-6 bg-gradient-to-r from-emerald-800 to-teal-800 text-white">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white disabled:opacity-50"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4 mt-2">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
              <User size={32} className="text-emerald-100" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200 bg-white/10 px-2 py-0.5 rounded-md">
                Delivery Partner
              </span>

              <h3 className="text-xl font-extrabold text-white mt-1">
                {rider.fullName}
              </h3>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Truck size={16} />
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Vehicle
                </p>
                <p className="text-xs font-bold text-slate-800">
                  {rider.vehicleType || '-'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Truck size={16} />
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Model
                </p>
                <p className="text-xs font-bold text-slate-800">
                  {rider.vehicleModel || '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-400 font-semibold flex items-center gap-2">
                <Phone size={14} />
                Contact Number
              </span>

              <span className="font-bold text-slate-800">
                {rider.phone || '-'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-400 font-semibold flex items-center gap-2">
                <Shield size={14} />
                License Number
              </span>

              <span className="font-mono font-bold text-slate-800">
                {rider.licenseNumber || '-'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-400 font-semibold flex items-center gap-2">
                <Truck size={14} />
                Plate Number
              </span>

              <span className="font-mono font-bold text-slate-800 uppercase">
                {rider.plateNumber || '-'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-400 font-semibold flex items-center gap-2">
                <Calendar size={14} />
                Applied On
              </span>

              <span className="font-bold text-slate-800">
                {formattedDate}
              </span>
            </div>
          </div>

          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-amber-700 font-black uppercase tracking-wider">
                KYC Status
              </p>

              <p className="text-xs font-bold text-slate-600 mt-0.5">
                Delivery partner verification pending
              </p>
            </div>

            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
              {rider.kycStatus || 'PENDING'}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleReject}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl border border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && action === 'reject' ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Application'
              )}
            </button>

            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && action === 'approve' ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve Rider'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}