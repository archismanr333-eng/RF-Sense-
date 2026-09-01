from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class SurveyCreate(BaseModel):
    survey_name: str
    location_name: Optional[str] = "Field Location"
    device_id: Optional[str] = "RF-SENSE-001"
    frequency_band: Optional[str] = "2.4 GHz ISM (2400-2483.5 MHz)"
    notes: Optional[str] = None
    center_lat: Optional[float] = 22.5726
    center_lng: Optional[float] = 88.3639

class SurveyUpdate(BaseModel):
    survey_name: Optional[str] = None
    location_name: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    end_time: Optional[datetime] = None

class SurveyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    survey_code: str
    survey_name: str
    user_id: Optional[str] = None
    device_id: Optional[str] = None
    location_name: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: int
    frequency_band: str
    sample_count: int
    avg_rf_power: float
    peak_rf_power: float
    avg_noise_floor: float
    primary_activity: str
    status: str
    notes: Optional[str] = None
    center_lat: float
    center_lng: float
    created_at: datetime
