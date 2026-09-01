from typing import Tuple
from backend.app.config import settings

class SignalProcessor:
    def __init__(self, ema_alpha: float = 0.25):
        self.ema_alpha = ema_alpha
        self.rolling_noise_floor = settings.NOISE_BASELINE_DBM

    def convert_adc_to_dbm(self, raw_adc: int) -> float:
        """
        Converts 12-bit ESP32 ADC reading (0-4095) into calibrated dBm.
        AD8318 has an inverted slope: ~2.1V at -60 dBm, ~0.5V at 0 dBm.
        Slope: -24.5 mV/dB.
        """
        # Linear approximation across standard 12-bit range
        voltage = (raw_adc / 4095.0) * 3.3
        # Inverted transfer function
        dbm = -60.0 + ((2.1 - voltage) / 0.0245)
        # Clamp to realistic bounds (-95 to +5 dBm)
        return round(max(-95.0, min(5.0, dbm)), 1)

    def apply_ema_filter(self, current_val: float, previous_val: float) -> float:
        """Lightweight Exponential Moving Average filter to smooth detector ripple."""
        return round((self.ema_alpha * current_val) + ((1.0 - self.ema_alpha) * previous_val), 1)

    def update_noise_floor(self, current_rf: float) -> float:
        """
        Estimates baseline noise floor dynamically.
        Only updates baseline when signal power is low/quiet to prevent active transmitters
        from dragging up the true thermal noise floor.
        """
        if current_rf < -75.0:
            self.rolling_noise_floor = (0.05 * current_rf) + (0.95 * self.rolling_noise_floor)
        return round(self.rolling_noise_floor, 1)

    def calculate_activity(self, rf_power: float, noise_floor: float) -> Tuple[int, str]:
        """
        Calculates normalized activity percentage score (0-100%) and level category.
        """
        # Normalized 0-100% based on -90 dBm to -30 dBm range
        norm = max(0, min(100, int(((rf_power - (-90.0)) / 60.0) * 100)))

        if rf_power >= settings.HIGH_MAX_DBM or norm >= 80:
            level = "critical"
        elif rf_power >= settings.MODERATE_MAX_DBM or norm >= 50:
            level = "high"
        elif rf_power >= settings.LOW_MAX_DBM or norm >= 25:
            level = "moderate"
        else:
            level = "low"

        return norm, level

signal_processor = SignalProcessor()
