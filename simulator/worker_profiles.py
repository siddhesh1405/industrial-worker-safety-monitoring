"""
Worker profile definitions.

This module contains the workers participating in the
industrial safety monitoring simulation.
"""

from dataclasses import dataclass
from typing import List


@dataclass
class Worker:
    """Represents an industrial worker."""

    worker_id: str
    name: str
    department: str
    shift: str
    status: str = "Active"


WORKERS: List[Worker] = [
    Worker(
        worker_id="W001",
        name="John",
        department="Assembly Line",
        shift="Morning"
    ),
    Worker(
        worker_id="W002",
        name="Alice",
        department="Packaging",
        shift="Morning"
    ),
    Worker(
        worker_id="W003",
        name="David",
        department="Chemical Storage",
        shift="Morning"
    ),
    Worker(
        worker_id="W004",
        name="Sarah",
        department="Loading Dock",
        shift="Morning"
    ),
    Worker(
        worker_id="W005",
        name="Mike",
        department="Furnace Area",
        shift="Morning"
    )
]