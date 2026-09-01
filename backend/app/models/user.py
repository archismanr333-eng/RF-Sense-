import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "profiles"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String(32), default="operator")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    devices = relationship("Device", back_populates="owner")
    surveys = relationship("Survey", back_populates="owner")
