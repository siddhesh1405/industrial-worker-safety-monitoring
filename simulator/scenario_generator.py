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
    Return a random scenario with a realistic distribution.

    This function is mainly used for general testing.
    """

    scenarios = [
        Scenario.NORMAL,
        Scenario.HEAT_STRESS,
        Scenario.GAS_LEAK,
        Scenario.WORKER_FALL,
        Scenario.CRITICAL_EMERGENCY,
    ]

    weights = [85, 5, 4, 4, 2]

    return random.choices(scenarios, weights=weights, k=1)[0]


def get_department_scenario(department: str) -> Scenario:
    """
    Select a scenario based on the worker's department.

    Different departments have different probabilities of
    experiencing industrial incidents.
    """

    department_probabilities = {
        "Assembly Line": (
            [
                Scenario.NORMAL,
                Scenario.HEAT_STRESS,
                Scenario.GAS_LEAK,
                Scenario.WORKER_FALL,
                Scenario.CRITICAL_EMERGENCY,
            ],
            [90, 5, 2, 2, 1],
        ),

        "Packaging": (
            [
                Scenario.NORMAL,
                Scenario.HEAT_STRESS,
                Scenario.GAS_LEAK,
                Scenario.WORKER_FALL,
                Scenario.CRITICAL_EMERGENCY,
            ],
            [92, 3, 1, 3, 1],
        ),

        "Chemical Storage": (
            [
                Scenario.NORMAL,
                Scenario.HEAT_STRESS,
                Scenario.GAS_LEAK,
                Scenario.WORKER_FALL,
                Scenario.CRITICAL_EMERGENCY,
            ],
            [75, 5, 15, 3, 2],
        ),

        "Loading Dock": (
            [
                Scenario.NORMAL,
                Scenario.HEAT_STRESS,
                Scenario.GAS_LEAK,
                Scenario.WORKER_FALL,
                Scenario.CRITICAL_EMERGENCY,
            ],
            [80, 3, 2, 12, 3],
        ),

        "Furnace Area": (
            [
                Scenario.NORMAL,
                Scenario.HEAT_STRESS,
                Scenario.GAS_LEAK,
                Scenario.WORKER_FALL,
                Scenario.CRITICAL_EMERGENCY,
            ],
            [70, 20, 2, 5, 3],
        ),
    }

    scenarios, weights = department_probabilities.get(
        department,
        (
            [
                Scenario.NORMAL,
                Scenario.HEAT_STRESS,
                Scenario.GAS_LEAK,
                Scenario.WORKER_FALL,
                Scenario.CRITICAL_EMERGENCY,
            ],
            [85, 5, 4, 4, 2],
        ),
    )

    return random.choices(scenarios, weights=weights, k=1)[0]


def should_trigger_emergency() -> bool:
    """
    Small chance of a critical emergency.

    Returns True approximately 5% of the time.
    """

    return random.random() < 0.05