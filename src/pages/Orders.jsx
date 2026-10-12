import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../Common/PageHeader';
import SegmentedTabs from '../Common/SegmentedTabs';
import StatusFilterPills from '../Common/StatusFilterPills';
import WorkflowRulesBar from '../Common/WorkflowRulesBar';
import EmptyState from '../Common/EmptyState';
import {
  Calendar,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Layers,
  Truck,
  Download,
  Thermometer,
  MapPin,
  Clock
} from 'lucide-react';

export default function OrderStatus() {
  const [activeTab, setActiveTab] = useState('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const initialOrders = [
    { id: '#VGF-2918', client: 'Green Grocers Inc.', produce: 'Fresh Spinach', quantity: '1,200 kg', status: 'Shipped', temp: '4.1°C', destination: 'Chicago Hub' },
    { id: '#VGF-2917', client: 'Organic Harvest Co.', produce: 'Broccoli Heads', quantity: '850 kg', status: 'Processing', temp: '4.4°C', destination: 'Detroit Depot' },
    { id: '#VGF-2916', client: 'Super Foods Depot', produce: 'Sweet Potatoes', quantity: '3,400 kg', status: 'Shipped', temp: '6.0°C', destination: 'Austin Terminal' },
    { id: '#VGF-2915', client: 'Healthy Living Market', produce: 'Avocados', quantity: '500 kg', status: 'Delayed', temp: '8.2°C', destination: 'Miami Cold Center' },
    { id: '#VGF-2914', client: 'Nature Express Hub', produce: 'Red Tomatoes', quantity: '2,100 kg', status: 'Shipped', temp: '5.1°C', destination: 'Denver Hub' },
    { id: '#VGF-2913', client: 'Sunrise Co-op', produce: 'Sweet Corn', quantity: '1,500 kg', status: 'Processing', temp: '4.9°C', destination: 'Boston Center' }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const delayedCount = initialOrders.filter((o) => o.status === 'Delayed').length;
  const shippedCount = initialOrders.filter((o) => o.status === 'Shipped').length;
  const processingCount = initialOrders.filter((o) => o.status === 'Processing').length;

  const orderTabs = [
    { id: 'orders', label: 'Consignment Ledger', icon: Layers, count: initialOrders.length },
    { id: 'fleet', label: 'Live Cold-Chain Fleet', icon: Truck, count: shippedCount },
    { id: 'archive', label: 'Archived Runs', icon: Calendar }
  ];

  const filterPills = [
    { id: 'All', label: 'All Shipments', count: initialOrders.length },
    { id: 'Shipped', label: 'In Transit / Shipped', count: shippedCount },
    { id: 'Processing', label: 'Processing (Depot)', count: processingCount },
    { id: 'Delayed', label: 'Delayed / Temp Alert', count: delayedCount }
  ];

  const filteredOrders = initialOrders.filter((order) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      order.client.toLowerCase().includes(query) ||
      order.id.toLowerCase().includes(query) ||
      order.produce.toLowerCase().includes(query) ||
      order.destination.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-dvh bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto max-h-dvh w-full space-y-5 sm:space-y-6">
        {/* Top Executive Header */}
        <PageHeader
          icon={Layers}
          title="Consignment & Fleet Logistics"
          subtitle="Real-time shipment ledger, temperature compliance, and regional distribution hub telemetry."
          stats={[
            { label: 'Total Shipments', value: initialOrders.length },
            { label: 'Temp Alerts', value: delayedCount, alert: delayedCount > 0 }
          ]}
          actionButtonText="Export Manifest"
          actionButtonIcon={Download}
          onActionClick={() => alert('Exporting live consignment manifest...')}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Primary Segmented Tabs Navigation */}
        <SegmentedTabs
          tabs={orderTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab 1: Orders Ledger */}
        {activeTab === 'orders' && (
          <>
            {/* Secondary Status Filter Pills */}
            <StatusFilterPills
              filters={filterPills}
              activeFilter={statusFilter}
              onFilterChange={setStatusFilter}
            />

            {/* Workflow Rules Information Bar */}
            <WorkflowRulesBar
              rulesText="Consignment tracking rules: Cold-chain threshold compliance <= 7.0°C and automated hub dispatch routing."
              showingCount={filteredOrders.length}
              totalCount={initialOrders.length}
              itemLabel="shipments"
            />

            {/* Unified Search Input Bar */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search consignments by tracking ID, client, produce type, or destination hub..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            {/* Data Table or Empty State */}
            {filteredOrders.length === 0 ? (
              <EmptyState
                icon={Layers}
                title="No consignments found"
                description={`There are currently no shipments in the selected "${statusFilter}" status category.`}
              />
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] uppercase font-semibold tracking-wider text-slate-600 bg-slate-50/80">
                        <th className="py-4 px-5">Reference ID</th>
                        <th className="py-4 px-5">Contract Client</th>
                        <th className="py-4 px-5">Produce Cargo</th>
                        <th className="py-4 px-5">Volume</th>
                        <th className="py-4 px-5">Destination Hub</th>
                        <th className="py-4 px-5 text-center">Batch Temp</th>
                        <th className="py-4 px-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="text-xs font-semibold text-slate-700 hover:bg-emerald-50/40 transition-colors"
                        >
                          <td className="py-4 px-5 font-mono font-semibold text-slate-900">
                            {order.id}
                          </td>
                          <td className="py-4 px-5 text-slate-900 font-semibold">{order.client}</td>
                          <td className="py-4 px-5">{order.produce}</td>
                          <td className="py-4 px-5 font-mono">{order.quantity}</td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <MapPin size={13} className="text-emerald-600" />
                              <span>{order.destination}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${
                                parseFloat(order.temp) > 7.0
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              <Thermometer size={12} />
                              {order.temp}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                                order.status === 'Shipped'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : order.status === 'Processing'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {order.status === 'Shipped' && <CheckCircle2 size={13} />}
                              {order.status === 'Processing' && <Clock size={13} />}
                              {order.status === 'Delayed' && <AlertCircle size={13} />}
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards List */}
                <div className="md:hidden p-4 space-y-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-slate-900">
                          {order.id}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            order.status === 'Shipped'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : order.status === 'Processing'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-slate-900">{order.client}</h4>
                        <p className="text-xs text-slate-500">{order.produce} • {order.quantity}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <MapPin size={13} className="text-emerald-600" />
                          <span>{order.destination}</span>
                        </div>
                        <span className="font-mono font-semibold text-slate-700">{order.temp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Tab 2: Live Cold-Chain Fleet */}
        {activeTab === 'fleet' && (
          <div className="space-y-4">
            <WorkflowRulesBar
              rulesText="Active IoT telemetry and cold-chain refrigerated van routes across key transit corridors."
              showingCount={shippedCount}
              totalCount={shippedCount}
              itemLabel="active vans"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {initialOrders
                .filter((o) => o.status === 'Shipped')
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                          <Truck size={18} />
                        </div>
                        <div>
                          <span className="font-mono text-xs font-semibold text-slate-900 block">{item.id}</span>
                          <span className="text-[11px] text-slate-400">{item.produce}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {item.temp}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span>Destination: <strong>{item.destination}</strong></span>
                      <span className="text-emerald-600 font-semibold">Active GPS</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 3: Archived Runs */}
        {activeTab === 'archive' && (
          <EmptyState
            icon={Calendar}
            title="No archived runs in this billing cycle"
            description="All completed shipments for this week have been reconciled and saved to the bank payout ledger."
          />
        )}
      </main>
    </div>
  );
}