-- ====================================================================
-- RF-Sense PostgreSQL Seed Data
-- ====================================================================

-- 1. Insert Default Devices
INSERT INTO public.devices (device_id, device_name, device_code, status, battery_level, battery_voltage, gps_status, gps_satellites, gps_hdop, esp32_cpu_temp, esp32_free_heap_kb, rf_detector_v_out, microsd_status, wifi_status, wifi_ssid, wifi_rssi)
VALUES 
('RF-SENSE-001', 'Field Surveyor Node Alpha', 'ESP32-WROOM-32D', 'online', 78, 3.94, 'FIXED', 11, 0.9, 41.5, 184.2, 1.28, 'READY', 'CONNECTED', 'RF-Lab-5G_Mesh', -52)
ON CONFLICT (device_id) DO NOTHING;

-- 2. Insert Historical Surveys
INSERT INTO public.surveys (id, survey_code, survey_name, device_id, location_name, start_time, end_time, duration_minutes, frequency_band, sample_count, avg_rf_power, peak_rf_power, avg_noise_floor, primary_activity, status, center_lat, center_lng, notes)
VALUES 
('a0000000-0000-0000-0000-000000000001', 'SUR-001', 'Academic Campus Perimeter Survey', 'RF-SENSE-001', 'Engineering Faculty Block A & Quad', '2026-08-28 09:30:00+00', '2026-08-28 11:45:00+00', 135, '2.4 GHz ISM (2400-2483.5 MHz)', 840, -64.2, -39.1, -86.5, 'moderate', 'completed', 22.5726, 88.3639, 'Dense Wi-Fi AP distribution along 2nd floor labs; moderate microwave leakage near cafeteria.'),
('a0000000-0000-0000-0000-000000000002', 'SUR-002', 'Industrial Park IoT Grid Survey', 'RF-SENSE-001', 'Warehouse Logistics Sector 4', '2026-08-29 08:00:00+00', '2026-08-29 10:15:00+00', 135, '2.4 GHz ISM (2400-2483.5 MHz)', 620, -52.8, -31.4, -84.2, 'high', 'completed', 22.5760, 88.3680, 'High BLE beacon and ZigBee mesh chatter between robotic automated guided vehicles.'),
('a0000000-0000-0000-0000-000000000003', 'SUR-003', 'Suburban Residential Baseline', 'RF-SENSE-001', 'Greenwood Greenbelt Outer Ring', '2026-08-27 14:00:00+00', '2026-08-27 15:30:00+00', 90, '2.4 GHz ISM (2400-2483.5 MHz)', 360, -78.4, -61.0, -88.1, 'low', 'completed', 22.5680, 88.3590, 'Low ambient congestion; clean spectral quiet zones identified for sensor placement.'),
('a0000000-0000-0000-0000-000000000004', 'SUR-004', 'Active Survey (Live Session)', 'RF-SENSE-001', 'Central Research Labs & Plaza', NOW() - INTERVAL '1 hour', NOW(), 60, '2.4 GHz ISM (2400-2483.5 MHz)', 240, -58.0, -34.8, -86.0, 'high', 'in_progress', 22.5726, 88.3639, 'Live walking survey in progress with real-time GPS and ADC streaming.')
ON CONFLICT (survey_code) DO NOTHING;
