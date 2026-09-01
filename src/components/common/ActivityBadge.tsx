import React from 'react';
import { RFActivityLevel } from '../../types/rf';

interface ActivityBadgeProps {
  level: RFActivityLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const ActivityBadge: React.FC<ActivityBadgeProps> = ({
  level,
  score,
  size = 'md',
  showPulse = true,
}) => {
  const config = {
    low: {
      label: 'LOW ACTIVITY',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400',
      glow: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    },
    moderate: {
      label: 'MODERATE',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
      glow: 'shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    },
    high: {
      label: 'HIGH CONGESTION',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      dot: 'bg-orange-400',
      glow: 'shadow-[0_0_10px_rgba(249,115,22,0.6)]',
    },
    critical: {
      label: 'CRITICAL BURST',
      bg: 'bg-red-500/15',
      border: 'border-red-500/40',
      text: 'text-red-400',
      dot: 'bg-red-400',
      glow: 'shadow-[0_0_12px_rgba(239,68,68,0.7)]',
    },
  }[level];

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-full border backdrop-blur-md transition-all ${config.bg} ${config.border} ${config.text} ${sizeClasses}`}
    >
      <span className="relative flex h-2 w-2">
        {showPulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot} ${config.glow}`} />
      </span>
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="opacity-80 font-bold ml-0.5">({score}%)</span>
      )}
    </span>
  );
};
