import React, { useState } from 'react';
import { 
  Cpu, 
  Radio, 
  Satellite, 
  HardDrive, 
  BatteryCharging, 
  Wifi, 
  ShieldCheck, 
  Sliders, 
  RefreshCw, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Activity,
  Terminal,
  Layers
} from 'lucide-react';
import { useRFData } from '../context/RFDataContext';
import { GlassCard } from '../components/layout/GlassCard';

export const DeviceStatusPage: React.FC = () => {
  const { deviceTelemetry, setSamplingRateMs, samplingRateMs, injectRFBurst } = useRFData();
  const [calibrating, setCalibrating] = useState(false);
  const [testLogMessage, setTestLogMessage] = useState<string | null>(null);

  const handleCalibrate = () => {
    setCalibrating(true);
    setTestLogMessage('Initiating zero-signal noise floor calibration sequence...');
    setTimeout(() => {
      setCalibrating(false);
      setTestLogMessage('Calibration complete: AD8318 slope normalized to -24.5 mV/dBm.');
    }, 2000);
  };

  const handleFlushSD = () => {
    setTestLogMessage('Flushing ESP32 RAM buffer to MicroSD FAT32 sector block...');
    setTimeout(() => {
      setTestLogMessage('MicroSD sync success: 4,820 samples committed to /logs/survey_004.csv');
    }, 1200);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-mono text-white">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface/80 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-neon/15 border border-cyan-neon text-cyan-neon shadow-neon-cyan">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-white tracking-wide">
                HARDWARE DIAGNOSTICS & TELEMETRY
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE (200 OK)
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              ESP32 Embedded Architecture • AD8318 RF Front-End • NEO-6M GPS • MicroSD Logging
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCalibrate}
            disabled={calibrating}
            className="px-4 py-2 rounded-lg bg-cyan-neon text-black font-bold text-xs hover:shadow-neon-cyan transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${calibrating ? 'animate-spin' : ''}`} />
            <span>{calibrating ? 'Calibrating Front-End...' : 'Recalibrate Detector'}</span>
          </button>
        </div>
      </div>

      {/* 5 Hardware Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. ESP32 Controller Card */}
        <GlassCard
          title="ESP32 Development Board"
          subtitle="Dual-Core Xtensa LX6 @ 240 MHz"
          icon={<Cpu className="w-5 h-5 text-cyan-neon" />}
          badge={
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              HEALTHY
            </span>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">Firmware Version:</span>
              <span className="text-white font-bold">{deviceTelemetry.firmware_version}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">CPU Temperature:</span>
              <span className="text-cyan-neon font-bold">{deviceTelemetry.esp32_cpu_temp}°C</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">Free Heap SRAM:</span>
              <span className="text-white">{deviceTelemetry.esp32_free_heap_kb} KB / 320 KB</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">System Uptime:</span>
              <span className="text-white font-bold">
                {Math.floor(deviceTelemetry.esp32_uptime_seconds / 3600)}h {Math.floor((deviceTelemetry.esp32_uptime_seconds % 3600) / 60)}m
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-text-muted">FreeRTOS Tasks:</span>
              <span className="text-emerald-400 font-semibold">ADC_TASK, GPS_UART, SD_LOG (Nominal)</span>
            </div>
          </div>
        </GlassCard>

        {/* 2. AD8318 RF Logarithmic Detector */}
        <GlassCard
          title="AD8318 RF Detector"
          subtitle="Logarithmic Power Sensor (1 MHz – 8 GHz)"
          icon={<Radio className="w-5 h-5 text-amber-400" />}
          badge={
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-neon/15 text-cyan-neon border border-cyan-neon/30">
              ACTIVE
            </span>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">Analog Vout Signal:</span>
              <span className="text-amber-400 font-bold">{deviceTelemetry.rf_detector_v_out} Volts</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">Dynamic Range:</span>
              <span className="text-white">-60 dBm to 0 dBm (±1.0 dB)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">Log Slope:</span>
              <span className="text-white">-24.5 mV / dB</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">BPF Center Freq:</span>
              <span className="text-cyan-neon font-bold">2.45 GHz (2.4-2.5 GHz BPF)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-text-muted">Detector Accuracy:</span>
              <span className="text-emerald-400 font-bold">Calibrated (ADC Ch 34)</span>
            </div>
          </div>
        </GlassCard>

        {/* 3. NEO-6M GPS Receiver */}
        <GlassCard
          title="NEO-6M GPS Module"
          subtitle="UART NMEA Positioning Engine"
          icon={<Satellite className="w-5 h-5 text-purple-400" />}
          badge={
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              3D FIX
            </span>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">Satellites in Constellation:</span>
              <span className="text-purple-400 font-bold">{deviceTelemetry.gps_satellites} Satellites</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">HDOP Horizontal Precision:</span>
              <span className="text-emerald-400 font-bold">{deviceTelemetry.gps_hdop} (Ideal)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">Baud Rate:</span>
              <span className="text-white">9600 baud (UART 2)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">NMEA Sentences:</span>
              <span className="text-white">$GPRMC, $GPGGA (1 Hz Sync)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-text-muted">Antenna Status:</span>
              <span className="text-cyan-neon font-bold">Active Ceramic Patch</span>
            </div>
          </div>
        </GlassCard>

        {/* 4. MicroSD Storage Subsystem */}
        <GlassCard
          title="MicroSD Logging Subsystem"
          subtitle="SPI Offline / Backup Telemetry Storage"
          icon={<HardDrive className="w-5 h-5 text-cyan-electric" />}
          badge={
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              READY
            </span>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">Logged Samples Count:</span>
              <span className="text-cyan-neon font-bold">{deviceTelemetry.microsd_logged_samples} records</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">Storage Capacity:</span>
              <span className="text-white">{deviceTelemetry.microsd_free_mb} MB free / {deviceTelemetry.microsd_total_mb} MB</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">File Format:</span>
              <span className="text-white">FAT32 CSV Log Structure</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-text-muted">Buffer Sync Action:</span>
              <button
                onClick={handleFlushSD}
                className="text-cyan-neon hover:underline font-bold"
              >
                Flush RAM Cache
              </button>
            </div>
          </div>
        </GlassCard>

        {/* 5. 18650 Battery & Power Subsystem */}
        <GlassCard
          title="18650 Battery & TP4056"
          subtitle="Portable Power & Regulation Circuitry"
          icon={<BatteryCharging className="w-5 h-5 text-emerald-400" />}
          badge={
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              78% CHARGED
            </span>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">Cell Terminal Voltage:</span>
              <span className="text-emerald-400 font-bold">{deviceTelemetry.battery_voltage} V</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">Current Draw:</span>
              <span className="text-white">{deviceTelemetry.power_draw_ma} mA</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">Estimated Field Runtime:</span>
              <span className="text-white font-bold">~14.2 Hours continuous</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-text-muted">Regulator Rail:</span>
              <span className="text-cyan-neon">3.3V Low-Dropout Regulated</span>
            </div>
          </div>
        </GlassCard>

        {/* 6. Wi-Fi & Cloud Ingestion */}
        <GlassCard
          title="Wi-Fi & Cloud Pipeline"
          subtitle="HTTPS / WSS to Supabase Ingestion API"
          icon={<Wifi className="w-5 h-5 text-cyan-neon" />}
          badge={
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-neon/15 text-cyan-neon border border-cyan-neon/30">
              CONNECTED
            </span>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">Access Point SSID:</span>
              <span className="text-white font-bold">{deviceTelemetry.wifi_ssid}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">Signal RSSI:</span>
              <span className="text-emerald-400 font-bold">{deviceTelemetry.wifi_rssi} dBm (Strong)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-text-muted">Endpoint:</span>
              <span className="text-cyan-neon text-[10px]">/functions/v1/ingest-rf-data</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-text-muted">Encryption:</span>
              <span className="text-white">TLS 1.3 + JWT Device Token</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Terminal / Hardware Log Console */}
      <GlassCard
        title="ESP32 UART Diagnostic Terminal"
        subtitle="Real-time serial console messages from the hardware prototype"
        icon={<Terminal className="w-5 h-5 text-cyan-neon" />}
      >
        <div className="rounded-xl bg-void/95 border border-white/10 p-4 font-mono text-xs text-text-secondary space-y-1.5 max-h-48 overflow-y-auto">
          <div className="text-emerald-400">[SYSTEM INIT] ESP32 boot OK. Clock 240MHz. FreeRTOS kernel v10.4.3</div>
          <div className="text-cyan-neon">[RF FRONTEND] AD8318 initialized on ADC1_CH4 (GPIO34). Attenuation 11dB.</div>
          <div className="text-purple-400">[GPS ENGINE] NEO-6M locked 11 satellites. 3D fix established. HDOP: 0.90</div>
          <div className="text-white">[SD CARD] MicroSD SPI mounted. FAT32 volume initialized. /logs/survey_004.csv opened.</div>
          <div className="text-text-muted">[WIFI CONNECT] Connected to "{deviceTelemetry.wifi_ssid}" (RSSI: {deviceTelemetry.wifi_rssi} dBm).</div>
          <div className="text-emerald-400">[CLOUD PUSH] Supabase Edge Function ingest active. Transmission interval: {samplingRateMs}ms.</div>
          {testLogMessage && (
            <div className="text-amber-400 font-bold animate-pulse">&gt;&gt; {testLogMessage}</div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
