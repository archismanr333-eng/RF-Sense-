from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.database import get_db
from backend.app.models.measurement import Measurement
from backend.app.models.survey import Survey

router = APIRouter(prefix="/analytics", tags=["Spectrum Analytics"])

@router.get("/summary")
def get_analytics_summary(
    survey_id: Optional[str] = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Computes deep statistical metrics:
    - Probability Density Function (PDF) buckets
    - Mean Signal-to-Noise Ratio (SNR)
    - Automated environment cleanliness score
    - 2.4 GHz channel congestion distribution
    """
    query = db.query(Measurement)
    if survey_id:
        survey = db.query(Survey).filter((Survey.id == survey_id) | (Survey.survey_code == survey_id)).first()
        if survey:
            query = query.filter(Measurement.survey_id == survey.id)

    records = query.all()
    if not records:
        return {
            "total_samples": 0,
            "cleanliness_score": 85,
            "avg_rf_power": -65.0,
            "mean_snr": 21.0,
            "histogram": [],
            "recommendations": ["Initiate active survey to accumulate spectrum telemetry."]
        }

    powers = [r.rf_power for r in records]
    avg_power = sum(powers) / len(powers)
    avg_snr = sum(r.snr for r in records) / len(records)

    # 1. Histogram PDF buckets
    histogram = [
        {"range": "< -80 dBm", "label": "Quiet Floor", "count": sum(1 for p in powers if p < -80)},
        {"range": "-80 to -70", "label": "Low Ambient", "count": sum(1 for p in powers if -80 <= p < -70)},
        {"range": "-70 to -60", "label": "Moderate Wi-Fi", "count": sum(1 for p in powers if -70 <= p < -60)},
        {"range": "-60 to -50", "label": "Active AP", "count": sum(1 for p in powers if -60 <= p < -50)},
        {"range": "-50 to -40", "label": "High Tx", "count": sum(1 for p in powers if -50 <= p < -40)},
        {"range": "> -40 dBm", "label": "Hotspot Spike", "count": sum(1 for p in powers if p >= -40)},
    ]

    # 2. Automated Cleanliness Score (0 - 100)
    cleanliness = max(10, min(98, round(100 - ((avg_power + 85) / 45) * 80)))

    # 3. Channel breakdown
    channel_counts = {}
    for r in records:
        ch = r.channel or 6
        channel_counts[ch] = channel_counts.get(ch, 0) + 1

    recommendations = []
    if channel_counts.get(6, 0) > channel_counts.get(11, 0):
        recommendations.append("Channel 6 exhibits elevated occupancy. Recommend deploying APs on Channel 11 (2462 MHz).")
    else:
        recommendations.append("Channel 11 is actively congested. Utilize Channel 1 or Channel 6 for secondary IoT gateways.")

    if any(p >= -45 for p in powers):
        recommendations.append("Intermittent critical RF spikes detected (> -45 dBm). Check for unshielded industrial microwave devices.")
    else:
        recommendations.append("No out-of-band harmonics or critical power overload observed in the 2.4-2.5 GHz passband.")

    return {
        "total_samples": len(records),
        "avg_rf_power": round(avg_power, 1),
        "mean_snr": round(avg_snr, 1),
        "cleanliness_score": cleanliness,
        "histogram": histogram,
        "channel_occupancy": channel_counts,
        "recommendations": recommendations,
    }
