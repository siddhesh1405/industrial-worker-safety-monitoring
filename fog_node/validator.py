"""
Sensor data validator.

Validates incoming sensor readings before processing.
"""

from typing import Dict


REQUIRED_FIELDS = [
    "workerId",
    "workerName",
    "department",
    "shift",
    "temperature",
    "gas",
    "humidity",
    "heartRate",
    "motion",
    "scenario",
    "timestamp",
]


class SensorDataValidator:
    """Validates sensor data received by the fog node."""

    @staticmethod
    def validate(sensor_data: Dict) -> bool:
        """
        Check whether all required fields exist.

        Returns:
            True if valid, otherwise False.
        """

        for field in REQUIRED_FIELDS:
            if field not in sensor_data:
                print(f"Missing field: {field}")
                return False

        return True