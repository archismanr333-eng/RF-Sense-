import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  RFMeasurement, 
  SurveySession, 
  DeviceTelemetry, 
  RFThresholdConfig, 
  FilterOptions 
} from '../types/rf';
import { 
  MOCK_SURVEYS, 
  INITIAL_DEVICE_TELEMETRY, 
  INITIAL_LIVE_MEASUREMENTS, 
  generateSurveyMeasurements, 
  generateLiveTelemetryPacket 
} from '../lib/mockData';

interface RFDataContextType {
  surveys: SurveySession[];
  activeSurvey: SurveySession;
  setActiveSurvey: (survey: SurveySession) => void;
  measurements: RFMeasurement[];
  liveMeasurements: RFMeasurement[];
  latestMeasurement: RFMeasurement;
  deviceTelemetry: DeviceTelemetry;
  isLiveStreaming: boolean;
  setIsLiveStreaming: (live: boolean) => void;
  toggleLiveStream: () => void;
  samplingRateMs: number;
  setSamplingRateMs: (rate: number) => void;
  thresholds: RFThresholdConfig;
  setThresholds: (cfg: RFThresholdConfig) => void;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  playbackTimestamp: string | null;
  setPlaybackTimestamp: (ts: string | null) => void;
  injectRFBurst: (dbmBoost?: number) => void;
  createNewSurvey: (name: string, location: string, band: string) => SurveySession;
  exportSurveyDataCSV: (surveyId?: string) => void;
  exportSurveyDataJSON: (surveyId?: string) => void;
  audioAlertEnabled: boolean;
  setAudioAlertEnabled: (enabled: boolean) => void;
  isAlertActive: boolean;
}

const DEFAULT_THRESHOLDS: RFThresholdConfig = {
  lowMaxDbm: -75,
  moderateMaxDbm: -55,
  highMaxDbm: -40,
  noiseBaselineDbm: -85,
  audioAlerts: true,
  autoSaveIntervalSec: 5,
};

const RFDataContext = createContext<RFDataContextType | undefined>(undefined);

export const RFDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [surveys, setSurveys] = useState<SurveySession[]>(MOCK_SURVEYS);
  const [activeSurvey, setActiveSurvey] = useState<SurveySession>(MOCK_SURVEYS[3]); // SUR-004
  const [measurements, setMeasurements] = useState<RFMeasurement[]>(INITIAL_LIVE_MEASUREMENTS);
  const [liveMeasurements, setLiveMeasurements] = useState<RFMeasurement[]>(INITIAL_LIVE_MEASUREMENTS);
  const [latestMeasurement, setLatestMeasurement] = useState<RFMeasurement>(
    INITIAL_LIVE_MEASUREMENTS[INITIAL_LIVE_MEASUREMENTS.length - 1]
  );
  const [deviceTelemetry, setDeviceTelemetry] = useState<DeviceTelemetry>(INITIAL_DEVICE_TELEMETRY);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [samplingRateMs, setSamplingRateMs] = useState<number>(350);
  const [thresholds, setThresholds] = useState<RFThresholdConfig>(DEFAULT_THRESHOLDS);
  const [audioAlertEnabled, setAudioAlertEnabled] = useState<boolean>(false);
  const [isAlertActive, setIsAlertActive] = useState<boolean>(false);
  const [playbackTimestamp, setPlaybackTimestamp] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterOptions>({
    timeRange: 'all',
    activityLevels: ['low', 'moderate', 'high', 'critical'],
  });

  // When active survey changes, load its dataset
  const handleSetActiveSurvey = useCallback((survey: SurveySession) => {
    setActiveSurvey(survey);
    if (survey.id === 'sur-004') {
      setMeasurements(liveMeasurements);
    } else {
      const surveyData = generateSurveyMeasurements(survey, 90);
      setMeasurements(surveyData);
    }
  }, [liveMeasurements]);

  // Real-time packet loop
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setLiveMeasurements((prev) => {
        const last = prev[prev.length - 1] || latestMeasurement;
        const newPacket = generateLiveTelemetryPacket(last.latitude, last.longitude, prev.length + 1);

        // Check for RF threshold alert (> moderateMaxDbm)
        if (newPacket.rf_power > thresholds.moderateMaxDbm) {
          setIsAlertActive(true);
          setTimeout(() => setIsAlertActive(false), 1200);
        }

        setLatestMeasurement(newPacket);

        // Update hardware telemetry
        setDeviceTelemetry((d) => ({
          ...d,
          esp32_uptime_seconds: d.esp32_uptime_seconds + Math.round(samplingRateMs / 1000),
          esp32_cpu_temp: Number((41.5 + Math.sin(Date.now() / 10000) * 1.5).toFixed(1)),
          rf_detector_v_out: Number((1.2 + ((newPacket.rf_power + 90) / 70) * 0.8).toFixed(2)),
          last_seen: new Date().toISOString(),
          last_measurement: newPacket.timestamp,
          microsd_logged_samples: d.microsd_logged_samples + 1,
        }));

        // Keep last 120 packets in live ring buffer
        const updated = [...prev.slice(-119), newPacket];
        if (activeSurvey.id === 'sur-004') {
          setMeasurements(updated);
        }
        return updated;
      });
    }, samplingRateMs);

    return () => clearInterval(interval);
  }, [isLiveStreaming, samplingRateMs, latestMeasurement, thresholds.moderateMaxDbm, activeSurvey.id]);

  const toggleLiveStream = useCallback(() => {
    setIsLiveStreaming((prev) => !prev);
  }, []);

  const injectRFBurst = useCallback((dbmBoost = 25) => {
    const burstPacket: RFMeasurement = {
      ...latestMeasurement,
      id: `burst-${Date.now()}`,
      rf_power: Math.min(-25, latestMeasurement.rf_power + dbmBoost),
      snr: latestMeasurement.snr + dbmBoost,
      activity_score: 96,
      activity_level: 'critical',
      timestamp: new Date().toISOString(),
    };

    setLatestMeasurement(burstPacket);
    setLiveMeasurements((prev) => [...prev.slice(-119), burstPacket]);
    setIsAlertActive(true);
    setTimeout(() => setIsAlertActive(false), 2000);
  }, [latestMeasurement]);

  const createNewSurvey = useCallback((name: string, location: string, band: string): SurveySession => {
    const newSurvey: SurveySession = {
      id: `sur-${Date.now().toString().slice(-4)}`,
      survey_code: `SUR-00${surveys.length + 1}`,
      survey_name: name || `Survey #${surveys.length + 1}`,
      user_id: 'usr-admin-1',
      device_id: 'RF-SENSE-001',
      location_name: location || 'Field Location Target',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600 * 1000).toISOString(),
      duration_minutes: 60,
      frequency_band: band || '2.4 GHz ISM (2400-2483.5 MHz)',
      sample_count: 0,
      avg_rf_power: -65.0,
      peak_rf_power: -45.0,
      avg_noise_floor: -86.0,
      primary_activity: 'moderate',
      status: 'in_progress',
      center_lat: 22.5726,
      center_lng: 88.3639,
    };

    setSurveys((prev) => [newSurvey, ...prev]);
    setActiveSurvey(newSurvey);
    setLiveMeasurements([]);
    setMeasurements([]);
    return newSurvey;
  }, [surveys.length]);

  const exportSurveyDataCSV = useCallback((surveyId?: string) => {
    const targetData = measurements;
    if (!targetData.length) return;

    const headers = ['sample_id', 'timestamp', 'latitude', 'longitude', 'rf_power_dbm', 'noise_floor_dbm', 'snr_db', 'activity_score', 'activity_level', 'channel'];
    const rows = targetData.map((m) => [
      m.sample_id,
      m.timestamp,
      m.latitude,
      m.longitude,
      m.rf_power,
      m.noise_floor,
      m.snr,
      m.activity_score,
      m.activity_level,
      m.channel || 1
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rf_sense_survey_${activeSurvey.survey_code}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [measurements, activeSurvey.survey_code]);

  const exportSurveyDataJSON = useCallback((surveyId?: string) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      survey: activeSurvey,
      device: deviceTelemetry,
      samples: measurements
    }, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `rf_sense_survey_${activeSurvey.survey_code}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [measurements, activeSurvey, deviceTelemetry]);

  return (
    <RFDataContext.Provider
      value={{
        surveys,
        activeSurvey,
        setActiveSurvey: handleSetActiveSurvey,
        measurements,
        liveMeasurements,
        latestMeasurement,
        deviceTelemetry,
        isLiveStreaming,
        setIsLiveStreaming,
        toggleLiveStream,
        samplingRateMs,
        setSamplingRateMs,
        thresholds,
        setThresholds,
        filters,
        setFilters,
        playbackTimestamp,
        setPlaybackTimestamp,
        injectRFBurst,
        createNewSurvey,
        exportSurveyDataCSV,
        exportSurveyDataJSON,
        audioAlertEnabled,
        setAudioAlertEnabled,
        isAlertActive,
      }}
    >
      {children}
    </RFDataContext.Provider>
  );
};

export const useRFData = () => {
  const context = useContext(RFDataContext);
  if (!context) {
    throw new Error('useRFData must be used within an RFDataProvider');
  }
  return context;
};
