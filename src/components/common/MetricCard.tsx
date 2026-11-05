import React, { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: ReactNode;
  trend?: {
    text: string;
    positive?: boolean;
  };
  onClick?: () => void;
  accent?: 'teal' | 'blue' | 'amber' | 'emerald' | 'slate';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  icon,
  trend,
  onClick,
  accent = 'teal',
}) => {
  const accentTopBorder = {
    teal: 'border-t-teal-500/80',
    blue: 'border-t-blue-500/80',
    amber: 'border-t-amber-500/80',
    emerald: 'border-t-emerald-500/80',
    slate: 'border-t-slate-600',
  }[accent];

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/90 border border-slate-800 ${accentTopBorder} border-t-2 rounded-xl p-4 transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-slate-700 hover:bg-slate-850' : ''
      }`}
    >
      <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
        <span className="truncate">{label}</span>
        {icon && <div className="text-slate-500 shrink-0">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl font-bold text-white tracking-tight font-mono tabular-nums">
          {value}
        </span>
        {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
      </div>

      {(subtext || trend) && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          {trend && (
            <span
              className={`font-mono font-medium ${
                trend.positive ? 'text-teal-400' : 'text-slate-400'
              }`}
            >
              {trend.text}
            </span>
          )}
          {trend && subtext && <span aria-hidden="true">·</span>}
          {subtext && <span className="truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
