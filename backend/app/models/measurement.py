import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    sample_id = Column(String(32), index=True, nullable=False) # e.g. 000125
    survey_id = Column(String(64), ForeignKey("surveys.id"), nullable=True, index=True)
    device_id = Column(String(64), ForeignKey("devices.device_id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Geolocation
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    altitude = Column(Float, default=15.0)

    # RF Telemetry
    rf_power = Column(Float, nullable=False) # dBm (e.g. -58.4)
    raw_adc = Column(Integer, default=1800) # 0 - 4095
    noise_floor = Column(Float, default=-86.0) # dBm
    snr = Column(Float, default=27.6) # dB (rf_power - noise_floor)
    activity_score = Column(Integer, default=76) # 0 - 100%
    activity_level = Column(String(32), default="high") # low, moderate, high, critical
    
    # 2.4 GHz Spectrum
    channel = Column(Integer, default=6) # 1 - 14
    frequency_mhz = Column(Float, default=2437.0) # e.g. 2437 MHz
    packet_rate = Column(Integer, default=45)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    survey = relationship("Survey", back_populates="measurements")
    device = relationship("Device", back_populates="measurements")

# Composite spatial & temporal index for rapid map & range querying
Index("idx_measurements_lat_lng", Measurement.latitude, Measurement.longitude)
Index("idx_measurements_survey_time", Measurement.survey_id, Measurement.timestamp)
