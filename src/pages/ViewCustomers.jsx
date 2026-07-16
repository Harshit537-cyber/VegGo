import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Calendar, 
  RefreshCw, 
  Users, 
  UserCheck, 
  UserX, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search,
  Sparkles,
  Eye,
  Trash2,
  X,
  ShoppingBag,
  CreditCard,
  User
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

export default function ViewCustomers() {
  const [currentTab, setCurrentTab] = useState('view-customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [customers, setCustomers] = useState([
    { id: 'CUST-84920', name: 'Alexander Wright', email: 'alexander.w@gmail.com', orders: '42 Orders', spent: '₹1,840.50', status: 'Active', joined: 'Jan 12, 2025' },
    { id: 'CUST-84919', name: 'Beatrice Vance', email: 'b.vance@yahoo.com', orders: '28 Orders', spent: '₹1,290.00', status: 'Active', joined: 'Feb 04, 2025' },
    { id: 'CUST-84918', name: 'Charlie Peterson', email: 'charliep@live.com', orders: '15 Orders', spent: '₹610.20', status: 'Suspended', joined: 'Feb 19, 2025' },
    { id: 'CUST-84917', name: 'Diana Prince', email: 'diana.p@amazon.com', orders: '64 Orders', spent: '₹3,120.40', status: 'Active', joined: 'Mar 01, 2025' },
    { id: 'CUST-84916', name: 'Ethan Hunt', email: 'ethan.h@imf.org', orders: '3 Orders', spent: '₹94.00', status: 'Inactive', joined: 'Apr 11, 2025' },
    { id: 'CUST-84915', name: 'Fiona Gallagher', email: 'fiona.g@southside.com', orders: '37 Orders', spent: '₹1,110.10', status: 'Active', joined: 'May 20, 2025' }
  ]);

  const customerStats = [
    { 
      label: 'Total Customers', 
      value: '24,840', 
      change: '+18.4%', 
      up: true,
      cardBg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent',
      cardBorder: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-700',
      tagColor: 'text-emerald-800 bg-emerald-50 border-emerald-100/50',
      icon: Users
    },
    { 
      label: 'Active This Month', 
      value: '18,290', 
      change: '+10.2%', 
      up: true,
      cardBg: 'bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-transparent',
      cardBorder: 'border-teal-500/20',
      iconBg: 'bg-teal-500/15 text-teal-700',
      tagColor: 'text-teal-800 bg-teal-50 border-teal-100/50',
      icon: UserCheck
    },
    { 
      label: 'Premium Subscribers', 
      value: '4,120', 
      change: '+15.5%', 
      up: true,
      cardBg: 'bg-gradient-to-br from-green-600/10 via-green-500/5 to-transparent',
      cardBorder: 'border-green-600/20',
      iconBg: 'bg-green-600/15 text-green-700',
      tagColor: 'text-green-800 bg-green-50 border-green-100/50',
      icon: Sparkles
    },
    { 
      label: 'Suspended Accounts', 
      value: '84', 
      change: '-4.1%', 
      up: false,
      cardBg: 'bg-gradient-to-br from-rose-500/10 via-rose-400/5 to-transparent',
      cardBorder: 'border-rose-500/20',
      iconBg: 'bg-rose-500/15 text-rose-755',
      tagColor: 'text-rose-800 bg-rose-50 border-rose-100/50',
      icon: UserX
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleDelete = (id) => {
    setCustomers((prev) => prev.filter(customer => customer.id !== id));
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
                User Directory Operations
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
              Customer Base
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
          {customerStats.map((stat, idx) => {
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
                  <span className="text-xs text-slate-400 font-bold">Monthly Progress</span>
                </div>
              </div>
            );
          })}
        </section>

        <section className="bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Registered Customer Ledger</h2>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by ID, name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase font-bold tracking-widest text-slate-400">
                  <th className="pb-4">Customer ID</th>
                  <th className="pb-4">Profile Details</th>
                  <th className="pb-4">Completed Purchases</th>
                  <th className="pb-4">Lifetime Outlay</th>
                  <th className="pb-4">Registration Date</th>
                  <th className="pb-4 text-center">Account State</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {filteredCustomers.map((customer, idx) => (
                  <tr key={idx} className="text-sm font-semibold text-slate-600 hover:bg-emerald-50/20 transition-colors">
                    <td className="py-4 font-mono text-slate-400 font-bold">{customer.id}</td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{customer.name}</span>
                        <span className="text-xs text-slate-400 font-normal">{customer.email}</span>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-slate-600">{customer.orders}</td>
                    <td className="py-4 font-mono text-slate-800 font-extrabold">{customer.spent}</td>
                    <td className="py-4 text-xs text-slate-400 font-medium">{customer.joined}</td>
                    <td className="py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                        customer.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        customer.status === 'Inactive' ? 'bg-slate-50 text-slate-500 border-slate-100' :
                        'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          customer.status === 'Active' ? 'bg-emerald-500' :
                          customer.status === 'Inactive' ? 'bg-slate-500' :
                          'bg-rose-500'
                        }`} />
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <User size={28} />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 block tracking-wider">{selectedCustomer.id}</span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{selectedCustomer.name}</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-700 rounded-xl">
                    <ShoppingBag size={18} />
                  </div>
                  <span className="text-sm font-semibold text-slate-500">Total Purchase Volume</span>
                </div>
                <span className="font-mono font-extrabold text-slate-900">{selectedCustomer.orders}</span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-700 rounded-xl">
                    <CreditCard size={18} />
                  </div>
                  <span className="text-sm font-semibold text-slate-500">Lifetime Account Outlay</span>
                </div>
                <span className="font-mono font-extrabold text-emerald-600">{selectedCustomer.spent}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100 text-sm">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</span>
                <span className="font-semibold text-slate-800 break-all">{selectedCustomer.email}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Registration Date</span>
                <span className="font-semibold text-slate-800">{selectedCustomer.joined}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}