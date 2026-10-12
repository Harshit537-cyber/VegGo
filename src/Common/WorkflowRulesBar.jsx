import React from 'react';

export default function WorkflowRulesBar({
  rulesText = 'All records across every onboarding phase with search, status filters, and one-click inspection.',
  showingCount = 0,
  itemLabel = 'records',
  className = ''
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs ${className}`}>
      <div className="flex items-center gap-2 text-slate-700 font-medium">
        <span className="font-extrabold text-slate-900">Workflow Rules:</span>
        <span className="text-slate-600 truncate">{rulesText}</span>
      </div>

      <div className="text-right shrink-0">
        <span className="text-emerald-700 font-bold">
          Showing {showingCount} {itemLabel}
        </span>
      </div>
    </div>
  );
}
