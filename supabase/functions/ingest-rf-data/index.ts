// Follow Deno / Supabase Edge Functions standard
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-token",
};

interface ESP32Payload {
  device_id: string;
  timestamp?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  rf_power: number;
  noise_floor?: number;
  activity_score?: number;
  activity_level?: string;
  channel?: number;
  survey_id?: string;
  device_token?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: ESP32Payload = await req.json();

    // 1. Data Validation
    if (!payload.device_id || payload.latitude === undefined || payload.longitude === undefined || payload.rf_power === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields: device_id, latitude, longitude, rf_power" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Compute Noise Floor & Activity if not provided
    const noiseFloor = payload.noise_floor ?? -86.0;
    const snr = Number((payload.rf_power - noiseFloor).toFixed(1));
    const score = payload.activity_score ?? Math.min(100, Math.max(0, Math.round(((payload.rf_power - (-90)) / 60) * 100)));
    
    let level = payload.activity_level;
    if (!level) {
      if (payload.rf_power >= -48) level = "critical";
      else if (payload.rf_power >= -62) level = "high";
      else if (payload.rf_power >= -75) level = "moderate";
      else level = "low";
    }

    const timestamp = payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString();

    // 3. Update device last seen
    await supabase.from("devices").upsert({
      device_id: payload.device_id,
      status: "online",
      last_seen: new Date().toISOString(),
    }, { onConflict: "device_id" });

    // 4. Insert Measurement Record (PostGIS location trigger handles POINT)
    const { data, error } = await supabase.from("measurements").insert({
      sample_id: Date.now().toString().slice(-6),
      survey_id: payload.survey_id ?? null,
      device_id: payload.device_id,
      timestamp: timestamp,
      latitude: payload.latitude,
      longitude: payload.longitude,
      altitude: payload.altitude ?? 15.0,
      rf_power: payload.rf_power,
      noise_floor: noiseFloor,
      snr: snr,
      activity_score: score,
      activity_level: level,
      channel: payload.channel ?? 6,
      frequency_mhz: 2407 + (payload.channel ?? 6) * 5,
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, measurement: data }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
