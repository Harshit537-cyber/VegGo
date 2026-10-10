
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../Common/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Calendar,
  RefreshCw,
  Send,
  Tag,
  Percent,
  BarChart3,
  ArrowUpRight,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  ShieldCheck,
  Users,
  TicketPercent,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function PromotionalNotifications() {
  const [currentTab, setCurrentTab] = useState('promotional-notifications');

  const [campaignName, setCampaignName] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [targetSegment, setTargetSegment] = useState('all');
  const [showNotification, setShowNotification] = useState(false);

  const [campaignHistory, setCampaignHistory] = useState([
    {
      id: 'PROM-903',
      name: 'Weekend Harvest Sale',
      code: 'HARVEST20',
      segment: 'All Customers',
      conversions: '1,420',
      revenue: '$18,450.00',
      status: 'Active'
    },
    {
      id: 'PROM-902',
      name: 'Free Midweek Delivery',
      code: 'FREECOMMUTE',
      segment: 'Lapsed Buyers',
      conversions: '610',
      revenue: '$9,120.00',
      status: 'Active'
    },
    {
      id: 'PROM-901',
      name: 'Premium Avocado Premium Restock',
      code: 'AVOCADO15',
      segment: 'Premium Members',
      conversions: '942',
      revenue: '$14,210.40',
      status: 'Expired'
    }
  ]);

  const promotionalStats = [
    {
      label: 'Active Promotions',
      value: '2 Running',
      change: '+100%',
      sub: 'Campaign Performance',
      icon: Megaphone,
      accent: 'emerald'
    },
    {
      label: 'Avg Promotion Conversion',
      value: '14.82%',
      change: '+2.4%',
      sub: 'Conversion Growth',
      icon: Percent,
      accent: 'teal'
    },
    {
      label: 'Promo-Driven Revenue',
      value: '$41,780.40',
      change: '+18.6%',
      sub: 'Revenue Performance',
      icon: TrendingUp,
      accent: 'green'
    },
    {
      label: 'Total Redemptions',
      value: '2,972',
      change: '+12.8%',
      sub: 'Voucher Activity',
      icon: TicketPercent,
      accent: 'emerald'
    }
  ];

  const getSegmentName = () => {
    if (targetSegment === 'all') return 'All Customers';
    if (targetSegment === 'premium') return 'Premium Members';
    return 'Lapsed Buyers';
  };

  const handleCreateCampaign = (e) => {
    e.preventDefault();

    if (!campaignName.trim() || !promoCode.trim()) return;

    const newCampaign = {
      id: `PROM-${campaignHistory.length + 901}`,
      name: campaignName.trim(),
      code: promoCode.trim().toUpperCase(),
      segment: getSegmentName(),
      conversions: '0',
      revenue: '$0.00',
      status: 'Active'
    };

    setCampaignHistory([newCampaign, ...campaignHistory]);

    setCampaignName('');
    setPromoCode('');
    setDiscountValue('');

    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const getStatStyles = (accent) => {
    if (accent === 'teal') {
      return {
        bar: 'bg-teal-600',
        icon: 'bg-teal-50 text-teal-700',
        badge: 'bg-teal-50 text-teal-700 border-teal-200'
      };
    }

    if (accent === 'green') {
      return {
        bar: 'bg-green-700',
        icon: 'bg-green-50 text-green-700',
        badge: 'bg-green-50 text-green-700 border-green-200'
      };
    }

    return {
      bar: 'bg-emerald-600',
      icon: 'bg-emerald-50 text-emerald-700',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
  };

  return (
    <div className="min-h-dvh bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">

      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-18 sm:pt-20 lg:pt-8 overflow-y-auto max-h-dvh w-full space-y-6 sm:space-y-8 relative">

        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{
                opacity: 0,
                y: -20,
                x: 20
              }}
              animate={{
                opacity: 1,
                y: 0,
                x: 0
              }}
              exit={{
                opacity: 0,
                y: -20,
                x: 20
              }}
              className="fixed top-6 right-6 z-[100] flex items-center gap-3 bg-emerald-950 text-white px-5 py-4 rounded-2xl shadow-2xl border border-emerald-800"
            >
              <div className="p-1.5 rounded-full bg-emerald-500/20">
                <CheckCircle2
                  size={17}
                  className="text-emerald-400"
                />
              </div>

              <span className="text-xs font-bold">
                Promotional campaign created successfully
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modern Executive Header */}
        <PageHeader 
          badge="Marketing & Growth"
          badgeIcon={TicketPercent}
          title="Promotional Campaigns"
          subtitle="Configure marketing campaigns, coupon vouchers, target segments, and measure conversion."
          onRefresh={() => window.location.reload()}
        />

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

          {promotionalStats.map((stat, index) => {
            const IconComponent = stat.icon;
            const styles = getStatStyles(stat.accent);

            return (
              <motion.div
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1
                }}
                whileHover={{
                  y: -6
                }}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden group"
              >

                <div className={`absolute top-0 left-0 right-0 h-1.5 ${styles.bar} group-hover:h-2 transition-all`} />

                <div className="flex items-center justify-between mb-5">

                  <span className="text-[11px] font-semibold text-black uppercase tracking-wider">
                    {stat.label}
                  </span>

                  <div className={`p-2.5 rounded-2xl ${styles.icon}`}>
                    <IconComponent size={18} />
                  </div>

                </div>

                <h3 className="text-3xl font-semibold text-black tracking-tight font-mono">
                  {stat.value}
                </h3>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">

                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${styles.badge}`}>

                    <ArrowUpRight size={12} />

                    {stat.change}

                  </span>

                  <span className="text-[10px] text-black font-semibold">
                    {stat.sub}
                  </span>

                </div>

              </motion.div>
            );
          })}

        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          <motion.section
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.5,
              delay: 0.3
            }}
            className="lg:col-span-1 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
          >

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <Megaphone size={18} />
                </div>

                <div>

                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Promotional Dispatch
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Create a targeted campaign
                  </p>

                </div>

              </div>

              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <ShieldCheck size={12} />
                SECURED
              </span>

            </div>

            <form
              onSubmit={handleCreateCampaign}
              className="space-y-5"
            >

              <div className="space-y-2">

                <label className="text-[11px] font-bold text-black uppercase tracking-wider flex items-center gap-2">

                  <Users
                    size={14}
                    className="text-emerald-600"
                  />

                  Target Audience Segment

                </label>

                <select
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                >
                  <option value="all">
                    Segment - All Registered Customers
                  </option>

                  <option value="premium">
                    Segment - Premium Subscribed Users
                  </option>

                  <option value="lapsed">
                    Segment - Lapsed Dormant Buyers
                  </option>
                </select>

              </div>

              <div className="space-y-2">

                <label className="text-[11px] font-bold text-black uppercase tracking-wider flex items-center gap-2">

                  <Megaphone
                    size={14}
                    className="text-emerald-600"
                  />

                  Campaign Name

                </label>

                <input
                  type="text"
                  placeholder="e.g., Seasonal Greens Discount"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="space-y-2">

                  <label className="text-[11px] font-bold text-black uppercase tracking-wider flex items-center gap-2">

                    <Tag
                      size={14}
                      className="text-emerald-600"
                    />

                    Promo Code

                  </label>

                  <input
                    type="text"
                    placeholder="e.g., GREENS20"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono uppercase"
                  />

                </div>

                <div className="space-y-2">

                  <label className="text-[11px] font-bold text-black uppercase tracking-wider flex items-center gap-2">

                    <Percent
                      size={14}
                      className="text-emerald-600"
                    />

                    Benefit Value

                  </label>

                  <input
                    type="text"
                    placeholder="e.g., 20% Off"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />

                </div>

              </div>

              <motion.button
                whileHover={{
                  y: -2
                }}
                whileTap={{
                  scale: 0.98
                }}
                type="submit"
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all duration-300"
              >

                <Send size={16} />

                Broadcast Promotional Campaign

              </motion.button>

            </form>

          </motion.section>

          <motion.section
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.5,
              delay: 0.4
            }}
            className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
          >

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <BarChart3 size={18} />
                </div>

                <div>

                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Marketing Campaign History
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Monitor promotional campaign performance
                  </p>

                </div>

              </div>

              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <Activity size={12} />
                LIVE
              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-left border-collapse min-w-[850px]">

                <thead>

                  <tr className="border-b border-slate-100 text-[10px] uppercase font-black tracking-wider text-slate-400">

                    <th className="pb-4">
                      Campaign Name
                    </th>

                    <th className="pb-4">
                      Voucher Code
                    </th>

                    <th className="pb-4">
                      Segment Target
                    </th>

                    <th className="pb-4">
                      Redemptions
                    </th>

                    <th className="pb-4">
                      Revenue Generated
                    </th>

                    <th className="pb-4 text-right">
                      Operational State
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {campaignHistory.map((camp, index) => (

                    <motion.tr
                      key={camp.id}
                      initial={{
                        opacity: 0,
                        x: 10
                      }}
                      animate={{
                        opacity: 1,
                        x: 0
                      }}
                      transition={{
                        delay: index * 0.05
                      }}
                      className="text-xs font-medium text-slate-700 hover:bg-emerald-50/30 transition-colors"
                    >

                      <td className="py-4">

                        <div className="flex items-center gap-2">

                          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">

                            <Megaphone
                              size={14}
                              className="text-emerald-600"
                            />

                          </div>

                          <div>

                            <p className="font-bold text-black">
                              {camp.name}
                            </p>

                            <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                              {camp.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="py-4">

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-bold font-mono text-slate-700">

                          <Tag size={11} className="text-emerald-600" />

                          {camp.code}

                        </span>

                      </td>

                      <td className="py-4 text-slate-500 font-semibold">
                        {camp.segment}
                      </td>

                      <td className="py-4 font-mono font-bold text-black">
                        {camp.conversions}
                      </td>

                      <td className="py-4 font-mono text-emerald-700 font-bold">
                        {camp.revenue}
                      </td>

                      <td className="py-4 text-right">

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold ${
                            camp.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >

                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              camp.status === 'Active'
                                ? 'bg-emerald-500'
                                : 'bg-slate-500'
                            }`}
                          />

                          {camp.status}

                        </span>

                      </td>

                    </motion.tr>

                  ))}

                </tbody>

              </table>

            </div>

          </motion.section>

        </section>

        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.5,
            delay: 0.5
          }}
          className="bg-emerald-50/70 p-5 rounded-3xl border border-emerald-100 flex gap-3"
        >

          <div className="p-2 bg-emerald-100 rounded-xl h-fit">

            <AlertCircle
              size={16}
              className="text-emerald-700"
            />

          </div>

          <div>

            <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-1">
              Promotional Policy Notice
            </p>

            <p className="text-[11px] text-emerald-800/80 leading-relaxed font-semibold">
              Promotional campaigns directly influence customer discounts and platform revenue. Verify the target segment, voucher code, and benefit value before activating a campaign.
            </p>

          </div>

        </motion.div>

      </main>
    </div>
  );
}
