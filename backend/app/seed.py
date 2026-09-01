import math
import random
from datetime import datetime, timedelta
from backend.app.database import engine, SessionLocal, Base
from backend.app.models.user import User
from backend.app.models.device import Device
from backend.app.models.survey import Survey
from backend.app.models.measurement import Measurement
from backend.app.routers.auth import get_password_hash
from backend.app.services.signal_processor import signal_processor

def seed_database():
    print("[INIT] Initializing RF-Sense Database Schema...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed User
        user = db.query(User).filter(User.email == "operator@rfsense.io").first()
        if not user:
            user = User(
                user_id="usr-admin-1",
                email="operator@rfsense.io",
                full_name="Lead Field Spectrum Officer",
                hashed_password=get_password_hash("operator2026"),
                role="admin"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print("[OK] Default Operator user created: operator@rfsense.io / operator2026")

        # 2. Seed Device
        device = db.query(Device).filter(Device.device_id == "RF-SENSE-001").first()
        if not device:
            device = Device(
                user_id=user.user_id,
                device_id="RF-SENSE-001",
                device_name="Field Surveyor Node Alpha",
                device_code="ESP32-WROOM-32D",
                status="online",
                battery_level=78,
                battery_voltage=3.94,
                gps_status="FIXED",
                gps_satellites=11,
                gps_hdop=0.9,
                esp32_cpu_temp=41.5,
                esp32_free_heap_kb=184.2,
                esp32_uptime_seconds=14820,
                rf_detector_v_out=1.28,
                microsd_status="READY",
                wifi_status="CONNECTED",
                wifi_ssid="RF-Lab-5G_Mesh",
                wifi_rssi=-52,
                last_seen=datetime.utcnow()
            )
            db.add(device)
            db.commit()
            db.refresh(device)
            print("[OK] Device RF-SENSE-001 registered.")

        # 3. Seed Surveys
        surveys_data = [
            {
                "id": "sur-001",
                "code": "SUR-001",
                "name": "Academic Campus Perimeter Survey",
                "loc": "Engineering Faculty Block A & Quad",
                "lat": 22.5726,
                "lng": 88.3639,
                "status": "completed",
                "avg_rf": -64.2,
                "peak_rf": -39.1,
                "mins": 135,
                "samples": 120
            },
            {
                "id": "sur-002",
                "code": "SUR-002",
                "name": "Industrial Park IoT Grid Survey",
                "loc": "Warehouse Logistics Sector 4",
                "lat": 22.5760,
                "lng": 88.3680,
                "status": "completed",
                "avg_rf": -52.8,
                "peak_rf": -31.4,
                "mins": 135,
                "samples": 100
            },
            {
                "id": "sur-003",
                "code": "SUR-003",
                "name": "Suburban Residential Baseline",
                "loc": "Greenwood Greenbelt Outer Ring",
                "lat": 22.5680,
                "lng": 88.3590,
                "status": "completed",
                "avg_rf": -78.4,
                "peak_rf": -61.0,
                "mins": 90,
                "samples": 80
            },
            {
                "id": "sur-004",
                "code": "SUR-004",
                "name": "Active Survey (Live Session)",
                "loc": "Central Research Labs & Plaza",
                "lat": 22.5726,
                "lng": 88.3639,
                "status": "in_progress",
                "avg_rf": -58.0,
                "peak_rf": -34.8,
                "mins": 60,
                "samples": 90
            }
        ]

        for s_data in surveys_data:
            existing_survey = db.query(Survey).filter(Survey.id == s_data["id"]).first()
            if not existing_survey:
                start_time = datetime.utcnow() - timedelta(minutes=s_data["mins"])
                end_time = datetime.utcnow() if s_data["status"] == "completed" else None
                
                survey = Survey(
                    id=s_data["id"],
                    survey_code=s_data["code"],
                    survey_name=s_data["name"],
                    user_id=user.user_id,
                    device_id=device.device_id,
                    location_name=s_data["loc"],
                    start_time=start_time,
                    end_time=end_time,
                    duration_minutes=s_data["mins"],
                    frequency_band="2.4 GHz ISM (2400-2483.5 MHz)",
                    sample_count=s_data["samples"],
                    avg_rf_power=s_data["avg_rf"],
                    peak_rf_power=s_data["peak_rf"],
                    avg_noise_floor=-86.0,
                    primary_activity="high" if s_data["avg_rf"] > -60 else "moderate" if s_data["avg_rf"] > -75 else "low",
                    status=s_data["status"],
                    center_lat=s_data["lat"],
                    center_lng=s_data["lng"]
                )
                db.add(survey)
                db.commit()
                db.refresh(survey)

                cur_lat = s_data["lat"] - 0.002
                cur_lng = s_data["lng"] - 0.002
                count = s_data["samples"]
                step_secs = (s_data["mins"] * 60) / count

                for i in range(count):
                    ts = start_time + timedelta(seconds=i * step_secs)
                    angle = (i / count) * math.pi * 4
                    cur_lat += math.sin(angle) * 0.00015 + (random.random() - 0.48) * 0.0001
                    cur_lng += math.cos(angle) * 0.00015 + (random.random() - 0.48) * 0.0001

                    base_rf = s_data["avg_rf"]
                    is_hotspot = math.hypot(cur_lat - s_data["lat"], cur_lng - s_data["lng"]) < 0.0015
                    if is_hotspot:
                        base_rf += 18.0 + math.sin(i * 0.8) * 8.0
                    else:
                        base_rf += (random.random() - 0.5) * 8.0

                    noise = -86.5 + math.sin(i / 10.0) * 1.5 + (random.random() - 0.5) * 1.0
                    rf_p = round(max(-90.0, min(-28.0, base_rf)), 1)
                    snr = round(rf_p - noise, 1)
                    score, level = signal_processor.calculate_activity(rf_p, noise)
                    raw_adc = int(4095 * ((rf_p + 90) / 70))
                    ch = [1, 6, 11, 3, 9][i % 5]

                    measurement = Measurement(
                        id=f"meas-{survey.id}-{str(i+1).zfill(4)}",
                        sample_id=str(i + 1).zfill(6),
                        survey_id=survey.id,
                        device_id=device.device_id,
                        timestamp=ts,
                        latitude=round(cur_lat, 6),
                        longitude=round(cur_lng, 6),
                        altitude=15.0 + math.sin(i / 8.0) * 3.0,
                        rf_power=rf_p,
                        raw_adc=raw_adc,
                        noise_floor=round(noise, 1),
                        snr=snr,
                        activity_score=score,
                        activity_level=level,
                        channel=ch,
                        frequency_mhz=2407.0 + (ch * 5.0),
                        packet_rate=int(score * 1.5 + 10)
                    )
                    db.add(measurement)

                db.commit()
                print(f"[OK] Survey {s_data['code']} seeded with {count} location-tagged measurements.")

        print("[COMPLETE] RF-Sense Database Seeding Complete!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
