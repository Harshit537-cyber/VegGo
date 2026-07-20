import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Percent, 
  DollarSign, 
  CreditCard, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Building
} from 'lucide-react';

export default function PaymentCommissions() {
  const [currentTab, setCurrentTab] = useState('payment-methods');
  const [showNotification, setShowNotification] = useState(false);

  const [platformCommission, setPlatformCommission] = useState(12);
  const [payoutLimit, setPayoutLimit] = useState(1500);
  const [fixedFee, setFixedFee] = useState(15);
  const [gstPercentage, setGstPercentage] = useState(18);

  const [razorpayActive, setRazorpayActive] = useState(true);
  const [stripeActive, setStripeActive] = useState(false);
  const [codActive, setCodActive] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/10 to-teal-50/20 flex font-sans antialiased text-slate-800">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto max-h-screen relative">
        {showNotification && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-emerald-500/20 animate-fade-in">
            <CheckCircle2 className="text-emerald-400" size={18} />
            <span className="text-xs font-bold">Payment parameters updated successfully</span>
          </div>
        )}

        <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-850 text-white shadow-lg overflow-hidden border border-emerald-700/30">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 z-10 flex-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15">
              Financial Panel
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              Payment & Commissions
            </h1>
            <p className="text-xs text-emerald-200/85">
              Configure settlement policies, platform fees, taxes, and payment processing rules.
            </p>
          </div>
        </header>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-emerald-100/50 shadow-sm space-y-8">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                <Percent size={18} className="text-emerald-600" />
                Commission Configuration
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span className="uppercase tracking-wider">Default Platform Commission</span>
                  <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg text-sm">{platformCommission}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="40" 
                  value={platformCommission}
                  onChange={(e) => setPlatformCommission(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
                <p className="text-[11px] text-slate-400 font-medium">This percentage is deducted from vendor earnings on every order completed.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign size={14} className="text-emerald-600" />
                    Fixed Transaction Fee
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={fixedFee} 
                      onChange={(e) => setFixedFee(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">INR</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-600" />
                    Operational Tax (GST)
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={gstPercentage} 
                      onChange={(e) => setGstPercentage(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-emerald-100/50 shadow-sm space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                <Building size={18} className="text-emerald-600" />
                Payout & Settlement Parameters
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Minimum Vendor Payout Balance</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={payoutLimit} 
                      onChange={(e) => setPayoutLimit(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">INR</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Automated Settlement Cycle</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all">
                    <option value="weekly">Weekly settlements</option>
                    <option value="biweekly">Bi-weekly settlements</option>
                    <option value="monthly">Monthly settlements</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-emerald-100/50 shadow-sm space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                <CreditCard size={18} className="text-emerald-600" />
                Active Gateway Channels
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Razorpay API</p>
                    <p className={`text-[9px] font-bold uppercase mt-0.5 ${razorpayActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {razorpayActive ? 'Active' : 'Offline'}
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setRazorpayActive(!razorpayActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${razorpayActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${razorpayActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Stripe System</p>
                    <p className={`text-[9px] font-bold uppercase mt-0.5 ${stripeActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {stripeActive ? 'Active' : 'Offline'}
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setStripeActive(!stripeActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${stripeActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${stripeActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Cash on Delivery (COD)</p>
                    <p className={`text-[9px] font-bold uppercase mt-0.5 ${codActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {codActive ? 'Active' : 'Offline'}
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setCodActive(!codActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${codActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${codActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100/65 flex gap-3">
              <AlertCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-800/80 leading-relaxed font-semibold">
                Changing system financial metrics immediately adjusts all pending and future transaction balances globally.
              </p>
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Save size={16} />
              Save Payment Rules
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}