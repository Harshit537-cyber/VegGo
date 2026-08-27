import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
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
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';

// Animated Value Counter Component
function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (!value) {
      setDisplayValue('0');
      return;
    }

    const strVal = String(value);
    const match = strVal.match(/([₹\d,.]+)\s*(.*)/);
    if (!match) {
      setDisplayValue(strVal);
      return;
    }

    const isRupee = strVal.startsWith('₹');
    const rawNumberStr = match[1].replace(/[₹,]/g, '');
    const targetNum = parseFloat(rawNumberStr);
    const suffix = match[2] || '';
    const isDecimal = rawNumberStr.includes('.');
    const hasComma = match[1].includes(',');

    if (isNaN(targetNum)) {
      setDisplayValue(strVal);
      return;
    }

    const duration = 1000;
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
        setDisplayValue(strVal);
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
    { id: 'CUST-84920', name: 'Alexander Wright', email: 'alexander.w@gmail.com', orders: '42', spent: '₹1,840.50', status: 'Active', joined: 'Jan 12, 2025' },
    { id: 'CUST-84919', name: 'Beatrice Vance', email: 'b.vance@yahoo.com', orders: '28', spent: '₹1,290.00', status: 'Active', joined: 'Feb 04, 2025' },
    { id: 'CUST-84918', name: 'Charlie Peterson', email: 'charliep@live.com', orders: '15', spent: '₹610.20', status: 'Suspended', joined: 'Feb 19, 2025' },
    { id: 'CUST-84917', name: 'Diana Prince', email: 'diana.p@amazon.com', orders: '64', spent: '₹3,120.40', status: 'Active', joined: 'Mar 01, 2025' },
    { id: 'CUST-84916', name: 'Ethan Hunt', email: 'ethan.h@imf.org', orders: '3', spent: '₹94.00', status: 'Inactive', joined: 'Apr 11, 2025' },
    { id: 'CUST-84915', name: 'Fiona Gallagher', email: 'fiona.g@southside.com', orders: '37', spent: '₹1,110.10', status: 'Active', joined: 'May 20, 2025' }
  ]);

  // Top Key Metrics
  const customerStats = [
    { 
      label: 'Total Active Customers', 
      value: '24,840', 
      change: '+18.4%', 
      up: true,
      accentColor: 'bg-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-700',
      tagColor: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Users
    },
    { 
      label: 'Monthly Active Users', 
      value: '18,290', 
      change: '+10.2%', 
      up: true,
      accentColor: 'bg-teal-600',
      iconBg: 'bg-teal-50 text-teal-700',
      tagColor: 'text-teal-700 bg-teal-50/80 border-teal-200/80',
      icon: UserCheck
    },
    { 
      label: 'Premium Members', 
      value: '4,120', 
      change: '+15.5%', 
      up: true,
      accentColor: 'bg-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-700',
      tagColor: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Sparkles
    },
    { 
      label: 'Suspended Accounts', 
      value: '84', 
      change: '-4.1%', 
      up: false,
      accentColor: 'bg-green-700',
      iconBg: 'bg-green-50 text-green-700',
      tagColor: 'text-rose-700 bg-rose-50/80 border-rose-200/80',
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
    setCustomers((prev) => prev.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">
        
        {/* Animated Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900 relative overflow-hidden group"
        >
          {/* Ambient Lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm backdrop-blur-md">
                <Zap size={12} className="text-emerald-400 animate-bounce" />
                Customer Management Directory
              </span>
              
              <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-900/80 px-3 py-1 rounded-full text-rose-300 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white">LIVE ADMIN VEG GO</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white flex items-center gap-3">
              Customer Directory
              <Sparkles className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </h1>
          </div>
          
          <div className="flex items-center gap-3 self-start lg:self-center z-10">
            <div className="bg-emerald-900/60 border border-emerald-800 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-100 shadow-inner backdrop-blur-sm">
              <Calendar size={14} className="text-emerald-400" />
              <span>Oct 12, 2026</span>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner group/btn"
              title="Refresh Data"
            >
              <RefreshCw size={15} className={`text-emerald-300 transition-transform duration-700 ${isRefreshing ? 'rotate-180 scale-110' : 'group-hover/btn:rotate-45'}`} />
            </motion.button>
          </div>
        </motion.header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {customerStats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accentColor} transition-all duration-300 group-hover:h-2`} />
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:scale-125" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-black uppercase tracking-wider group-hover:text-emerald-700 transition-colors duration-200">
                      {stat.label}
                    </span>
                    <motion.div 
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      className={`${stat.iconBg} p-2.5 rounded-2xl transition-all shadow-xs`}
                    >
                      <IconComponent size={18} />
                    </motion.div>
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl font-semibold text-black tracking-tight font-mono group-hover:text-emerald-800 transition-colors duration-200">
                    <AnimatedValue value={stat.value} key={refreshKey} />
                  </h3>
                </div>
                
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between relative z-10">
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-transform duration-300 group-hover:scale-105 ${stat.tagColor}`}>
                    {stat.up ? (
                      <ArrowUpRight size={13} className="text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    ) : (
                      <ArrowDownRight size={13} className="text-rose-600 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                    )}
                    {stat.change}
                  </span>
                  <span className="text-[11px] text-black font-semibold">Monthly Period</span>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Full Width Customer Table Container */}
        <section className="w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                    <Users size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-black tracking-tight">Customer Records</h2>
                    <p className="text-xs font-semibold text-black">Active customer account directory</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Desktop Dynamic Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">
                      <th className="py-3.5 px-4 rounded-l-xl">User ID</th>
                      <th className="py-3.5 px-4">Customer Details</th>
                      <th className="py-3.5 px-4 text-center">Orders</th>
                      <th className="py-3.5 px-4">Total Outlay</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer, idx) => (
                        <motion.tr 
                          key={customer.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 + idx * 0.05 }}
                          className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                        >
                          <td className="py-3.5 px-4 font-mono text-black font-semibold group-hover:text-emerald-700 transition-colors">{customer.id}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                                {customer.name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-black group-hover:translate-x-0.5 group-hover:text-emerald-700 transition-all duration-200">{customer.name}</span>
                                <span className="text-[10px] text-slate-500">{customer.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-center text-black">{customer.orders}</td>
                          <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold">{customer.spent}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all duration-300 group-hover:scale-105 ${
                              customer.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs' :
                              customer.status === 'Inactive' ? 'bg-slate-100 text-slate-600 border-slate-200/80 shadow-2xs' :
                              'bg-rose-50 text-rose-700 border-rose-200/80 shadow-2xs'
                            }`}>
                              {customer.status === 'Active' ? (
                                <CheckCircle2 size={11} className="text-emerald-600" />
                              ) : (
                                <Clock size={11} className="text-amber-600" />
                              )}
                              {customer.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setSelectedCustomer(customer)}
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="View Info"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(customer.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Remove User"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                          No matching customer profiles found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden space-y-3">
                {filteredCustomers.map((customer) => (
                  <motion.div 
                    key={customer.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-black font-semibold">{customer.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        customer.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        customer.status === 'Inactive' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {customer.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700 transition-colors duration-200">{customer.name}</h4>
                      <p className="text-xs text-slate-500">{customer.email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">Total Orders</span>
                        <span className="font-mono font-semibold text-black">{customer.orders}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-black block">Total Spent</span>
                        <span className="font-mono font-semibold text-emerald-700">{customer.spent}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 relative"
            >
              <button
                onClick={() => setSelectedCustomer(null)}
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-2xl flex items-center justify-center font-bold text-lg">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">{selectedCustomer.id}</span>
                  <h3 className="text-lg font-bold text-black">{selectedCustomer.name}</h3>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                      <ShoppingBag size={16} />
                    </div>
                    <span className="text-xs font-semibold text-black">Total Orders</span>
                  </div>
                  <span className="font-mono font-bold text-black text-sm">{selectedCustomer.orders}</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                      <CreditCard size={16} />
                    </div>
                    <span className="text-xs font-semibold text-black">Total Outlay</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 text-sm">{selectedCustomer.spent}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-0.5">Email</span>
                  <span className="font-semibold text-slate-600 break-all">{selectedCustomer.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-0.5">Joined</span>
                  <span className="font-semibold text-slate-600">{selectedCustomer.joined}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}