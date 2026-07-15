import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Calendar, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  ShieldCheck, 
  ThumbsUp, 
  ThumbsDown,
  Clock
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
        formatted = currentVal.toFixed(2);
      } else {
        formatted = Math.floor(currentVal).toString();
      }

      if (hasComma) {
        const parts = formatted.split('.');
        parts[0] = parseInt(parts[0], 10).toLocaleString('en-IN');
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

export default function DocumentVerification() {
  const [currentTab, setCurrentTab] = useState('document-verification');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [documents, setDocuments] = useState([
    { id: 'DOC-9001', name: 'Marcus Sterling', type: 'Driver License', status: 'Pending', uploaded: 'Oct 10, 2026' },
    { id: 'DOC-9002', name: 'Golden Harvest Co.', type: 'Food Safety Certificate', status: 'Pending', uploaded: 'Oct 11, 2026' },
    { id: 'DOC-9003', name: 'Elena Rostova', type: 'Vehicle Insurance', status: 'Pending', uploaded: 'Oct 11, 2026' },
    { id: 'DOC-9004', name: 'Alpine Berry Orchards', type: 'Business Registry License', status: 'Pending', uploaded: 'Oct 12, 2026' }
  ]);

  const handleAction = (id, nextStatus) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        return { ...doc, status: nextStatus };
      }
      return doc;
    }));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const pendingCount = documents.filter(doc => doc.status === 'Pending').length;
  const verifiedCount = documents.filter(doc => doc.status === 'Verified').length;
  const flaggedCount = documents.filter(doc => doc.status === 'Flagged').length;

  const auditStats = [
    {
      label: 'Unresolved Audits',
      value: `${pendingCount} Documents`,
      cardBg: 'bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent',
      cardBorder: 'border-amber-500/20',
      iconBg: 'bg-amber-500/15 text-amber-700',
      icon: FileText
    },
    {
      label: 'Approved Audits',
      value: `${verifiedCount} Approved`,
      cardBg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent',
      cardBorder: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-700',
      icon: CheckCircle2
    },
    {
      label: 'Flagged Violations',
      value: `${flaggedCount} Flagged`,
      cardBg: 'bg-gradient-to-br from-rose-500/10 via-rose-400/5 to-transparent',
      cardBorder: 'border-rose-500/20',
      iconBg: 'bg-rose-500/15 text-rose-755',
      icon: AlertTriangle
    }
  ];

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
                Trust & Safety Verification
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
              Document Verification
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

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {auditStats.map((stat, idx) => {
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
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Partner Credentials Verification Ledger</h2>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl">Unresolved: {pendingCount}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase font-bold tracking-widest text-slate-400">
                  <th className="pb-4">Partner Identity</th>
                  <th className="pb-4">File ID</th>
                  <th className="pb-4">Document Type</th>
                  <th className="pb-4">Submission Date</th>
                  <th className="pb-4">Audit Status</th>
                  <th className="pb-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {documents.map((doc) => (
                  <tr key={doc.id} className="text-sm font-semibold text-slate-600 hover:bg-emerald-50/20 transition-colors">
                    <td className="py-4 font-bold text-slate-900">{doc.name}</td>
                    <td className="py-4 font-mono text-slate-400 font-bold">{doc.id}</td>
                    <td className="py-4 text-slate-500 font-medium">{doc.type}</td>
                    <td className="py-4 text-xs text-slate-400 font-medium">{doc.uploaded}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                        doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        doc.status === 'Flagged' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          doc.status === 'Verified' ? 'bg-emerald-500' :
                          doc.status === 'Flagged' ? 'bg-rose-500' :
                          'bg-amber-500'
                        }`} />
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <button className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-600 transition-all">
                        <Eye size={16} />
                      </button>
                      {doc.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleAction(doc.id, 'Verified')}
                            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200/50 transition-all"
                          >
                            <ThumbsUp size={16} />
                          </button>
                          <button
                            onClick={() => handleAction(doc.id, 'Flagged')}
                            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 transition-all"
                          >
                            <ThumbsDown size={16} />
                          </button>
                        </>
                      )}
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