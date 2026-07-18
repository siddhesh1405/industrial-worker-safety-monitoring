"""
Risk assessment module.

Evaluates incoming sensor readings and assigns a risk level.
"""

from config.constants import (
    TEMPERATURE_WARNING,
    TEMPERATURE_CRITICAL,
    GAS_WARNING,
    GAS_CRITICAL,
    HEART_RATE_WARNING,
    HEART_RATE_CRITICAL,
    HUMIDITY_WARNING,
    HUMIDITY_CRITICAL,
    MOTION_FALL,
    RISK_NORMAL,
    RISK_WARNING,
    RISK_CRITICAL,
)


class RiskAssessor:
    """Determines the overall risk level of a worker."""

    @staticmethod
    def assess(sensor_data: dict) -> str:
        """
        Assess the risk level using sensor thresholds.
        """

        temperature = sensor_data["temperature"]
        gas = sensor_data["gas"]
        humidity = sensor_data["humidity"]
        heart_rate = sensor_data["heartRate"]
        motion = sensor_data["motion"]

        # Critical conditions
        if (
            temperature >= TEMPERATURE_CRITICAL
            or gas >= GAS_CRITICAL
            or humidity >= HUMIDITY_CRITICAL
            or heart_rate >= HEART_RATE_CRITICAL
            or motion == MOTION_FALL
        ):
            return RISK_CRITICAL

        # Warning conditions
        if (
            temperature >= TEMPERATURE_WARNING
            or gas >= GAS_WARNING
            or humidity >= HUMIDITY_WARNING
            or heart_rate >= HEART_RATE_WARNING
        ):
            return RISK_WARNING

        return RISK_NORMAL