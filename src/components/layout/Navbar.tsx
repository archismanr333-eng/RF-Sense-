import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Activity, 
  Satellite, 
  Cpu, 
  Play, 
  Pause, 
  Zap, 
  Volume2, 
  VolumeX, 
  Download, 
  Layers, 
  Bell,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import { useRFData } from '../../context/RFDataContext';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
}) => {
  const {
    activeSurvey,
    surveys,
    setActiveSurvey,
    deviceTelemetry,
    isLiveStreaming,
    toggleLiveStream,
    injectRFBurst,
    audioAlertEnabled,
    setAudioAlertEnabled,
    exportSurveyDataCSV,
    isAlertActive,
  } = useRFData();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-white/10 bg-void/85 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle & Brand & Active Session */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg bg-surface/80 border border-white/10 text-white hover:text-cyan-neon"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div 
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-neon/10 border border-cyan-neon/40 text-cyan-neon group-hover:shadow-neon-cyan transition-all">
            <Radio className="w-5 h-5 animate-pulse-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-void animate-ping-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg tracking-wider text-white group-hover:text-cyan-neon transition-colors">
                RF-SENSE
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-neon/15 text-cyan-neon border border-cyan-neon/30">
                2.4 GHz ISM
              </span>
            </div>
            <p className="hidden md:block text-[10px] font-mono text-text-muted tracking-tight">
              INTELLIGENT RF ENVIRONMENT MAPPING
            </p>
          </div>
        </div>

        {/* Survey Session Switcher */}
        <div className="hidden xl:flex items-center gap-2 ml-4 pl-4 border-l border-white/10">
          <Layers className="w-4 h-4 text-cyan-neon" />
          <span className="text-xs text-text-secondary font-mono">Survey:</span>
          <select
            value={activeSurvey.id}
            onChange={(e) => {
              const s = surveys.find((item) => item.id === e.target.value);
              if (s) setActiveSurvey(s);
            }}
            className="bg-surface-card border border-white/15 rounded-md px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-cyan-neon transition-colors"
          >
            {surveys.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.survey_code}] {s.survey_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Live Status Telemetry Pills */}
      <div className="hidden lg:flex items-center gap-3">
        {/* ESP32 Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card/90 border border-white/10 text-[11px] font-mono">
          <Cpu className="w-3.5 h-3.5 text-cyan-neon" />
          <span className="text-text-secondary">ESP32:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ONLINE
          </span>
        </div>

        {/* GPS Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card/90 border border-white/10 text-[11px] font-mono">
          <Satellite className="w-3.5 h-3.5 text-cyan-electric" />
          <span className="text-text-secondary">GPS:</span>
          <span className="text-cyan-neon font-semibold">
            {deviceTelemetry.gps_fix_type} ({deviceTelemetry.gps_satellites} SAT)
          </span>
        </div>

        {/* Live Indicator / Alarm */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono transition-all ${
            isAlertActive
              ? 'bg-red-500/20 border-red-500/60 text-red-400 shadow-neon-red animate-pulse'
              : 'bg-cyan-neon/10 border-cyan-neon/30 text-cyan-neon'
          }`}
        >
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>{isAlertActive ? 'HIGH RF SPIKE' : 'SPECTRUM ACTIVE'}</span>
        </div>
      </div>

      {/* Right: Actions, Live Stream Toggle & Timestamp */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Timestamp */}
        <div className="hidden 2xl:block text-right">
          <span className="font-mono text-xs text-text-secondary block">
            {currentTime}
          </span>
        </div>

        {/* Inject RF Burst (Simulation tester) */}
        <button
          onClick={() => injectRFBurst(25)}
          title="Simulate RF power burst spike"
          className="p-2 rounded-lg bg-surface border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/60 transition-all text-xs font-mono flex items-center gap-1.5"
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">Simulate Spike</span>
        </button>

        {/* Toggle Live Stream Feed */}
        <button
          onClick={toggleLiveStream}
          className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all ${
            isLiveStreaming
              ? 'bg-cyan-neon/20 border-cyan-neon text-cyan-neon shadow-neon-cyan'
              : 'bg-surface border-white/20 text-text-secondary hover:text-white'
          }`}
        >
          {isLiveStreaming ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Stream</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stream Paused</span>
            </>
          )}
        </button>

        {/* Audio Alert Toggle */}
        <button
          onClick={() => setAudioAlertEnabled(!audioAlertEnabled)}
          title={audioAlertEnabled ? 'Disable Audio Tone' : 'Enable Audio Tone on Spikes'}
          className={`p-2 rounded-lg border transition-colors ${
            audioAlertEnabled
              ? 'bg-cyan-neon/15 border-cyan-neon/40 text-cyan-neon'
              : 'bg-surface border-white/10 text-text-muted hover:text-white'
          }`}
        >
          {audioAlertEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Export Data */}
        <button
          onClick={() => exportSurveyDataCSV()}
          title="Export CSV Dataset"
          className="hidden sm:flex p-2 rounded-lg bg-surface border border-white/10 text-text-secondary hover:text-cyan-neon hover:border-cyan-neon/40 transition-all"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Auth / View Profile */}
        <button
          onClick={() => setCurrentView('login')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-neon to-cyan-electric text-black font-mono font-bold text-xs hover:shadow-neon-cyan transition-all"
        >
          <span>OPERATOR</span>
        </button>
      </div>
    </header>
  );
};
