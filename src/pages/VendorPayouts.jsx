import React, { useState } from 'react';
import { Wallet, ArrowUpRight, CheckCircle2, Clock, AlertCircle, Search, Filter } from 'lucide-react';

function VendorPayouts() {
  const [searchTerm, setSearchTerm] = useState('');

  const payoutsData = [
    {
      id: 'PAY-10029',
      vendor: 'Fresh Organic Mart',
      owner: 'Ramesh Kumar',
      amount: '₹14,250',
      bankAcc: '•••• 4829 (HDFC)',
      requestedDate: '24 May 2024',
      status: 'Pending'
    },
    {
      id: 'PAY-10028',
      vendor: 'Green Valley Veggies',
      owner: 'Suresh Patel',
      amount: '₹28,900',
      bankAcc: '•••• 1102 (ICICI)',
      requestedDate: '23 May 2024',
      status: 'Completed'
    },
    {
      id: 'PAY-10027',
      vendor: 'Farm Fresh Hub',
      owner: 'Anil Sharma',
      amount: '₹8,400',
      bankAcc: '•••• 9032 (SBI)',
      requestedDate: '22 May 2024',
      status: 'Processing'
    }
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-900 min-h-screen text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Vendor Payouts & Settlements</h1>
          <p className="text-xs text-emerald-400/80 font-medium mt-1">
            Manage vendor withdrawal requests and automated payouts.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all text-xs">
          <ArrowUpRight size={16} /> Process Bulk Payout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Pending Requests</p>
            <h3 className="text-2xl font-black text-white mt-1">₹42,650</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Clock size={22} />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Processed Today</p>
            <h3 className="text-2xl font-black text-white mt-1">₹1,28,900</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Platform Commission Earned</p>
            <h3 className="text-2xl font-black text-white mt-1">₹18,400</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <Wallet size={22} />
          </div>
        </div>
      </div>

      <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by vendor name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-900/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 text-xs font-semibold text-slate-300 transition-all">
            <Filter size={14} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4">Payout ID</th>
                <th className="py-4 px-4">Vendor Details</th>
                <th className="py-4 px-4">Amount</th>
                <th className="py-4 px-4">Bank Account</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-xs">
              {payoutsData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-all">
                  <td className="py-4 px-4 font-bold text-emerald-400">{item.id}</td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-white">{item.vendor}</p>
                    <p className="text-[10px] text-slate-400">{item.owner}</p>
                  </td>
                  <td className="py-4 px-4 font-black text-white">{item.amount}</td>
                  <td className="py-4 px-4 text-slate-300 font-mono">{item.bankAcc}</td>
                  <td className="py-4 px-4 text-slate-400">{item.requestedDate}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        item.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : item.status === 'Processing'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {item.status === 'Pending' ? (
                      <button className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-[11px] transition-all">
                        Approve
                      </button>
                    ) : (
                      <button className="px-3 py-1.5 bg-slate-700 text-slate-300 font-semibold rounded-xl text-[11px] hover:bg-slate-600 transition-all">
                        View Log
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default VendorPayouts;