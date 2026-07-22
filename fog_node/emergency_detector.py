"""
Emergency detection module.

Determines whether an immediate emergency response
should be triggered by the fog node.
"""

from config.constants import (
    TEMPERATURE_CRITICAL,
    GAS_CRITICAL,
    HEART_RATE_CRITICAL,
    MOTION_FALL,
    RISK_CRITICAL,
)


class EmergencyDetector:
    """Detects emergency situations."""

    @staticmethod
    def detect(sensor_data: dict, risk_level: str) -> bool:
        """
        Return True if an emergency is detected.
        """

        if risk_level == RISK_CRITICAL:
            return True

        if sensor_data["motion"] == MOTION_FALL:
            return True

        if sensor_data["gas"] >= GAS_CRITICAL:
            return True

        if sensor_data["temperature"] >= TEMPERATURE_CRITICAL:
            return True

        if sensor_data["heartRate"] >= HEART_RATE_CRITICAL:
            return True

        return False