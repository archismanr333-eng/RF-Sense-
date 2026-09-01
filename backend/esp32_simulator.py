#!/usr/bin/env python3
"""
RF-Sense ESP32 Hardware & GPS Walking Route Simulator.
Simulates an active ESP32 microcontroller with AD8318 logarithmic RF detector
and NEO-6M GPS module streaming telemetry to the RF-Sense backend.
"""
import sys
import io
# Force UTF-8 stdout to avoid cp1252 encoding errors on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import time
import math
import random
import requests
from datetime import datetime

BACKEND_URL = "http://localhost:8000/api/ingest-rf-data"
DEVICE_ID = "RF-SENSE-001"
AUTH_TOKEN = "ESP32_RF_SENSE_SECRET_TOKEN_2026"

# Base coordinates: Science & Engineering Complex (22.5726 N, 88.3639 E)
BASE_LAT = 22.5726
BASE_LNG = 88.3639

def run_simulator(interval_sec: float = 0.5, total_samples: int = 100):
    print("=" * 60)
    print("[SIMULATOR] STARTING ESP32 HARDWARE & RF DETECTOR SIMULATOR")
    print(f"[ENDPOINT]  Target: {BACKEND_URL}")
    print(f"[DEVICE]    ID: {DEVICE_ID} | Rate: {interval_sec}s/sample")
    print("=" * 60)

    cur_lat = BASE_LAT
    cur_lng = BASE_LNG
    noise_floor = -86.0

    for i in range(1, total_samples + 1):
        # 1. Simulate smooth surveyor walk path
        angle = (i / total_samples) * math.pi * 4
        cur_lat += math.sin(angle) * 0.00008 + (random.random() - 0.49) * 0.00004
        cur_lng += math.cos(angle) * 0.00008 + (random.random() - 0.49) * 0.00004

        # 2. Simulate 2.4 GHz RF environment (Wi-Fi packet bursts, occasional microwave spikes)
        base_rf = -68.0 + (random.random() - 0.5) * 10.0

        # Inject occasional severe Wi-Fi burst
        if random.random() > 0.85:
            base_rf += random.uniform(15.0, 28.0)

        # Noise floor slight drift
        noise_floor = round(-86.2 + (random.random() - 0.5) * 1.5, 1)
        rf_power = round(max(-92.0, min(-28.0, base_rf)), 1)

        # 3. Calculate activity & SNR
        snr = round(rf_power - noise_floor, 1)
        norm_score = max(0, min(100, int(((rf_power - (-90.0)) / 60.0) * 100)))

        if rf_power >= -48 or norm_score >= 80:
            act_level = "critical"
        elif rf_power >= -62 or norm_score >= 50:
            act_level = "high"
        elif rf_power >= -75 or norm_score >= 25:
            act_level = "moderate"
        else:
            act_level = "low"

        channel = random.choice([1, 6, 11, 2, 7])
        raw_adc = int(4095 * ((rf_power + 90) / 70))

        payload = {
            "device_id": DEVICE_ID,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "latitude": round(cur_lat, 6),
            "longitude": round(cur_lng, 6),
            "altitude": round(15.4 + random.random() * 0.8, 1),
            "rf_power": rf_power,
            "raw_adc": raw_adc,
            "noise_floor": noise_floor,
            "activity_score": norm_score,
            "activity_level": act_level,
            "channel": channel,
            "device_token": AUTH_TOKEN
        }

        try:
            resp = requests.post(BACKEND_URL, json=payload, timeout=2.0)
            if resp.status_code == 201:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Sample #{str(i).zfill(4)} -> RF: {rf_power:>6} dBm | Noise: {noise_floor} dBm | SNR: +{snr:>5} dB | Lat: {cur_lat:.5f} | [{act_level.upper()}]")
            else:
                print(f"[WARN] HTTP {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"[ERROR] Connection error (Ensure FastAPI is running on port 8000): {e}")

        time.sleep(interval_sec)

    print("[DONE] Simulation sequence finished.")


if __name__ == "__main__":
    run_simulator(interval_sec=0.5, total_samples=50)
