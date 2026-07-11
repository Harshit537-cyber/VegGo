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
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  X
} from 'lucide-react';

function Sidebar({ currentTab, setCurrentTab }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState('dashboard');

  const menuGroups = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      subItems: [
        { id: 'revenue-overview', label: 'Revenue Overview', path: '/dashboard/revenue' },
        { id: 'order-statistics', label: 'Order Statistics', path: '/dashboard/orders' },
        { id: 'vendor-statistics', label: 'Vendor Statistics', path: '/dashboard/vendors' }
      ]
    },
    {
      id: 'customers',
      label: 'Customer Management',
      icon: Users,
      subItems: [
        { id: 'view-customers', label: 'View Customers', path: '/customers/view' },
        { id: 'block-unblock', label: 'Block / Unblock Accounts', path: '/customers/moderation' }
      ]
    },
    {
      id: 'vendors',
      label: 'Vendor Management',
      icon: Store,
      subItems: [
        { id: 'shop-approval', label: 'Shop Approval', path: '/vendors/approval' },
        { id: 'shop-suspension', label: 'Shop Suspension', path: '/vendors/suspension' }
      ]
    },
    {
      id: 'delivery',
      label: 'Delivery Partner Management',
      icon: Truck,
      subItems: [
        { id: 'rider-approval', label: 'Rider Approval', path: '/delivery/approval' },
        { id: 'document-verification', label: 'Document Verification', path: '/delivery/verification' }
      ]
    },
    {
      id: 'products',
      label: 'Product Management',
      icon: Package,
      subItems: [
        { id: 'categories', label: 'Categories', path: '/products/categories' },
        { id: 'products', label: 'Products', path: '/products/list' }
      ]
    },
    {
      id: 'orders',
      label: 'Order Management',
      icon: ShoppingCart,
      subItems: [
        { id: 'live-orders', label: 'Live Orders', path: '/orders/live' },
        { id: 'order-monitoring', label: 'Order Monitoring', path: '/orders/monitoring' }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      subItems: [
        { id: 'revenue-reports', label: 'Revenue Reports', path: '/reports/revenue' },
        { id: 'vendor-reports', label: 'Vendor Reports', path: '/reports/vendors' },
        { id: 'delivery-reports', label: 'Delivery Reports', path: '/reports/delivery' }
      ]
    },
    {
      id: 'notifications',
      label: 'Notification Center',
      icon: Bell,
      subItems: [
        { id: 'push-notifications', label: 'Push Notifications', path: '/notifications/push' },
        { id: 'promotional-notifications', label: 'Promotional Notifications', path: '/notifications/promotional' }
      ]
    }
  ];

  const handleGroupToggle = (groupId) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
  };

  const handleSubItemClick = (subItemId, path) => {
    setCurrentTab(subItemId);
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => navigate('/login');

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-5 left-5 z-50 p-2.5 bg-emerald-950 text-white rounded-xl shadow-md border border-emerald-800"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden" />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 w-80 h-screen bg-emerald-950 p-6 flex flex-col justify-between border-r border-emerald-900/30 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-[calc(100vh-140px)] space-y-6">
          <div className="flex items-center gap-3.5 px-3 shrink-0">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
              <Leaf size={24} className="text-emerald-400" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              VegGo<span className="text-emerald-400 font-medium">Fresh</span>
            </span>
          </div>

          <nav className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-emerald-800 scrollbar-track-transparent">
            {menuGroups.map((group) => {
              const isExpanded = expandedGroup === group.id;
              const GroupIcon = group.icon;

              return (
                <div key={group.id} className="space-y-1">
                  <button
                    onClick={() => handleGroupToggle(group.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                      isExpanded
                        ? 'bg-emerald-900/50 text-white'
                        : 'text-emerald-200/60 hover:text-white hover:bg-emerald-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <GroupIcon size={20} className={isExpanded ? 'text-emerald-400' : 'text-emerald-200/60'} />
                      <span>{group.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-emerald-400" />
                    ) : (
                      <ChevronDown size={16} className="text-emerald-200/40" />
                    )}
                  </button>

                  <div
                    className={`pl-11 pr-2 space-y-1 transition-all duration-250 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-64 opacity-100 py-1' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    {group.subItems.map((subItem) => {
                      const isSelected = currentTab === subItem.id;
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => handleSubItemClick(subItem.id, subItem.path)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'text-emerald-300/50 hover:text-white hover:bg-emerald-900/40'
                          }`}
                        >
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

        <div className="space-y-4 shrink-0">
          <div className="flex items-center justify-between px-3 p-3 bg-emerald-900/30 rounded-2xl border border-emerald-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-800 border border-emerald-500 flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div>
                <p className="text-sm font-semibold text-white">John Doe</p>
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Admin</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-semibold text-rose-300 hover:text-white hover:bg-rose-500/10 transition-all"
          >
            <LogOut size={20} />
            Disconnect
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;