import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Calendar, 
  RefreshCw, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  DollarSign, 
  FileSpreadsheet, 
  ChevronDown,
  Percent,
  TrendingDown,
  PieChart
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
        formatted = currentVal.toFixed(2);
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

export default function RevenueReports() {
  const [currentTab, setCurrentTab] = useState('revenue-reports');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('Last 6 Months');

  const reportStats = [
    {
      label: 'Net Platform Profit',
      value: '₹8,42,190.00',
      change: '+14.2%',
      up: true,
      cardBg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent',
      cardBorder: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-700',
      tagColor: 'text-emerald-800 bg-emerald-50 border-emerald-100/50',
      icon: TrendingUp
    },
    {
      label: 'Tax / GST Collected',
      value: '₹42,120.00',
      change: '+8.6%',
      up: true,
      cardBg: 'bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-transparent',
      cardBorder: 'border-teal-500/20',
      iconBg: 'bg-teal-500/15 text-teal-700',
      tagColor: 'text-teal-800 bg-teal-50 border-teal-100/50',
      icon: Percent
    },
    {
      label: 'Total Payouts Done',
      value: '₹6,80,240.00',
      change: '+11.5%',
      up: true,
      cardBg: 'bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent',
      cardBorder: 'border-amber-500/20',
      iconBg: 'bg-amber-500/15 text-amber-700',
      tagColor: 'text-amber-800 bg-amber-50 border-amber-100/50',
      icon: FileSpreadsheet
    },
    {
      label: 'Operational Overhead',
      value: '₹18,400.00',
      change: '-2.4%',
      up: false,
      cardBg: 'bg-gradient-to-br from-rose-500/10 via-rose-400/5 to-transparent',
      cardBorder: 'border-rose-500/20',
      iconBg: 'bg-rose-500/15 text-rose-755',
      tagColor: 'text-rose-800 bg-rose-50 border-rose-100/50',
      icon: TrendingDown
    }
  ];

  const chartData = [
    { month: 'May', revenue: 75, profit: 45 },
    { month: 'Jun', revenue: 88, profit: 54 },
    { month: 'Jul', revenue: 95, profit: 62 },
    { month: 'Aug', revenue: 110, profit: 72 },
    { month: 'Sep', revenue: 135, profit: 84 },
    { month: 'Oct', revenue: 155, profit: 98 }
  ];

  const subLedger = [
    { type: 'B2C Sales Revenue', gross: '₹12,40,900.00', net: '₹1,24,090.00', tax: '₹62,045.00', share: '78%' },
    { type: 'Corporate Contracts', gross: '₹3,10,200.00', net: '₹31,020.00', tax: '₹15,510.00', share: '15%' },
    { type: 'SaaS Store Subscriptions', gross: '₹84,000.00', net: '₹84,000.00', tax: '₹4,200.00', share: '7%' }
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
              <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-100 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15">
                Financial Reports Engine
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
              Revenue Reports
            </h1>
          </div>
          
          <div className="flex items-center gap-3 z-10">
            <button className="px-5 py-3 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-2xl flex items-center gap-2 text-xs font-bold border border-white/10 shadow-sm transition-all duration-300 active:scale-95">
              <FileSpreadsheet size={16} />
              Export Statement
            </button>
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
          {reportStats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={idx} 
                className={`${stat.cardBg} ${stat.cardBorder} p-6 rounded-3xl border shadow-sm hover:shadow-xl hover:shadow-emerald-950/[0.02] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125 pointer-events-none" />
                
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest group-hover:text-slate-700 transition-colors">
                      {stat.label}
                    </span>
                    <div className={`${stat.iconBg} p-2.5 rounded-2xl transition-colors duration-300`}>
                      <IconComponent size={18} />
                    </div>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 mt-4 tracking-tight">
                    <AnimatedValue value={stat.value} key={refreshKey} />
                  </h3>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100/50 flex items-center justify-between">
                  <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${stat.tagColor}`}>
                    {stat.up ? <ArrowUpRight size={14} className="text-emerald-600" /> : <ArrowDownRight size={14} className="text-rose-600" />}
                    {stat.change}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">Monthly Period</span>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Platform Sales Revenue Curve</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">GTV & profit tracking trend</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl text-slate-600">
                  <span>{selectedMonth}</span>
                  <ChevronDown size={14} />
                </div>
              </div>

              <div className="relative h-64 w-full flex items-end justify-between px-4 pt-12">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="w-full border-t border-slate-100" />
                  <div className="w-full border-t border-slate-100" />
                  <div className="w-full border-t border-slate-100" />
                  <div className="w-full border-t border-slate-100" />
                </div>

                {chartData.map((data, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-1 group z-10">
                    <div className="flex gap-1.5 items-end justify-center w-full h-40">
                      <div 
                        style={{ height: `${(data.revenue / 170) * 100}%` }}
                        className="w-4 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg transition-all duration-1000 group-hover:opacity-90 relative"
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none transition-opacity duration-300">
                          ₹{data.revenue}K
                        </div>
                      </div>
                      <div 
                        style={{ height: `${(data.profit / 170) * 100}%` }}
                        className="w-4 bg-gradient-to-t from-lime-500 to-green-400 rounded-t-lg transition-all duration-1000 group-hover:opacity-90 relative"
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none transition-opacity duration-300">
                          ₹{data.profit}K
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 mt-3">{data.month}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-6 mt-6 justify-center text-xs font-bold border-t border-slate-50 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">Gross Transaction Volume</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-lime-500" />
                  <span className="text-slate-600">Net Platform Profit</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <PieChart size={20} className="text-emerald-600" />
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Ledger Streams</h2>
              </div>
              
              <div className="space-y-4">
                {subLedger.map((stream, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-100 hover:bg-emerald-50/25 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">{stream.type}</span>
                      <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">{stream.share}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 text-xs text-slate-400 font-semibold">
                      <div>
                        <span className="block font-mono text-slate-700 font-bold">{stream.gross}</span>
                        <span>Gross GTV</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-mono text-emerald-700 font-bold">{stream.net}</span>
                        <span>Platform Net</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}