import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Settings,
  Mail,
  Database,
  Shield,
  Smartphone,
  Cpu,
  Save,
  CheckCircle2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function SystemSettings() {
  const [currentTab, setCurrentTab] = useState('general-settings');
  const [showNotification, setShowNotification] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const [smtpHost, setSmtpHost] = useState('smtp.sendgrid.net');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smsGateway, setSmsGateway] = useState('twilio');
  const [minAndroidVersion, setMinAndroidVersion] = useState('2.4.1');
  const [minIosVersion, setMinIosVersion] = useState('2.3.0');
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleDatabaseBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      setShowNotification(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/10 to-teal-50/20 flex font-sans antialiased text-slate-800">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto max-h-screen relative">
        {showNotification && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-emerald-500/20 animate-fade-in">
            <CheckCircle2 className="text-emerald-400" size={18} />
            <span className="text-xs font-bold">System configurations updated successfully</span>
          </div>
        )}

        <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-850 text-white shadow-lg overflow-hidden border border-emerald-700/30">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 z-10 flex-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15">
              Admin Panel
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              System Settings
            </h1>
            <p className="text-xs text-emerald-200/85">
              Control system integrations, environment configurations, and application performance parameters.
            </p>
          </div>
        </header>

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-emerald-100/50 shadow-sm space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                <Mail size={18} className="text-emerald-600" />
                SMTP & Mail Integrations
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SMTP Host</label>
                  <input 
                    type="text" 
                    value={smtpHost} 
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SMTP Port</label>
                  <input 
                    type="text" 
                    value={smtpPort} 
                    onChange={(e) => setSmtpPort(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sender Email Address</label>
                  <input 
                    type="email" 
                    defaultValue="no-reply@veggofresh.com" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SMTP Encryption</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all">
                    <option value="tls">TLS (Recommended)</option>
                    <option value="ssl">SSL</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-emerald-100/50 shadow-sm space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                <Smartphone size={18} className="text-emerald-600" />
                Mobile Application Version Control
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Minimum Android Version</label>
                  <input 
                    type="text" 
                    value={minAndroidVersion} 
                    onChange={(e) => setMinAndroidVersion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Minimum iOS Version</label>
                  <input 
                    type="text" 
                    value={minIosVersion} 
                    onChange={(e) => setMinIosVersion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-emerald-100/50 shadow-sm space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                <Cpu size={18} className="text-emerald-600" />
                Third Party API Integrations
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SMS Gateway Provider</label>
                  <select 
                    value={smsGateway} 
                    onChange={(e) => setSmsGateway(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  >
                    <option value="twilio">Twilio SMS</option>
                    <option value="msg91">MSG91 Gateway</option>
                    <option value="firebase">Firebase OTP</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Google Maps API Key</label>
                  <input 
                    type="password" 
                    defaultValue="AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-emerald-100/50 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Database size={18} className="text-emerald-600" />
                  Database Maintenance
                </h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Create offline server backups and clean transaction logs to keep server performance optimized.
              </p>
              <button 
                type="button"
                onClick={handleDatabaseBackup}
                disabled={isBackingUp}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-2xl text-xs font-bold transition-all duration-300 active:scale-95 border border-slate-200"
              >
                <RefreshCw size={14} className={isBackingUp ? 'animate-spin text-emerald-600' : 'text-slate-600'} />
                {isBackingUp ? 'Backing Up Database...' : 'Run Standard Backup'}
              </button>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-emerald-100/50 shadow-sm space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Shield size={18} className="text-emerald-600" />
                Security Environment
              </h2>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">Two-Factor Auth (2FA)</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Required for Admin Login</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${twoFactorAuth ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${twoFactorAuth ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Save size={16} />
              Save System Settings
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}