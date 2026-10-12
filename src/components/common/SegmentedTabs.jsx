import React from 'react';

export default function SegmentedTabs({
  tabs = [],
  activeTab,
  onTabChange,
  className = ''
}) {
  return (
    <div className={`p-1.5 bg-slate-200/60 rounded-2xl flex flex-wrap gap-1.5 w-full ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const TabIcon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-white text-slate-900 shadow-sm shadow-slate-200/80 border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            {TabIcon && (
              <TabIcon
                size={16}
                className={isActive ? 'text-emerald-600' : 'text-slate-400'}
              />
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
