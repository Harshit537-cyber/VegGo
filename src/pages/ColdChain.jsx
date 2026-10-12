import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../Common/PageHeader';
import { Calendar, RefreshCw, ShieldAlert, Thermometer, Droplet, Wind, CheckCircle2 } from 'lucide-react';

export default function ColdChain() {
  const [currentTab, setCurrentTab] = useState('logistics');

  const facilities = [
    { id: 'CR-1', name: 'Primary Cold Room 1', temp: '3.8 °C', humidity: '88%', status: 'Optimized', type: 'Storage Room' },
    { id: 'CR-2', name: 'Secondary Cold Room 2', temp: '4.1 °C', humidity: '85%', status: 'Optimized', type: 'Storage Room' },
    { id: 'FZ-1', name: 'Deep Freezer Alpha', temp: '-18.5 °C', humidity: '92%', status: 'Optimized', type: 'Deep Freeze' },
    { id: 'TR-12', name: 'Transit Unit Cargo 12', temp: '5.2 °C', humidity: '80%', status: 'Warning', type: 'Reefer Truck' },
    { id: 'TR-08', name: 'Transit Unit Cargo 08', temp: '4.0 °C', humidity: '82%', status: 'Optimized', type: 'Reefer Truck' },
    { id: 'CR-3', name: 'Holding Facility Room 3', temp: '9.5 °C', humidity: '64%', status: 'Critical', type: 'Holding Bay' }
  ];

  const coreMetrics = [
    { label: 'Active Cooling Nodes', value: '14 / 15 Online', alert: false },
    { label: 'Facility Avg Humidity', value: '81.5%', alert: false },
    { label: 'Thermal Safety Index', value: '98.2%', alert: false },
    { label: 'Anomalies Flagged', value: '1 Node Out of Range', alert: true }
  ];

  return (
    <div className="min-h-dvh bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto max-h-dvh space-y-6 sm:space-y-8">
        <PageHeader 
          badge="Environmental Auditing"
          badgeIcon={Thermometer}
          title="Cold Chain Telemetry"
          subtitle="Real-time thermal tracking, refrigeration chambers, and transit cargo environmental status."
          onRefresh={() => window.location.reload()}
        />

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {coreMetrics.map((metric, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{metric.label}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-3">{metric.value}</h3>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-1.5">
                {metric.alert ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
                    <ShieldAlert size={14} /> Attention Required
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <CheckCircle2 size={14} /> Standard Range
                  </span>
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">Active Sensor Node Registry</h2>
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              6 Monitored Terminals
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((fac) => (
              <div key={fac.id} className="p-5 bg-slate-50 rounded-[20px] border border-slate-150 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-black tracking-wider text-slate-400 uppercase bg-white border border-slate-200/60 px-2.5 py-1 rounded-md">
                      {fac.id}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      fac.status === 'Optimized' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      fac.status === 'Warning' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {fac.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{fac.name}</h3>
                  <p className="text-xs text-slate-400 font-semibold mb-6">{fac.type}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200/60 text-center">
                  <div className="flex flex-col items-center">
                    <Thermometer size={16} className="text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Temp</span>
                    <span className="text-sm font-extrabold text-slate-800 mt-0.5">{fac.temp}</span>
                  </div>
                  <div className="flex flex-col items-center border-x border-slate-200/60">
                    <Droplet size={16} className="text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Humidity</span>
                    <span className="text-sm font-extrabold text-slate-800 mt-0.5">{fac.humidity}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Wind size={16} className="text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Vent</span>
                    <span className="text-sm font-extrabold text-slate-800 mt-0.5">Auto</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}