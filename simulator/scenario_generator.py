"""
Scenario generator for industrial worker simulation.

This module defines the possible situations that a worker
can experience during the simulation.
"""

from enum import Enum
import random


class Scenario(Enum):
    """Supported simulation scenarios."""

    NORMAL = "Normal Operation"
    HEAT_STRESS = "Heat Stress"
    GAS_LEAK = "Gas Leak"
    WORKER_FALL = "Worker Fall"
    CRITICAL_EMERGENCY = "Critical Emergency"


def get_random_scenario() -> Scenario:
    """
    Randomly choose a scenario.

    Normal operation has a much higher probability than
    emergency situations.
    """

    scenarios = [
        Scenario.NORMAL,
        Scenario.NORMAL,
        Scenario.NORMAL,
        Scenario.NORMAL,
        Scenario.NORMAL,
        Scenario.HEAT_STRESS,
        Scenario.GAS_LEAK,
        Scenario.WORKER_FALL,
        Scenario.CRITICAL_EMERGENCY
    ]

    return random.choice(scenarios)

def get_department_default_scenario(department: str) -> Scenario:
    """
    Return the most common scenario for a department.
    """

    defaults = {
        "Assembly Line": Scenario.NORMAL,
        "Packaging": Scenario.NORMAL,
        "Chemical Storage": Scenario.GAS_LEAK,
        "Loading Dock": Scenario.WORKER_FALL,
        "Furnace Area": Scenario.HEAT_STRESS,
    }

    return defaults.get(department, Scenario.NORMAL)

def should_trigger_emergency() -> bool:
    """
    Small chance of a critical emergency.

    Returns True approximately 5% of the time.
    """

    return random.random() < 0.05