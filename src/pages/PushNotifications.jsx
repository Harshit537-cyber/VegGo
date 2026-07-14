import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Calendar, RefreshCw, Send, Bell, Smartphone, Users, ChevronRight } from 'lucide-react';

export default function PushNotifications() {
  const [currentTab, setCurrentTab] = useState('push-notifications');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');

  const [notificationHistory, setNotificationHistory] = useState([
    { id: 'PUSH-102', title: 'System Maintenance Window', audience: 'All Users', sentTime: 'Oct 11, 2026, 11:30 PM', status: 'Delivered', reach: '18,240' },
    { id: 'PUSH-101', title: 'Fresh Arrival: Baby Spinach!', audience: 'Customers Only', sentTime: 'Oct 10, 2026, 09:00 AM', status: 'Delivered', reach: '14,100' },
    { id: 'PUSH-100', title: 'Weekly Payout Cleared', audience: 'Vendors Only', sentTime: 'Oct 09, 2026, 04:15 PM', status: 'Delivered', reach: '1,248' },
    { id: 'PUSH-099', title: 'High Demand Peak Hours Alert', audience: 'Riders Only', sentTime: 'Oct 08, 2026, 11:00 AM', status: 'Delivered', reach: '840' }
  ]);

  const stats = [
    { label: 'Active Devices Registered', value: '20,428', icon: Smartphone, bg: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
    { label: 'Avg Delivery Rate', value: '99.8%', icon: Bell, bg: 'bg-indigo-50 text-indigo-600 border border-indigo-100' },
    { label: 'Avg Interactive Open Rate', value: '42.3%', icon: Users, bg: 'bg-amber-50 text-amber-600 border border-amber-100' }
  ];

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!title || !body) return;

    const newPush = {
      id: `PUSH-${notificationHistory.length + 100}`,
      title,
      audience: audience === 'all' ? 'All Users' : audience.charAt(0).toUpperCase() + audience.slice(1) + ' Only',
      sentTime: 'Just Now',
      status: 'Delivered',
      reach: audience === 'all' ? '20,428' : audience === 'customers' ? '14,100' : audience === 'vendors' ? '1,248' : '840'
    };

    setNotificationHistory([newPush, ...notificationHistory]);
    setTitle('');
    setBody('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/60">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Real-time System Broadcasts
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Push Notifications</h1>
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
          {stats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">{stat.value}</h3>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg}`}>
                  <IconComponent size={24} />
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-1 bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Dispatch Broadcast</h2>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Target Demographic</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-700 transition-all"
                >
                  <option value="all">Broadcast - All Users</option>
                  <option value="customers">Customers Directory Only</option>
                  <option value="vendors">Vendor Directory Only</option>
                  <option value="riders">Logistics Directory Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Notification Title</label>
                <input
                  type="text"
                  placeholder="e.g., Seasonal Sales Event"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-700 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Body Message Content</label>
                <textarea
                  rows="4"
                  placeholder="Enter message text description..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-700 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/10 transition-all duration-200"
              >
                <Send size={16} />
                Broadcast Push
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Broadcast Log</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase font-black tracking-wider text-slate-400">
                    <th className="pb-4">Transmission ID</th>
                    <th className="pb-4">Title Heading</th>
                    <th className="pb-4">Target Audience</th>
                    <th className="pb-4">Active Reach</th>
                    <th className="pb-4">Broadcast Time</th>
                    <th className="pb-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notificationHistory.map((item) => (
                    <tr key={item.id} className="text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4.5 font-mono text-xs font-semibold text-slate-400">{item.id}</td>
                      <td className="py-4.5 font-bold text-slate-900">{item.title}</td>
                      <td className="py-4.5 text-slate-500">{item.audience}</td>
                      <td className="py-4.5 font-mono text-xs text-slate-600">{item.reach} devices</td>
                      <td className="py-4.5 text-xs text-slate-400">{item.sentTime}</td>
                      <td className="py-4.5 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {item.status}
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