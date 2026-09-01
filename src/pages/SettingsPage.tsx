import React, { useState } from 'react';
import { 
  Settings, 
  Sliders, 
  Database, 
  Cpu, 
  Save, 
  CheckCircle2, 
  Volume2, 
  Layers, 
  ShieldCheck,
  Palette
} from 'lucide-react';
import { useRFData } from '../context/RFDataContext';
import { GlassCard } from '../components/layout/GlassCard';

export const SettingsPage: React.FC = () => {
  const { thresholds, setThresholds, samplingRateMs, setSamplingRateMs, audioAlertEnabled, setAudioAlertEnabled } = useRFData();

  const [lowThreshold, setLowThreshold] = useState<number>(thresholds.lowMaxDbm);
  const [moderateThreshold, setModerateThreshold] = useState<number>(thresholds.moderateMaxDbm);
  const [highThreshold, setHighThreshold] = useState<number>(thresholds.highMaxDbm);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Cloud config
  const [supabaseUrl, setSupabaseUrl] = useState('https://sample-rf-sense.supabase.co');
  const [edgeFunctionPath, setEdgeFunctionPath] = useState('/functions/v1/ingest-rf-data');
  const [themeMode, setThemeMode] = useState('cyber-dark');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setThresholds({
      ...thresholds,
      lowMaxDbm: lowThreshold,
      moderateMaxDbm: moderateThreshold,
      highMaxDbm: highThreshold,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto font-mono text-white">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface/80 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-neon/10 border border-cyan-neon/40 text-cyan-neon">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-wide">
              SYSTEM CONFIGURATION & CALIBRATION
            </h1>
            <p className="text-xs text-text-secondary">
              RF signal threshold calibration, Supabase backend integration, and telemetry parameters
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2.5 rounded-lg bg-cyan-neon text-black font-bold text-xs hover:shadow-neon-cyan transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>System parameters updated and propagated to ESP32 telemetry pipeline.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. RF Signal Threshold Calibration */}
        <GlassCard
          title="RF Signal Classification Thresholds"
          subtitle="Configure dBm boundaries for activity scoring and alarm triggers"
          icon={<Sliders className="w-5 h-5 text-cyan-neon" />}
        >
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-text-secondary">Low Activity Boundary:</span>
                <span className="font-bold text-emerald-400">{lowThreshold} dBm</span>
              </div>
              <input
                type="range"
                min="-90"
                max="-60"
                value={lowThreshold}
                onChange={(e) => setLowThreshold(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <span className="text-[10px] text-text-muted">Values below this are marked as Quiet Background</span>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-text-secondary">Moderate Activity Threshold:</span>
                <span className="font-bold text-amber-400">{moderateThreshold} dBm</span>
              </div>
              <input
                type="range"
                min="-80"
                max="-45"
                value={moderateThreshold}
                onChange={(e) => setModerateThreshold(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-[10px] text-text-muted">Typical ambient Wi-Fi / Bluetooth transmissions</span>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-text-secondary">Critical / High Congestion Threshold:</span>
                <span className="font-bold text-red-400">{highThreshold} dBm</span>
              </div>
              <input
                type="range"
                min="-60"
                max="-25"
                value={highThreshold}
                onChange={(e) => setHighThreshold(Number(e.target.value))}
                className="w-full accent-red-400 cursor-pointer"
              />
              <span className="text-[10px] text-text-muted">Values above trigger immediate cockpit warnings</span>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-text-secondary">Audio Alarm on High RF Spike:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={audioAlertEnabled}
                  onChange={(e) => setAudioAlertEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-void peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-neon" />
              </label>
            </div>
          </div>
        </GlassCard>

        {/* 2. ESP32 Sampling & Acquisition Config */}
        <GlassCard
          title="ESP32 Telemetry & Acquisition"
          subtitle="Microcontroller ADC reading interval and logging rate"
          icon={<Cpu className="w-5 h-5 text-amber-400" />}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-text-secondary uppercase mb-1">
                ADC Acquisition Rate
              </label>
              <select
                value={samplingRateMs}
                onChange={(e) => setSamplingRateMs(Number(e.target.value))}
                className="w-full bg-void/80 border border-white/15 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-neon"
              >
                <option value={100}>100 ms (High-Speed Sweep - 10 samples/sec)</option>
                <option value={250}>250 ms (Standard Telemetry - 4 samples/sec)</option>
                <option value={500}>500 ms (Power Saving Field Survey)</option>
                <option value={1000}>1000 ms (Extended Walking Survey)</option>
              </select>
            </div>

            <div>
              <label className="block text-text-secondary uppercase mb-1">
                Device Identifier Code
              </label>
              <input
                type="text"
                disabled
                value="RF-SENSE-001 (MAC: 24:6F:28:B1:A9:7C)"
                className="w-full bg-void/50 border border-white/10 rounded-lg p-2.5 text-text-muted"
              />
            </div>

            <div>
              <label className="block text-text-secondary uppercase mb-1">
                Digital Filter Algorithm
              </label>
              <input
                type="text"
                disabled
                value="5-Point Rolling Median + Exponential Moving Average (EMA α=0.25)"
                className="w-full bg-void/50 border border-white/10 rounded-lg p-2.5 text-cyan-neon"
              />
            </div>
          </div>
        </GlassCard>

        {/* 3. Supabase Cloud Backend Configuration */}
        <GlassCard
          title="Supabase Backend Architecture"
          subtitle="PostgreSQL / PostGIS and Edge Function ingestion target"
          icon={<Database className="w-5 h-5 text-purple-400" />}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-text-secondary uppercase mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-void/80 border border-white/15 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-neon"
              />
            </div>

            <div>
              <label className="block text-text-secondary uppercase mb-1">
                Edge Function Ingestion Route
              </label>
              <input
                type="text"
                value={edgeFunctionPath}
                onChange={(e) => setEdgeFunctionPath(e.target.value)}
                className="w-full bg-void/80 border border-white/15 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-neon"
              />
            </div>

            <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-[11px] text-text-secondary">
              <span className="text-emerald-400 font-bold block mb-1">Row Level Security (RLS) Active:</span>
              Operator authenticated sessions can only query authorized device survey datasets.
            </div>
          </div>
        </GlassCard>

        {/* 4. UI Theme & Display Customization */}
        <GlassCard
          title="Interface Customization"
          subtitle="HUD display themes and visual styling"
          icon={<Palette className="w-5 h-5 text-cyan-electric" />}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-text-secondary uppercase mb-1">
                Theme Profile
              </label>
              <select
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value)}
                className="w-full bg-void/80 border border-white/15 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-neon"
              >
                <option value="cyber-dark">Cyber Dark (Electric Cyan & Void Space - Stitch Spec)</option>
                <option value="tactical-amber">Tactical Night Mode (Amber HUD)</option>
                <option value="deep-navy">Spectra Deep Navy Command</option>
              </select>
            </div>

            <div className="p-3 rounded-lg bg-void/80 border border-white/10 space-y-1 text-[11px]">
              <span className="text-text-muted uppercase block">Typography Stack:</span>
              <span className="text-white block font-display font-bold">Space Grotesk (Numerical Metrics & Headings)</span>
              <span className="text-text-secondary block font-sans">Inter (Body, Telemetry & Labels)</span>
            </div>
          </div>
        </GlassCard>
      </form>
    </div>
  );
};
