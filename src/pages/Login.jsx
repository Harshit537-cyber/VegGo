import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, Check, Leaf, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/50 to-slate-200 flex items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-6xl bg-white rounded-[36px] shadow-2xl border border-slate-100 flex flex-col md:flex-row overflow-hidden min-h-[800px]">
        
        <div className="w-full md:w-[45%] bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 p-10 md:p-14 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-500/5 border border-emerald-400/20 backdrop-blur-md shadow-inner">
              <Leaf size={28} className="text-emerald-400 animate-pulse" />
            </div>
            <span className="text-3xl font-black tracking-tight text-white">
              VegGo<span className="text-emerald-400 font-medium">Fresh</span>
            </span>
          </div>

          <div className="relative z-10 my-auto py-12 flex flex-col items-center">
            <div className="relative w-full max-w-[380px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-300 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                  System Status
                </span>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>

              <div className="space-y-5">
                <div className="bg-white/5 rounded-2xl p-5 flex items-center justify-between border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-400/20">
                      <Shield className="text-emerald-400" size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">SSL Encryption</p>
                      <p className="text-xs text-emerald-300/60 mt-0.5">Active & Secure</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check size={14} className="text-emerald-400" />
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 flex items-center justify-between border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-400/20">
                      <div className="w-5 h-5 rounded-full border-2 border-dashed border-emerald-400 animate-spin"></div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Cold Chain Logistics</p>
                      <p className="text-xs text-emerald-300/60 mt-0.5">Optimized Nodes</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check size={14} className="text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Admin Console</h2>
            <p className="text-base text-emerald-100/70 leading-relaxed max-w-sm">
              Access the unified supply control center. Monitor fresh stock levels, logistic flows, and live marketplace metrics.
            </p>
          </div>
        </div>

        <div className="w-full md:w-[55%] p-10 sm:p-14 lg:p-20 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-12">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
                Welcome back
              </h2>
              <p className="text-slate-500 text-base">
                Enter your credentials to manage the platform operations.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={22} />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-slate-800 text-base font-medium placeholder:text-slate-400"
                    placeholder="admin@veggofresh.com" 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-bold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <a href="#forgot" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={22} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-slate-800 text-base font-medium placeholder:text-slate-400"
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-3 select-none text-left"
                >
                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                    rememberMe ? 'bg-emerald-600 border-emerald-600 shadow-md shadow-emerald-500/20' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}>
                    {rememberMe && <Check size={14} className="text-white stroke-[3px]" />}
                  </div>
                  <span className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
                    Keep me signed in
                  </span>
                </button>
              </div>

              <button type="submit" className="w-full py-4.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all text-white font-bold text-base rounded-2xl shadow-xl shadow-emerald-600/15 flex items-center justify-center gap-2.5 group mt-4">
                Sign In to Dashboard
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}