"""
Sensor simulator.

Generates realistic sensor readings for industrial workers
based on predefined scenarios.
"""

from datetime import datetime
import random
from typing import Optional

from simulator.worker_profiles import Worker
from simulator.scenario_generator import (
    Scenario,
    get_department_scenario,
)
from simulator.sensor_profiles import get_sensor_profile


class SensorSimulator:
    """Generates simulated sensor readings."""

    def __init__(self):
        random.seed()

    @staticmethod
    def _generate_float(minimum: float, maximum: float) -> float:
        """Generate a float value with one decimal place."""
        return round(random.uniform(minimum, maximum), 1)

    @staticmethod
    def _generate_integer(minimum: int, maximum: int) -> int:
        """Generate an integer value."""
        return random.randint(minimum, maximum)

    def generate_sensor_data(
        self,
        worker: Worker,
        scenario: Optional[Scenario] = None,
    ) -> dict:
        """
        Generate one complete sensor record for a worker.
        If no scenario is provided, select one based on the
        worker's department.
        """

        if scenario is None:
            scenario = get_department_scenario(worker.department)

        profile = get_sensor_profile(scenario)

        sensor_data = {
            "workerId": worker.worker_id,
            "workerName": worker.name,
            "department": worker.department,
            "shift": worker.shift,
            "temperature": self._generate_float(
                *profile.temperature
            ),
            "gas": self._generate_integer(
                *profile.gas
            ),
            "humidity": self._generate_integer(
                *profile.humidity
            ),
            "heartRate": self._generate_integer(
                *profile.heart_rate
            ),
            "motion": profile.motion,
            "scenario": scenario.value,
            "timestamp": datetime.utcnow().isoformat(),
        }

        return sensor_data