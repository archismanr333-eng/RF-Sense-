from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class DeviceCreate(BaseModel):
    device_id: str
    device_name: Optional[str] = "Field Surveyor Node"
    device_code: Optional[str] = "ESP32-WROOM-32D"

class DeviceTelemetryUpdate(BaseModel):
    status: Optional[str] = "online"
    battery_level: Optional[int] = None
    battery_voltage: Optional[float] = None
    gps_status: Optional[str] = None
    gps_satellites: Optional[int] = None
    gps_hdop: Optional[float] = None
    esp32_cpu_temp: Optional[float] = None
    esp32_free_heap_kb: Optional[float] = None
    esp32_uptime_seconds: Optional[int] = None
    rf_detector_v_out: Optional[float] = None
    microsd_status: Optional[str] = None
    wifi_status: Optional[str] = None
    wifi_ssid: Optional[str] = None
    wifi_rssi: Optional[int] = None

class DeviceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    device_id: str
    device_name: str
    device_code: str
    status: str
    battery_level: int
    battery_voltage: float
    gps_status: str
    gps_satellites: int
    gps_hdop: float
    esp32_cpu_temp: float
    esp32_free_heap_kb: float
    esp32_uptime_seconds: int
    rf_detector_v_out: float
    microsd_status: str
    wifi_status: str
    wifi_ssid: str
    wifi_rssi: int
    last_seen: datetime
    created_at: datetime
