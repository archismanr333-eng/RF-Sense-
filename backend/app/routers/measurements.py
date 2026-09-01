from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database import get_db
from backend.app.models.measurement import Measurement
from backend.app.schemas.measurement import MeasurementOut

router = APIRouter(prefix="/measurements", tags=["RF Measurements"])

@router.get("/latest", response_model=Optional[MeasurementOut])
def get_latest_measurement(
    device_id: Optional[str] = None,
    survey_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve the most recent RF measurement record."""
    query = db.query(Measurement)
    if device_id:
        query = query.filter(Measurement.device_id == device_id)
    if survey_id:
        query = query.filter(Measurement.survey_id == survey_id)

    return query.order_by(desc(Measurement.timestamp)).first()

@router.get("/history", response_model=List[MeasurementOut])
def get_measurement_history(
    survey_id: Optional[str] = None,
    time_range: Optional[str] = Query("all", pattern="^(15m|1h|6h|today|all)$"),
    limit: int = Query(200, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Retrieve historical time-series measurements with time filtering."""
    query = db.query(Measurement)
    if survey_id:
        query = query.filter(Measurement.survey_id == survey_id)

    now = datetime.utcnow()
    if time_range == "15m":
        query = query.filter(Measurement.timestamp >= now - timedelta(minutes=15))
    elif time_range == "1h":
        query = query.filter(Measurement.timestamp >= now - timedelta(hours=1))
    elif time_range == "6h":
        query = query.filter(Measurement.timestamp >= now - timedelta(hours=6))
    elif time_range == "today":
        today_start = datetime(now.year, now.month, now.day)
        query = query.filter(Measurement.timestamp >= today_start)

    return query.order_by(Measurement.timestamp.asc()).limit(limit).all()
