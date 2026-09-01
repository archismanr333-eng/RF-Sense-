import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RFMeasurement } from '../../types/rf';
import { Layers, ZoomIn, ZoomOut, Compass, Navigation } from 'lucide-react';

interface RFHeatmapLeafletProps {
  measurements: RFMeasurement[];
  activeMeasurement?: RFMeasurement;
  height?: string | number;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  showHeatmapLayer?: boolean;
  showPointsLayer?: boolean;
  showRoutePolyline?: boolean;
  timeFilterTimestamp?: string | null;
  onPointSelect?: (measurement: RFMeasurement) => void;
}

export const RFHeatmapLeaflet: React.FC<RFHeatmapLeafletProps> = ({
  measurements,
  activeMeasurement,
  height = '100%',
  centerLat = 22.5726,
  centerLng = 88.3639,
  zoom = 16,
  showHeatmapLayer = true,
  showPointsLayer = true,
  showRoutePolyline = true,
  timeFilterTimestamp = null,
  onPointSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const activePulseMarkerRef = useRef<L.CircleMarker | null>(null);

  const [currentZoom, setCurrentZoom] = useState<number>(zoom);

  // Filter points based on timestamp slider if active
  const filteredPoints = React.useMemo(() => {
    if (!timeFilterTimestamp) return measurements;
    const filterTime = new Date(timeFilterTimestamp).getTime();
    return measurements.filter((m) => new Date(m.timestamp).getTime() <= filterTime);
  }, [measurements, timeFilterTimestamp]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark Matter tile layer by CartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Layer groups for dynamic rendering
    const heatGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);

    heatLayerRef.current = heatGroup;
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Layers when points or toggles change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old elements
    if (heatLayerRef.current) heatLayerRef.current.clearLayers();
    if (markersLayerRef.current) markersLayerRef.current.clearLayers();
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
    if (activePulseMarkerRef.current) {
      activePulseMarkerRef.current.remove();
      activePulseMarkerRef.current = null;
    }

    if (!filteredPoints.length) return;

    const latLngs: L.LatLngExpression[] = [];

    filteredPoints.forEach((point) => {
      const latLng: [number, number] = [point.latitude, point.longitude];
      latLngs.push(latLng);

      // Color based on RF Power & Activity
      let fillColor = '#10b981'; // green (< -75)
      let glowColor = 'rgba(16,185,129,0.3)';
      let radius = 10;

      if (point.rf_power >= -48 || point.activity_level === 'critical') {
        fillColor = '#ef4444'; // critical red
        glowColor = 'rgba(239,68,68,0.6)';
        radius = 24;
      } else if (point.rf_power >= -62 || point.activity_level === 'high') {
        fillColor = '#f97316'; // orange
        glowColor = 'rgba(249,115,22,0.5)';
        radius = 18;
      } else if (point.rf_power >= -75 || point.activity_level === 'moderate') {
        fillColor = '#fbbf24'; // yellow
        glowColor = 'rgba(251,191,36,0.4)';
        radius = 14;
      }

      // 1. Heatmap Glow Circle
      if (showHeatmapLayer && heatLayerRef.current) {
        const heatCircle = L.circle(latLng, {
          radius: radius * 1.5,
          color: 'transparent',
          fillColor: fillColor,
          fillOpacity: 0.38,
        });
        heatCircle.addTo(heatLayerRef.current);
      }

      // 2. Waypoint Dot Marker
      if (showPointsLayer && markersLayerRef.current) {
        const dotMarker = L.circleMarker(latLng, {
          radius: 4.5,
          color: '#ffffff',
          weight: 1,
          fillColor: fillColor,
          fillOpacity: 0.95,
        });

        // Popup with rich RF telemetry
        const popupContent = `
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 4px; min-width: 180px;">
            <div style="font-weight: 700; color: #00bfff; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; margin-bottom: 6px;">
              SAMPLE #${point.sample_id}
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #87929b;">RF POWER:</span>
              <strong style="color: ${fillColor};">${point.rf_power} dBm</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #87929b;">NOISE FLOOR:</span>
              <span>${point.noise_floor} dBm</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #87929b;">SNR MARGIN:</span>
              <span style="color: #38e8ff;">+${point.snr} dB</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #87929b;">ACTIVITY:</span>
              <span style="text-transform: uppercase;">${point.activity_level} (${point.activity_score}%)</span>
            </div>
            <div style="color: #66727d; font-size: 9px; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 4px;">
              LAT: ${point.latitude}° | LNG: ${point.longitude}°
            </div>
          </div>
        `;

        dotMarker.bindPopup(popupContent);
        dotMarker.on('click', () => {
          if (onPointSelect) onPointSelect(point);
        });

        dotMarker.addTo(markersLayerRef.current);
      }
    });

    // 3. Polyline Track
    if (showRoutePolyline && latLngs.length > 1) {
      polylineRef.current = L.polyline(latLngs, {
        color: '#00bfff',
        weight: 2,
        opacity: 0.6,
        dashArray: '4, 6',
      }).addTo(map);
    }

    // 4. Latest Active Position Beacon
    const latest = activeMeasurement || filteredPoints[filteredPoints.length - 1];
    if (latest) {
      const activeLatLng: [number, number] = [latest.latitude, latest.longitude];
      
      const pulseMarker = L.circleMarker(activeLatLng, {
        radius: 8,
        color: '#00bfff',
        weight: 2,
        fillColor: '#38e8ff',
        fillOpacity: 1,
      });

      pulseMarker.bindTooltip(`LIVE SENSOR: ${latest.rf_power} dBm`, {
        permanent: false,
        direction: 'top',
        className: 'font-mono text-xs bg-void border border-cyan-neon text-cyan-neon',
      });

      pulseMarker.addTo(map);
      activePulseMarkerRef.current = pulseMarker;
    }
  }, [
    filteredPoints,
    activeMeasurement,
    showHeatmapLayer,
    showPointsLayer,
    showRoutePolyline,
    onPointSelect,
  ]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter = () => {
    if (mapInstanceRef.current && filteredPoints.length > 0) {
      const latest = activeMeasurement || filteredPoints[filteredPoints.length - 1];
      mapInstanceRef.current.setView([latest.latitude, latest.longitude], zoom);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-xl overflow-hidden border border-white/10 shadow-glass">
      {/* Map DOM target */}
      <div ref={mapContainerRef} className="w-full h-full" style={{ height }} />

      {/* Top Map HUD Overlay */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-void/90 border border-cyan-neon/30 backdrop-blur-md font-mono text-xs text-white shadow-lg pointer-events-auto">
          <Navigation className="w-3.5 h-3.5 text-cyan-neon" />
          <span>GEO MAP HUD</span>
          <span className="text-text-muted">|</span>
          <span className="text-cyan-neon">{filteredPoints.length} SAMPLES</span>
        </div>
      </div>

      {/* Floating Map Zoom & Recenter Controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 rounded-lg bg-void/90 border border-white/15 text-white hover:text-cyan-neon hover:border-cyan-neon transition-all backdrop-blur-md shadow-lg"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 rounded-lg bg-void/90 border border-white/15 text-white hover:text-cyan-neon hover:border-cyan-neon transition-all backdrop-blur-md shadow-lg"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleRecenter}
          title="Recenter Map to Active Sensor"
          className="p-2 rounded-lg bg-void/90 border border-white/15 text-white hover:text-cyan-neon hover:border-cyan-neon transition-all backdrop-blur-md shadow-lg"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Heatmap Color Scale Legend */}
      <div className="absolute bottom-3 left-3 z-[400] pointer-events-auto">
        <div className="px-3.5 py-2 rounded-lg bg-void/90 border border-white/10 backdrop-blur-md font-mono text-[11px] text-white shadow-xl flex items-center gap-4">
          <span className="text-text-muted font-bold text-[10px]">RF ACTIVITY SCALE:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              <span className="text-text-secondary">&lt; -75 dBm (Low)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
              <span className="text-text-secondary">-75 to -55 dBm (Med)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_#ef4444]" />
              <span className="text-text-secondary">&gt; -55 dBm (High)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
