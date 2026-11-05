import React from 'react';

interface ProgressBarProps {
  percentage: number;
  color?: 'teal' | 'blue' | 'amber' | 'emerald';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  color = 'teal',
  height = 'md',
  showLabel = false,
}) => {
  const clamped = Math.max(0, Math.min(100, isNaN(percentage) ? 0 : percentage));

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[height];

  const colorGradient = {
    teal: 'bg-teal-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
  }[color];

  return (
    <div className="w-full">
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${heightClass} ${colorGradient} transition-all duration-300 rounded-full`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1 text-xs text-slate-400 font-mono tabular-nums">
          <span>{clamped.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};
