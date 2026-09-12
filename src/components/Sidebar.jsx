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
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 p-3 bg-emerald-900 text-white rounded-2xl shadow-lg border border-emerald-700/50 hover:bg-emerald-800 transition-all duration-300"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 w-80 h-screen p-6 flex flex-col justify-between transition-transform duration-500 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute inset-y-6 left-6 right-0 bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 rounded-[2.5rem] border border-emerald-800/40 shadow-2xl shadow-emerald-950/20 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-[calc(100vh-160px)] space-y-7 pl-6 pr-4 pt-4">
          <div className="flex items-center gap-3.5 px-2 shrink-0">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
              <Leaf
                size={22}
                className="text-emerald-400"
              />
            </div>

            <span className="text-xl font-black tracking-tight text-white">
              VegGo
              <span className="text-emerald-400 font-medium">
                Fresh
              </span>
            </span>
          </div>

          <nav className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {menuGroups.map((group) => {
              const isExpanded = expandedGroup === group.id;

              const isSelected =
                location.pathname === group.path ||
                group.subItems.some(
                  (subItem) => location.pathname === subItem.path
                );

              const GroupIcon = group.icon;

              return (
                <div
                  key={group.id}
                  className="space-y-1"
                >
                  <button
                    onClick={() => handleGroupToggle(group)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                      isSelected || isExpanded
                        ? "bg-white/10 text-white shadow-inner border border-white/5"
                        : "text-emerald-200/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
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
                          size={14}
                          className="text-emerald-400"
                        />
                      ) : (
                        <ChevronDown
                          size={14}
                          className="text-emerald-300/30"
                        />
                      ))}
                  </button>

                  <div
                    className={`pl-10 space-y-1 transition-all duration-300 ease-in-out overflow-hidden ${
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
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 relative ${
                            isSubSelected
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                              : "text-emerald-300/50 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {isSubSelected && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-r-full" />
                          )}

                          {subItem.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="relative z-10 space-y-4 shrink-0 pl-6 pr-6 pb-9">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold text-black bg-gray-300 hover:text-white hover:bg-gray-500 transition-all duration-300"
          >
            <LogOut size={18} />
            Logout
          </button>
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