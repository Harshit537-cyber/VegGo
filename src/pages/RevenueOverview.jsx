import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Calendar, RefreshCw, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Percent } from 'lucide-react';

export default function RevenueOverview() {
  const [currentTab, setCurrentTab] = useState('revenue-overview');

  const revenueStats = [
    { label: 'Total Gross Revenue', value: '$148,290.45', change: '+18.4%', up: true },
    { label: 'Average Order Value', value: '$42.50', change: '+3.1%', up: true },
    { label: 'Vendor Commissions', value: '$22,243.80', change: '+12.7%', up: true },
    { label: 'Platform Platform Fees', value: '$8,140.20', change: '-1.2%', up: false }
  ];

  const revenueStreams = [
    { source: 'Direct B2C Orders', amount: '$94,500.00', share: '63.7%', status: 'Active', trendUp: true },
    { source: 'Wholesale Group Buys', amount: '$31,240.45', share: '21.1%', status: 'Growing', trendUp: true },
    { source: 'Vendor Subscription plans', amount: '$14,410.00', share: '9.7%', status: 'Stable', trendUp: false },
    { source: 'Delivery Surcharge', amount: '$8,140.00', share: '5.5%', status: 'Declined', trendUp: false }
  ];

  const recentPayouts = [
    { id: 'PAY-89302', vendor: 'Organic Valley Farms', amount: '$12,480.00', commission: '12%', netRevenue: '$1,497.60', status: 'Completed' },
    { id: 'PAY-89303', vendor: 'Greenhouse Co-op', amount: '$8,320.50', commission: '10%', netRevenue: '$832.05', status: 'Completed' },
    { id: 'PAY-89304', vendor: 'Sunshine Orchards', amount: '$15,100.00', commission: '12%', netRevenue: '$1,812.00', status: 'Processing' },
    { id: 'PAY-89305', vendor: 'Purely Plants Co.', amount: '$4,890.00', commission: '8%', netRevenue: '$391.20', status: 'Completed' },
    { id: 'PAY-89306', vendor: 'Evergreen Hydroponics', amount: '$9,150.00', commission: '12%', netRevenue: '$1,098.00', status: 'Completed' },
    { id: 'PAY-89307', vendor: 'Valley Herbals LLC', amount: '$3,410.00', commission: '10%', netRevenue: '$341.00', status: 'Processing' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/60">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Financial Performance Dashboard
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Revenue Overview</h1>
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
          {revenueStats.map((stat, idx) => (
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
                <span className="text-xs text-slate-400 font-medium">Monthly Period</span>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-1 bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-6">Revenue Breakdown</h2>
              <div className="space-y-4">
                {revenueStreams.map((stream, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">{stream.source}</span>
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">{stream.share}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="font-mono text-sm font-bold text-slate-900">{stream.amount}</span>
                      <span className={`flex items-center gap-0.5 text-xs font-bold ${stream.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {stream.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {stream.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">Recent Vendor Settlements</h2>
              <span className="text-sm font-semibold text-emerald-600 hover:underline cursor-pointer">Export Transactions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase font-black tracking-wider text-slate-400">
                    <th className="pb-4">Transaction ID</th>
                    <th className="pb-4">Vendor Partner</th>
                    <th className="pb-4">Gross Vol</th>
                    <th className="pb-4">Fee Rate</th>
                    <th className="pb-4">Net Revenue</th>
                    <th className="pb-4 text-right">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPayouts.map((payout, idx) => (
                    <tr key={idx} className="text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4.5 font-mono text-xs font-semibold text-slate-400">{payout.id}</td>
                      <td className="py-4.5 font-bold text-slate-900">{payout.vendor}</td>
                      <td className="py-4.5 font-mono text-slate-900">{payout.amount}</td>
                      <td className="py-4.5 font-mono">{payout.commission}</td>
                      <td className="py-4.5 font-mono text-emerald-600 font-bold">{payout.netRevenue}</td>
                      <td className="py-4.5 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          payout.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/40'
                            : 'bg-amber-50 text-amber-600 border border-amber-200/40'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${payout.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}