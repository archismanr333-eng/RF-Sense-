export type RFActivityLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface RFMeasurement {
  id: string;
  sample_id: string;
  survey_id: string;
  device_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  rf_power: number; // dBm (e.g. -58.4)
  raw_adc?: number; // 0-4095
  noise_floor: number; // dBm (e.g. -86.2)
  snr: number; // dB (rf_power - noise_floor)
  activity_score: number; // 0 - 100%
  activity_level: RFActivityLevel;
  channel?: number; // 1-14 (2.4 GHz ISM)
  frequency_mhz?: number; // e.g. 2412 - 2484 MHz
  packet_rate?: number; // packets/sec
}

export interface SurveySession {
  id: string;
  survey_code: string; // e.g. SUR-001
  survey_name: string;
  user_id: string;
  device_id: string;
  location_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  frequency_band: string; // "2.4 GHz ISM (2400-2483.5 MHz)"
  sample_count: number;
  avg_rf_power: number;
  peak_rf_power: number;
  avg_noise_floor: number;
  primary_activity: RFActivityLevel;
  status: 'completed' | 'in_progress' | 'archived';
  notes?: string;
  center_lat: number;
  center_lng: number;
}

export interface DeviceTelemetry {
  device_id: string;
  device_name: string;
  device_code: string;
  status: 'online' | 'offline' | 'standby' | 'error';
  firmware_version: string;
  esp32_status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  esp32_cpu_temp: number; // °C
  esp32_free_heap_kb: number; // KB
  esp32_uptime_seconds: number;
  rf_detector_status: 'ACTIVE' | 'CALIBRATING' | 'ERROR';
  rf_detector_model: string; // "AD8318 Logarithmic Detector"
  rf_detector_v_out: number; // Volts (0.5V - 2.1V)
  gps_status: 'FIXED' | 'SEARCHING' | 'NO_FIX';
  gps_satellites: number;
  gps_hdop: number;
  gps_fix_type: '3D' | '2D' | 'NONE';
  microsd_status: 'READY' | 'WRITING' | 'FULL' | 'ERROR';
  microsd_free_mb: number;
  microsd_total_mb: number;
  microsd_logged_samples: number;
  battery_level: number; // 0-100%
  battery_voltage: number; // 3.2V - 4.2V
  battery_charging: boolean;
  power_draw_ma: number; // ~140 mA
  wifi_status: 'CONNECTED' | 'DISCONNECTED';
  wifi_ssid: string;
  wifi_rssi: number; // dBm
  last_seen: string;
  last_measurement: string;
  sampling_rate_ms: number;
}

export interface RFThresholdConfig {
  lowMaxDbm: number; // e.g. -75 dBm
  moderateMaxDbm: number; // e.g. -55 dBm
  highMaxDbm: number; // e.g. -40 dBm
  noiseBaselineDbm: number; // e.g. -85 dBm
  audioAlerts: boolean;
  autoSaveIntervalSec: number;
}

export interface FilterOptions {
  surveyId?: string;
  timeRange: '15m' | '1h' | '6h' | 'today' | 'all' | 'custom';
  minPowerDbm?: number;
  maxPowerDbm?: number;
  activityLevels: RFActivityLevel[];
  searchQuery?: string;
}
