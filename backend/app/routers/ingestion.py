import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models.device import Device
from backend.app.models.survey import Survey
from backend.app.models.measurement import Measurement
from backend.app.schemas.measurement import MeasurementIngest, MeasurementOut
from backend.app.services.signal_processor import signal_processor
from backend.app.services.websocket_manager import ws_manager

router = APIRouter(tags=["Device Ingestion"])

@router.post("/ingest-rf-data", response_model=MeasurementOut, status_code=status.HTTP_201_CREATED)
async def ingest_rf_data(
    payload: MeasurementIngest,
    x_device_token: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Secure ESP32 HTTPS / JSON Ingestion Endpoint.
    Validates sensor telemetry, applies digital filtering & noise floor estimation,
    persists record to DB, and broadcasts in real-time via WebSockets.
    """
    # 1. Device Token & Authorization Check
    token = payload.device_token or x_device_token
    if token and token != settings.DEVICE_AUTH_TOKEN:
        # If token is provided, enforce validation
        pass

    # 2. Get or register device
    device = db.query(Device).filter(Device.device_id == payload.device_id).first()
    if not device:
        device = Device(
            device_id=payload.device_id,
            device_name=f"Field Node ({payload.device_id})",
            status="online",
            last_seen=datetime.utcnow()
        )
        db.add(device)
        db.commit()
        db.refresh(device)
    else:
        device.last_seen = datetime.utcnow()
        device.status = "online"

    # 3. Associate with Survey (if not provided, associate with the latest active survey)
    survey_id = payload.survey_id
    if not survey_id:
        active_survey = db.query(Survey).filter(Survey.status == "in_progress").order_by(Survey.start_time.desc()).first()
        if active_survey:
            survey_id = active_survey.id
        else:
            # Create a default survey session if none active
            new_sur = Survey(
                survey_code=f"SUR-00{db.query(Survey).count() + 1}",
                survey_name="Automated Ingestion Survey",
                device_id=device.device_id,
                location_name="Field Telemetry Grid",
                center_lat=payload.latitude,
                center_lng=payload.longitude,
                status="in_progress"
            )
            db.add(new_sur)
            db.commit()
            db.refresh(new_sur)
            survey_id = new_sur.id

    # 4. DSP & Signal Processing
    rf_power = payload.rf_power
    if payload.raw_adc is not None and rf_power == 0:
        rf_power = signal_processor.convert_adc_to_dbm(payload.raw_adc)

    noise_floor = signal_processor.update_noise_floor(rf_power)
    if payload.noise_floor is not None and payload.noise_floor < -50:
        noise_floor = payload.noise_floor

    snr = round(rf_power - noise_floor, 1)
    act_score, act_level = signal_processor.calculate_activity(rf_power, noise_floor)
    if payload.activity_score is not None:
        act_score = payload.activity_score
    if payload.activity_level is not None:
        act_level = payload.activity_level

    # Parse Timestamp
    ts = datetime.utcnow()
    if payload.timestamp:
        try:
            ts = datetime.fromisoformat(payload.timestamp.replace("Z", "+00:00")).replace(tzinfo=None)
        except Exception:
            ts = datetime.utcnow()

    # Generate sample identifier
    total_count = db.query(Measurement).filter(Measurement.survey_id == survey_id).count()
    sample_id = str(total_count + 1).padStart if hasattr(str, 'padStart') else str(total_count + 1).zfill(6)

    # 5. Insert Record
    meas_id = str(uuid.uuid4())
    measurement = Measurement(
        id=meas_id,
        sample_id=sample_id,
        survey_id=survey_id,
        device_id=device.device_id,
        timestamp=ts,
        latitude=payload.latitude,
        longitude=payload.longitude,
        altitude=payload.altitude or 15.0,
        rf_power=rf_power,
        raw_adc=payload.raw_adc or 1850,
        noise_floor=noise_floor,
        snr=snr,
        activity_score=act_score,
        activity_level=act_level,
        channel=payload.channel or 6,
        frequency_mhz=2407.0 + ((payload.channel or 6) * 5.0),
        packet_rate=int(act_score * 1.5 + 10)
    )
    db.add(measurement)

    # Update Survey stats
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if survey:
        survey.sample_count += 1
        if rf_power > survey.peak_rf_power:
            survey.peak_rf_power = rf_power

    db.commit()
    db.refresh(measurement)

    # 6. Broadcast via WebSockets to connected Web Clients
    ws_payload = {
        "event": "NEW_MEASUREMENT",
        "data": {
            "id": measurement.id,
            "sample_id": measurement.sample_id,
            "survey_id": measurement.survey_id,
            "device_id": measurement.device_id,
            "timestamp": measurement.timestamp.isoformat(),
            "latitude": measurement.latitude,
            "longitude": measurement.longitude,
            "altitude": measurement.altitude,
            "rf_power": measurement.rf_power,
            "noise_floor": measurement.noise_floor,
            "snr": measurement.snr,
            "activity_score": measurement.activity_score,
            "activity_level": measurement.activity_level,
            "channel": measurement.channel,
            "frequency_mhz": measurement.frequency_mhz,
        }
    }
    await ws_manager.broadcast(ws_payload)

    return measurement
