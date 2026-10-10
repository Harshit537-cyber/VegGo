import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../Common/PageHeader';
import { Calendar, RefreshCw, Search, Filter, CheckCircle2, AlertCircle, Layers } from 'lucide-react';

export default function OrderStatus() {
  const [currentTab, setCurrentTab] = useState('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const orderStats = [
    { label: 'Active Shipments', value: '18 Batches', accent: 'bg-emerald-500' },
    { label: 'Pending Processing', value: '1,350 kg', accent: 'bg-amber-500' },
    { label: 'Completed Today', value: '12 Deliveries', accent: 'bg-sky-500' },
    { label: 'Delayed Units', value: '1 Alerted', accent: 'bg-rose-500' }
  ];

  const initialOrders = [
    { id: '#VGF-2918', client: 'Green Grocers Inc.', produce: 'Fresh Spinach', quantity: '1,200 kg', status: 'Shipped', temp: '4.1°C', destination: 'Chicago Hub' },
    { id: '#VGF-2917', client: 'Organic Harvest Co.', produce: 'Broccoli Heads', quantity: '850 kg', status: 'Processing', temp: '4.4°C', destination: 'Detroit Depot' },
    { id: '#VGF-2916', client: 'Super Foods Depot', produce: 'Sweet Potatoes', quantity: '3,400 kg', status: 'Shipped', temp: '6.0°C', destination: 'Austin Terminal' },
    { id: '#VGF-2915', client: 'Healthy Living Market', produce: 'Avocados', quantity: '500 kg', status: 'Delayed', temp: '8.2°C', destination: 'Miami Cold Center' },
    { id: '#VGF-2914', client: 'Nature Express Hub', produce: 'Red Tomatoes', quantity: '2,100 kg', status: 'Shipped', temp: '5.1°C', destination: 'Denver Hub' },
    { id: '#VGF-2913', client: 'Sunrise Co-op', produce: 'Sweet Corn', quantity: '1,500 kg', status: 'Processing', temp: '4.9°C', destination: 'Boston Center' }
  ];

  const filteredOrders = initialOrders.filter((order) => {
    const matchesSearch = order.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.produce.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-dvh bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-18 sm:pt-20 lg:pt-8 overflow-y-auto max-h-dvh space-y-6 sm:space-y-8">
        <PageHeader
          badge="Consignment Ledger"
          badgeIcon={Layers}
          title="Order Status Tracking"
          subtitle="Real-time shipment ledger, temperature compliance, and regional distribution hub telemetry."
        />

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {orderStats.map((stat, idx) => (
            <div key={idx} className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
              <div className={`absolute top-0 left-0 right-0 h-1 ${stat.accent}`} />
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">{stat.value}</h3>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-slate-400" />
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {['All', 'Shipped', 'Processing', 'Delayed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === status
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase font-black tracking-wider text-slate-400">
                  <th className="pb-4">Reference</th>
                  <th className="pb-4">Contract Name</th>
                  <th className="pb-4">Produce</th>
                  <th className="pb-4">Quantity</th>
                  <th className="pb-4">Destination</th>
                  <th className="pb-4 text-center">Batch Temp</th>
                  <th className="pb-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4.5 font-bold text-slate-900">{order.id}</td>
                    <td className="py-4.5">{order.client}</td>
                    <td className="py-4.5">{order.produce}</td>
                    <td className="py-4.5">{order.quantity}</td>
                    <td className="py-4.5">{order.destination}</td>
                    <td className="py-4.5 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        parseFloat(order.temp) > 7.0 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {order.temp}
                      </span>
                    </td>
                    <td className="py-4.5 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        order.status === 'Shipped' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/40' :
                        order.status === 'Processing' ? 'bg-amber-50 text-amber-600 border border-amber-200/40' :
                        'bg-rose-50 text-rose-600 border border-rose-200/40'
                      }`}>
                        {order.status === 'Shipped' && <CheckCircle2 size={12} />}
                        {order.status === 'Processing' && <Layers size={12} />}
                        {order.status === 'Delayed' && <AlertCircle size={12} />}
                        {order.status}
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