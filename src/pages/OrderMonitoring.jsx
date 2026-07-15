import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Calendar, 
  RefreshCw, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Truck, 
  ShieldAlert, 
  Eye, 
  PhoneCall, 
  MapPin, 
  Activity,
  Thermometer
} from 'lucide-react';

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    const match = value.match(/([₹\d,.]+)\s*(.*)/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const isRupee = value.startsWith('₹');
    const rawNumberStr = match[1].replace(/[₹,]/g, '');
    const targetNum = parseFloat(rawNumberStr);
    const suffix = match[2] || '';
    const isDecimal = rawNumberStr.includes('.');
    const hasComma = match[1].includes(',');

    const duration = 1200;
    const startTime = performance.now();
    let animationFrameId;

    const updateCount = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = easeProgress * targetNum;

      let formatted;
      if (isDecimal) {
        formatted = currentVal.toFixed(1);
      } else {
        formatted = Math.floor(currentVal).toString();
      }

      if (hasComma) {
        const parts = formatted.split('.');
        parts[0] = parseInt(parts[0], 10).toLocaleString('en-IN');
        formatted = parts.join('.');
      }

      setDisplayValue(`${isRupee ? '₹' : ''}${formatted}${suffix ? ' ' + suffix : ''}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{displayValue}</span>;
}

export default function OrderMonitoring() {
  const [currentTab, setCurrentTab] = useState('order-monitoring');
  const [searchQuery, setSearchQuery] = useState('');
  const [alertFilter, setStatusFilter] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [monitoredOrders, setMonitoredOrders] = useState([
    { id: 'ORD-9021', customer: 'Rahul Kulkarni', rider: 'Sohan Singh', temp: '4.2°C', status: 'On Track', eta: '12 mins', alert: 'Normal' },
    { id: 'ORD-9022', customer: 'Meera Nair', rider: 'Vikram Dutt', temp: '8.4°C', status: 'Delayed', eta: '28 mins', alert: 'Critical' },
    { id: 'ORD-9023', customer: 'Aniket Goel', rider: 'Rajesh Kumar', temp: '5.1°C', status: 'On Track', eta: '8 mins', alert: 'Normal' },
    { id: 'ORD-9024', customer: 'Pooja Hegde', rider: 'Amit Joshi', temp: '6.8°C', status: 'Stuck in Traffic', eta: '35 mins', alert: 'Warning' },
    { id: 'ORD-9025', customer: 'Kabir Thapar', rider: 'Devendra Pal', temp: '9.2°C', status: 'Delayed', eta: '42 mins', alert: 'Critical' },
    { id: 'ORD-9026', customer: 'Aditi Rao', rider: 'Harpreet Singh', temp: '4.8°C', status: 'On Track', eta: '15 mins', alert: 'Normal' }
  ]);

  const handleReassign = (id) => {
    setMonitoredOrders(prev => prev.map(order => {
      if (order.id === id) {
        return { ...order, rider: 'Reassigned (Auto)', alert: 'Normal', status: 'On Track', temp: '4.5°C' };
      }
      return order;
    }));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const criticalCount = monitoredOrders.filter(o => o.alert === 'Critical').length;
  const warningCount = monitoredOrders.filter(o => o.alert === 'Warning').length;
  const activeRidersCount = monitoredOrders.length;

  const monitoringStats = [
    {
      label: 'Critical Thresholds',
      value: `${criticalCount} Incidents`,
      cardBg: 'bg-gradient-to-br from-rose-500/10 via-rose-400/5 to-transparent',
      cardBorder: 'border-rose-500/20',
      iconBg: 'bg-rose-500/15 text-rose-755',
      icon: ShieldAlert
    },
    {
      label: 'Warning Thresholds',
      value: `${warningCount} Transits`,
      cardBg: 'bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent',
      cardBorder: 'border-amber-500/20',
      iconBg: 'bg-amber-500/15 text-amber-700',
      icon: AlertTriangle
    },
    {
      label: 'Average ETA Target',
      value: '26.4 mins',
      cardBg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent',
      cardBorder: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-700',
      icon: Clock
    },
    {
      label: 'Monitored Fleets',
      value: `${activeRidersCount} Couriers`,
      cardBg: 'bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-transparent',
      cardBorder: 'border-teal-500/20',
      iconBg: 'bg-teal-500/15 text-teal-700',
      icon: Truck
    }
  ];

  const filteredMonitoredOrders = monitoredOrders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.rider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAlert = alertFilter === 'All' || order.alert === alertFilter;
    return matchesSearch && matchesAlert;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/10 to-teal-50/20 flex font-sans antialiased text-slate-800">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto max-h-screen">
        <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-850 text-white shadow-lg overflow-hidden border border-emerald-700/30">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 z-10 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-100 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15">
                Operations Logistics Center
              </span>
              
              <div className="flex items-center gap-3 bg-rose-950/60 backdrop-blur-md border border-rose-500/30 px-3.5 py-1.5 rounded-full text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.2)] max-w-[190px] overflow-hidden">
                <span className="relative flex h-3.5 w-3.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] border border-white/20"></span>
                </span>
                <div className="overflow-hidden whitespace-nowrap text-[11px] font-black uppercase tracking-widest text-white w-full">
                  <marquee scrollamount="3.5" className="leading-none">LIVE ADMIN VEG GO</marquee>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Logistics & Order Monitoring
            </h1>
          </div>
          
          <div className="flex items-center gap-3 z-10">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm text-sm font-bold text-emerald-50">
              <Calendar size={16} className="text-emerald-300" />
              <span>Oct 12, 2026</span>
            </div>
            <button 
              onClick={handleRefresh}
              className="p-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl hover:bg-white/20 transition-all duration-300 active:scale-95 shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 group"
            >
              <RefreshCw size={16} className={`text-emerald-300 transition-transform duration-700 ${isRefreshing ? 'rotate-180' : 'group-hover:rotate-45'}`} />
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {monitoringStats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={idx} 
                className={`${stat.cardBg} ${stat.cardBorder} p-6 rounded-3xl border shadow-sm hover:shadow-xl hover:shadow-emerald-950/[0.02] hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125 pointer-events-none" />
                
                <div>
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest group-hover:text-slate-700 transition-colors">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                    <AnimatedValue value={stat.value} key={refreshKey} />
                  </h3>
                </div>
                <div className={`${stat.iconBg} p-4 rounded-2xl border border-white/10 shadow-sm transition-colors duration-300 z-10`}>
                  <IconComponent size={22} />
                </div>
              </div>
            );
          })}
        </section>

        <section className="bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Real-Time Dispatch Health</h2>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {['All', 'Normal', 'Warning', 'Critical'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setStatusFilter(level)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      alertFilter === level
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by ID, customer or rider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-550 focus:bg-white transition-all text-slate-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase font-bold tracking-widest text-slate-400">
                  <th className="pb-4">Order ID</th>
                  <th className="pb-4">Customer</th>
                  <th className="pb-4">Assigned Rider</th>
                  <th className="pb-4 text-center font-bold">Transit Temperature</th>
                  <th className="pb-4">Delivery Status</th>
                  <th className="pb-4">ETA Window</th>
                  <th className="pb-4 text-right">Emergency Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {filteredMonitoredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 font-bold text-sm">
                      No tracked transits matched filters.
                    </td>
                  </tr>
                ) : (
                  filteredMonitoredOrders.map((order) => (
                    <tr key={order.id} className="text-sm font-semibold text-slate-600 hover:bg-emerald-50/20 transition-colors">
                      <td className="py-5 font-mono text-slate-400 font-bold">{order.id}</td>
                      <td className="py-5 font-bold text-slate-900">{order.customer}</td>
                      <td className="py-5 font-bold text-slate-700">{order.rider}</td>
                      <td className="py-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border ${
                          parseFloat(order.temp) >= 8.0 
                            ? 'bg-rose-50 text-rose-700 border-rose-100/50' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
                        }`}>
                          <Thermometer size={14} className="text-slate-400" />
                          {order.temp}
                        </span>
                      </td>
                      <td className="py-5 text-xs text-slate-500 font-medium">{order.status}</td>
                      <td className="py-5 font-mono text-xs text-slate-700 font-extrabold">{order.eta}</td>
                      <td className="py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-600 transition-all">
                            <PhoneCall size={14} />
                          </button>
                          {order.alert === 'Critical' && (
                            <button
                              onClick={() => handleReassign(order.id)}
                              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 rounded-2xl text-[11px] font-bold transition-all"
                            >
                              Auto-Reassign
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}