import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Calendar, 
  RefreshCw, 
  ShoppingCart, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  User, 
  MapPin, 
  Plus, 
  Search, 
  SlidersHorizontal 
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

export default function LiveOrders() {
  const [currentTab, setCurrentTab] = useState('live-orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [orders, setOrders] = useState([
    { id: 'ORD-4091', customer: 'Rohan Sharma', address: 'Connaught Place, New Delhi', items: 'Organic Spinach (2kg), Red Tomatoes (3kg)', amount: '₹340.00', status: 'Incoming', time: 'Just now' },
    { id: 'ORD-4092', name: 'Priyan Sen', customer: 'Priya Sen', address: 'Salt Lake, Kolkata', items: 'Fresh Broccoli (1.5kg), Strawberries (1 Box)', amount: '₹520.00', status: 'Processing', time: '8 mins ago' },
    { id: 'ORD-4093', customer: 'Amit Verma', address: 'Indiranagar, Bengaluru', items: 'Sweet Potatoes (5kg), Fresh Mint (2 Bunches)', amount: '₹380.00', status: 'Out for Delivery', time: '14 mins ago' },
    { id: 'ORD-4094', customer: 'Sneha Patel', address: 'Andheri West, Mumbai', items: 'Button Mushrooms (1kg), Avocados (2 Units)', amount: '₹490.00', status: 'Processing', time: '22 mins ago' },
    { id: 'ORD-4095', customer: 'Vikram Malhotra', address: 'Banjara Hills, Hyderabad', items: 'Exotic Salad Box (2 Units)', amount: '₹600.00', status: 'Incoming', time: '29 mins ago' },
    { id: 'ORD-4096', customer: 'Ananya Roy', address: 'Gariahat, Kolkata', items: 'Fresh Basil (1 Bunch), Cherry Tomatoes (2 Boxes)', amount: '₹290.00', status: 'Out for Delivery', time: '35 mins ago' }
  ]);

  const handleAction = (id, nextStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        return { ...order, status: nextStatus };
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

  const incomingCount = orders.filter(o => o.status === 'Incoming').length;
  const processingCount = orders.filter(o => o.status === 'Processing').length;
  const deliveryCount = orders.filter(o => o.status === 'Out for Delivery').length;
  
  const totalRevenue = orders.reduce((sum, o) => {
    const numericValue = parseFloat(o.amount.replace(/[₹,]/g, ''));
    return sum + numericValue;
  }, 0);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.items.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const liveStats = [
    {
      label: 'Incoming Requests',
      value: `${incomingCount} Pending`,
      cardBg: 'bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent',
      cardBorder: 'border-amber-500/20',
      iconBg: 'bg-amber-500/15 text-amber-700',
      icon: Clock
    },
    {
      label: 'Processing Batch',
      value: `${processingCount} Orders`,
      cardBg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent',
      cardBorder: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-700',
      icon: ShoppingCart
    },
    {
      label: 'Out For Delivery',
      value: `${deliveryCount} Active`,
      cardBg: 'bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-transparent',
      cardBorder: 'border-teal-500/20',
      iconBg: 'bg-teal-500/15 text-teal-700',
      icon: Truck
    },
    {
      label: 'Total Active Value',
      value: `₹${totalRevenue.toFixed(2)}`,
      cardBg: 'bg-gradient-to-br from-green-600/10 via-green-500/5 to-transparent',
      cardBorder: 'border-green-600/20',
      iconBg: 'bg-green-600/15 text-green-700',
      icon: CheckCircle2
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
                Real-time Order Operations
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
              Live Orders Feed
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
          {liveStats.map((stat, idx) => {
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
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Operations Ledger</h2>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {['All', 'Incoming', 'Processing', 'Out for Delivery'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      statusFilter === status
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search active orders..."
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
                  <th className="pb-4">Customer Details</th>
                  <th className="pb-4">Items Summary</th>
                  <th className="pb-4">Total Amount</th>
                  <th className="pb-4">Age Limit</th>
                  <th className="pb-4">Execution State</th>
                  <th className="pb-4 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 font-bold text-sm">
                      No matching active live orders.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="text-sm font-semibold text-slate-600 hover:bg-emerald-50/20 transition-colors">
                      <td className="py-5 font-mono text-slate-400 font-bold">{order.id}</td>
                      <td className="py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{order.customer}</span>
                          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <MapPin size={10} className="text-slate-400" />
                            {order.address}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 max-w-[200px] truncate text-slate-500 font-medium">{order.items}</td>
                      <td className="py-5 font-mono text-slate-800 font-extrabold">{order.amount}</td>
                      <td className="py-5 text-xs text-slate-400 font-medium">{order.time}</td>
                      <td className="py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                          order.status === 'Incoming' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          order.status === 'Processing' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          'bg-teal-50 text-teal-700 border-teal-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            order.status === 'Incoming' ? 'bg-amber-550' :
                            order.status === 'Processing' ? 'bg-emerald-500' :
                            'bg-teal-550'
                          }`} />
                          {order.status}
                        </span>
                      </td>
                      <td className="py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-600 transition-all">
                            <Eye size={14} />
                          </button>
                          {order.status === 'Incoming' && (
                            <button
                              onClick={() => handleAction(order.id, 'Processing')}
                              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200/50 rounded-2xl text-[11px] font-bold transition-all"
                            >
                              Accept Order
                            </button>
                          )}
                          {order.status === 'Processing' && (
                            <button
                              onClick={() => handleAction(order.id, 'Out for Delivery')}
                              className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-600 border border-teal-200/50 rounded-2xl text-[11px] font-bold transition-all"
                            >
                              Assign Dispatch
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