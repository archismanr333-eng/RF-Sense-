import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Survey(Base):
    __tablename__ = "surveys"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    survey_code = Column(String(32), unique=True, index=True, nullable=False) # SUR-001
    survey_name = Column(String(255), nullable=False)
    user_id = Column(String(64), ForeignKey("profiles.user_id"), nullable=True)
    device_id = Column(String(64), ForeignKey("devices.device_id"), nullable=True)
    location_name = Column(String(255), default="Field Survey Zone")
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, default=60)
    frequency_band = Column(String(128), default="2.4 GHz ISM (2400-2483.5 MHz)")
    sample_count = Column(Integer, default=0)
    avg_rf_power = Column(Float, default=-65.0)
    peak_rf_power = Column(Float, default=-40.0)
    avg_noise_floor = Column(Float, default=-86.0)
    primary_activity = Column(String(32), default="moderate")
    status = Column(String(32), default="in_progress") # in_progress, completed, archived
    notes = Column(Text, nullable=True)
    center_lat = Column(Float, default=22.5726)
    center_lng = Column(Float, default=88.3639)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="surveys")
    device = relationship("Device", back_populates="surveys")
    measurements = relationship("Measurement", back_populates="survey", cascade="all, delete-orphan")
