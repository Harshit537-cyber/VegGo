import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import ConfirmModal from '../Common/ConfirmModal';
import { 
  Calendar, 
  RefreshCw, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Search, 
  ShieldCheck
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

export default function CustomerModeration() {
  const [currentTab, setCurrentTab] = useState('block-unblock');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, account: null });
  
  const [accounts, setAccounts] = useState([
    { id: 'CUST-84920', name: 'Alexander Wright', email: 'alexander.w@gmail.com', flags: 0, reason: 'None', status: 'Active' },
    { id: 'CUST-84919', name: 'Beatrice Vance', email: 'b.vance@yahoo.com', flags: 3, reason: 'Multiple payment failures', status: 'Active' },
    { id: 'CUST-84918', name: 'Charlie Peterson', email: 'charliep@live.com', flags: 8, reason: 'Repeated cancellation abuse', status: 'Blocked' },
    { id: 'CUST-84917', name: 'Diana Prince', email: 'diana.p@amazon.com', flags: 1, reason: 'Suspicious location change', status: 'Active' },
    { id: 'CUST-84916', name: 'Ethan Hunt', email: 'ethan.h@imf.org', flags: 12, reason: 'Promo code manipulation', status: 'Blocked' },
    { id: 'CUST-84915', name: 'Fiona Gallagher', email: 'fiona.g@southside.com', flags: 0, reason: 'None', status: 'Active' }
  ]);

  const initiateToggleStatus = (account) => {
    setModalConfig({
      isOpen: true,
      account
    });
  };

  const handleConfirmAction = () => {
    if (!modalConfig.account) return;

    const { id } = modalConfig.account;
    setAccounts(prev => prev.map(account => {
      if (account.id === id) {
        const nextStatus = account.status === 'Active' ? 'Blocked' : 'Active';
        return { 
          ...account, 
          status: nextStatus,
          flags: nextStatus === 'Active' ? 0 : account.flags
        };
      }
      return account;
    }));

    setModalConfig({ isOpen: false, account: null });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const activeCount = accounts.filter(a => a.status === 'Active').length;
  const blockedCount = accounts.filter(a => a.status === 'Blocked').length;
  const flaggedCount = accounts.filter(a => a.flags > 0 && a.status === 'Active').length;

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const moderationStats = [
    {
      label: 'Unrestricted Users',
      value: `${activeCount} Accounts`,
      cardBg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent',
      cardBorder: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-700',
      icon: UserCheck
    },
    {
      label: 'Suspended / Blocked',
      value: `${blockedCount} Accounts`,
      cardBg: 'bg-gradient-to-br from-rose-500/10 via-rose-400/5 to-transparent',
      cardBorder: 'border-rose-500/20',
      iconBg: 'bg-rose-500/15 text-rose-755',
      icon: UserX
    },
    {
      label: 'Flagged Warnings',
      value: `${flaggedCount} Active`,
      cardBg: 'bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent',
      cardBorder: 'border-amber-500/20',
      iconBg: 'bg-amber-500/15 text-amber-700',
      icon: ShieldAlert
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
                Security & Policy Enforcement
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
              Moderation Center
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
          {moderationStats.map((stat, idx) => {
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">User Moderation Ledger</h2>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search accounts..."
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
                  <th className="pb-4">Customer Details</th>
                  <th className="pb-4">Account ID</th>
                  <th className="pb-4">Flags Raised</th>
                  <th className="pb-4">Primary Infraction</th>
                  <th className="pb-4">Account State</th>
                  <th className="pb-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="text-sm font-semibold text-slate-600 hover:bg-emerald-50/20 transition-colors">
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{account.name}</span>
                        <span className="text-xs text-slate-400 font-normal">{account.email}</span>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-slate-400 font-bold">{account.id}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                        account.flags >= 5 ? 'bg-rose-50 text-rose-700 border-rose-100/50' :
                        account.flags > 0 ? 'bg-amber-50 text-amber-700 border-amber-100/50' :
                        'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {account.flags} Flags
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 font-medium">{account.reason}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                        account.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${account.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {account.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => initiateToggleStatus(account)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-[11px] font-bold transition-all border ${
                          account.status === 'Active'
                            ? 'bg-rose-50 hover:bg-rose-100/80 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {account.status === 'Active' ? <UserX size={14} /> : <ShieldCheck size={14} />}
                        {account.status === 'Active' ? 'Block Account' : 'Restore Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {modalConfig.isOpen && modalConfig.account && (
          <ConfirmModal
            isOpen={modalConfig.isOpen}
            onClose={() => setModalConfig({ isOpen: false, account: null })}
            onConfirm={handleConfirmAction}
            type={modalConfig.account.status === 'Active' ? 'danger' : 'success'}
            title={modalConfig.account.status === 'Active' ? 'Restrict Account Access' : 'Restore Account Access'}
            message={
              modalConfig.account.status === 'Active'
                ? `Are you sure you want to suspend access for ${modalConfig.account.name}? They will lose immediately access to platform services.`
                : `Are you sure you want to restore workspace privileges for ${modalConfig.account.name}? This resets their flags status.`
            }
            confirmText={modalConfig.account.status === 'Active' ? 'Yes, Block Account' : 'Yes, Restore Access'}
            cancelText="Cancel Action"
          />
        )}
      </AnimatePresence>
    </div>
  );
}