import React, { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  subtitle?: string;
  badge?: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  progress?: number; // 0-100
  colorScheme?: 'cyan' | 'amber' | 'red' | 'emerald' | 'purple';
  subMetrics?: { label: string; value: string | number }[];
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  subtitle,
  badge,
  trend,
  progress,
  colorScheme = 'cyan',
  subMetrics,
}) => {
  const colorMap = {
    cyan: {
      borderGlow: 'hover:border-cyan-neon/50 hover:shadow-neon-cyan',
      accentText: 'text-cyan-neon',
      barBg: 'bg-cyan-neon',
      barGlow: 'shadow-[0_0_10px_rgba(0,191,255,0.8)]',
      iconBg: 'bg-cyan-neon/10 text-cyan-neon',
    },
    amber: {
      borderGlow: 'hover:border-amber-400/50 hover:shadow-neon-amber',
      accentText: 'text-amber-400',
      barBg: 'bg-amber-400',
      barGlow: 'shadow-[0_0_10px_rgba(251,191,36,0.8)]',
      iconBg: 'bg-amber-400/10 text-amber-400',
    },
    red: {
      borderGlow: 'hover:border-red-400/50 hover:shadow-neon-red',
      accentText: 'text-red-400',
      barBg: 'bg-red-400',
      barGlow: 'shadow-[0_0_10px_rgba(248,113,113,0.8)]',
      iconBg: 'bg-red-400/10 text-red-400',
    },
    emerald: {
      borderGlow: 'hover:border-emerald-400/50',
      accentText: 'text-emerald-400',
      barBg: 'bg-emerald-400',
      barGlow: 'shadow-[0_0_10px_rgba(52,211,153,0.8)]',
      iconBg: 'bg-emerald-400/10 text-emerald-400',
    },
    purple: {
      borderGlow: 'hover:border-purple-400/50',
      accentText: 'text-purple-400',
      barBg: 'bg-purple-400',
      barGlow: 'shadow-[0_0_10px_rgba(192,132,252,0.8)]',
      iconBg: 'bg-purple-400/10 text-purple-400',
    },
  }[colorScheme];

  return (
    <div
      className={`group relative rounded-xl bg-surface/75 backdrop-blur-xl border border-white/10 p-5 shadow-glass transition-all duration-300 ${colorMap.borderGlow}`}
    >
      {/* Top subtle highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-text-secondary uppercase">
            {title}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white">
              {value}
            </span>
            {unit && (
              <span className={`text-sm font-mono font-medium ${colorMap.accentText}`}>
                {unit}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {icon && (
            <div className={`p-2.5 rounded-lg border border-white/10 ${colorMap.iconBg}`}>
              {icon}
            </div>
          )}
          {badge}
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-3.5">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colorMap.barBg} ${colorMap.barGlow}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {(subtitle || trend || subMetrics) && (
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
          {subtitle && <span className="text-text-muted">{subtitle}</span>}
          {trend && (
            <span
              className={`font-mono ${
                trend.isPositive ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {trend.value}
            </span>
          )}
          {subMetrics && (
            <div className="flex items-center gap-3 w-full justify-between font-mono text-[11px]">
              {subMetrics.map((sm, i) => (
                <div key={i} className="text-text-secondary">
                  <span className="text-text-muted">{sm.label}: </span>
                  <span className="text-white font-medium">{sm.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
