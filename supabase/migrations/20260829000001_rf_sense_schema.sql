-- ====================================================================
-- RF-Sense PostgreSQL + PostGIS Schema Migration
-- Matches Tech Stack & Architecture Document Specifications
-- ====================================================================

-- 1. Enable PostGIS Extension for Geospatial Queries
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Profiles / Users Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'operator',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Hardware Devices Table
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    device_id TEXT UNIQUE NOT NULL, -- e.g. RF-SENSE-001
    device_name TEXT NOT NULL DEFAULT 'Field Surveyor Node',
    device_code TEXT NOT NULL DEFAULT 'ESP32-WROOM-32D',
    status TEXT DEFAULT 'online', -- online, offline, standby, error
    battery_level INTEGER DEFAULT 78,
    battery_voltage DOUBLE PRECISION DEFAULT 3.94,
    gps_status TEXT DEFAULT 'FIXED',
    gps_satellites INTEGER DEFAULT 11,
    gps_hdop DOUBLE PRECISION DEFAULT 0.9,
    esp32_cpu_temp DOUBLE PRECISION DEFAULT 41.5,
    esp32_free_heap_kb DOUBLE PRECISION DEFAULT 184.2,
    esp32_uptime_seconds INTEGER DEFAULT 3600,
    rf_detector_v_out DOUBLE PRECISION DEFAULT 1.28,
    microsd_status TEXT DEFAULT 'READY',
    wifi_status TEXT DEFAULT 'CONNECTED',
    wifi_ssid TEXT DEFAULT 'RF-Lab-5G_Mesh',
    wifi_rssi INTEGER DEFAULT -52,
    last_seen TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Survey Sessions Table
CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_code TEXT UNIQUE NOT NULL, -- e.g. SUR-001
    survey_name TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    device_id TEXT REFERENCES public.devices(device_id) ON DELETE SET NULL,
    location_name TEXT NOT NULL DEFAULT 'Field Survey Area',
    start_time TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 60,
    frequency_band TEXT NOT NULL DEFAULT '2.4 GHz ISM (2400-2483.5 MHz)',
    sample_count INTEGER DEFAULT 0,
    avg_rf_power DOUBLE PRECISION DEFAULT -65.0,
    peak_rf_power DOUBLE PRECISION DEFAULT -40.0,
    avg_noise_floor DOUBLE PRECISION DEFAULT -86.0,
    primary_activity TEXT DEFAULT 'moderate',
    status TEXT DEFAULT 'in_progress', -- in_progress, completed, archived
    notes TEXT,
    center_lat DOUBLE PRECISION DEFAULT 22.5726,
    center_lng DOUBLE PRECISION DEFAULT 88.3639,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. RF Measurements Table with PostGIS Geography Point
CREATE TABLE IF NOT EXISTS public.measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sample_id TEXT NOT NULL, -- e.g. 000125
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
    device_id TEXT REFERENCES public.devices(device_id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    
    -- Numerical Coordinates
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    altitude DOUBLE PRECISION DEFAULT 15.0,
    
    -- PostGIS Point: POINT(longitude latitude)
    location GEOMETRY(Point, 4326),
    
    -- Calibrated RF Power & Signal Metrics
    rf_power DOUBLE PRECISION NOT NULL, -- in dBm (-90.0 to 0.0)
    raw_adc INTEGER DEFAULT 1800,       -- 0 to 4095
    noise_floor DOUBLE PRECISION NOT NULL DEFAULT -86.0,
    snr DOUBLE PRECISION NOT NULL DEFAULT 27.0,
    activity_score INTEGER NOT NULL DEFAULT 76, -- 0 to 100%
    activity_level TEXT NOT NULL DEFAULT 'high', -- low, moderate, high, critical
    
    channel INTEGER DEFAULT 6,
    frequency_mhz DOUBLE PRECISION DEFAULT 2437.0,
    packet_rate INTEGER DEFAULT 45,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. Spatial & Performance Indexes
CREATE INDEX IF NOT EXISTS idx_measurements_location ON public.measurements USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_measurements_survey_time ON public.measurements (survey_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_measurements_power ON public.measurements (rf_power);
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON public.devices (device_id);

-- 7. Trigger to automatically populate PostGIS location point from lat/lng
CREATE OR REPLACE FUNCTION public.set_measurement_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_measurement_location ON public.measurements;
CREATE TRIGGER trg_set_measurement_location
BEFORE INSERT OR UPDATE ON public.measurements
FOR EACH ROW EXECUTE FUNCTION public.set_measurement_location();

-- 8. Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

-- Allow users to read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to view devices and surveys
CREATE POLICY "Authenticated users can view devices" ON public.devices
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view surveys" ON public.surveys
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view measurements" ON public.measurements
    FOR SELECT TO authenticated USING (true);

-- 9. Supabase Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.measurements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
