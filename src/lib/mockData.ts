import { RFMeasurement, SurveySession, DeviceTelemetry, RFActivityLevel } from '../types/rf';

// Base coordinates for initial center (e.g. Technology Hub / University Campus area 22.5726° N, 88.3639° E)
const BASE_LAT = 22.5726;
const BASE_LNG = 88.3639;

export const INITIAL_DEVICE_TELEMETRY: DeviceTelemetry = {
  device_id: 'RF-SENSE-001',
  device_name: 'Field Surveyor Node Alpha',
  device_code: 'ESP32-WROOM-32D',
  status: 'online',
  firmware_version: 'v2.4.1-rc3 (FreeRTOS)',
  esp32_status: 'ONLINE',
  esp32_cpu_temp: 41.8,
  esp32_free_heap_kb: 184.2,
  esp32_uptime_seconds: 14820,
  rf_detector_status: 'ACTIVE',
  rf_detector_model: 'AD8318 Logarithmic Detector (1MHz - 8GHz)',
  rf_detector_v_out: 1.28,
  gps_status: 'FIXED',
  gps_satellites: 11,
  gps_hdop: 0.9,
  gps_fix_type: '3D',
  microsd_status: 'READY',
  microsd_free_mb: 28450,
  microsd_total_mb: 30420,
  microsd_logged_samples: 4820,
  battery_level: 78,
  battery_voltage: 3.94,
  battery_charging: false,
  power_draw_ma: 142.5,
  wifi_status: 'CONNECTED',
  wifi_ssid: 'RF-Lab-5G_Mesh',
  wifi_rssi: -52,
  last_seen: new Date().toISOString(),
  last_measurement: new Date().toISOString(),
  sampling_rate_ms: 250,
};

export const MOCK_SURVEYS: SurveySession[] = [
  {
    id: 'sur-001',
    survey_code: 'SUR-001',
    survey_name: 'Academic Campus Perimeter Survey',
    user_id: 'usr-admin-1',
    device_id: 'RF-SENSE-001',
    location_name: 'Engineering Faculty Block A & Quad',
    start_time: '2026-08-28T09:30:00Z',
    end_time: '2026-08-28T11:45:00Z',
    duration_minutes: 135,
    frequency_band: '2.4 GHz ISM (2400-2483.5 MHz)',
    sample_count: 840,
    avg_rf_power: -64.2,
    peak_rf_power: -39.1,
    avg_noise_floor: -86.5,
    primary_activity: 'moderate',
    status: 'completed',
    notes: 'Dense Wi-Fi AP distribution along 2nd floor labs; moderate microwave leakage near cafeteria.',
    center_lat: 22.5726,
    center_lng: 88.3639,
  },
  {
    id: 'sur-002',
    survey_code: 'SUR-002',
    survey_name: 'Industrial Park IoT Grid Survey',
    user_id: 'usr-admin-1',
    device_id: 'RF-SENSE-001',
    location_name: 'Warehouse Logistics Sector 4',
    start_time: '2026-08-29T08:00:00Z',
    end_time: '2026-08-29T10:15:00Z',
    duration_minutes: 135,
    frequency_band: '2.4 GHz ISM (2400-2483.5 MHz)',
    sample_count: 620,
    avg_rf_power: -52.8,
    peak_rf_power: -31.4,
    avg_noise_floor: -84.2,
    primary_activity: 'high',
    status: 'completed',
    notes: 'High BLE beacon and ZigBee mesh chatter between robotic automated guided vehicles.',
    center_lat: 22.5760,
    center_lng: 88.3680,
  },
  {
    id: 'sur-003',
    survey_code: 'SUR-003',
    survey_name: 'Suburban Residential Baseline',
    user_id: 'usr-admin-1',
    device_id: 'RF-SENSE-001',
    location_name: 'Greenwood Greenbelt Outer Ring',
    start_time: '2026-08-27T14:00:00Z',
    end_time: '2026-08-27T15:30:00Z',
    duration_minutes: 90,
    frequency_band: '2.4 GHz ISM (2400-2483.5 MHz)',
    sample_count: 360,
    avg_rf_power: -78.4,
    peak_rf_power: -61.0,
    avg_noise_floor: -88.1,
    primary_activity: 'low',
    status: 'completed',
    notes: 'Low ambient congestion; clean spectral quiet zones identified for sensor placement.',
    center_lat: 22.5680,
    center_lng: 88.3590,
  },
  {
    id: 'sur-004',
    survey_code: 'SUR-004',
    survey_name: 'Active Survey (Live Session)',
    user_id: 'usr-admin-1',
    device_id: 'RF-SENSE-001',
    location_name: 'Central Research Labs & Plaza',
    start_time: new Date(Date.now() - 3600 * 1000).toISOString(),
    end_time: new Date().toISOString(),
    duration_minutes: 60,
    frequency_band: '2.4 GHz ISM (2400-2483.5 MHz)',
    sample_count: 240,
    avg_rf_power: -58.0,
    peak_rf_power: -34.8,
    avg_noise_floor: -86.0,
    primary_activity: 'high',
    status: 'in_progress',
    notes: 'Live walking survey in progress with real-time GPS and ADC streaming.',
    center_lat: 22.5726,
    center_lng: 88.3639,
  }
];

// Helper to determine activity level
export function calculateActivityLevel(rfPower: number, noiseFloor: number): { score: number; level: RFActivityLevel } {
  // Activity score from 0 to 100 based on SNR and absolute power
  // -90 dBm -> 0%, -30 dBm -> 100%
  const normalized = Math.min(100, Math.max(0, Math.round(((rfPower - (-90)) / 60) * 100)));
  let level: RFActivityLevel = 'low';
  if (rfPower >= -48 || normalized >= 75) {
    level = 'critical';
  } else if (rfPower >= -62 || normalized >= 50) {
    level = 'high';
  } else if (rfPower >= -74 || normalized >= 25) {
    level = 'moderate';
  }
  return { score: normalized, level };
}

// Generate a realistic historical walk path with localized RF bursts
export function generateSurveyMeasurements(survey: SurveySession, count = 120): RFMeasurement[] {
  const measurements: RFMeasurement[] = [];
  const startTimeMs = new Date(survey.start_time).getTime();
  const stepTimeMs = (survey.duration_minutes * 60 * 1000) / count;

  let curLat = survey.center_lat - 0.003;
  let curLng = survey.center_lng - 0.003;

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(startTimeMs + i * stepTimeMs).toISOString();
    
    // Wander path in a smooth serpentine walking route
    const angle = (i / count) * Math.PI * 4;
    curLat += Math.sin(angle) * 0.00015 + (Math.random() - 0.48) * 0.0001;
    curLng += Math.cos(angle) * 0.00015 + (Math.random() - 0.48) * 0.0001;

    // Simulate RF power spikes near specific hotspot zones
    const distToCenter = Math.hypot(curLat - survey.center_lat, curLng - survey.center_lng);
    let baseRf = survey.avg_rf_power;
    
    // Create 2 prominent RF hotspots in the walk
    const isHotspot1 = Math.hypot(curLat - (survey.center_lat + 0.001), curLng - (survey.center_lng + 0.001)) < 0.0015;
    const isHotspot2 = Math.hypot(curLat - (survey.center_lat - 0.0015), curLng - (survey.center_lng + 0.0008)) < 0.0012;

    if (isHotspot1) {
      baseRf += 18 + Math.sin(i * 0.8) * 8;
    } else if (isHotspot2) {
      baseRf += 12 + Math.cos(i * 0.6) * 6;
    } else {
      baseRf += (Math.random() - 0.5) * 8;
    }

    // Noise floor baseline (~ -86 dBm with small drift)
    const noiseFloor = -86.5 + (Math.sin(i / 10) * 1.5) + (Math.random() - 0.5) * 1.2;
    const rfPower = Math.round((Math.max(-89.0, Math.min(-28.0, baseRf))) * 10) / 10;
    const { score, level } = calculateActivityLevel(rfPower, noiseFloor);
    const snr = Math.round((rfPower - noiseFloor) * 10) / 10;
    const rawAdc = Math.round(4095 * ((rfPower + 90) / 70));
    const channel = [1, 6, 11, 3, 9][i % 5];

    measurements.push({
      id: `meas-${survey.id}-${i.toString().padStart(4, '0')}`,
      sample_id: (i + 1).toString().padStart(6, '0'),
      survey_id: survey.id,
      device_id: survey.device_id,
      timestamp,
      latitude: Number(curLat.toFixed(6)),
      longitude: Number(curLng.toFixed(6)),
      altitude: 14.5 + Math.sin(i / 8) * 3,
      rf_power: rfPower,
      raw_adc: rawAdc,
      noise_floor: Math.round(noiseFloor * 10) / 10,
      snr,
      activity_score: score,
      activity_level: level,
      channel,
      frequency_mhz: 2407 + channel * 5,
      packet_rate: Math.floor(score * 1.8 + 15),
    });
  }

  return measurements;
}

// Generate active live survey dataset
export const INITIAL_LIVE_MEASUREMENTS = generateSurveyMeasurements(MOCK_SURVEYS[3], 60);

// Single incoming live telemetry packet simulator
export function generateLiveTelemetryPacket(prevLat = BASE_LAT, prevLng = BASE_LNG, sampleIndex = 1): RFMeasurement {
  const noiseFloor = -86.2 + (Math.random() - 0.5) * 1.5;
  // Natural variation with occasional bursts
  const burst = Math.random() > 0.82 ? Math.random() * 22 : 0;
  const rfPower = Math.round((-68.0 + (Math.random() - 0.5) * 12 + burst) * 10) / 10;
  const { score, level } = calculateActivityLevel(rfPower, noiseFloor);

  // Slight wander
  const lat = prevLat + (Math.random() - 0.49) * 0.00008;
  const lng = prevLng + (Math.random() - 0.49) * 0.00008;
  const channel = [1, 6, 11, 2, 7][Math.floor(Math.random() * 5)];

  return {
    id: `live-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    sample_id: sampleIndex.toString().padStart(6, '0'),
    survey_id: 'sur-004',
    device_id: 'RF-SENSE-001',
    timestamp: new Date().toISOString(),
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lng.toFixed(6)),
    altitude: 16.2 + Math.random() * 0.8,
    rf_power: rfPower,
    raw_adc: Math.round(4095 * ((rfPower + 90) / 70)),
    noise_floor: Math.round(noiseFloor * 10) / 10,
    snr: Math.round((rfPower - noiseFloor) * 10) / 10,
    activity_score: score,
    activity_level: level,
    channel,
    frequency_mhz: 2407 + channel * 5,
    packet_rate: Math.floor(score * 2.2 + 20),
  };
}

// Channel spectrum distribution mock (Channels 1-14 in 2.4 GHz ISM)
export const CHANNEL_SPECTRUM_DATA = [
  { channel: 'Ch 1 (2412)', power: -56.2, activity: 72, primaryProtocol: 'Wi-Fi 802.11ax', color: '#00bfff' },
  { channel: 'Ch 2 (2417)', power: -72.4, activity: 32, primaryProtocol: 'Interference Spill', color: '#38e8ff' },
  { channel: 'Ch 3 (2422)', power: -81.0, activity: 14, primaryProtocol: 'ZigBee 802.15.4', color: '#10b981' },
  { channel: 'Ch 4 (2427)', power: -79.5, activity: 18, primaryProtocol: 'BLE Beacon', color: '#10b981' },
  { channel: 'Ch 5 (2432)', power: -69.8, activity: 41, primaryProtocol: 'Wi-Fi / Sideband', color: '#fbbf24' },
  { channel: 'Ch 6 (2437)', power: -48.1, activity: 89, primaryProtocol: 'Wi-Fi Primary Lab', color: '#ef4444' },
  { channel: 'Ch 7 (2442)', power: -68.4, activity: 46, primaryProtocol: 'Interference Spill', color: '#fbbf24' },
  { channel: 'Ch 8 (2447)', power: -78.1, activity: 22, primaryProtocol: 'BLE 5.0 Mesh', color: '#10b981' },
  { channel: 'Ch 9 (2452)', power: -74.2, activity: 29, primaryProtocol: 'Proprietary RF', color: '#10b981' },
  { channel: 'Ch 10 (2457)', power: -66.5, activity: 51, primaryProtocol: 'Wi-Fi Spill', color: '#fbbf24' },
  { channel: 'Ch 11 (2462)', power: -51.3, activity: 84, primaryProtocol: 'Wi-Fi Gateway AP', color: '#f97316' },
  { channel: 'Ch 12 (2467)', power: -76.0, activity: 25, primaryProtocol: 'Microwave Leak', color: '#10b981' },
  { channel: 'Ch 13 (2472)', power: -83.2, activity: 11, primaryProtocol: 'Quiet Band', color: '#10b981' },
  { channel: 'Ch 14 (2484)', power: -86.0, activity: 5, primaryProtocol: 'Restricted Guard', color: '#10b981' },
];
