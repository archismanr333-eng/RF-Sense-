import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Activity, 
  Satellite, 
  Zap, 
  Sliders, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Layers, 
  Terminal, 
  Maximize2, 
  RefreshCw,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { useRFData } from '../context/RFDataContext';
import { GlassCard } from '../components/layout/GlassCard';
import { OscilloscopeCanvas } from '../components/charts/OscilloscopeCanvas';
import { ActivityBadge } from '../components/common/ActivityBadge';

export const LiveMonitorPage: React.FC = () => {
  const {
    latestMeasurement,
    deviceTelemetry,
    isLiveStreaming,
    toggleLiveStream,
    samplingRateMs,
    setSamplingRateMs,
    injectRFBurst,
    audioAlertEnabled,
    setAudioAlertEnabled,
    isAlertActive,
    thresholds,
  } = useRFData();

  const [peakHoldDbm, setPeakHoldDbm] = useState<number>(latestMeasurement.rf_power);
  const [packetHistory, setPacketHistory] = useState<any[]>([]);

  // Update peak hold
  useEffect(() => {
    if (latestMeasurement.rf_power > peakHoldDbm) {
      setPeakHoldDbm(latestMeasurement.rf_power);
    }
  }, [latestMeasurement.rf_power, peakHoldDbm]);

  // Maintain rolling packet logs
  useEffect(() => {
    setPacketHistory((prev) => [
      {
        id: latestMeasurement.id,
        sample: latestMeasurement.sample_id,
        time: latestMeasurement.timestamp.substring(11, 23),
        rf: latestMeasurement.rf_power,
        adc: latestMeasurement.raw_adc || 1420,
        vout: deviceTelemetry.rf_detector_v_out,
        noise: latestMeasurement.noise_floor,
        snr: latestMeasurement.snr,
        act: latestMeasurement.activity_score,
      },
      ...prev.slice(0, 40),
    ]);
  }, [latestMeasurement, deviceTelemetry.rf_detector_v_out]);

  const resetPeak = () => setPeakHoldDbm(latestMeasurement.rf_power);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-mono">
      {/* Top Cockpit Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-surface/80 border border-cyan-neon/40 shadow-neon-cyan backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-neon/15 border border-cyan-neon text-cyan-neon shadow-neon-cyan">
            <Radio className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-void animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-white tracking-wider">
                LIVE RF SPECTRUM COCKPIT
              </h1>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                ● LIVE
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              AD8318 Logarithmic Detector • ESP32 ADC Real-Time Pipeline (2400-2483.5 MHz)
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Rate Selector */}
          <div className="flex items-center gap-1 bg-void/80 border border-white/10 rounded-lg p-1 text-xs">
            <span className="text-text-muted px-2">Sample Rate:</span>
            {[100, 250, 500, 1000].map((rate) => (
              <button
                key={rate}
                onClick={() => setSamplingRateMs(rate)}
                className={`px-2 py-1 rounded ${
                  samplingRateMs === rate
                    ? 'bg-cyan-neon text-black font-bold'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {rate}ms
              </button>
            ))}
          </div>

          <button
            onClick={() => injectRFBurst(25)}
            className="px-3.5 py-2 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            <span>Inject Spike</span>
          </button>

          <button
            onClick={resetPeak}
            className="px-3 py-2 rounded-lg bg-surface border border-white/15 text-xs text-text-secondary hover:text-white transition-all flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Peak</span>
          </button>

          <button
            onClick={() => setAudioAlertEnabled(!audioAlertEnabled)}
            className={`p-2 rounded-lg border text-xs transition-all ${
              audioAlertEnabled
                ? 'bg-cyan-neon/20 border-cyan-neon text-cyan-neon'
                : 'bg-surface border-white/10 text-text-muted'
            }`}
            title="Audio Alert on Threshold Exceeded"
          >
            {audioAlertEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Primary HUD Readouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Instantaneous RF Power */}
        <div className="p-5 rounded-xl bg-surface/75 border border-cyan-neon/40 shadow-neon-cyan relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-text-muted mb-2">
            <span>INSTANTANEOUS POWER</span>
            <span className="text-cyan-neon font-bold">REALTIME</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold text-white tracking-tight">
              {latestMeasurement.rf_power}
            </span>
            <span className="text-base text-cyan-neon font-bold">dBm</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-white/5">
            <span>Detector Vout: <strong className="text-white">{deviceTelemetry.rf_detector_v_out}V</strong></span>
            <span>Raw ADC: <strong className="text-white">{latestMeasurement.raw_adc}</strong></span>
          </div>
        </div>

        {/* Peak Power Hold */}
        <div className="p-5 rounded-xl bg-surface/75 border border-amber-500/40 shadow-neon-amber relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-text-muted mb-2">
            <span>PEAK POWER HOLD</span>
            <span className="text-amber-400 font-bold">MAX ENVELOPE</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold text-amber-400 tracking-tight">
              {peakHoldDbm}
            </span>
            <span className="text-base text-amber-400 font-bold">dBm</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-white/5">
            <span>Delta to Peak: <strong className="text-white">{(peakHoldDbm - latestMeasurement.rf_power).toFixed(1)} dB</strong></span>
            <span className="text-amber-400 font-semibold">PEAK CAPTURE</span>
          </div>
        </div>

        {/* Noise Floor Baseline */}
        <div className="p-5 rounded-xl bg-surface/75 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-text-muted mb-2">
            <span>ESTIMATED NOISE FLOOR</span>
            <span className="text-purple-400 font-bold">BASELINE</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold text-white tracking-tight">
              {latestMeasurement.noise_floor}
            </span>
            <span className="text-base text-purple-400 font-bold">dBm</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-white/5">
            <span>SNR Margin: <strong className="text-emerald-400">+{latestMeasurement.snr} dB</strong></span>
            <span className="text-text-muted">Moving Avg</span>
          </div>
        </div>

        {/* Activity & Alarm Level */}
        <div className={`p-5 rounded-xl border relative overflow-hidden transition-all ${
          isAlertActive
            ? 'bg-red-500/20 border-red-500/60 shadow-neon-red animate-pulse'
            : 'bg-surface/75 border-white/10'
        }`}>
          <div className="flex items-center justify-between text-xs text-text-muted mb-2">
            <span>SPECTRAL ACTIVITY</span>
            <ActivityBadge level={latestMeasurement.activity_level} size="sm" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold text-white tracking-tight">
              {latestMeasurement.activity_score}
            </span>
            <span className="text-base text-cyan-electric font-bold">%</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-white/5">
            <span>Status: <strong className="text-white">{latestMeasurement.activity_level.toUpperCase()}</strong></span>
            <span>Packet Rate: <strong className="text-cyan-neon">{latestMeasurement.packet_rate} pkt/s</strong></span>
          </div>
        </div>
      </div>

      {/* Main Real-Time Oscilloscope Trace Screen */}
      <GlassCard
        title="AD8318 High-Speed Oscilloscope & Waveform Stream"
        subtitle="100ms sweep sampling interval • Continuous signal tracking with peak hold"
        icon={<Activity className="w-5 h-5 text-cyan-neon" />}
        glow={true}
      >
        <OscilloscopeCanvas
          currentPower={latestMeasurement.rf_power}
          noiseFloor={latestMeasurement.noise_floor}
          activityScore={latestMeasurement.activity_score}
          height={280}
          isStreaming={isLiveStreaming}
        />
      </GlassCard>

      {/* Lower Tactical Deck: GPS Coordinates & Raw Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: GPS Tactical Geolocation HUD (4 Cols) */}
        <div className="lg:col-span-4">
          <GlassCard
            title="NEO-6M GPS Receiver Telemetry"
            subtitle="Geotagging receiver synchronized to microsecond epoch"
            icon={<Satellite className="w-4 h-4" />}
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-void/80 border border-white/10 flex items-center justify-between">
                <span className="text-text-muted">Latitude:</span>
                <span className="font-bold text-white">{latestMeasurement.latitude.toFixed(6)}° N</span>
              </div>
              <div className="p-3 rounded-lg bg-void/80 border border-white/10 flex items-center justify-between">
                <span className="text-text-muted">Longitude:</span>
                <span className="font-bold text-white">{latestMeasurement.longitude.toFixed(6)}° E</span>
              </div>
              <div className="p-3 rounded-lg bg-void/80 border border-white/10 flex items-center justify-between">
                <span className="text-text-muted">Elevation / Altitude:</span>
                <span className="font-bold text-cyan-neon">{latestMeasurement.altitude?.toFixed(1)} meters</span>
              </div>
              <div className="p-3 rounded-lg bg-void/80 border border-white/10 flex items-center justify-between">
                <span className="text-text-muted">Satellites Tracked:</span>
                <span className="font-bold text-emerald-400">{deviceTelemetry.gps_satellites} Locked</span>
              </div>
              <div className="p-3 rounded-lg bg-void/80 border border-white/10 flex items-center justify-between">
                <span className="text-text-muted">HDOP Accuracy:</span>
                <span className="font-bold text-white">{deviceTelemetry.gps_hdop} (High Precision)</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Real-time Ingestion Stream Table (8 Cols) */}
        <div className="lg:col-span-8">
          <GlassCard
            title="Raw Ingestion Telemetry Stream"
            subtitle="Live UART/HTTPS packet decoding from ESP32 front-end"
            icon={<Terminal className="w-4 h-4" />}
          >
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead className="sticky top-0 bg-surface-card border-b border-white/10 text-[10px] text-text-muted uppercase">
                  <tr>
                    <th className="py-2 px-3">Packet ID</th>
                    <th className="py-2 px-3">Time (UTC)</th>
                    <th className="py-2 px-3">RF Power</th>
                    <th className="py-2 px-3">Raw ADC</th>
                    <th className="py-2 px-3">Detector Vout</th>
                    <th className="py-2 px-3">SNR Margin</th>
                    <th className="py-2 px-3">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {packetHistory.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-2 px-3 text-cyan-neon">#{row.sample}</td>
                      <td className="py-2 px-3 text-text-secondary">{row.time}</td>
                      <td className={`py-2 px-3 font-bold ${
                        row.rf >= -55 ? 'text-red-400' : row.rf >= -75 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {row.rf} dBm
                      </td>
                      <td className="py-2 px-3 text-white">{row.adc}</td>
                      <td className="py-2 px-3 text-text-muted">{row.vout}V</td>
                      <td className="py-2 px-3 text-cyan-electric">+{row.snr} dB</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-white">
                          {row.act}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
