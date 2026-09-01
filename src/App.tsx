import React, { useState, useEffect } from 'react';
import { RFDataProvider, useRFData } from './context/RFDataContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveMonitorPage } from './pages/LiveMonitorPage';
import { HeatmapPage } from './pages/HeatmapPage';
import { HistoryPage } from './pages/HistoryPage';
import { DeviceStatusPage } from './pages/DeviceStatusPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const { isAlertActive, audioAlertEnabled } = useRFData();

  // Audio beep alarm when spike occurs and audioAlertEnabled is true
  useEffect(() => {
    if (isAlertActive && audioAlertEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz High A
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      } catch (e) {
        // audio context prevented by browser autoplay policy until interaction
      }
    }
  }, [isAlertActive, audioAlertEnabled]);

  // Full-page standalone views without dashboard shell
  if (currentView === 'landing') {
    return <LandingPage onEnterApp={(view) => setCurrentView(view || 'dashboard')} />;
  }

  if (currentView === 'login') {
    return (
      <LoginPage
        onSuccess={() => setCurrentView('dashboard')}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-void text-[#DEE3E8] flex flex-col bg-cyber-grid selection:bg-cyan-neon/30">
      {/* Top Telemetry Command Bar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Dynamic Page Content (with left padding for fixed sidebar on desktop) */}
        <main className="flex-1 overflow-y-auto lg:pl-64 transition-all pb-12">
          {currentView === 'dashboard' && <DashboardPage onNavigate={setCurrentView} />}
          {currentView === 'live-monitor' && <LiveMonitorPage />}
          {currentView === 'heatmap' && <HeatmapPage />}
          {currentView === 'history' && <HistoryPage onNavigateToMap={() => setCurrentView('heatmap')} />}
          {currentView === 'device' && <DeviceStatusPage />}
          {currentView === 'analytics' && <AnalyticsPage />}
          {currentView === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <RFDataProvider>
      <AppContent />
    </RFDataProvider>
  );
};

export default App;
