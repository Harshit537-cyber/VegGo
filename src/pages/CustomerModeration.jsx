import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Calendar, RefreshCw, ShieldAlert, UserCheck, UserX, Search, ShieldCheck } from 'lucide-react';

export default function CustomerModeration() {
  const [currentTab, setCurrentTab] = useState('block-unblock');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [accounts, setAccounts] = useState([
    { id: 'CUST-84920', name: 'Alexander Wright', email: 'alexander.w@gmail.com', flags: 0, reason: 'None', status: 'Active' },
    { id: 'CUST-84919', name: 'Beatrice Vance', email: 'b.vance@yahoo.com', flags: 3, reason: 'Multiple payment failures', status: 'Active' },
    { id: 'CUST-84918', name: 'Charlie Peterson', email: 'charliep@live.com', flags: 8, reason: 'Repeated cancellation abuse', status: 'Blocked' },
    { id: 'CUST-84917', name: 'Diana Prince', email: 'diana.p@amazon.com', flags: 1, reason: 'Suspicious location change', status: 'Active' },
    { id: 'CUST-84916', name: 'Ethan Hunt', email: 'ethan.h@imf.org', flags: 12, reason: 'Promo code manipulation', status: 'Blocked' },
    { id: 'CUST-84915', name: 'Fiona Gallagher', email: 'fiona.g@southside.com', flags: 0, reason: 'None', status: 'Active' }
  ]);

  const toggleAccountStatus = (id) => {
    setAccounts(prev => prev.map(account => {
      if (account.id === id) {
        const nextStatus = account.status === 'Active' ? 'Blocked' : 'Active';
        return { 
          ...account, 
          status: nextStatus,
          flags: nextStatus === 'Active' ? 0 : account.flags
        };
      }
      return account;
    }));
  };

  const activeCount = accounts.filter(a => a.status === 'Active').length;
  const blockedCount = accounts.filter(a => a.status === 'Blocked').length;
  const flaggedCount = accounts.filter(a => a.flags > 0 && a.status === 'Active').length;

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/60">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Security & Policy Enforcement
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Moderation Center</h1>
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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unrestricted Users</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{activeCount} Accounts</h3>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
              <UserCheck size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suspended / Blocked</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{blockedCount} Accounts</h3>
            </div>
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600">
              <UserX size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flagged Warnings</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{flaggedCount} Active</h3>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-600">
              <ShieldAlert size={24} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-xl font-bold text-slate-900">User Moderation Ledger</h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase font-black tracking-wider text-slate-400">
                  <th className="pb-4">Customer Details</th>
                  <th className="pb-4">Account ID</th>
                  <th className="pb-4">Flags Raised</th>
                  <th className="pb-4">Primary Infraction</th>
                  <th className="pb-4">Account State</th>
                  <th className="pb-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{account.name}</span>
                        <span className="text-xs text-slate-400 font-normal">{account.email}</span>
                      </div>
                    </td>
                    <td className="py-4.5 font-mono text-xs font-semibold text-slate-400">{account.id}</td>
                    <td className="py-4.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        account.flags >= 5 ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        account.flags > 0 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {account.flags} Flags
                      </span>
                    </td>
                    <td className="py-4.5 text-slate-500 font-normal">{account.reason}</td>
                    <td className="py-4.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        account.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/40' :
                        'bg-rose-50 text-rose-600 border border-rose-200/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${account.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {account.status}
                      </span>
                    </td>
                    <td className="py-4.5 text-right">
                      <button
                        onClick={() => toggleAccountStatus(account.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          account.status === 'Active'
                            ? 'bg-rose-50 hover:bg-rose-100/80 text-rose-600 border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-600 border-emerald-200'
                        }`}
                      >
                        {account.status === 'Active' ? <UserX size={14} /> : <ShieldCheck size={14} />}
                        {account.status === 'Active' ? 'Block Account' : 'Restore Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}