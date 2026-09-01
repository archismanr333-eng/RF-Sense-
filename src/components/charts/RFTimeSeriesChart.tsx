import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import { RFMeasurement } from '../../types/rf';

interface RFTimeSeriesChartProps {
  data: RFMeasurement[];
  height?: number;
  showThresholds?: boolean;
  thresholdHigh?: number;
  thresholdModerate?: number;
  timeFilter?: string;
  onTimeFilterChange?: (filter: string) => void;
}

export const RFTimeSeriesChart: React.FC<RFTimeSeriesChartProps> = ({
  data,
  height = 320,
  showThresholds = true,
  thresholdHigh = -55,
  thresholdModerate = -75,
  timeFilter = 'all',
  onTimeFilterChange,
}) => {
  const [selectedSeries, setSelectedSeries] = useState<{
    rfPower: boolean;
    noiseFloor: boolean;
    activity: boolean;
  }>({
    rfPower: true,
    noiseFloor: true,
    activity: true,
  });

  // Format data for Recharts
  const chartData = data.map((d) => ({
    time: d.timestamp ? d.timestamp.substring(11, 19) : '',
    rfPower: d.rf_power,
    noiseFloor: d.noise_floor,
    activity: d.activity_score,
    snr: d.snr,
    level: d.activity_level,
    fullTimestamp: d.timestamp,
  }));

  const filters = ['15m', '1h', '6h', 'Today', 'All'];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Chart Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Series Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setSelectedSeries((prev) => ({ ...prev, rfPower: !prev.rfPower }))
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all ${
              selectedSeries.rfPower
                ? 'bg-cyan-neon/20 border-cyan-neon text-cyan-neon shadow-[0_0_8px_rgba(0,191,255,0.4)]'
                : 'bg-surface border-white/10 text-text-muted'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-neon" />
            <span>RF Power (dBm)</span>
          </button>

          <button
            onClick={() =>
              setSelectedSeries((prev) => ({
                ...prev,
                noiseFloor: !prev.noiseFloor,
              }))
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all ${
              selectedSeries.noiseFloor
                ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                : 'bg-surface border-white/10 text-text-muted'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Noise Floor (dBm)</span>
          </button>

          <button
            onClick={() =>
              setSelectedSeries((prev) => ({ ...prev, activity: !prev.activity }))
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all ${
              selectedSeries.activity
                ? 'bg-purple-400/20 border-purple-400 text-purple-400'
                : 'bg-surface border-white/10 text-text-muted'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Activity Index (%)</span>
          </button>
        </div>

        {/* Time Filter Tabs */}
        {onTimeFilterChange && (
          <div className="flex items-center bg-surface-card rounded-lg p-0.5 border border-white/10">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => onTimeFilterChange(f.toLowerCase())}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                  timeFilter.toLowerCase() === f.toLowerCase()
                    ? 'bg-cyan-neon/20 text-cyan-neon font-semibold'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Chart Container */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="rfPowerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00bfff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00bfff" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="noiseFloorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />

            <XAxis
              dataKey="time"
              stroke="#66727d"
              tick={{ fill: '#87929b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={{ stroke: '#30363a' }}
            />

            <YAxis
              yAxisId="left"
              domain={[-95, -20]}
              stroke="#66727d"
              tick={{ fill: '#87929b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(v) => `${v} dBm`}
              tickLine={{ stroke: '#30363a' }}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              stroke="#66727d"
              tick={{ fill: '#87929b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(v) => `${v}%`}
              tickLine={{ stroke: '#30363a' }}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload;
                  return (
                    <div className="rounded-lg bg-void/95 border border-cyan-neon/40 p-3 shadow-xl backdrop-blur-xl font-mono text-xs text-white">
                      <div className="text-text-muted text-[10px] pb-1 border-b border-white/10 mb-2">
                        TIME: {p.fullTimestamp || label}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-cyan-neon">RF Power:</span>
                          <span className="font-bold">{p.rfPower} dBm</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-amber-400">Noise Floor:</span>
                          <span>{p.noiseFloor} dBm</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-purple-400">Activity Index:</span>
                          <span>{p.activity}% ({p.level?.toUpperCase()})</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-emerald-400">SNR:</span>
                          <span>+{p.snr} dB</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {showThresholds && (
              <>
                <ReferenceLine
                  yAxisId="left"
                  y={thresholdHigh}
                  label={{
                    value: 'HIGH RF THRESHOLD (-55 dBm)',
                    fill: '#f97316',
                    fontSize: 9,
                    position: 'insideTopRight',
                  }}
                  stroke="#f97316"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <ReferenceLine
                  yAxisId="left"
                  y={thresholdModerate}
                  label={{
                    value: 'MODERATE (-75 dBm)',
                    fill: '#fbbf24',
                    fontSize: 9,
                    position: 'insideBottomRight',
                  }}
                  stroke="#fbbf24"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              </>
            )}

            {selectedSeries.rfPower && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="rfPower"
                stroke="#00bfff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#rfPowerGradient)"
                isAnimationActive={false}
              />
            )}

            {selectedSeries.noiseFloor && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="noiseFloor"
                stroke="#fbbf24"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                isAnimationActive={false}
              />
            )}

            {selectedSeries.activity && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="activity"
                stroke="#c084fc"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
