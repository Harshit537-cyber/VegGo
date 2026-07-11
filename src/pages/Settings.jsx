import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { User, Bell, Shield, Globe, Save, Mail, Key } from 'lucide-react';

export default function Settings() {
  const [currentTab, setCurrentTab] = useState('settings');
  
  const [profile, setProfile] = useState({
    name: 'Jane Doe',
    email: 'jane.doe@supplychain.com',
    role: 'Operations Manager'
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReport: false
  });

  return (
    <div className="w-full min-h-screen bg-slate-50 flex">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 min-h-screen p-8 lg:p-12 overflow-y-auto w-full">
        <header className="mb-10">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Configuration
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">System Settings</h1>
          <p className="text-slate-500 mt-1">Manage your profile, system preferences, and security settings.</p>
        </header>

        <div className="w-full space-y-6">
          <section className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-200/60 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <User size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Profile Information</h2>
                <p className="text-xs text-slate-500">Update your account details and public information.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Role</label>
                <input 
                  type="text" 
                  value={profile.role} 
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-200/60 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Notification Preferences</h2>
                <p className="text-xs text-slate-500">Choose when and how you want to be notified.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Email Alerts</h4>
                  <p className="text-xs text-slate-500">Receive system updates and critical issue notices via email.</p>
                </div>
                <button 
                  onClick={() => setNotifications({ ...notifications, emailAlerts: !notifications.emailAlerts })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${notifications.emailAlerts ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'}`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-sm" />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Push Notifications</h4>
                  <p className="text-xs text-slate-500">Get alerts directly on your browser or device screen.</p>
                </div>
                <button 
                  onClick={() => setNotifications({ ...notifications, pushNotifications: !notifications.pushNotifications })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${notifications.pushNotifications ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'}`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-sm" />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Weekly Summary Reports</h4>
                  <p className="text-xs text-slate-500">Receive a consolidated status report every Monday.</p>
                </div>
                <button 
                  onClick={() => setNotifications({ ...notifications, weeklyReport: !notifications.weeklyReport })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${notifications.weeklyReport ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'}`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-sm" />
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-200/60 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Shield size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Security & Authentication</h2>
                <p className="text-xs text-slate-500">Manage credentials and login configurations.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center gap-2 px-4 py-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-all">
                <Key size={16} />
                Change Password
              </button>
              <button className="flex items-center gap-2 px-4 py-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-all">
                <Globe size={16} />
                Manage Active Sessions
              </button>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4">
            <button className="px-6 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl transition-all">
              Cancel
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all">
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}