import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Calendar, RefreshCw, Send, Tag, Percent, BarChart, ArrowUpRight, Megaphone } from 'lucide-react';

export default function PromotionalNotifications() {
  const [currentTab, setCurrentTab] = useState('promotional-notifications');
  const [campaignName, setCampaignName] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [targetSegment, setTargetSegment] = useState('all');

  const [campaignHistory, setCampaignHistory] = useState([
    { id: 'PROM-903', name: 'Weekend Harvest Sale', code: 'HARVEST20', segment: 'All Customers', conversions: '1,420', revenue: '$18,450.00', status: 'Active' },
    { id: 'PROM-902', name: 'Free Midweek Delivery', code: 'FREECOMMUTE', segment: 'Lapsed Buyers', conversions: '610', revenue: '$9,120.00', status: 'Active' },
    { id: 'PROM-901', name: 'Premium Avocado Premium Restock', code: 'AVOCADO15', segment: 'Premium Members', conversions: '942', revenue: '$14,210.40', status: 'Expired' }
  ]);

  const promotionalStats = [
    { label: 'Active Promotions', value: '2 Running', change: '+100%', up: true },
    { label: 'Avg Promotion Conversion', value: '14.82%', change: '+2.4%', up: true },
    { label: 'Promo-Driven Revenue', value: '$41,780.40', change: '+18.6%', up: true }
  ];

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!campaignName || !promoCode) return;

    const newCampaign = {
      id: `PROM-${campaignHistory.length + 901}`,
      name: campaignName,
      code: promoCode.toUpperCase(),
      segment: targetSegment === 'all' ? 'All Customers' : targetSegment === 'premium' ? 'Premium Members' : 'Lapsed Buyers',
      conversions: '0',
      revenue: '$0.00',
      status: 'Active'
    };

    setCampaignHistory([newCampaign, ...campaignHistory]);
    setCampaignName('');
    setPromoCode('');
    setDiscountValue('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/60">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Marketing & Growth Core
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Promotional Campaigns</h1>
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
          {promotionalStats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-3">{stat.value}</h3>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className={`flex items-center gap-1 text-sm font-bold ${stat.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <ArrowUpRight size={16} />
                  {stat.change}
                </span>
                <span className="text-xs text-slate-400 font-medium">Campaign Performance</span>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-1 bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Dispatch Promotional Alert</h2>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Target Audience Segment</label>
                <select
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-700 transition-all"
                >
                  <option value="all">Segment - All Registered Customers</option>
                  <option value="premium">Segment - Premium Subscribed Users</option>
                  <option value="lapsed">Segment - Lapsed Dormant Buyers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g., Seasonal Greens Discount"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-700 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Promo Code</label>
                  <input
                    type="text"
                    placeholder="e.g., GREENS20"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-700 transition-all font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Benefit Value</label>
                  <input
                    type="text"
                    placeholder="e.g., 20% Off / Free Delivery"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-700 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/10 transition-all duration-200"
              >
                <Send size={16} />
                Broadcast Promotional Campaign
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Dispatched Marketing History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase font-black tracking-wider text-slate-400">
                    <th className="pb-4">Campaign Name</th>
                    <th className="pb-4">Voucher Code</th>
                    <th className="pb-4">Segment Target</th>
                    <th className="pb-4">Total Redemptions</th>
                    <th className="pb-4">Revenue Generated</th>
                    <th className="pb-4 text-right">Operational State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaignHistory.map((camp) => (
                    <tr key={camp.id} className="text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4.5 font-bold text-slate-900 flex items-center gap-2">
                        <Megaphone size={16} className="text-emerald-500" />
                        {camp.name}
                      </td>
                      <td className="py-4.5 font-mono text-xs font-bold text-slate-600">{camp.code}</td>
                      <td className="py-4.5 text-slate-500">{camp.segment}</td>
                      <td className="py-4.5 font-mono text-slate-900">{camp.conversions}</td>
                      <td className="py-4.5 font-mono text-emerald-600 font-bold">{camp.revenue}</td>
                      <td className="py-4.5 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          camp.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/40' :
                          'bg-slate-100 text-slate-600 border border-slate-200/40'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${camp.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                          {camp.status}
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