import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Calendar, RefreshCw, Users, UserCheck, UserX, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';

export default function ViewCustomers() {
  const [currentTab, setCurrentTab] = useState('view-customers');
  const [searchQuery, setSearchQuery] = useState('');

  const customerStats = [
    { label: 'Total Customers', value: '24,840', change: '+18.4%', up: true },
    { label: 'Active This Month', value: '18,290', change: '+10.2%', up: true },
    { label: 'Premium Subscribers', value: '4,120', change: '+15.5%', up: true },
    { label: 'Suspended Accounts', value: '84', change: '-4.1%', up: false }
  ];

  const customersList = [
    { id: 'CUST-84920', name: 'Alexander Wright', email: 'alexander.w@gmail.com', orders: '42 Orders', spent: '$1,840.50', status: 'Active', joined: 'Jan 12, 2025' },
    { id: 'CUST-84919', name: 'Beatrice Vance', email: 'b.vance@yahoo.com', orders: '28 Orders', spent: '$1,290.00', status: 'Active', joined: 'Feb 04, 2025' },
    { id: 'CUST-84918', name: 'Charlie Peterson', email: 'charliep@live.com', orders: '15 Orders', spent: '$610.20', status: 'Suspended', joined: 'Feb 19, 2025' },
    { id: 'CUST-84917', name: 'Diana Prince', email: 'diana.p@amazon.com', orders: '64 Orders', spent: '$3,120.40', status: 'Active', joined: 'Mar 01, 2025' },
    { id: 'CUST-84916', name: 'Ethan Hunt', email: 'ethan.h@imf.org', orders: '3 Orders', spent: '$94.00', status: 'Inactive', joined: 'Apr 11, 2025' },
    { id: 'CUST-84915', name: 'Fiona Gallagher', email: 'fiona.g@southside.com', orders: '37 Orders', spent: '$1,110.10', status: 'Active', joined: 'May 20, 2025' }
  ];

  const filteredCustomers = customersList.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/60">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              User Directory Operations
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Customer Base</h1>
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

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {customerStats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-3">{stat.value}</h3>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className={`flex items-center gap-1 text-sm font-bold ${stat.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stat.up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {stat.change}
                </span>
                <span className="text-xs text-slate-400 font-medium">Monthly Progress</span>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-xl font-bold text-slate-900">Registered Customer Ledger</h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by ID, name, email..."
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
                  <th className="pb-4">Customer ID</th>
                  <th className="pb-4">Profile Details</th>
                  <th className="pb-4">Completed Purchases</th>
                  <th className="pb-4">Lifetime Outlay</th>
                  <th className="pb-4">Registration Date</th>
                  <th className="pb-4 text-right">Account State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer, idx) => (
                  <tr key={idx} className="text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4.5 font-mono text-xs font-semibold text-slate-400">{customer.id}</td>
                    <td className="py-4.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{customer.name}</span>
                        <span className="text-xs text-slate-400 font-normal">{customer.email}</span>
                      </div>
                    </td>
                    <td className="py-4.5 font-mono text-slate-600">{customer.orders}</td>
                    <td className="py-4.5 font-mono text-slate-900 font-bold">{customer.spent}</td>
                    <td className="py-4.5 text-xs text-slate-400 font-normal">{customer.joined}</td>
                    <td className="py-4.5 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        customer.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/40' :
                        customer.status === 'Inactive' ? 'bg-slate-100 text-slate-600 border border-slate-200/40' :
                        'bg-rose-50 text-rose-600 border border-rose-200/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          customer.status === 'Active' ? 'bg-emerald-500' :
                          customer.status === 'Inactive' ? 'bg-slate-500' :
                          'bg-rose-500'
                        }`} />
                        {customer.status}
                      </span>
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