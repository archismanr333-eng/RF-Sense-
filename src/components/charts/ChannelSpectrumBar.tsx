import React from 'react';
import { CHANNEL_SPECTRUM_DATA } from '../../lib/mockData';

export const ChannelSpectrumBar: React.FC = () => {
  return (
    <div className="w-full space-y-3 font-mono">
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>2.4 GHz ISM Channel Utilization (2400 - 2483.5 MHz)</span>
        <span className="text-cyan-neon font-bold">Ch 1, 6, 11 Active Primary</span>
      </div>

      <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 pt-2">
        {CHANNEL_SPECTRUM_DATA.map((ch, idx) => {
          const isCrowded = ch.activity > 70;
          const isModerate = ch.activity > 35 && ch.activity <= 70;
          
          return (
            <div
              key={ch.channel}
              className="group relative flex flex-col items-center justify-end h-28 p-1 rounded bg-surface border border-white/5 hover:border-cyan-neon/40 transition-all cursor-pointer"
            >
              {/* Power Bar */}
              <div className="w-full bg-white/5 rounded-t h-20 relative flex items-end overflow-hidden">
                <div
                  className={`w-full rounded-t transition-all duration-500 ${
                    isCrowded
                      ? 'bg-gradient-to-t from-red-500/80 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                      : isModerate
                      ? 'bg-gradient-to-t from-amber-500/80 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                      : 'bg-gradient-to-t from-cyan-neon/60 to-cyan-electric shadow-[0_0_6px_rgba(0,191,255,0.4)]'
                  }`}
                  style={{ height: `${ch.activity}%` }}
                />
              </div>

              {/* Channel number */}
              <span className="text-[10px] text-text-secondary mt-1 group-hover:text-cyan-neon font-bold">
                {idx + 1}
              </span>

              {/* Hover Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-30 w-36 p-2 rounded bg-void/95 border border-cyan-neon/40 shadow-xl text-[10px] text-white pointer-events-none">
                <div className="font-bold text-cyan-neon">{ch.channel}</div>
                <div className="text-text-muted">Protocol: {ch.primaryProtocol}</div>
                <div className="flex justify-between mt-1 text-white">
                  <span>Power: {ch.power} dBm</span>
                  <span>Act: {ch.activity}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-text-muted pt-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-neon" /> Low Activity (&lt;35%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Moderate (35-70%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" /> High Congestion (&gt;70%)
          </span>
        </div>
        <span>BW: 20/40 MHz Channels</span>
      </div>
    </div>
  );
};
