import React, { ReactNode } from 'react';

interface GlassCardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
  glow?: boolean;
  scanline?: boolean;
  badge?: ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  title,
  subtitle,
  icon,
  headerAction,
  children,
  className = '',
  glow = false,
  scanline = false,
  badge,
}) => {
  return (
    <div
      className={`relative rounded-xl bg-surface/70 backdrop-blur-xl border border-white/10 shadow-glass overflow-hidden transition-all duration-300 ${
        glow ? 'border-cyan-neon/40 shadow-neon-cyan' : 'hover:border-white/20'
      } ${scanline ? 'scanline-overlay' : ''} ${className}`}
    >
      {/* Top ambient glass reflection line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-neon/30 to-transparent pointer-events-none" />

      {(title || icon || headerAction || badge) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            {icon && <div className="text-cyan-neon text-lg">{icon}</div>}
            <div>
              <div className="flex items-center gap-2">
                {title && (
                  <h3 className="font-display font-semibold text-sm tracking-wider uppercase text-white">
                    {title}
                  </h3>
                )}
                {badge}
              </div>
              {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
        </div>
      )}

      <div className="p-5">{children}</div>
    </div>
  );
};
