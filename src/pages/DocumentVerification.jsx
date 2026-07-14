import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Calendar, RefreshCw, FileText, CheckCircle, AlertTriangle, Eye, ShieldCheck, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function DocumentVerification() {
  const [currentTab, setCurrentTab] = useState('document-verification');

  const [documents, setDocuments] = useState([
    { id: 'DOC-9001', name: 'Marcus Sterling', type: 'Driver License', status: 'Pending', uploaded: 'Oct 10, 2026' },
    { id: 'DOC-9002', name: 'Golden Harvest Co.', type: 'Food Safety Certificate', status: 'Pending', uploaded: 'Oct 11, 2026' },
    { id: 'DOC-9003', name: 'Elena Rostova', type: 'Vehicle Insurance', status: 'Pending', uploaded: 'Oct 11, 2026' },
    { id: 'DOC-9004', name: 'Alpine Berry Orchards', type: 'Business Registry License', status: 'Pending', uploaded: 'Oct 12, 2026' }
  ]);

  const handleAction = (id, nextStatus) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        return { ...doc, status: nextStatus };
      }
      return doc;
    }));
  };

  const pendingCount = documents.filter(doc => doc.status === 'Pending').length;
  const verifiedCount = documents.filter(doc => doc.status === 'Verified').length;
  const flaggedCount = documents.filter(doc => doc.status === 'Flagged').length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/60">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Trust & Safety Verification
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Document Verification</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm text-sm font-semibold text-slate-600">
              <Calendar size={18} className="text-slate-400" />
              <span>Oct 12, 2026</span>
            </div>
            <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unresolved Audits</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{pendingCount} Documents</h3>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-600">
              <FileText size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Audits</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{verifiedCount} Approved</h3>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flagged Violations</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{flaggedCount} Flagged</h3>
            </div>
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600">
              <AlertTriangle size={24} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">Partner Credentials Verification Ledger</h2>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">Unresolved: {pendingCount}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase font-black tracking-wider text-slate-400">
                  <th className="pb-4">Partner Identity</th>
                  <th className="pb-4">File ID</th>
                  <th className="pb-4">Document Type</th>
                  <th className="pb-4">Submission Date</th>
                  <th className="pb-4">Audit Status</th>
                  <th className="pb-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4.5 font-bold text-slate-900">{doc.name}</td>
                    <td className="py-4.5 font-mono text-xs font-semibold text-slate-400">{doc.id}</td>
                    <td className="py-4.5 text-slate-500 font-normal">{doc.type}</td>
                    <td className="py-4.5 text-xs text-slate-400 font-normal">{doc.uploaded}</td>
                    <td className="py-4.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/40' :
                        doc.status === 'Flagged' ? 'bg-rose-50 text-rose-600 border border-rose-200/40' :
                        'bg-amber-50 text-amber-600 border border-amber-200/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          doc.status === 'Verified' ? 'bg-emerald-500' :
                          doc.status === 'Flagged' ? 'bg-rose-500' :
                          'bg-amber-500'
                        }`} />
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-4.5 text-right space-x-2">
                      <button className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                        <Eye size={16} />
                      </button>
                      {doc.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleAction(doc.id, 'Verified')}
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-600 border border-emerald-200/50 transition-colors"
                          >
                            <ThumbsUp size={16} />
                          </button>
                          <button
                            onClick={() => handleAction(doc.id, 'Flagged')}
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-rose-50 hover:bg-rose-100/80 text-rose-600 border border-rose-200/50 transition-colors"
                          >
                            <ThumbsDown size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}