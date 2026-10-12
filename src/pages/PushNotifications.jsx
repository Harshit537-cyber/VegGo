
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../Common/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Calendar,
  RefreshCw,
  Send,
  Bell,
  Smartphone,
  Users,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  ShieldCheck,
  Radio,
  Megaphone,
  Activity,
  MessageSquare
} from 'lucide-react';

export default function PushNotifications() {
  const [currentTab, setCurrentTab] = useState('push-notifications');

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [showNotification, setShowNotification] = useState(false);

  const [notificationHistory, setNotificationHistory] = useState([
    {
      id: 'PUSH-102',
      title: 'System Maintenance Window',
      audience: 'All Users',
      sentTime: 'Oct 11, 2026, 11:30 PM',
      status: 'Delivered',
      reach: '18,240'
    },
    {
      id: 'PUSH-101',
      title: 'Fresh Arrival: Baby Spinach!',
      audience: 'Customers Only',
      sentTime: 'Oct 10, 2026, 09:00 AM',
      status: 'Delivered',
      reach: '14,100'
    },
    {
      id: 'PUSH-100',
      title: 'Weekly Payout Cleared',
      audience: 'Vendors Only',
      sentTime: 'Oct 09, 2026, 04:15 PM',
      status: 'Delivered',
      reach: '1,248'
    },
    {
      id: 'PUSH-099',
      title: 'High Demand Peak Hours Alert',
      audience: 'Riders Only',
      sentTime: 'Oct 08, 2026, 11:00 AM',
      status: 'Delivered',
      reach: '840'
    }
  ]);

  const stats = [
    {
      label: 'Active Devices Registered',
      value: '20,428',
      icon: Smartphone,
      accent: 'emerald',
      sub: 'Registered Devices'
    },
    {
      label: 'Average Delivery Rate',
      value: '99.8%',
      icon: Bell,
      accent: 'teal',
      sub: 'Successful Delivery'
    },
    {
      label: 'Interactive Open Rate',
      value: '42.3%',
      icon: Users,
      accent: 'green',
      sub: 'User Engagement'
    },
    {
      label: 'Broadcasts Delivered',
      value: notificationHistory.length,
      icon: Radio,
      accent: 'emerald',
      sub: 'Recent Campaigns'
    }
  ];

  const getReach = () => {
    if (audience === 'all') return '20,428';
    if (audience === 'customers') return '14,100';
    if (audience === 'vendors') return '1,248';
    return '840';
  };

  const getAudienceName = () => {
    if (audience === 'all') return 'All Users';
    if (audience === 'customers') return 'Customers Only';
    if (audience === 'vendors') return 'Vendors Only';
    return 'Riders Only';
  };

  const handleSendNotification = (e) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) return;

    const newPush = {
      id: `PUSH-${notificationHistory.length + 100}`,
      title: title.trim(),
      audience: getAudienceName(),
      sentTime: 'Just Now',
      status: 'Delivered',
      reach: getReach()
    };

    setNotificationHistory([newPush, ...notificationHistory]);

    setTitle('');
    setBody('');
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

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto max-h-dvh w-full space-y-6 sm:space-y-8 relative">

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
                Push notification broadcast successfully
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modern Executive Header */}
        <PageHeader 
          badge="Communication Center"
          badgeIcon={Radio}
          title="Push Notifications"
          subtitle="Create, target, and dispatch real-time alerts across customers, vendors, and delivery fleets."
          onRefresh={() => window.location.reload()}
        />

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

          {stats.map((stat, index) => {
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

                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${styles.badge}`}>
                    Live
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
                    Dispatch Broadcast
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Send real-time push notifications
                  </p>

                </div>

              </div>

              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <ShieldCheck size={12} />
                SECURED
              </span>

            </div>

            <form
              onSubmit={handleSendNotification}
              className="space-y-5"
            >

              <div className="space-y-2">

                <label className="text-[11px] font-bold text-black uppercase tracking-wider flex items-center gap-2">
                  <Users
                    size={14}
                    className="text-emerald-600"
                  />
                  Target Demographic
                </label>

                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                >
                  <option value="all">
                    Broadcast - All Users
                  </option>

                  <option value="customers">
                    Customers Directory Only
                  </option>

                  <option value="vendors">
                    Vendor Directory Only
                  </option>

                  <option value="riders">
                    Logistics Directory Only
                  </option>
                </select>

              </div>

              <div className="space-y-2">

                <label className="text-[11px] font-bold text-black uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare
                    size={14}
                    className="text-emerald-600"
                  />
                  Notification Title
                </label>

                <input
                  type="text"
                  placeholder="e.g., Seasonal Sales Event"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />

              </div>

              <div className="space-y-2">

                <label className="text-[11px] font-bold text-black uppercase tracking-wider flex items-center gap-2">
                  <Bell
                    size={14}
                    className="text-emerald-600"
                  />
                  Body Message Content
                </label>

                <textarea
                  rows="5"
                  placeholder="Enter message text description..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
                />

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

                Broadcast Push

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
                  <Activity size={18} />
                </div>

                <div>

                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Recent Broadcast Log
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Monitor recently delivered notifications
                  </p>

                </div>

              </div>

              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <Radio size={12} />
                LIVE
              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-left border-collapse min-w-[760px]">

                <thead>

                  <tr className="border-b border-slate-100 text-[10px] uppercase font-black tracking-wider text-slate-400">

                    <th className="pb-4">
                      Transmission ID
                    </th>

                    <th className="pb-4">
                      Title Heading
                    </th>

                    <th className="pb-4">
                      Target Audience
                    </th>

                    <th className="pb-4">
                      Active Reach
                    </th>

                    <th className="pb-4">
                      Broadcast Time
                    </th>

                    <th className="pb-4 text-right">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {notificationHistory.map((item, index) => (

                    <motion.tr
                      key={item.id}
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

                      <td className="py-4 font-mono text-[10px] font-semibold text-slate-400">
                        {item.id}
                      </td>

                      <td className="py-4 font-bold text-black">
                        {item.title}
                      </td>

                      <td className="py-4 text-slate-500 font-semibold">
                        {item.audience}
                      </td>

                      <td className="py-4 font-mono text-[10px] text-slate-600">
                        {item.reach} devices
                      </td>

                      <td className="py-4 text-[10px] text-slate-400">
                        {item.sentTime}
                      </td>

                      <td className="py-4 text-right">

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">

                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

                          {item.status}

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
              Broadcast Policy Notice
            </p>

            <p className="text-[11px] text-emerald-800/80 leading-relaxed font-semibold">
              Push notifications are delivered to active registered devices based on the selected audience. Always verify the message content and target demographic before broadcasting.
            </p>

          </div>

        </motion.div>

      </main>
    </div>
  );
}
