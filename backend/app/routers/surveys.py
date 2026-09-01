import io
import csv
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database import get_db
from backend.app.models.survey import Survey
from backend.app.models.measurement import Measurement
from backend.app.schemas.survey import SurveyCreate, SurveyUpdate, SurveyOut
from backend.app.schemas.measurement import MeasurementOut

router = APIRouter(prefix="/surveys", tags=["Survey Sessions"])

@router.get("", response_model=List[SurveyOut])
def list_surveys(
    status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """List all survey sessions."""
    query = db.query(Survey)
    if status:
        query = query.filter(Survey.status == status)
    return query.order_by(desc(Survey.start_time)).limit(limit).all()

@router.post("", response_model=SurveyOut, status_code=201)
def create_survey(survey_in: SurveyCreate, db: Session = Depends(get_db)):
    """Initialize a new survey session."""
    count = db.query(Survey).count()
    survey_code = f"SUR-{str(count + 1).zfill(3)}"

    new_survey = Survey(
        survey_code=survey_code,
        survey_name=survey_in.survey_name,
        device_id=survey_in.device_id,
        location_name=survey_in.location_name or "Field Survey Site",
        frequency_band=survey_in.frequency_band or "2.4 GHz ISM (2400-2483.5 MHz)",
        notes=survey_in.notes,
        center_lat=survey_in.center_lat or 22.5726,
        center_lng=survey_in.center_lng or 88.3639,
        status="in_progress",
        start_time=datetime.utcnow()
    )
    db.add(new_survey)
    db.commit()
    db.refresh(new_survey)
    return new_survey

@router.get("/{survey_id}", response_model=SurveyOut)
def get_survey_details(survey_id: str, db: Session = Depends(get_db)):
    """Get single survey session details."""
    survey = db.query(Survey).filter((Survey.id == survey_id) | (Survey.survey_code == survey_id)).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey session not found")
    return survey

@router.get("/{survey_id}/measurements", response_model=List[MeasurementOut])
def get_survey_measurements(
    survey_id: str,
    limit: int = Query(500, ge=1, le=2000),
    db: Session = Depends(get_db)
):
    """Retrieve all measurements associated with a specific survey."""
    survey = db.query(Survey).filter((Survey.id == survey_id) | (Survey.survey_code == survey_id)).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey session not found")

    return db.query(Measurement).filter(Measurement.survey_id == survey.id).order_by(Measurement.timestamp.asc()).limit(limit).all()

@router.get("/{survey_id}/export")
def export_survey_csv(survey_id: str, format: str = Query("csv", pattern="^(csv|json)$"), db: Session = Depends(get_db)):
    """Export survey dataset as CSV or JSON file download."""
    survey = db.query(Survey).filter((Survey.id == survey_id) | (Survey.survey_code == survey_id)).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey session not found")

    measurements = db.query(Measurement).filter(Measurement.survey_id == survey.id).order_by(Measurement.timestamp.asc()).all()

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "sample_id", "timestamp", "latitude", "longitude", "altitude",
            "rf_power_dbm", "raw_adc", "noise_floor_dbm", "snr_db",
            "activity_score", "activity_level", "channel", "frequency_mhz"
        ])
        for m in measurements:
            writer.writerow([
                m.sample_id, m.timestamp.isoformat(), m.latitude, m.longitude, m.altitude,
                m.rf_power, m.raw_adc, m.noise_floor, m.snr,
                m.activity_score, m.activity_level, m.channel, m.frequency_mhz
            ])
        
        csv_data = output.getvalue()
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=rf_survey_{survey.survey_code}.csv"}
        )
    else:
        return {
            "survey": {
                "code": survey.survey_code,
                "name": survey.survey_name,
                "location": survey.location_name,
                "band": survey.frequency_band,
                "start_time": survey.start_time.isoformat(),
            },
            "sample_count": len(measurements),
            "samples": [
                {
                    "sample_id": m.sample_id,
                    "timestamp": m.timestamp.isoformat(),
                    "lat": m.latitude,
                    "lng": m.longitude,
                    "rf_power": m.rf_power,
                    "noise_floor": m.noise_floor,
                    "snr": m.snr,
                    "activity_score": m.activity_score,
                    "activity_level": m.activity_level,
                }
                for m in measurements
            ]
        }
