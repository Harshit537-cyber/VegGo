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
} from "lucide-react";
import LogoutModal from "../Common/LogoutModal";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
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

  useEffect(() => {
    const activeGroup = menuGroups.find((group) =>
      group.subItems.some(
        (subItem) => location.pathname === subItem.path
      )
    );

    if (activeGroup) {
      setExpandedGroup(activeGroup.id);
    } else {
      setExpandedGroup(null);
    }
  }, [location.pathname]);

  const handleGroupToggle = (group) => {
    if (!group.subItems.length) {
      setIsOpen(false);
      navigate(group.path);
      return;
    }

    setExpandedGroup((prev) =>
      prev === group.id ? null : group.id
    );
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
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          className="lg:hidden fixed top-5 left-5 z-50 p-2.5 bg-emerald-950/90 backdrop-blur-md text-emerald-300 rounded-2xl shadow-xl border border-emerald-700/40 hover:bg-emerald-900 transition-all duration-300 cursor-pointer"
        >
          <Menu size={20} />
        </button>
      )}

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-40 w-72 sm:w-80 h-screen p-3 sm:p-4 lg:p-6 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full w-full bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 rounded-3xl lg:rounded-[2.5rem] border border-emerald-800/40 shadow-2xl shadow-emerald-950/30 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-emerald-800/30 shrink-0">
            <div
              onClick={() => {
                setIsOpen(false);
                navigate("/dashboard");
              }}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 shadow-inner group-hover:bg-emerald-500/20 group-hover:border-emerald-400/30 transition-all duration-300">
                <Leaf
                  size={22}
                  className="text-emerald-400 group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <span className="text-xl font-black tracking-tight text-white">
                VegGo
                <span className="text-emerald-400 font-medium">
                  Fresh
                </span>
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation menu"
              className="lg:hidden p-2 text-emerald-300/80 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-emerald-800/60 scrollbar-track-transparent">
            {menuGroups.map((group) => {
              const isExpanded = expandedGroup === group.id;

              const isSelected =
                location.pathname === group.path ||
                group.subItems.some(
                  (subItem) => location.pathname === subItem.path
                );

              const GroupIcon = group.icon;

              return (
                <div key={group.id} className="space-y-1">
                  <button
                    onClick={() => handleGroupToggle(group)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                      isSelected || isExpanded
                        ? "bg-white/10 text-white shadow-inner border border-white/5"
                        : "text-emerald-200/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GroupIcon
                        size={18}
                        className={
                          isSelected || isExpanded
                            ? "text-emerald-400"
                            : "text-emerald-300/60"
                        }
                      />

                      <span>{group.label}</span>
                    </div>

                    {group.subItems.length > 0 &&
                      (isExpanded ? (
                        <ChevronUp
                          size={15}
                          className="text-emerald-400"
                        />
                      ) : (
                        <ChevronDown
                          size={15}
                          className="text-emerald-300/40"
                        />
                      ))}
                  </button>

                  {group.subItems.length > 0 && (
                    <div
                      className={`ml-5 pl-3 border-l border-emerald-500/20 space-y-1 my-1 transition-all duration-300 ease-in-out overflow-hidden ${
                        isExpanded
                          ? "max-h-96 opacity-100 py-1"
                          : "max-h-0 opacity-0 pointer-events-none"
                      }`}
                    >
                      {group.subItems.map((subItem) => {
                        const isSubSelected =
                          location.pathname === subItem.path;

                        return (
                          <button
                            key={subItem.id}
                            onClick={() =>
                              handleSubItemClick(subItem.path)
                            }
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                              isSubSelected
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                                : "text-emerald-200/60 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            {subItem.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-4 border-t border-emerald-800/30 shrink-0">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-300/90 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-rose-600/20"
            >
              <LogOut size={18} />
              Logout
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