"""
Sensor profile definitions.

Each profile represents a realistic industrial scenario.
The simulator generates sensor values within these ranges.
"""

from dataclasses import dataclass
from typing import Tuple

from simulator.scenario_generator import Scenario
from config.constants import MOTION_NORMAL, MOTION_FALL


@dataclass(frozen=True)
class SensorProfile:
    """Defines the expected sensor ranges for a scenario."""

    temperature: Tuple[float, float]
    gas: Tuple[int, int]
    humidity: Tuple[int, int]
    heart_rate: Tuple[int, int]
    motion: str


SCENARIO_PROFILES = {
    Scenario.NORMAL: SensorProfile(
        temperature=(22.0, 34.0),
        gas=(5, 25),
        humidity=(35, 55),
        heart_rate=(65, 90),
        motion=MOTION_NORMAL
    ),

    Scenario.HEAT_STRESS: SensorProfile(
        temperature=(42.0, 55.0),
        gas=(10, 25),
        humidity=(45, 60),
        heart_rate=(100, 130),
        motion=MOTION_NORMAL
    ),

    Scenario.GAS_LEAK: SensorProfile(
        temperature=(28.0, 34.0),
        gas=(90, 150),
        humidity=(40, 55),
        heart_rate=(90, 120),
        motion=MOTION_NORMAL
    ),

    Scenario.WORKER_FALL: SensorProfile(
        temperature=(24.0, 32.0),
        gas=(5, 20),
        humidity=(40, 60),
        heart_rate=(110, 145),
        motion=MOTION_FALL
    ),

    Scenario.CRITICAL_EMERGENCY: SensorProfile(
        temperature=(50.0, 60.0),
        gas=(120, 180),
        humidity=(70, 90),
        heart_rate=(130, 170),
        motion=MOTION_FALL
    ),
}
def get_sensor_profile(scenario: Scenario) -> SensorProfile:
    """
    Return the sensor profile for a given scenario.
    """

    return SCENARIO_PROFILES[scenario]