import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Thermometer, 
  ShieldCheck,
  Leaf,
  Activity,
  Package,
  Gauge
} from 'lucide-react';

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    const match = value.match(/([\d,.]+)\s*(.*)/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const rawNumberStr = match[1].replace(/,/g, '');
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
        parts[0] = parseInt(parts[0], 10).toLocaleString('en-US');
        formatted = parts.join('.');
      }

      setDisplayValue(`${formatted}${suffix ? ' ' + suffix : ''}`);

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

export default function Dashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const stats = [
    { 
      label: 'Fresh Dispatch Orders', 
      value: '14,820 kg', 
      change: '+12.4%', 
      up: true, 
      desc: 'Compared to yesterday',
      icon: Leaf,
      color: 'emerald'
    },
    { 
      label: 'Active Supply Lines', 
      value: '34 active', 
      change: '+3.2%', 
      up: true, 
      desc: '2 cold rooms standby',
      icon: Activity,
      color: 'teal'
    },
    { 
      label: 'Ambient Temp Average', 
      value: '4.2 °C', 
      change: '-0.8%', 
      up: false, 
      desc: 'Targeting 3.5 - 5 °C',
      icon: Thermometer,
      color: 'emerald'
    },
    { 
      label: 'Estimated Profit Margin', 
      value: '87.4%', 
      change: '+1.5%', 
      up: true, 
      desc: 'Excluding freight costs',
      icon: Gauge,
      color: 'green'
    }
  ];

  const recentOrders = [
    { id: '#VGF-2918', client: 'Green Grocers Inc.', produce: 'Fresh Spinach', quantity: '1,200 kg', status: 'Shipped', temp: '4.1°C' },
    { id: '#VGF-2917', client: 'Organic Harvest Co.', produce: 'Broccoli Heads', quantity: '850 kg', status: 'Processing', temp: '4.4°C' },
    { id: '#VGF-2916', client: 'Super Foods Depot', produce: 'Sweet Potatoes', quantity: '3,400 kg', status: 'Shipped', temp: '6.0°C' },
    { id: '#VGF-2915', client: 'Healthy Living Market', produce: 'Avocados', quantity: '500 kg', status: 'Delayed', temp: '8.2°C' },
    { id: '#VGF-2914', client: 'Nature Express Hub', produce: 'Red Tomatoes', quantity: '2,100 kg', status: 'Shipped', temp: '5.1°C' }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/10 to-teal-50/20 flex font-sans antialiased text-slate-800">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto max-h-screen">
        <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-850 text-white shadow-lg overflow-hidden border border-emerald-700/30">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 z-10 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15">
                Operations Center
              </span>
              
              <div className="flex items-center gap-3 bg-rose-950/60 backdrop-blur-md border border-rose-500/30 px-3.5 py-1.5 rounded-full text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.2)] max-w-[190px] overflow-hidden">
                <span className="relative flex h-3.5 w-3.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] border border-white/20"></span>
                </span>
                <div className="overflow-hidden whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-white w-full">
                  <marquee scrollamount="3.5" className="leading-none">LIVE ADMIN VEG GO</marquee>
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              Real-time Platform Metrics
            </h1>
          </div>
          
          <div className="flex items-center gap-3 z-10">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm text-xs font-semibold text-emerald-50">
              <Calendar size={14} className="text-emerald-300" />
              <span>Oct 12, 2026</span>
            </div>
            <button 
              onClick={handleRefresh}
              className="p-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl hover:bg-white/20 transition-all duration-300 active:scale-95 shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 group"
            >
              <RefreshCw size={14} className={`text-emerald-300 transition-transform duration-700 ${isRefreshing ? 'rotate-180' : 'group-hover:rotate-45'}`} />
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={idx} 
                className="bg-white p-6 rounded-3xl border border-emerald-100/50 shadow-sm hover:shadow-xl hover:shadow-emerald-950/[0.02] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125" />
                
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-800 transition-colors">
                      {stat.label}
                    </span>
                    <div className="p-2.5 bg-emerald-50/80 rounded-2xl text-emerald-700 group-hover:bg-emerald-100/50 transition-colors">
                      <IconComponent size={16} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mt-4 tracking-tight">
                    <AnimatedValue value={stat.value} key={refreshKey} />
                  </h3>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    stat.up ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                  }`}>
                    {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.change}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{stat.desc}</span>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Package size={18} className="text-emerald-600" />
                    Recent Supply Line Dispatches
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Live status of active thermal transit lanes</p>
                </div>
                <button className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors bg-emerald-50 hover:bg-emerald-100/60 px-4 py-2 rounded-xl self-start sm:self-auto">
                  Export Ledger
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      <th className="pb-4">Reference</th>
                      <th className="pb-4">Contract Name</th>
                      <th className="pb-4">Produce</th>
                      <th className="pb-4 text-center">Batch Temp</th>
                      <th className="pb-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="text-xs font-semibold text-slate-600 hover:bg-emerald-50/20 transition-colors">
                        <td className="py-4 font-bold text-slate-900">{order.id}</td>
                        <td className="py-4 text-slate-700">{order.client}</td>
                        <td className="py-4">{order.produce}</td>
                        <td className="py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-[11px] font-mono font-bold text-slate-600 border border-slate-100">
                            <Thermometer size={12} className="text-emerald-500" />
                            {order.temp}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            order.status === 'Shipped' ? 'bg-emerald-50/60 text-emerald-700 border-emerald-100' :
                            order.status === 'Processing' ? 'bg-amber-50/60 text-amber-700 border-amber-100' :
                            'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {order.status === 'Shipped' && <CheckCircle2 size={12} className="text-emerald-600" />}
                            {order.status === 'Processing' && <Layers size={12} className="text-amber-600" />}
                            {order.status === 'Delayed' && <AlertCircle size={12} className="text-rose-600" />}
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Thermal Health</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Consistency metrics across operations</p>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600">
                  <ShieldCheck size={18} />
                </div>
              </div>

              <div className="relative aspect-[4/3] w-full bg-gradient-to-tr from-emerald-900 via-emerald-800 to-teal-950 rounded-2xl flex flex-col items-center justify-center p-6 border border-emerald-800/20 overflow-hidden group shadow-md">
                <div className="absolute inset-0 bg-radial-gradient from-emerald-500/20 to-transparent opacity-60 pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:14px_24px]" />
                
                <div className="z-10 flex flex-col items-center">
                  <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-3 group-hover:scale-110 transition-transform duration-500">
                    <TrendingUp size={28} className="text-emerald-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-100 tracking-wide uppercase">Operational Consistency</p>
                  <p className="text-[11px] text-emerald-200/70 mt-2 text-center max-w-[180px] leading-relaxed">
                    All active nodes are functioning inside targeted temperature bounds.
                  </p>
                </div>
                
                <div className="absolute inset-x-0 bottom-0 bg-emerald-950/80 backdrop-blur-sm border-t border-emerald-800/30 p-2.5 text-center">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">99.8% Reliability Rating</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Standard Deviations</span>
                  <span className="text-slate-900">0.12 °C Max</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[95%] rounded-full transition-all duration-1000" />
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-600">Cold Storage Nodes</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                4 / 4 Active
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}