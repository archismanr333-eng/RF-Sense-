import React, { useState } from 'react';
import { 
  Radio, 
  Activity, 
  Satellite, 
  Cpu, 
  MapPin, 
  Wifi, 
  Zap, 
  Layers, 
  RefreshCw, 
  Download, 
  Compass, 
  Filter, 
  Eye, 
  Clock,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { useRFData } from '../context/RFDataContext';
import { GlassCard } from '../components/layout/GlassCard';
import { MetricCard } from '../components/common/MetricCard';
import { ActivityBadge } from '../components/common/ActivityBadge';
import { RFTimeSeriesChart } from '../components/charts/RFTimeSeriesChart';
import { ChannelSpectrumBar } from '../components/charts/ChannelSpectrumBar';
import { RFHeatmapLeaflet } from '../components/map/RFHeatmapLeaflet';
import { RFMeasurement } from '../types/rf';

interface DashboardPageProps {
  onNavigate: (view: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    activeSurvey,
    latestMeasurement,
    liveMeasurements,
    measurements,
    deviceTelemetry,
    isLiveStreaming,
    toggleLiveStream,
    injectRFBurst,
    exportSurveyDataCSV,
    exportSurveyDataJSON,
    thresholds,
  } = useRFData();

  const [selectedPacket, setSelectedPacket] = useState<RFMeasurement | null>(null);
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'stream' | 'spectrum'>('stream');

  // Compute stats
  const powers = measurements.map((m) => m.rf_power);
  const minPower = powers.length ? Math.min(...powers) : -90;
  const maxPower = powers.length ? Math.max(...powers) : -30;
  const avgPower = powers.length ? (powers.reduce((a, b) => a + b, 0) / powers.length).toFixed(1) : '-64.0';

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner / Session Info Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-neon/15 text-cyan-neon border border-cyan-neon/30">
              MISSION CONTROL
            </span>
            <span className="text-xs font-mono text-text-muted">
              SURVEY ID: <strong className="text-white">{activeSurvey.survey_code}</strong>
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">
            {activeSurvey.survey_name}
          </h1>
          <p className="text-xs text-text-secondary font-mono flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-neon" />
            <span>{activeSurvey.location_name}</span>
            <span className="text-white/20">•</span>
            <span>Band: {activeSurvey.frequency_band}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('live-monitor')}
            className="px-3.5 py-2 rounded-lg bg-cyan-neon text-black font-mono font-bold text-xs hover:shadow-neon-cyan transition-all flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            <span>Dedicated Live Cockpit</span>
          </button>

          <button
            onClick={() => onNavigate('heatmap')}
            className="px-3.5 py-2 rounded-lg bg-surface border border-white/15 text-white font-mono text-xs hover:border-cyan-neon hover:text-cyan-neon transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-cyan-neon" />
            <span>Open Spatial Heatmap</span>
          </button>

          <button
            onClick={() => exportSurveyDataCSV()}
            title="Download CSV"
            className="p-2 rounded-lg bg-surface border border-white/15 text-text-secondary hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5 Primary Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* RF Signal Power */}
        <MetricCard
          title="Current RF Power"
          value={latestMeasurement.rf_power}
          unit="dBm"
          icon={<Radio className="w-5 h-5" />}
          colorScheme="cyan"
          progress={((latestMeasurement.rf_power + 90) / 60) * 100}
          subMetrics={[
            { label: 'Min', value: `${minPower} dBm` },
            { label: 'Avg', value: `${avgPower} dBm` },
            { label: 'Max', value: `${maxPower} dBm` },
          ]}
        />

        {/* Noise Floor Baseline */}
        <MetricCard
          title="Noise Floor Baseline"
          value={latestMeasurement.noise_floor}
          unit="dBm"
          icon={<Zap className="w-5 h-5" />}
          colorScheme="amber"
          subtitle="Adaptive rolling baseline estimator"
          subMetrics={[
            { label: 'SNR Margin', value: `+${latestMeasurement.snr} dB` },
            { label: 'Detector Vout', value: `${deviceTelemetry.rf_detector_v_out}V` },
          ]}
        />

        {/* RF Activity Index */}
        <MetricCard
          title="Activity & Congestion"
          value={latestMeasurement.activity_score}
          unit="%"
          icon={<Activity className="w-5 h-5" />}
          colorScheme={
            latestMeasurement.activity_level === 'critical' || latestMeasurement.activity_level === 'high'
              ? 'red'
              : 'emerald'
          }
          badge={<ActivityBadge level={latestMeasurement.activity_level} size="sm" />}
          progress={latestMeasurement.activity_score}
          subtitle="Spectral saturation index"
        />

        {/* GPS Geolocation */}
        <MetricCard
          title="GPS Geolocation (NEO-6M)"
          value={`${latestMeasurement.latitude.toFixed(4)}° N`}
          unit={`${latestMeasurement.longitude.toFixed(4)}° E`}
          icon={<Satellite className="w-5 h-5" />}
          colorScheme="purple"
          subtitle={`Fix: ${deviceTelemetry.gps_fix_type} • ${deviceTelemetry.gps_satellites} Satellites`}
          subMetrics={[
            { label: 'HDOP', value: deviceTelemetry.gps_hdop },
            { label: 'Altitude', value: `${latestMeasurement.altitude?.toFixed(1)} m` },
          ]}
        />

        {/* Hardware Status */}
        <MetricCard
          title="ESP32 Telemetry"
          value={`${deviceTelemetry.battery_level}%`}
          unit="BATTERY"
          icon={<Cpu className="w-5 h-5" />}
          colorScheme="emerald"
          subtitle={`Uptime: ${Math.floor(deviceTelemetry.esp32_uptime_seconds / 60)}m`}
          subMetrics={[
            { label: 'CPU Temp', value: `${deviceTelemetry.esp32_cpu_temp}°C` },
            { label: 'MicroSD', value: deviceTelemetry.microsd_status },
          ]}
        />
      </div>

      {/* Main Workspace: Recharts Time-Series & Interactive Mini-Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real-time Multi-Series Chart (7 Cols) */}
        <div className="lg:col-span-7">
          <GlassCard
            title="Real-Time RF Power & Activity Multi-Graph"
            subtitle="Time-series analysis with AD8318 logarithmic conversion"
            icon={<TrendingUp className="w-4 h-4" />}
            headerAction={
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-cyan-neon flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-neon animate-pulse" />
                  {isLiveStreaming ? 'LIVE' : 'PAUSED'}
                </span>
              </div>
            }
          >
            <RFTimeSeriesChart
              data={measurements}
              height={340}
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
              thresholdHigh={thresholds.moderateMaxDbm}
              thresholdModerate={thresholds.lowMaxDbm}
            />
          </GlassCard>
        </div>

        {/* Right: Mini Geotagged RF Heatmap Viewport (5 Cols) */}
        <div className="lg:col-span-5">
          <GlassCard
            title="Spatial Geolocation & RF Heat Zones"
            subtitle="CartoDB Dark Matter tiles & dynamic waypoint clustering"
            icon={<MapPin className="w-4 h-4" />}
            headerAction={
              <button
                onClick={() => onNavigate('heatmap')}
                className="text-[11px] font-mono text-cyan-neon hover:underline flex items-center gap-1"
              >
                <span>Full Map</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="h-[340px] rounded-lg overflow-hidden border border-white/5">
              <RFHeatmapLeaflet
                measurements={measurements}
                activeMeasurement={latestMeasurement}
                zoom={16}
                onPointSelect={(pt) => setSelectedPacket(pt)}
              />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Secondary Workspace: Channel Spectrum & Live Packet Ingestion Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 2.4 GHz Channel Spectrum Distribution (5 Cols) */}
        <div className="lg:col-span-5">
          <GlassCard
            title="2.4 GHz ISM Spectrum Utilization"
            subtitle="Channels 1 to 14 power & protocol activity distribution"
            icon={<Layers className="w-4 h-4" />}
          >
            <ChannelSpectrumBar />
          </GlassCard>
        </div>

        {/* Right: Live Telemetry Packet Stream Table (7 Cols) */}
        <div className="lg:col-span-7">
          <GlassCard
            title="ESP32 Live Telemetry Packet Stream"
            subtitle={`Ingestion buffer: ${measurements.length} records tagged with GPS & timestamp`}
            icon={<Activity className="w-4 h-4" />}
            headerAction={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportSurveyDataJSON()}
                  className="px-2.5 py-1 rounded bg-surface border border-white/10 text-xs font-mono text-text-secondary hover:text-white"
                >
                  Export JSON
                </button>
              </div>
            }
          >
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead className="sticky top-0 bg-surface-card/95 backdrop-blur-md border-b border-white/10 text-[10px] text-text-muted uppercase">
                  <tr>
                    <th className="py-2 px-3">Sample</th>
                    <th className="py-2 px-3">Time</th>
                    <th className="py-2 px-3">RF (dBm)</th>
                    <th className="py-2 px-3">Noise</th>
                    <th className="py-2 px-3">SNR</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {measurements.slice(-15).reverse().map((pkt) => (
                    <tr
                      key={pkt.id}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                      onClick={() => setSelectedPacket(pkt)}
                    >
                      <td className="py-2 px-3 font-bold text-white">#{pkt.sample_id}</td>
                      <td className="py-2 px-3 text-text-secondary">{pkt.timestamp.substring(11, 19)}</td>
                      <td className={`py-2 px-3 font-semibold ${
                        pkt.rf_power >= -55 ? 'text-red-400' : pkt.rf_power >= -75 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {pkt.rf_power} dBm
                      </td>
                      <td className="py-2 px-3 text-text-muted">{pkt.noise_floor} dBm</td>
                      <td className="py-2 px-3 text-cyan-electric">+{pkt.snr} dB</td>
                      <td className="py-2 px-3">
                        <ActivityBadge level={pkt.activity_level} size="sm" showPulse={false} />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPacket(pkt);
                          }}
                          className="p-1 rounded hover:bg-cyan-neon/20 text-text-muted hover:text-cyan-neon transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Packet Inspection Modal */}
      {selectedPacket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-cyan-neon/40 p-6 shadow-neon-cyan font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-neon" />
                <span className="font-bold text-white text-base">
                  TELEMETRY PACKET #{selectedPacket.sample_id}
                </span>
              </div>
              <button
                onClick={() => setSelectedPacket(null)}
                className="text-text-muted hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-void/80 border border-white/10">
                <span className="text-text-muted block text-[10px]">RF POWER</span>
                <span className="text-base font-bold text-cyan-neon">{selectedPacket.rf_power} dBm</span>
              </div>
              <div className="p-3 rounded-lg bg-void/80 border border-white/10">
                <span className="text-text-muted block text-[10px]">EST. NOISE FLOOR</span>
                <span className="text-base font-bold text-amber-400">{selectedPacket.noise_floor} dBm</span>
              </div>
              <div className="p-3 rounded-lg bg-void/80 border border-white/10">
                <span className="text-text-muted block text-[10px]">SNR MARGIN</span>
                <span className="text-base font-bold text-emerald-400">+{selectedPacket.snr} dB</span>
              </div>
              <div className="p-3 rounded-lg bg-void/80 border border-white/10">
                <span className="text-text-muted block text-[10px]">ACTIVITY INDEX</span>
                <span className="text-base font-bold text-purple-400">{selectedPacket.activity_score}% ({selectedPacket.activity_level.toUpperCase()})</span>
              </div>
              <div className="p-3 rounded-lg bg-void/80 border border-white/10">
                <span className="text-text-muted block text-[10px]">GPS COORDINATES</span>
                <span className="text-xs text-white">{selectedPacket.latitude}°, {selectedPacket.longitude}°</span>
              </div>
              <div className="p-3 rounded-lg bg-void/80 border border-white/10">
                <span className="text-text-muted block text-[10px]">TIMESTAMP</span>
                <span className="text-xs text-white">{selectedPacket.timestamp}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedPacket(null)}
                className="px-4 py-2 rounded-lg bg-cyan-neon text-black font-bold text-xs hover:shadow-neon-cyan"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
