import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Leaf,
  LayoutDashboard,
  Package,
  Settings,
  Wallet,
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  X,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Dot,
  Bell,
  HelpCircle,
  Mail,
  FileText,
  Shield,
  PlusCircle,
  MessageSquare,
  Store,
  Truck,
  User,
  Headphones,
  UserCheck,
  Tag,
  Layers,
  BarChart3,
  TrendingUp,
  Search
} from "lucide-react";
import LogoutModal from "../Common/LogoutModal";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false); // Mobile drawer open state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("veggo_sidebar_collapsed") === "true";
  });
  const [expandedGroup, setExpandedGroup] = useState("management");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const menuGroups = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      subItems: [],
    },
    {
      id: "management",
      label: "Management",
      icon: Users,
      subItems: [
        {
          id: "vendors",
          label: "Vendors / Stores",
          icon: Store,
          path: "/management/vendors",
        },
        {
          id: "delivery",
          label: "Delivery Fleet",
          icon: Truck,
          path: "/management/delivery",
        },
        {
          id: "customers",
          label: "Customer Directory",
          icon: User,
          path: "/management/customers",
        },
      ],
    },
    {
      id: "products",
      label: "Product Catalog",
      icon: Package,
      subItems: [
        {
          id: "catalog",
          label: "All Products",
          icon: Package,
          path: "/products/list",
        },
        {
          id: "categories",
          label: "Categories",
          icon: Layers,
          path: "/products/categories",
        },
        {
          id: "subcategories",
          label: "Subcategories",
          icon: Tag,
          path: "/products/subcategories",
        },
      ],
    },
    {
      id: "payouts",
      label: "Payouts & Wallet",
      icon: Wallet,
      subItems: [
        {
          id: "wallet",
          label: "Admin Wallet",
          icon: Wallet,
          path: "/payouts/wallet",
        },
        {
          id: "payout_requests",
          label: "Payout Requests",
          icon: TrendingUp,
          path: "/payouts/vendors",
        },
      ],
    },
    {
      id: "orders",
      label: "Consignments & Fleet",
      icon: Truck,
      path: "/dashboard/orders-monitoring",
      subItems: [],
    },
    {
      id: "reports",
      label: "Analytics & Reports",
      icon: BarChart3,
      path: "/reports/revenue",
      subItems: [],
    },
    {
      id: "notifications",
      label: "Push Notifications",
      icon: Bell,
      path: "/notifications",
      subItems: [],
    },
    {
      id: "settings",
      label: "System Settings",
      icon: Settings,
      path: "/settings",
      subItems: [],
    },
  ];

  // Auto-expand active group
  useEffect(() => {
    const activeGroup = menuGroups.find((group) =>
      group.subItems.some((subItem) => location.pathname === subItem.path)
    );

    if (activeGroup) {
      setExpandedGroup(activeGroup.id);
    }
  }, [location.pathname]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("veggo_sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleGroupToggle = (group) => {
    if (!group.subItems.length) {
      setIsOpen(false);
      navigate(group.path);
      return;
    }

    if (isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem("veggo_sidebar_collapsed", "false");
      setExpandedGroup(group.id);
      return;
    }

    setExpandedGroup((prev) => (prev === group.id ? null : group.id));
  };

  const handleSubItemClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* 1. Full-Width Top Navigation Bar (Sign-In page luminous aesthetic) */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white/95 backdrop-blur-xl border-b border-emerald-100/90 text-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        {/* Top multi-color gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />

        {/* Left: VegGo Brand Logo & Hamburger */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 cursor-pointer select-none group"
            title="VegGoFresh Admin Platform"
          >
            {/* Gradient Rounded Box with Leaf Logo */}
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform shrink-0">
              <Leaf size={18} className="drop-shadow-xs" />
            </div>

            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                VegGo<span className="text-emerald-600 font-extrabold">Fresh</span>
              </span>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest block -mt-0.5">
                Admin Console
              </span>
            </div>
          </div>

          {/* Hamburger Menu Icon */}
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsOpen((prev) => !prev);
              } else {
                toggleCollapse();
              }
            }}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all cursor-pointer ml-1"
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Right: Notifications & Circular User Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Bell with 9+ Count Badge */}
          <button
            onClick={() => navigate("/notifications")}
            className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
            title="Notifications"
          >
            <Bell size={19} />
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-4.5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white shadow-xs">
              9+
            </span>
          </button>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/70 border border-emerald-200/80 transition-all cursor-pointer shadow-2xs group"
              title="Admin Profile"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                SA
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
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">Administrator</p>
                    <p className="text-[11px] text-slate-500 truncate">admin@veggofresh.com</p>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/settings");
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <ShieldCheck size={15} className="text-emerald-600" />
                      Settings & Security
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogoutClick();
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

      {/* Backdrop for Mobile Drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* 2. Fixed Left Sidebar with Sign-In Light Aesthetic */}
      <aside
        className={`fixed top-16 left-0 bottom-0 z-40 bg-white/95 backdrop-blur-2xl border-r border-emerald-100/90 text-slate-800 flex flex-col transition-all duration-300 ease-out shadow-sm lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "w-20" : "w-64"}`}
      >
        {/* Navigation Items */}
        <nav className={`flex-1 overflow-y-auto py-5 space-y-1.5 scrollbar-thin scrollbar-thumb-emerald-100 scrollbar-track-transparent ${isCollapsed ? 'px-2' : 'px-3.5'}`}>
          {menuGroups.map((group) => {
            const isExpanded = expandedGroup === group.id;

            const isDirectSelected = location.pathname === group.path;
            const hasActiveSub = group.subItems.some(
              (subItem) => location.pathname === subItem.path
            );
            const isSelected = isDirectSelected || hasActiveSub;

            const GroupIcon = group.icon;

            return (
              <div key={group.id} className="relative group/item space-y-1">
                <button
                  onClick={() => handleGroupToggle(group)}
                  className={`w-full flex items-center rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isCollapsed
                      ? "justify-center p-3"
                      : "justify-between px-3.5 py-2.5"
                  } ${
                    isDirectSelected
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/20"
                      : isSelected || (isExpanded && !isCollapsed)
                      ? "bg-emerald-50/90 text-emerald-800 font-bold border border-emerald-200/80"
                      : "text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/60"
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className={`shrink-0 ${
                      isDirectSelected ? "text-white" : isSelected ? "text-emerald-600" : "text-slate-500 group-hover/item:text-emerald-700"
                    }`}>
                      <GroupIcon size={19} />
                    </div>

                    {!isCollapsed && <span>{group.label}</span>}
                  </div>

                  {!isCollapsed && group.subItems.length > 0 &&
                    (isExpanded ? (
                      <ChevronUp size={16} className="text-emerald-700 shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400 shrink-0" />
                    ))}
                </button>

                {/* Floating Flyout Tooltip when Collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full top-0 ml-3 z-50 invisible group-hover/item:visible opacity-0 group-hover/item:opacity-100 transition-all duration-200 pointer-events-none group-hover/item:pointer-events-auto">
                    <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-3 min-w-[190px] space-y-2 text-slate-800">
                      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                        <GroupIcon size={15} className="text-emerald-600" />
                        <span className="text-xs font-bold text-slate-900">{group.label}</span>
                      </div>

                      {group.subItems.length > 0 ? (
                        <div className="space-y-1">
                          {group.subItems.map((subItem) => {
                            const isSubSelected = location.pathname === subItem.path;
                            const SubIcon = subItem.icon;
                            return (
                              <button
                                key={subItem.id}
                                onClick={() => handleSubItemClick(subItem.path)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                                  isSubSelected
                                    ? "bg-emerald-600 text-white font-bold shadow-xs"
                                    : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                                }`}
                              >
                                <SubIcon size={14} />
                                {subItem.label}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSubItemClick(group.path)}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                        >
                          Open {group.label}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Submenu Accordion when Expanded */}
                {!isCollapsed && group.subItems.length > 0 && (
                  <div
                    className={`ml-5 pl-3 border-l-2 border-emerald-200/80 space-y-1 my-1 transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded
                        ? "max-h-96 opacity-100 py-1"
                        : "max-h-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    {group.subItems.map((subItem) => {
                      const isSubSelected = location.pathname === subItem.path;
                      const SubIcon = subItem.icon;

                      return (
                        <button
                          key={subItem.id}
                          onClick={() => handleSubItemClick(subItem.path)}
                          className={`w-full text-left px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-between ${
                            isSubSelected
                              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-sm shadow-emerald-600/20"
                              : "text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/70"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <SubIcon size={15} className={isSubSelected ? "text-white" : "text-emerald-600"} />
                            <span>{subItem.label}</span>
                          </div>
                          {isSubSelected && <Dot size={18} className="text-emerald-200 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer Logout Button */}
        <div className={`p-3.5 border-t border-slate-100 shrink-0`}>
          <button
            onClick={handleLogoutClick}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl text-xs font-bold text-rose-600 bg-rose-50/80 hover:bg-rose-600 hover:text-white border border-rose-200/60 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-rose-600/20 ${
              isCollapsed ? 'p-3' : 'px-3.5 py-2.5'
            }`}
            title="Logout Session"
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Logout Session</span>}
          </button>
        </div>
      </aside>

      {/* 3. Desktop Column Spacer */}
      <div
        className="hidden lg:block shrink-0 transition-all duration-300"
        style={{ width: isCollapsed ? "5rem" : "16rem" }}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}

export default Sidebar;