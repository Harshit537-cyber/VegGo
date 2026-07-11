import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Calendar, RefreshCw, ShoppingCart, Clock, CheckCircle, AlertTriangle, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export default function OrderStatistics() {
  const [currentTab, setCurrentTab] = useState('order-statistics');

  const orderStats = [
    { label: 'Total Placed Orders', value: '14,820', change: '+12.4%', up: true },
    { label: 'Pending Processing', value: '312', change: '-4.8%', up: false },
    { label: 'In-Transit / Shipped', value: '840', change: '+8.2%', up: true },
    { label: 'Fulfilled Orders', value: '13,668', change: '+14.5%', up: true }
  ];

  const orderBreakdown = [
    { category: 'Organic Vegetables', count: '6,240 Orders', portion: '42.1%', health: 'High' },
    { category: 'Fresh Fruits', count: '4,150 Orders', portion: '28.0%', health: 'High' },
    { category: 'Wholesale Bundles', count: '2,960 Orders', portion: '20.0%', health: 'Moderate' },
    { category: 'Exotic Greens', count: '1,470 Orders', portion: '9.9%', health: 'Low' }
  ];

  const recentOrdersLog = [
    { id: 'ORD-99120', customer: 'Sarah Jenkins', items: 'Baby Spinach, Red Tomatoes', amount: '$42.30', status: 'In-Transit', time: '12 mins ago' },
    { id: 'ORD-99119', customer: 'Metro Grocers Corp', items: 'Broccoli Wholesale (40kg)', amount: '$136.00', status: 'Delivered', time: '24 mins ago' },
    { id: 'ORD-99118', customer: 'David Miller', items: 'Avocados, Baby Carrots', amount: '$28.90', status: 'Processing', time: '40 mins ago' },
    { id: 'ORD-99117', customer: 'Harbor Greens Market', items: 'Sweet Potatoes (100kg)', amount: '$115.00', status: 'Delivered', time: '1 hr ago' },
    { id: 'ORD-99116', customer: 'Elena Rostova', items: 'Fresh Spinach, Strawberries', amount: '$19.50', status: 'Failed', time: '2 hrs ago' },
    { id: 'ORD-99115', customer: 'James Cooper', items: 'Organic Lettuce, Broccolini', amount: '$31.20', status: 'Processing', time: '2 hrs ago' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/60">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Real-time Order Operations
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Order Statistics</h1>
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
          {orderStats.map((stat, idx) => (
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
                <span className="text-xs text-slate-400 font-medium">Daily Dynamics</span>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-1 bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-6">Category Distribution</h2>
              <div className="space-y-4">
                {orderBreakdown.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">{item.category}</span>
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">{item.portion}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-sm text-slate-500">{item.count}</span>
                      <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                        item.health === 'High' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        item.health === 'Moderate' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {item.health} Demand
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">Recent Order Activity Ledger</h2>
              <span className="text-sm font-semibold text-emerald-600 hover:underline cursor-pointer">View All Orders</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase font-black tracking-wider text-slate-400">
                    <th className="pb-4">Order ID</th>
                    <th className="pb-4">Customer</th>
                    <th className="pb-4">Items Summary</th>
                    <th className="pb-4">Total Amount</th>
                    <th className="pb-4">Timestamp</th>
                    <th className="pb-4 text-right">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrdersLog.map((order, idx) => (
                    <tr key={idx} className="text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4.5 font-mono text-xs font-semibold text-slate-400">{order.id}</td>
                      <td className="py-4.5 font-bold text-slate-900">{order.customer}</td>
                      <td className="py-4.5 max-w-[180px] truncate">{order.items}</td>
                      <td className="py-4.5 font-mono text-slate-900 font-bold">{order.amount}</td>
                      <td className="py-4.5 text-xs text-slate-400 font-normal">{order.time}</td>
                      <td className="py-4.5 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/40' :
                          order.status === 'Processing' ? 'bg-blue-50 text-blue-600 border border-blue-200/40' :
                          order.status === 'In-Transit' ? 'bg-amber-50 text-amber-600 border border-amber-200/40' :
                          'bg-rose-50 text-rose-600 border border-rose-200/40'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            order.status === 'Delivered' ? 'bg-emerald-500' :
                            order.status === 'Processing' ? 'bg-blue-500' :
                            order.status === 'In-Transit' ? 'bg-amber-500' :
                            'bg-rose-500'
                          }`} />
                          {order.status}
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