import React, { useState } from 'react';
import Sidebar from '../../../layouts/Sidebar';
import PageHeader from '../../../components/common/PageHeader';
import { Package, AlertCircle, CheckCircle2, Clock, Info, Bell } from 'lucide-react';

export default function Notifications() {
  const [currentTab, setCurrentTab] = useState('notifications');

  const notifications = [
    { id: 1, type: 'order', title: 'New Order Received', desc: 'Order #4521 has been placed by local wholesale agent.', time: '2m ago', icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 2, type: 'logistics', title: 'Temperature Alert', desc: 'Cold chain unit in Truck #9 exceeds safety limit.', time: '1h ago', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 3, type: 'delivery', title: 'Delivery Successful', desc: 'Order #4480 reached the regional distribution center.', time: '3h ago', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 4, type: 'system', title: 'Maintenance Notice', desc: 'System will undergo routine updates at 02:00 AM.', time: '5h ago', icon: Info, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="w-full min-h-dvh bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-dvh p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto space-y-6 sm:space-y-8">
        <PageHeader 
          badge="System Updates"
          badgeIcon={Bell}
          title="Activity Notifications"
          subtitle="Real-time operational alerts regarding supply chains, deliveries, and platform updates."
          onRefresh={() => window.location.reload()}
        />

        <section className="w-full max-w-full space-y-4">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              className="group bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm hover:shadow-md transition-all flex items-start gap-5"
            >
              <div className={`p-3 rounded-2xl ${n.bg} ${n.color} flex-shrink-0`}>
                <n.icon size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-bold text-slate-900 text-lg truncate">{n.title}</h3>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 flex-shrink-0 mt-1">
                    <Clock size={12} /> {n.time}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{n.desc}</p>
                
                <div className="mt-4 flex gap-4">
                  <button className="text-xs font-bold text-emerald-600 hover:underline">View Details</button>
                  <button className="text-xs font-bold text-slate-400 hover:text-slate-600">Dismiss</button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}