import React from 'react';
import { 
  Radio, 
  Activity, 
  Map, 
  Cpu, 
  ShieldCheck, 
  Sliders, 
  Layers, 
  Download, 
  ArrowRight, 
  Zap, 
  Satellite, 
  BarChart2, 
  Database,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useRFData } from '../context/RFDataContext';
import { RFTimeSeriesChart } from '../components/charts/RFTimeSeriesChart';
import { RFHeatmapLeaflet } from '../components/map/RFHeatmapLeaflet';

interface LandingPageProps {
  onEnterApp: (view?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { latestMeasurement, liveMeasurements } = useRFData();

  return (
    <div className="min-h-screen bg-void text-[#DEE3E8] bg-cyber-grid selection:bg-cyan-neon/30">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-void/90 backdrop-blur-xl px-6 lg:px-12 h-18 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-neon/10 border border-cyan-neon/40 text-cyan-neon shadow-neon-cyan">
            <Radio className="w-5 h-5 animate-pulse-slow" />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-wider text-white">
              RF-SENSE
            </span>
            <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-neon/15 text-cyan-neon border border-cyan-neon/30">
              INTELLIGENCE
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-mono text-text-secondary">
          <a href="#features" className="hover:text-cyan-neon transition-colors">Features</a>
          <a href="#architecture" className="hover:text-cyan-neon transition-colors">System Architecture</a>
          <a href="#tech-stack" className="hover:text-cyan-neon transition-colors">Tech Stack</a>
          <a href="#use-cases" className="hover:text-cyan-neon transition-colors">Use Cases</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onEnterApp('login')}
            className="px-4 py-2 rounded-lg bg-surface border border-white/15 text-xs font-mono text-white hover:border-cyan-neon/50 hover:text-cyan-neon transition-all"
          >
            Operator Login
          </button>
          <button
            onClick={() => onEnterApp('dashboard')}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-neon to-cyan-electric text-black font-mono font-bold text-xs hover:shadow-neon-cyan transition-all flex items-center gap-1.5"
          >
            <span>Launch Console</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
        {/* Background radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-neon/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-neon/10 border border-cyan-neon/30 text-cyan-neon text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-neon animate-ping" />
            <span>2.4 GHz ISM Spectrum Geolocation & RF Activity Suite</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            UNDERSTAND THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-neon via-cyan-electric to-white">
              RF ENVIRONMENT
            </span>
          </h1>

          <p className="text-base sm:text-lg text-text-secondary font-sans leading-relaxed">
            Monitor real-time RF activity, stabilize noise-floor baselines, and convert location-tagged 
            telemetry into high-resolution spatial heatmaps with an ESP32 hardware front-end and cloud analytics.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onEnterApp('dashboard')}
              className="px-6 py-3.5 rounded-xl bg-cyan-neon text-black font-mono font-bold text-sm hover:shadow-neon-cyan-lg transition-all flex items-center gap-2"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEnterApp('heatmap')}
              className="px-6 py-3.5 rounded-xl bg-surface/80 border border-white/20 text-white font-mono text-sm hover:border-cyan-neon hover:text-cyan-neon transition-all flex items-center gap-2"
            >
              <Map className="w-4 h-4 text-cyan-neon" />
              <span>View Spatial Heatmap</span>
            </button>
          </div>

          {/* Quick Real-Time Telemetry Bar */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-text-muted">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Sensor: <strong className="text-white">AD8318 Log Detector</strong>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-neon" />
              MCU: <strong className="text-white">ESP32 Dual-Core</strong>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Position: <strong className="text-white">NEO-6M GPS 3D Fix</strong>
            </span>
          </div>
        </div>

        {/* Live Interactive Teaser Cockpit */}
        <div className="mt-16 rounded-2xl bg-surface/80 backdrop-blur-2xl border border-cyan-neon/30 p-4 sm:p-6 shadow-neon-cyan relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs font-bold text-white tracking-widest uppercase">
                Live Sensor Ingestion Feed (Sample #{latestMeasurement.sample_id})
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-cyan-neon">RF: {latestMeasurement.rf_power} dBm</span>
              <span className="text-amber-400">Noise: {latestMeasurement.noise_floor} dBm</span>
              <span className="text-emerald-400">SNR: +{latestMeasurement.snr} dB</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-text-secondary uppercase">
                Real-Time RF Power & Noise Floor vs Timestamp
              </span>
              <RFTimeSeriesChart data={liveMeasurements.slice(-30)} height={220} />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono text-text-secondary uppercase">
                Geotagged Survey Trace & Heatmap Preview
              </span>
              <div className="h-[220px] rounded-xl overflow-hidden border border-white/10">
                <RFHeatmapLeaflet measurements={liveMeasurements} zoom={16} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Feature Pillars */}
      <section id="features" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="font-display text-3xl font-bold text-white">
            Engineered for High-Stakes RF Intelligence
          </h2>
          <p className="text-text-secondary text-sm">
            Everything needed to capture, filter, log, and interpret electromagnetic environment activity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: '2.4 GHz RF Signal Monitoring',
              desc: 'High-speed analog sampling via AD8318 logarithmic detector converting ambient RF power into calibrated dBm metrics.',
              icon: Radio,
              color: 'text-cyan-neon border-cyan-neon/30 bg-cyan-neon/10',
            },
            {
              title: 'Noise-Floor Estimation',
              desc: 'Continuous rolling average and median filtering to dynamically distinguish background noise from active transmitters.',
              icon: Sliders,
              color: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
            },
            {
              title: 'RF Activity & Congestion',
              desc: 'Real-time 0-100% activity scoring and automated multi-level threshold classification (Low, Moderate, High, Critical).',
              icon: Activity,
              color: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
            },
            {
              title: 'GPS Location Tagging',
              desc: 'NEO-6M satellite receiver integration fusing microsecond timestamps with precise latitude, longitude, and elevation.',
              icon: Satellite,
              color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
            },
            {
              title: 'Time-Based Playback Analysis',
              desc: 'Scrub through historical survey timelines to visualize how RF interference patterns evolve across space and time.',
              icon: Layers,
              color: 'text-cyan-electric border-cyan-electric/30 bg-cyan-electric/10',
            },
            {
              title: 'Spatial RF Heatmap',
              desc: 'PostGIS spatial indexing and interactive Leaflet map overlays rendering glowing electromagnetic density gradients.',
              icon: Map,
              color: 'text-red-400 border-red-400/30 bg-red-400/10',
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="rounded-xl bg-surface/70 border border-white/10 p-6 hover:border-cyan-neon/40 hover:shadow-neon-cyan transition-all group backdrop-blur-xl"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${f.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-text-secondary text-xs leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* System Architecture Flow Diagram */}
      <section id="architecture" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-white/10 bg-surface-dim/40 rounded-3xl my-12">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-block font-mono text-xs text-cyan-neon uppercase tracking-widest">
            End-to-End Pipeline
          </div>
          <h2 className="font-display text-3xl font-bold text-white">
            System Architecture
          </h2>
          <p className="text-text-secondary text-sm">
            From physical electromagnetic wave capture to cloud geospatial visualization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {[
            {
              step: '01',
              title: 'RF Front-End',
              sub: '2.4 GHz Antenna + BPF + AD8318 Log Detector',
              tag: 'HARDWARE',
            },
            {
              step: '02',
              title: 'ESP32 Acquisition',
              sub: 'ADC Sampling, Digital Filtering, GPS UART Fusion',
              tag: 'EMBEDDED',
            },
            {
              step: '03',
              title: 'HTTPS / MicroSD',
              sub: 'Encrypted JSON Ingestion & Offline CSV Backup',
              tag: 'TRANSPORT',
            },
            {
              step: '04',
              title: 'Supabase Cloud',
              sub: 'PostgreSQL + PostGIS Geospatial + Realtime WS',
              tag: 'BACKEND',
            },
            {
              step: '05',
              title: 'Command Dashboard',
              sub: 'React + TypeScript + Leaflet Heatmap + Recharts',
              tag: 'FRONTEND',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative p-5 rounded-xl bg-surface border border-white/10 flex flex-col justify-between hover:border-cyan-neon/50 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-2xl font-bold text-cyan-neon/40 group-hover:text-cyan-neon transition-colors">
                    {item.step}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-text-muted border border-white/10">
                    {item.tag}
                  </span>
                </div>
                <h4 className="font-display font-semibold text-sm text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-[11px] text-text-secondary">
                  {item.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Target Use Cases */}
      <section id="use-cases" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="font-display text-3xl font-bold text-white">
            Designed for Field & Laboratory Applications
          </h2>
          <p className="text-text-secondary text-sm">
            Empowering researchers, wireless network engineers, IoT developers, and academic survey teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface/60 border border-white/10">
            <Zap className="w-8 h-8 text-cyan-neon mb-4" />
            <h3 className="font-display font-bold text-lg text-white mb-2">
              Wireless Network Planning
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Identify congested Wi-Fi channels, rogue access points, and dead zones across educational campuses, warehouses, and industrial parks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface/60 border border-white/10">
            <ShieldCheck className="w-8 h-8 text-amber-400 mb-4" />
            <h3 className="font-display font-bold text-lg text-white mb-2">
              Electromagnetic Interference Audit
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Pinpoint spurious RF emissions from microwave ovens, industrial machinery, and unshielded RF transmitters disrupting IoT sensor nodes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface/60 border border-white/10">
            <Database className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="font-display font-bold text-lg text-white mb-2">
              Academic & Spectrum Research
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Collect verified location-tagged RF datasets for propagation model validation, machine learning anomaly detection, and spectrum occupancy studies.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 lg:px-12 bg-surface-dim/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-cyan-neon" />
            <span className="font-display font-bold text-white tracking-wider">
              RF-SENSE INTELLIGENCE
            </span>
          </div>
          <p className="text-xs font-mono text-text-muted">
            Portable 2.4 GHz RF Environment Mapping and Activity Analysis System • PRD & WRD Compliant
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onEnterApp('dashboard')}
              className="text-xs font-mono text-cyan-neon hover:underline"
            >
              Open Dashboard
            </button>
            <button
              onClick={() => onEnterApp('login')}
              className="text-xs font-mono text-text-secondary hover:text-white"
            >
              Operator Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
