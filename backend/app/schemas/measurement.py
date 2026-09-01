from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class MeasurementIngest(BaseModel):
    device_id: str = Field(..., json_schema_extra={"example": "RF-SENSE-001"})
    timestamp: Optional[str] = Field(None, json_schema_extra={"example": "2026-08-28T10:32:15Z"})
    latitude: float = Field(..., ge=-90.0, le=90.0, json_schema_extra={"example": 22.5726})
    longitude: float = Field(..., ge=-180.0, le=180.0, json_schema_extra={"example": 88.3639})
    altitude: Optional[float] = 15.0
    rf_power: float = Field(..., ge=-120.0, le=30.0, json_schema_extra={"example": -62.4})
    raw_adc: Optional[int] = Field(None, ge=0, le=4095)
    noise_floor: Optional[float] = Field(-86.0, json_schema_extra={"example": -85.1})
    activity_score: Optional[int] = Field(None, ge=0, le=100, json_schema_extra={"example": 76})
    activity_level: Optional[str] = Field(None, json_schema_extra={"example": "high"})
    channel: Optional[int] = Field(6, ge=1, le=14)
    survey_id: Optional[str] = None
    device_token: Optional[str] = None

class MeasurementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    sample_id: str
    survey_id: Optional[str] = None
    device_id: str
    timestamp: datetime
    latitude: float
    longitude: float
    altitude: Optional[float] = None
    rf_power: float
    raw_adc: Optional[int] = None
    noise_floor: float
    snr: float
    activity_score: int
    activity_level: str
    channel: Optional[int] = None
    frequency_mhz: Optional[float] = None
    packet_rate: Optional[int] = None
    created_at: datetime

class HeatmapPointOut(BaseModel):
    lat: float
    lng: float
    power: float
    noise: float
    snr: float
    activity: int
    level: str
    sample_id: str
    timestamp: str

class HeatmapResponse(BaseModel):
    total_points: int
    points: List[HeatmapPointOut]
    center_lat: float
    center_lng: float
    min_power: float
    max_power: float
