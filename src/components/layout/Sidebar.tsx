import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Map, 
  History, 
  Cpu, 
  BarChart3, 
  Settings, 
  Globe, 
  Lock,
  Radio,
  Wifi,
  HardDrive,
  BatteryCharging
} from 'lucide-react';
import { useRFData } from '../../context/RFDataContext';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const { deviceTelemetry, isLiveStreaming } = useRFData();

  const navigationItems = [
    {
      id: 'landing',
      label: 'Home & Concept',
      icon: Globe,
      badge: 'Public',
      badgeColor: 'text-text-muted bg-white/5',
    },
    {
      id: 'dashboard',
      label: 'Main Dashboard',
      icon: LayoutDashboard,
      badge: 'Real-time',
      badgeColor: 'text-cyan-neon bg-cyan-neon/10',
    },
    {
      id: 'live-monitor',
      label: 'Live Monitor',
      icon: Activity,
      badge: 'LIVE',
      badgePulse: true,
      badgeColor: 'text-emerald-400 bg-emerald-400/10',
    },
    {
      id: 'heatmap',
      label: 'RF Heatmap',
      icon: Map,
      badge: 'Spatial/Time',
      badgeColor: 'text-purple-400 bg-purple-400/10',
    },
    {
      id: 'history',
      label: 'Survey History',
      icon: History,
      badge: 'Archive',
      badgeColor: 'text-text-muted bg-white/5',
    },
    {
      id: 'device',
      label: 'Hardware Telemetry',
      icon: Cpu,
      badge: 'ESP32',
      badgeColor: 'text-cyan-electric bg-cyan-electric/10',
    },
    {
      id: 'analytics',
      label: 'Spectrum Analytics',
      icon: BarChart3,
      badge: 'Insights',
      badgeColor: 'text-amber-400 bg-amber-400/10',
    },
    {
      id: 'settings',
      label: 'Configuration',
      icon: Settings,
      badge: '',
      badgeColor: '',
    },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-white/10 bg-void/95 backdrop-blur-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5">
            <p className="text-[10px] font-mono tracking-widest text-text-muted uppercase">
              Operational Views
            </p>
          </div>

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-neon/20 to-transparent text-cyan-neon border border-cyan-neon/40 shadow-[0_0_15px_rgba(0,191,255,0.15)] font-semibold'
                    : 'text-text-secondary hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                {/* Active left indicator glow line */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-cyan-neon shadow-[0_0_8px_#00bfff]" />
                )}

                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cyan-neon' : 'text-text-muted group-hover:text-cyan-electric'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium border border-white/5 flex items-center gap-1 ${item.badgeColor}`}
                  >
                    {item.badgePulse && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Hardware Diagnostics Pill */}
        <div className="p-3 border-t border-white/10 bg-white/[0.01]">
          <div className="rounded-xl bg-surface-card/90 border border-white/10 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-cyan-neon animate-pulse-slow" />
                <span className="text-[11px] font-mono font-semibold text-white">
                  {deviceTelemetry.device_id}
                </span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-text-muted" />
                <span>{deviceTelemetry.wifi_rssi} dBm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BatteryCharging className="w-3 h-3 text-emerald-400" />
                <span>{deviceTelemetry.battery_level}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-text-muted" />
                <span>{deviceTelemetry.esp32_cpu_temp}°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-3 h-3 text-text-muted" />
                <span>{deviceTelemetry.microsd_status}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
