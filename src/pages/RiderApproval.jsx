import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Calendar, RefreshCw, Check, X, Truck, Clock, Eye, ShieldCheck } from 'lucide-react';

export default function RiderApproval() {
  const [currentTab, setCurrentTab] = useState('rider-approval');

  const [applicants, setApplicants] = useState([
    { id: 'RDR-4091', name: 'Marcus Sterling', city: 'North Sector', vehicle: 'Electric Bike', date: 'Oct 10, 2026', status: 'Pending' },
    { id: 'RDR-4092', name: 'Elena Rostova', city: 'West Downtown', vehicle: 'Refrigerated Van', date: 'Oct 11, 2026', status: 'Pending' },
    { id: 'RDR-4093', name: 'James Cooper', city: 'Central Hub', vehicle: 'Motorcycle', date: 'Oct 11, 2026', status: 'Pending' },
    { id: 'RDR-4094', name: 'Sarah Jenkins', city: 'East Valley', vehicle: 'Electric Bike', date: 'Oct 12, 2026', status: 'Pending' }
  ]);

  const handleAction = (id) => {
    setApplicants(prev => prev.filter(rider => rider.id !== id));
  };

  const pendingCount = applicants.length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/60">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Logistics Fleet Onboarding
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Rider Approvals</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm text-sm font-semibold text-slate-600">
              <Calendar size={18} className="text-slate-400" />
              <span>Oct 12, 2026</span>
            </div>
            <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Awaiting Verification</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{pendingCount} Applicants</h3>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-600">
              <Clock size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Riders Activated Today</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">34 Couriers</h3>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
              <Truck size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Background Pass Rate</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">98.2% Passing</h3>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
              <ShieldCheck size={24} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">Pending Logistics Onboarding Registry</h2>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">Queue Depth: {pendingCount}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase font-black tracking-wider text-slate-400">
                  <th className="pb-4">Applicant Driver</th>
                  <th className="pb-4">Applicant ID</th>
                  <th className="pb-4">Primary Region</th>
                  <th className="pb-4">Vehicle Category</th>
                  <th className="pb-4">Application Date</th>
                  <th className="pb-4 text-right">Verification Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicants.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 font-semibold">
                      No pending rider registrations remaining.
                    </td>
                  </tr>
                ) : (
                  applicants.map((rider) => (
                    <tr key={rider.id} className="text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4.5 font-bold text-slate-900">{rider.name}</td>
                      <td className="py-4.5 font-mono text-xs font-semibold text-slate-400">{rider.id}</td>
                      <td className="py-4.5 text-slate-500">{rider.city}</td>
                      <td className="py-4.5">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          {rider.vehicle}
                        </span>
                      </td>
                      <td className="py-4.5 text-xs text-slate-400 font-normal">{rider.date}</td>
                      <td className="py-4.5 text-right space-x-2">
                        <button className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleAction(rider.id)}
                          className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-600 border border-emerald-200/50 transition-colors"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleAction(rider.id)}
                          className="inline-flex items-center justify-center p-2 rounded-xl bg-rose-50 hover:bg-rose-100/80 text-rose-600 border border-rose-200/50 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}