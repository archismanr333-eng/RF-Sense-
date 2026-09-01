import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Device(Base):
    __tablename__ = "devices"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("profiles.user_id"), nullable=True)
    device_id = Column(String(64), unique=True, index=True, nullable=False) # e.g. RF-SENSE-001
    device_name = Column(String(255), default="Field Surveyor Node")
    device_code = Column(String(64), default="ESP32-WROOM-32D")
    status = Column(String(32), default="online") # online, offline, error
    battery_level = Column(Integer, default=78)
    battery_voltage = Column(Float, default=3.94)
    gps_status = Column(String(32), default="FIXED")
    gps_satellites = Column(Integer, default=11)
    gps_hdop = Column(Float, default=0.9)
    esp32_cpu_temp = Column(Float, default=41.5)
    esp32_free_heap_kb = Column(Float, default=184.0)
    esp32_uptime_seconds = Column(Integer, default=3600)
    rf_detector_v_out = Column(Float, default=1.28)
    microsd_status = Column(String(32), default="READY")
    wifi_status = Column(String(32), default="CONNECTED")
    wifi_ssid = Column(String(128), default="RF-Lab-5G_Mesh")
    wifi_rssi = Column(Integer, default=-52)
    last_seen = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="devices")
    surveys = relationship("Survey", back_populates="device")
    measurements = relationship("Measurement", back_populates="device")
