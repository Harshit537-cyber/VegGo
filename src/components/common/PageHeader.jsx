import React from 'react';
import { RefreshCw, Activity, Send } from 'lucide-react';

function PageHeader({
  icon: Icon = Activity,
  badge,
  badgeIcon: BadgeIcon,
  title,
  subtitle,
  stats = [],
  primaryAction,
  actionButtonText,
  actionButtonIcon: ActionIcon = Send,
  onActionClick,
  onRefresh,
  isRefreshing = false,
  actions,
  rightActions,
  children,
  className = ''
}) {
  const renderedActions = actions || rightActions;

  return (
    <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-2 ${className}`}>
      {/* Left: Big Icon Badge Box + Title + Subtitle */}
      <div className={`flex ${subtitle ? 'items-start sm:items-center' : 'items-center'} gap-4`}>
        {Icon && (
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
            <Icon size={28} />
          </div>
        )}

        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-3.5xl font-black tracking-tight text-slate-900 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Quick Stat Badges + Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 self-start lg:self-center shrink-0">
        {/* Quick Stat Badges */}
        {stats.map((stat, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-700"
          >
            {stat.alert && (
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            )}
            <span className="text-slate-500 font-semibold">{stat.label}:</span>
            <span className={stat.alert ? 'text-amber-700 font-black' : 'text-slate-900 font-black'}>
              {stat.value}
            </span>
          </div>
        ))}

        {/* Primary Action Button */}
        {primaryAction ? (
          primaryAction
        ) : actionButtonText && onActionClick ? (
          <button
            type="button"
            onClick={onActionClick}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/20 cursor-pointer"
          >
            <ActionIcon size={16} />
            <span>{actionButtonText}</span>
          </button>
        ) : null}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 active:scale-98 border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs cursor-pointer disabled:opacity-60"
            title="Refresh Data"
          >
            <RefreshCw
              size={15}
              className={isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-600'}
            />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        )}

        {renderedActions}
        {children}
      </div>
    </div>
  );
}

export default React.memo(PageHeader);
