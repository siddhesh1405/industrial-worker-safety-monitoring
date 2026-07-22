"""
Application service layer.

Coordinates the simulator and fog node.
"""

from simulator.worker_profiles import WORKERS
from simulator.sensor_simulator import SensorSimulator
from fog_node.fog_processor import FogProcessor


class WorkerSafetyService:

    def __init__(self):
        self.simulator = SensorSimulator()
        self.processor = FogProcessor()

    def get_live_data(self):

        processed_workers = []

        for worker in WORKERS:

            sensor_data = self.simulator.generate_sensor_data(worker)

            processed = self.processor.process(sensor_data)

            processed_workers.append(processed)

        return processed_workers


service = WorkerSafetyService()