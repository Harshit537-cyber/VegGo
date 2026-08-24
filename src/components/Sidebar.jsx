import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf,
  LayoutDashboard,
  Users,
  Store,
  Truck,
  Package,
  ShoppingCart,
  BarChart3,
  Bell,
  Settings,
  Wallet,
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import LogoutModal from '../Common/LogoutModal';

function Sidebar({ currentTab, setCurrentTab }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState('dashboard');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const menuGroups = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      subItems: [
        {
          id: 'revenue-overview',
          label: 'Revenue Overview',
          path: '/dashboard/revenue'
        },
        {
          id: 'order-statistics',
          label: 'Order Statistics',
          path: '/dashboard/orders'
        },
        {
          id: 'vendor-statistics',
          label: 'Vendor Statistics',
          path: '/dashboard/vendors'
        }
      ]
    },
    {
      id: 'payouts',
      label: 'Payouts & Settlements',
      icon: Wallet,
      subItems: [
        {
          id: 'vendor-payouts',
          label: 'Vendor Payouts',
          path: '/payouts/vendors'
        },
        {
          id: 'delivery-payouts',
          label: 'Rider Settlements',
          path: '/payouts/delivery'
        },
        {
          id: 'customer-refunds',
          label: 'Customer Refunds',
          path: '/payouts/refunds'
        }
      ]
    },
    {
      id: 'customers',
      label: 'Customer Management',
      icon: Users,
      subItems: [
        {
          id: 'view-customers',
          label: 'View Customers',
          path: '/customers/view'
        },
        {
          id: 'block-unblock',
          label: 'Block / Unblock Accounts',
          path: '/customers/moderation'
        }
      ]
    },
    {
      id: 'vendors',
      label: 'Vendor Management',
      icon: Store,
      subItems: [
        {
          id: 'shop-approval',
          label: 'Shop Approval',
          path: '/vendors/approval'
        },
        {
          id: 'shop-suspension',
          label: 'Shop Suspension',
          path: '/vendors/suspension'
        }
      ]
    },
    {
      id: 'delivery',
      label: 'Delivery Partner Management',
      icon: Truck,
      subItems: [
        {
          id: 'rider-approval',
          label: 'Rider Approval',
          path: '/delivery/approval'
        },
        {
          id: 'document-verification',
          label: 'Document Verification',
          path: '/delivery/verification'
        }
      ]
    },
    {
      id: 'products',
      label: 'Product Management',
      icon: Package,
      subItems: [
        {
          id: 'categories',
          label: 'Categories',
          path: '/products/categories'
        },
        {
          id: 'subcategories',
          label: 'Subcategories',
          path: '/products/subcategories'
        },
        {
          id: 'products',
          label: 'Products',
          path: '/products/list'
        }
      ]
    },
    {
      id: 'orders',
      label: 'Order Management',
      icon: ShoppingCart,
      subItems: [
        {
          id: 'live-orders',
          label: 'Live Orders',
          path: '/orders/live'
        },
        {
          id: 'order-monitoring',
          label: 'Order Monitoring',
          path: '/orders/monitoring'
        }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      subItems: [
        {
          id: 'revenue-reports',
          label: 'Revenue Reports',
          path: '/reports/revenue'
        },
        {
          id: 'vendor-reports',
          label: 'Vendor Reports',
          path: '/reports/vendors'
        },
        {
          id: 'delivery-reports',
          label: 'Delivery Reports',
          path: '/reports/delivery'
        }
      ]
    },
    {
      id: 'notifications',
      label: 'Notification Center',
      icon: Bell,
      subItems: [
        {
          id: 'push-notifications',
          label: 'Push Notifications',
          path: '/notifications/push'
        },
        {
          id: 'promotional-notifications',
          label: 'Promotional Notifications',
          path: '/notifications/promotional'
        }
      ]
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      subItems: [
        {
          id: 'general-settings',
          label: 'Platform Configuration',
          path: '/settings/general'
        },
        {
          id: 'payment-methods',
          label: 'Payment & Commissions',
          path: '/settings/payments'
        }
      ]
    }
  ];

  const handleGroupToggle = (groupId) => {
    setExpandedGroup(
      expandedGroup === groupId ? null : groupId
    );
  };

  const handleSubItemClick = (subItemId, path) => {
    setCurrentTab(subItemId);
    setIsOpen(false);
    navigate(path);
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    navigate('/login');
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
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full'
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
              const isExpanded =
                expandedGroup === group.id;

              const GroupIcon = group.icon;

              return (
                <div
                  key={group.id}
                  className="space-y-1"
                >
                  <button
                    onClick={() =>
                      handleGroupToggle(group.id)
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                      isExpanded
                        ? 'bg-white/10 text-white shadow-inner border border-white/5'
                        : 'text-emerald-200/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <GroupIcon
                        size={18}
                        className={
                          isExpanded
                            ? 'text-emerald-400'
                            : 'text-emerald-300/60'
                        }
                      />

                      <span>{group.label}</span>
                    </div>

                    {isExpanded ? (
                      <ChevronUp
                        size={14}
                        className="text-emerald-400"
                      />
                    ) : (
                      <ChevronDown
                        size={14}
                        className="text-emerald-300/30"
                      />
                    )}
                  </button>

                  <div
                    className={`pl-10 space-y-1 transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded
                        ? 'max-h-96 opacity-100 py-1'
                        : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    {group.subItems.map(
                      (subItem) => {
                        const isSelected =
                          currentTab ===
                          subItem.id;

                        return (
                          <button
                            key={subItem.id}
                            onClick={() =>
                              handleSubItemClick(
                                subItem.id,
                                subItem.path
                              )
                            }
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 relative ${
                              isSelected
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'text-emerald-300/50 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-r-full" />
                            )}

                            {subItem.label}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            })}

          </nav>
        </div>

        <div className="relative z-10 space-y-4 shrink-0 pl-6 pr-4 pb-4">

          <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-2xl border border-white/5 shadow-inner">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-xl bg-emerald-800 border border-emerald-500/40 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                JD
              </div>

              <div>
                <p className="text-xs font-bold text-white">
                  John Doe
                </p>

                <p className="text-[9px] text-emerald-400 uppercase tracking-widest font-black">
                  Admin
                </p>
              </div>

            </div>

          </div>

          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold text-rose-300/80 hover:text-white hover:bg-rose-500/10 transition-all duration-300"
          >
            <LogOut size={18} />
            Disconnect
          </button>

        </div>
      </aside>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() =>
          setIsLogoutModalOpen(false)
        }
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}

export default Sidebar;