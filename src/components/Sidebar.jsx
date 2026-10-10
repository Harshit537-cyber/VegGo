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
  Dot
} from "lucide-react";
import LogoutModal from "../Common/LogoutModal";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false); // Mobile drawer open state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("veggo_sidebar_collapsed") === "true";
  });
  const [expandedGroup, setExpandedGroup] = useState(null);
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
          id: "customers",
          label: "Customers",
          path: "/management/customers",
        },
        {
          id: "delivery",
          label: "Delivery",
          path: "/management/delivery",
        },
        {
          id: "vendors",
          label: "Vendors",
          path: "/management/vendors",
        },
      ],
    },
    {
      id: "payouts",
      label: "Payouts & Settlements",
      icon: Wallet,
      subItems: [
        {
          id: "wallet",
          label: "Wallet",
          path: "/payouts/wallet",
        },
        {
          id: "payouts",
          label: "Payouts",
          path: "/payouts/vendors",
        },
      ],
    },
    {
      id: "products",
      label: "Product Management",
      icon: Package,
      subItems: [
        {
          id: "categories",
          label: "Categories",
          path: "/products/categories",
        },
        {
          id: "subcategories",
          label: "Subcategories",
          path: "/products/subcategories",
        },
        {
          id: "products",
          label: "Products",
          path: "/products/list",
        },
      ],
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
    } else {
      setExpandedGroup(null);
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
      {/* Mobile Hamburger Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/95 backdrop-blur-md text-slate-700 rounded-2xl shadow-md border border-slate-200/90 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-40 h-dvh p-3 sm:p-4 lg:p-5 flex flex-col transition-all duration-300 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "w-24 sm:w-[94px]" : "w-72 sm:w-80"}`}
      >
        <div className="flex flex-col h-full w-full bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden relative">
          {/* Top Multi-Color Accent Bar matching Sign In identity */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shrink-0" />

          {/* Logo & Header Branding */}
          <div className={`flex items-center justify-between pt-4 pb-4 border-b border-slate-100 shrink-0 ${isCollapsed ? 'px-3 flex-col gap-3' : 'px-5'}`}>
            <div
              onClick={() => {
                setIsOpen(false);
                navigate("/dashboard");
              }}
              className={`flex items-center cursor-pointer group select-none ${isCollapsed ? 'justify-center' : 'gap-3.5'}`}
              title="VegGoFresh Admin Platform"
            >
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 shrink-0 group-hover:scale-105 transition-transform">
                <Leaf size={20} className="drop-shadow-xs" />
              </div>

              {!isCollapsed && (
                <div className="overflow-hidden">
                  <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                    VegGo<span className="text-emerald-600 font-extrabold">Fresh</span>
                  </span>
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest block">
                    Admin Platform
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse / Expand Toggle Button */}
            <button
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation menu"
              className="lg:hidden p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className={`flex-1 overflow-y-auto py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent ${isCollapsed ? 'px-2' : 'px-3.5'}`}>
            {menuGroups.map((group) => {
              const isExpanded = expandedGroup === group.id;

              const isSelected =
                location.pathname === group.path ||
                group.subItems.some(
                  (subItem) => location.pathname === subItem.path
                );

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
                      isSelected || (isExpanded && !isCollapsed)
                        ? "bg-emerald-50/90 text-emerald-800 font-bold border border-emerald-200/80 shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                      <div className={`p-1 rounded-lg transition-colors ${
                        isSelected
                          ? "text-emerald-600"
                          : "text-slate-500 group-hover/item:text-slate-800"
                      }`}>
                        <GroupIcon size={19} />
                      </div>

                      {!isCollapsed && <span>{group.label}</span>}
                    </div>

                    {!isCollapsed && group.subItems.length > 0 &&
                      (isExpanded ? (
                        <ChevronUp size={15} className="text-emerald-600 shrink-0" />
                      ) : (
                        <ChevronDown size={15} className="text-slate-400 shrink-0" />
                      ))}
                  </button>

                  {/* Floating Flyout Tooltip when Collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full top-0 ml-3.5 z-50 invisible group-hover/item:visible opacity-0 group-hover/item:opacity-100 transition-all duration-200 pointer-events-none group-hover/item:pointer-events-auto">
                      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 p-3 min-w-[190px] space-y-2">
                        <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                          <GroupIcon size={15} className="text-emerald-600" />
                          <span className="text-xs font-bold text-slate-900">{group.label}</span>
                        </div>

                        {group.subItems.length > 0 ? (
                          <div className="space-y-1">
                            {group.subItems.map((subItem) => {
                              const isSubSelected = location.pathname === subItem.path;
                              return (
                                <button
                                  key={subItem.id}
                                  onClick={() => handleSubItemClick(subItem.path)}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    isSubSelected
                                      ? "bg-emerald-600 text-white shadow-xs"
                                      : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  }`}
                                >
                                  {subItem.label}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSubItemClick(group.path)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 cursor-pointer"
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
                      className={`ml-5 pl-3 border-l-2 border-emerald-100 space-y-1 my-1 transition-all duration-300 ease-in-out overflow-hidden ${
                        isExpanded
                          ? "max-h-96 opacity-100 py-1"
                          : "max-h-0 opacity-0 pointer-events-none"
                      }`}
                    >
                      {group.subItems.map((subItem) => {
                        const isSubSelected = location.pathname === subItem.path;

                        return (
                          <button
                            key={subItem.id}
                            onClick={() => handleSubItemClick(subItem.path)}
                            className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer flex items-center justify-between ${
                              isSubSelected
                                ? "bg-emerald-600 text-white font-bold shadow-xs shadow-emerald-600/20"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                          >
                            <span>{subItem.label}</span>
                            {isSubSelected && <Dot size={20} className="text-emerald-200 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer Info & Logout */}
          <div className={`border-t border-slate-100 shrink-0 space-y-2 ${isCollapsed ? 'p-2' : 'p-3.5'}`}>
            {!isCollapsed && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span className="font-semibold text-slate-700">Admin Console</span>
                </span>
                <span className="font-mono text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60 font-bold">
                  v2.4
                </span>
              </div>
            )}

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
        </div>
      </aside>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}

export default Sidebar;