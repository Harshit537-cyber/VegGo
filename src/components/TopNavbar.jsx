import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Leaf, 
  Menu, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Search
} from 'lucide-react';
import LogoutModal from '../Common/LogoutModal';

export default function TopNavbar({ onToggleSidebar, isSidebarCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(9);

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 shadow-xs">
        {/* Left: Brand / Sidebar Toggle */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 transition-all cursor-pointer shadow-2xs"
            title="Toggle Sidebar"
          >
            <Menu size={19} />
          </button>

          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 shrink-0 group-hover:scale-105 transition-transform">
              <Leaf size={18} className="drop-shadow-xs" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                VegGo<span className="text-emerald-600 font-extrabold">Fresh</span>
              </span>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest block -mt-0.5">
                Admin Console
              </span>
            </div>
          </div>
        </div>

        {/* Right: Notifications & Profile Badge */}
        <div className="flex items-center gap-3">
          {/* Notifications Trigger */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 transition-all cursor-pointer shadow-2xs"
            title="Notifications"
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white shadow-xs">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="relative">
                <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                  SA
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-800 block leading-tight">Super Admin</span>
                <span className="text-[10px] font-semibold text-emerald-700 block">Console Online</span>
              </div>

              <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-transform" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <>
                <div 
                  onClick={() => setIsProfileOpen(false)} 
                  className="fixed inset-0 z-40"
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">Administrator</p>
                    <p className="text-[11px] text-slate-500 truncate">admin@veggofresh.com</p>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <ShieldCheck size={15} className="text-emerald-600" />
                      Security & Settings
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsLogoutModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <LogOut size={15} />
                      Logout Session
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
