import os

class Settings:
    PROJECT_NAME: str = "RF-Sense Backend"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./rf_sense.db")
    
    # JWT Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "rf-sense-hyper-secure-cyber-jwt-key-2026-ism-band")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Device Ingestion Token
    DEVICE_AUTH_TOKEN: str = os.getenv("DEVICE_AUTH_TOKEN", "ESP32_RF_SENSE_SECRET_TOKEN_2026")
    
    # RF Threshold Defaults (dBm)
    LOW_MAX_DBM: float = -75.0
    MODERATE_MAX_DBM: float = -55.0
    HIGH_MAX_DBM: float = -40.0
    NOISE_BASELINE_DBM: float = -86.0

settings = Settings()
