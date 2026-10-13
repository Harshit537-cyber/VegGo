import React from 'react';

export default function SegmentedTabs({
  tabs = [],
  activeTab,
  onTabChange,
  className = ''
}) {
  return (
    <div className={`p-1.5 bg-emerald-50/60 border border-emerald-100/80 rounded-2xl flex flex-wrap gap-1.5 w-full ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const TabIcon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200/90 font-extrabold'
                : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-100/40'
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
