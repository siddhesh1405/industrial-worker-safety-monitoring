"""
Utility functions for accessing worker information.
"""

from simulator.worker_profiles import WORKERS


def get_all_workers():
    """
    Return all worker profiles.
    """
    return WORKERS


def get_worker(worker_id: str):
    """
    Find a worker by worker ID.

    Returns:
        Worker object if found, otherwise None.
    """
    for worker in WORKERS:
        if worker.worker_id == worker_id:
            return worker

    return None