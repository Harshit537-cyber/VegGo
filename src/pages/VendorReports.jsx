import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Calendar, 
  RefreshCw, 
  FileSpreadsheet, 
  Store, 
  TrendingUp, 
  Star, 
  Percent, 
  ShieldCheck,
  ChevronDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
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

export default function VendorReports() {
  const [currentTab, setCurrentTab] = useState('vendor-reports');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRange, setSelectedMonth] = useState('Quarter 3, 2026');

  const vendorStats = [
    {
      label: 'Settled Vendor Volume',
      value: '₹14,24,800.00',
      change: '+16.5%',
      up: true,
      cardBg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent',
      cardBorder: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-700',
      tagColor: 'text-emerald-800 bg-emerald-50 border-emerald-100/50',
      icon: TrendingUp
    },
    {
      label: 'Fulfillment Rate',
      value: '98.4%',
      change: '+0.8%',
      up: true,
      cardBg: 'bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-transparent',
      cardBorder: 'border-teal-500/20',
      iconBg: 'bg-teal-500/15 text-teal-700',
      tagColor: 'text-teal-800 bg-teal-50 border-teal-100/50',
      icon: ShieldCheck
    },
    {
      label: 'Avg Commission Fee',
      value: '11.4%',
      change: '+1.2%',
      up: true,
      cardBg: 'bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent',
      cardBorder: 'border-amber-500/20',
      iconBg: 'bg-amber-500/15 text-amber-700',
      tagColor: 'text-amber-800 bg-amber-50 border-amber-100/50',
      icon: Percent
    },
    {
      label: 'Onboarding SLA',
      value: '1.8 Days',
      change: '-0.3%',
      up: false,
      cardBg: 'bg-gradient-to-br from-rose-500/10 via-rose-400/5 to-transparent',
      cardBorder: 'border-rose-500/20',
      iconBg: 'bg-rose-500/15 text-rose-755',
      tagColor: 'text-rose-800 bg-rose-50 border-rose-100/50',
      icon: Store
    }
  ];

  const vendorPerformanceReport = [
    { name: 'Organic Valley Farms', productCount: '82 SKUs', GTV: '₹6,40,900.00', returnRate: '0.4%', rating: '4.9', payoutStatus: 'Cleared' },
    { name: 'Greenhouse Co-op', owner: 'Clara Oswald', productCount: '41 SKUs', GTV: '₹3,20,500.00', returnRate: '1.2%', rating: '4.8', payoutStatus: 'Cleared' },
    { name: 'Sunshine Orchards', owner: 'Marcus Aurelius', productCount: '65 SKUs', GTV: '₹2,84,100.00', returnRate: '0.8%', rating: '4.7', payoutStatus: 'Pending' },
    { name: 'Purely Plants Co.', owner: 'Sarah Connor', productCount: '28 SKUs', GTV: '₹1,12,300.00', returnRate: '1.5%', rating: '4.9', payoutStatus: 'Cleared' },
    { name: 'Evergreen Hydroponics', owner: 'Bruce Wayne', productCount: '19 SKUs', GTV: '₹67,000.00', returnRate: '4.2%', rating: '4.4', payoutStatus: 'On Hold' }
  ];

  const satisfactionBreakdown = [
    { label: 'High Rating (4.5 - 5.0)', percentage: 82, color: 'bg-emerald-500' },
    { label: 'Moderate Rating (3.5 - 4.4)', percentage: 14, color: 'bg-amber-500' },
    { label: 'Low Rating (< 3.5)', percentage: 4, color: 'bg-rose-500' }
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
                Vendor Relations & Audits
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
              Vendor Performance Reports
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
          {vendorStats.map((stat, idx) => {
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

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Layers size={20} className="text-emerald-600" />
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Vendor Metrics Matrix</h2>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl text-slate-600">
                  <span>{selectedRange}</span>
                  <ChevronDown size={14} />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase font-bold tracking-widest text-slate-400">
                      <th className="pb-4">Shop Name</th>
                      <th className="pb-4">Product Catalog</th>
                      <th className="pb-4">Gross Trade Value</th>
                      <th className="pb-4">SLA Return Rate</th>
                      <th className="pb-4">Rating Index</th>
                      <th className="pb-4 text-right">Settlement State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {vendorPerformanceReport.map((vendor, idx) => (
                      <tr key={idx} className="text-sm font-semibold text-slate-600 hover:bg-emerald-50/20 transition-colors">
                        <td className="py-4 font-bold text-slate-900">{vendor.name}</td>
                        <td className="py-4 font-mono text-slate-500 font-bold">{vendor.productCount}</td>
                        <td className="py-4 font-mono text-slate-800 font-extrabold">{vendor.GTV}</td>
                        <td className="py-4 font-mono text-slate-500">{vendor.returnRate}</td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100/50 shadow-sm">
                            <Star size={12} className="fill-amber-500 text-amber-500" />
                            {vendor.rating}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                            vendor.payoutStatus === 'Cleared' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            vendor.payoutStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {vendor.payoutStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={20} className="text-emerald-600" />
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Satisfaction Breakdown</h2>
              </div>
              
              <div className="space-y-6">
                {satisfactionBreakdown.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span>{item.label}</span>
                      <span className="text-slate-900">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${item.percentage}%` }}
                        className={`${item.color} h-full rounded-full transition-all duration-1000`} 
                      />
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