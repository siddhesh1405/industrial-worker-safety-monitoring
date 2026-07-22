"""
Fog processor.

Coordinates all fog node processing before
sending data to cloud services.
"""

from datetime import datetime

from fog_node.validator import SensorDataValidator
from fog_node.risk_assessor import RiskAssessor
from fog_node.emergency_detector import EmergencyDetector


class FogProcessor:
    """Processes incoming sensor readings."""

    def process(self, sensor_data: dict) -> dict:
        """
        Process one sensor reading.

        Returns:
            Processed sensor event.
        """

        if not SensorDataValidator.validate(sensor_data):
            raise ValueError("Invalid sensor data received.")

        risk_level = RiskAssessor.assess(sensor_data)

        emergency = EmergencyDetector.detect(
            sensor_data,
            risk_level,
        )

        processed_data = sensor_data.copy()

        processed_data["riskLevel"] = risk_level
        processed_data["emergency"] = emergency
        processed_data["processedAt"] = datetime.utcnow().isoformat()

        return processed_data