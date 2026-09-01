from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.device import Device
from backend.app.schemas.device import DeviceCreate, DeviceTelemetryUpdate, DeviceOut

router = APIRouter(prefix="/devices", tags=["Hardware Devices"])

@router.get("", response_model=List[DeviceOut])
def list_devices(db: Session = Depends(get_db)):
    """List all registered RF-Sense hardware nodes."""
    return db.query(Device).all()

@router.get("/{device_id}", response_model=DeviceOut)
def get_device_telemetry(device_id: str, db: Session = Depends(get_db)):
    """Get telemetry status for a specific hardware node."""
    device = db.query(Device).filter(Device.device_id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    return device

@router.put("/{device_id}/telemetry", response_model=DeviceOut)
def update_device_telemetry(
    device_id: str,
    update_in: DeviceTelemetryUpdate,
    db: Session = Depends(get_db)
):
    """Update hardware health parameters from ESP32."""
    device = db.query(Device).filter(Device.device_id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")

    for field, val in update_in.dict(exclude_unset=True).items():
        setattr(device, field, val)

    device.last_seen = datetime.utcnow()
    db.commit()
    db.refresh(device)
    return device
