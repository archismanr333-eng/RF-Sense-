import React, { useState, useEffect } from 'react';
import { 
  Map, 
  Layers, 
  Filter, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Calendar, 
  Clock, 
  Download, 
  Eye, 
  Compass, 
  Activity, 
  Radio, 
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { useRFData } from '../context/RFDataContext';
import { RFHeatmapLeaflet } from '../components/map/RFHeatmapLeaflet';
import { RFMeasurement, SurveySession } from '../types/rf';

export const HeatmapPage: React.FC = () => {
  const {
    surveys,
    activeSurvey,
    setActiveSurvey,
    measurements,
    exportSurveyDataCSV,
  } = useRFData();

  // Map layer toggles
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [showPolyline, setShowPolyline] = useState(true);

  // Threshold filter
  const [minPowerFilter, setMinPowerFilter] = useState<number>(-90);
  const [selectedActivityLevels, setSelectedActivityLevels] = useState<string[]>([
    'low',
    'moderate',
    'high',
    'critical',
  ]);

  // Selected single point inspector
  const [inspectedPoint, setInspectedPoint] = useState<RFMeasurement | null>(null);

  // Time-Aware Playback Controller State (10:00 to 12:00 scrubber)
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState<number>(measurements.length);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Keep playback index within bounds when dataset changes
  useEffect(() => {
    setPlaybackIndex(measurements.length);
    setIsPlaying(false);
  }, [measurements]);

  // Playback timer animation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPlaybackIndex((prev) => {
        if (prev >= measurements.length) {
          setIsPlaying(false);
          return measurements.length;
        }
        return prev + 1;
      });
    }, 400 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, measurements.length]);

  // Filtered dataset according to sidebar and timeline scrubber
  const timeSliceMeasurements = measurements.slice(0, playbackIndex);
  const filteredMeasurements = timeSliceMeasurements.filter((m) => {
    const powerMatch = m.rf_power >= minPowerFilter;
    const levelMatch = selectedActivityLevels.includes(m.activity_level);
    return powerMatch && levelMatch;
  });

  const currentScrubPoint = timeSliceMeasurements[timeSliceMeasurements.length - 1];
  const currentScrubTime = currentScrubPoint
    ? currentScrubPoint.timestamp.substring(11, 19)
    : '00:00:00';

  const startTimeStr = measurements.length > 0
    ? measurements[0].timestamp.substring(11, 19)
    : '10:00:00';

  const endTimeStr = measurements.length > 0
    ? measurements[measurements.length - 1].timestamp.substring(11, 19)
    : '12:00:00';

  // Hotspots count
  const hotspotCount = filteredMeasurements.filter((m) => m.rf_power >= -55).length;

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1700px] mx-auto font-mono text-white">
      {/* Top Header & Survey Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-surface/80 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-neon/10 border border-cyan-neon/40 text-cyan-neon">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-white tracking-wide">
                SPATIAL RF ACTIVITY HEATMAP
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40">
                POSTGIS GEOSPATIAL
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Interactive 2.4 GHz spatial heatmap with time-aware survey playback
            </p>
          </div>
        </div>

        {/* Survey Picker */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-card border border-white/10 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-text-muted">Active Survey:</span>
            <select
              value={activeSurvey.id}
              onChange={(e) => {
                const s = surveys.find((item) => item.id === e.target.value);
                if (s) setActiveSurvey(s);
              }}
              className="bg-transparent text-white font-bold focus:outline-none"
            >
              {surveys.map((s) => (
                <option key={s.id} value={s.id} className="bg-surface text-white">
                  [{s.survey_code}] {s.survey_name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => exportSurveyDataCSV()}
            className="px-3 py-1.5 rounded-lg bg-surface border border-white/15 text-xs text-text-secondary hover:text-cyan-neon hover:border-cyan-neon transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export GeoCSV</span>
          </button>
        </div>
      </div>

      {/* Main Map + Sidebar Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Filter & Control Sidebar (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Map Layer Toggles */}
          <div className="p-4 rounded-xl bg-surface/75 border border-white/10 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-neon" />
                MAP LAYERS
              </span>
              <span className="text-[10px] text-text-muted">CARTODB DARK</span>
            </div>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 rounded bg-void/60 border border-white/5 hover:border-cyan-neon/30 cursor-pointer">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-neon" />
                  RF Heatmap Layer
                </span>
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="rounded border-white/20 accent-cyan-neon"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-void/60 border border-white/5 hover:border-cyan-neon/30 cursor-pointer">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Waypoint Data Points
                </span>
                <input
                  type="checkbox"
                  checked={showPoints}
                  onChange={(e) => setShowPoints(e.target.checked)}
                  className="rounded border-white/20 accent-cyan-neon"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-void/60 border border-white/5 hover:border-cyan-neon/30 cursor-pointer">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  Survey Polyline Path
                </span>
                <input
                  type="checkbox"
                  checked={showPolyline}
                  onChange={(e) => setShowPolyline(e.target.checked)}
                  className="rounded border-white/20 accent-cyan-neon"
                />
              </label>
            </div>
          </div>

          {/* Minimum RF Power Threshold Filter */}
          <div className="p-4 rounded-xl bg-surface/75 border border-white/10 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                POWER THRESHOLD
              </span>
              <span className="text-cyan-neon font-bold">{minPowerFilter} dBm</span>
            </div>

            <input
              type="range"
              min="-90"
              max="-30"
              step="1"
              value={minPowerFilter}
              onChange={(e) => setMinPowerFilter(Number(e.target.value))}
              className="w-full accent-cyan-neon cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>-90 dBm (All)</span>
              <span>-60 dBm</span>
              <span>-30 dBm (High Only)</span>
            </div>
          </div>

          {/* Survey Statistics Card */}
          <div className="p-4 rounded-xl bg-surface/75 border border-white/10 backdrop-blur-xl space-y-2 text-xs">
            <span className="text-[10px] text-text-muted uppercase tracking-widest block mb-1">
              SURVEY SPATIAL TELEMETRY
            </span>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-text-secondary">Visible Waypoints:</span>
              <span className="font-bold text-cyan-neon">{filteredMeasurements.length} / {measurements.length}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-text-secondary">Hotspots Detected:</span>
              <span className="font-bold text-red-400">{hotspotCount} zones</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-text-secondary">Center Coordinates:</span>
              <span className="text-white">{activeSurvey.center_lat.toFixed(4)}°, {activeSurvey.center_lng.toFixed(4)}°</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-secondary">Frequency Range:</span>
              <span className="text-amber-400">2.412 - 2.472 GHz</span>
            </div>
          </div>

          {/* Point Inspector if selected */}
          {inspectedPoint && (
            <div className="p-4 rounded-xl bg-cyan-neon/5 border border-cyan-neon/40 shadow-neon-cyan space-y-2 text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1 border-b border-cyan-neon/20">
                <span className="font-bold text-cyan-neon">SAMPLE #{inspectedPoint.sample_id}</span>
                <button
                  onClick={() => setInspectedPoint(null)}
                  className="text-text-muted hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Power:</span>
                <strong className="text-cyan-neon">{inspectedPoint.rf_power} dBm</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Noise Floor:</span>
                <span>{inspectedPoint.noise_floor} dBm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">SNR:</span>
                <span className="text-emerald-400">+{inspectedPoint.snr} dB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Time:</span>
                <span>{inspectedPoint.timestamp.substring(11, 19)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Map Canvas + Time Scrubber Deck (9 Cols) */}
        <div className="lg:col-span-9 space-y-3">
          {/* Main Leaflet Map Viewport */}
          <div className="h-[520px] rounded-xl overflow-hidden border border-white/15 shadow-glass relative">
            <RFHeatmapLeaflet
              measurements={filteredMeasurements}
              activeMeasurement={currentScrubPoint}
              showHeatmapLayer={showHeatmap}
              showPointsLayer={showPoints}
              showRoutePolyline={showPolyline}
              centerLat={activeSurvey.center_lat}
              centerLng={activeSurvey.center_lng}
              zoom={16}
              onPointSelect={(pt) => setInspectedPoint(pt)}
            />
          </div>

          {/* Time-Aware Heatmap Scrubbing Controller (WRD Requirements Section 10 & 14) */}
          <div className="p-4 rounded-xl bg-surface/80 border border-cyan-neon/30 shadow-glass backdrop-blur-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-cyan-neon" />
                <span className="font-bold text-white uppercase tracking-wider">
                  Time-Aware RF Heatmap Playback
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-neon/15 text-cyan-neon border border-cyan-neon/30">
                  CURRENT: {currentScrubTime}
                </span>
              </div>

              {/* Playback Controls & Speed Multipliers */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                    isPlaying
                      ? 'bg-amber-400 text-black shadow-neon-amber'
                      : 'bg-cyan-neon text-black shadow-neon-cyan'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause' : 'Play Timeline'}</span>
                </button>

                <button
                  onClick={() => {
                    setPlaybackIndex(0);
                    setIsPlaying(true);
                  }}
                  title="Restart Survey Playback"
                  className="p-1.5 rounded-lg bg-surface border border-white/15 text-text-secondary hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1 bg-void/80 border border-white/10 rounded-lg p-0.5 text-[11px]">
                  {[1, 2, 5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-0.5 rounded ${
                        playbackSpeed === speed
                          ? 'bg-cyan-neon text-black font-bold'
                          : 'text-text-secondary hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Range Scrubber Slider */}
            <div className="space-y-1.5">
              <input
                type="range"
                min="1"
                max={measurements.length || 1}
                value={playbackIndex}
                onChange={(e) => {
                  setPlaybackIndex(Number(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full accent-cyan-neon h-2 bg-void/80 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
                <span>Start: {startTimeStr}</span>
                <span className="text-cyan-neon font-bold">
                  Scrubbing: {playbackIndex} / {measurements.length} Samples
                </span>
                <span>End: {endTimeStr}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
