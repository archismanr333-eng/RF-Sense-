from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.measurement import Measurement
from backend.app.models.survey import Survey
from backend.app.schemas.measurement import HeatmapPointOut, HeatmapResponse

router = APIRouter(prefix="/heatmap", tags=["Spatial Heatmap"])

@router.get("/points", response_model=HeatmapResponse)
def get_heatmap_points(
    survey_id: Optional[str] = None,
    min_power_dbm: Optional[float] = Query(-95.0, ge=-120.0, le=0.0),
    max_power_dbm: Optional[float] = Query(0.0, ge=-120.0, le=30.0),
    activity_levels: Optional[str] = Query("low,moderate,high,critical"),
    time_filter: Optional[str] = None, # ISO timestamp cutoff for timeline playback
    limit: int = Query(1000, ge=1, le=5000),
    db: Session = Depends(get_db)
):
    """
    Returns spatial points formatted for Leaflet & PostGIS rendering.
    Supports time-aware playback slider filtering and activity threshold filters.
    """
    query = db.query(Measurement)

    # 1. Filter by Survey
    center_lat, center_lng = 22.5726, 88.3639
    if survey_id:
        survey = db.query(Survey).filter((Survey.id == survey_id) | (Survey.survey_code == survey_id)).first()
        if survey:
            query = query.filter(Measurement.survey_id == survey.id)
            center_lat, center_lng = survey.center_lat, survey.center_lng
    else:
        active_survey = db.query(Survey).order_by(Survey.start_time.desc()).first()
        if active_survey:
            query = query.filter(Measurement.survey_id == active_survey.id)
            center_lat, center_lng = active_survey.center_lat, active_survey.center_lng

    # 2. Power Thresholds
    query = query.filter(Measurement.rf_power >= min_power_dbm, Measurement.rf_power <= max_power_dbm)

    # 3. Activity Levels
    levels = [lvl.strip().lower() for lvl in activity_levels.split(",") if lvl.strip()]
    if levels:
        query = query.filter(Measurement.activity_level.in_(levels))

    # 4. Time-Aware Timeline Cutoff
    if time_filter:
        try:
            cutoff_dt = datetime.fromisoformat(time_filter.replace("Z", "+00:00")).replace(tzinfo=None)
            query = query.filter(Measurement.timestamp <= cutoff_dt)
        except Exception:
            pass

    records = query.order_by(Measurement.timestamp.asc()).limit(limit).all()

    points: List[HeatmapPointOut] = []
    min_p, max_p = -90.0, -30.0
    if records:
        powers = [r.rf_power for r in records]
        min_p = min(powers)
        max_p = max(powers)

    for r in records:
        points.append(
            HeatmapPointOut(
                lat=r.latitude,
                lng=r.longitude,
                power=r.rf_power,
                noise=r.noise_floor,
                snr=r.snr,
                activity=r.activity_score,
                level=r.activity_level,
                sample_id=r.sample_id,
                timestamp=r.timestamp.isoformat()
            )
        )

    return HeatmapResponse(
        total_points=len(points),
        points=points,
        center_lat=center_lat,
        center_lng=center_lng,
        min_power=min_p,
        max_power=max_p
    )
