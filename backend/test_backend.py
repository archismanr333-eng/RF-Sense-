import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

def test_health_check():
    """Verify backend health endpoint."""
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["esp32_pipeline"] == "active"

def test_root_endpoint():
    """Verify root endpoint."""
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert "2.4 GHz ISM" in data["band"]

def test_auth_operator_login():
    """Verify operator authentication."""
    with TestClient(app) as client:
        response = client.post("/api/auth/login", json={
            "email": "operator@rfsense.io",
            "password": "operator2026"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["email"] == "operator@rfsense.io"

def test_list_surveys():
    """Verify surveys listing."""
    with TestClient(app) as client:
        response = client.get("/api/surveys")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        codes = [s["survey_code"] for s in data]
        assert "SUR-001" in codes

def test_create_survey():
    """Verify dynamic survey creation."""
    with TestClient(app) as client:
        payload = {
            "survey_name": "Automated Unit Test Survey",
            "location_name": "Test Lab RF Anechoic Chamber",
            "device_id": "RF-SENSE-001",
            "frequency_band": "2.4 GHz ISM (2400-2483.5 MHz)",
            "center_lat": 22.5726,
            "center_lng": 88.3639
        }
        response = client.post("/api/surveys", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["survey_name"] == "Automated Unit Test Survey"
        assert data["status"] == "in_progress"

def test_esp32_data_ingestion():
    """Verify ESP32 hardware telemetry ingestion."""
    with TestClient(app) as client:
        payload = {
            "device_id": "RF-SENSE-001",
            "latitude": 22.5731,
            "longitude": 88.3642,
            "rf_power": -56.8,
            "noise_floor": -86.2,
            "raw_adc": 1950,
            "channel": 6,
            "device_token": "ESP32_RF_SENSE_SECRET_TOKEN_2026"
        }
        response = client.post("/api/ingest-rf-data", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["device_id"] == "RF-SENSE-001"
        assert data["rf_power"] == -56.8
        assert data["snr"] == pytest.approx(29.4, 0.2)
        assert data["activity_level"] in ["moderate", "high", "critical"]

def test_get_heatmap_points():
    """Verify spatial heatmap queries."""
    with TestClient(app) as client:
        response = client.get("/api/heatmap/points?min_power_dbm=-90.0&max_power_dbm=0.0")
        assert response.status_code == 200
        data = response.json()
        assert "total_points" in data
        assert "points" in data
        assert data["total_points"] > 0

def test_get_spectrum_analytics():
    """Verify analytics processing."""
    with TestClient(app) as client:
        response = client.get("/api/analytics/summary")
        assert response.status_code == 200
        data = response.json()
        assert "cleanliness_score" in data
        assert "histogram" in data
        assert len(data["histogram"]) == 6
        assert "recommendations" in data

def test_device_telemetry_query():
    """Verify device hardware status query."""
    with TestClient(app) as client:
        response = client.get("/api/devices/RF-SENSE-001")
        assert response.status_code == 200
        data = response.json()
        assert data["device_id"] == "RF-SENSE-001"
        assert data["gps_status"] == "FIXED"
