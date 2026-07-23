"""
Background engine for generating live worker safety data.
"""

from collections import deque
import threading
import time

from simulator.worker_profiles import WORKERS
from simulator.sensor_simulator import SensorSimulator
from fog_node.fog_processor import FogProcessor
from aws.dynamodb_service import DynamoDBService


class LiveEngine:

    def __init__(self):

        self.simulator = SensorSimulator()
        self.processor = FogProcessor()
        self.db = DynamoDBService()

        self.latest_data = []
        self.event_history = deque(maxlen=500)
        self.data_lock = threading.Lock()
        self.running = False

    def update_data(self):

        workers = []

        for worker in WORKERS:

            sensor_data = self.simulator.generate_sensor_data(worker)

            processed = self.processor.process(sensor_data)
            # Save the processed event to DynamoDB.
            # Any errors are handled inside the service so live processing continues.
            self.db.save_event(processed)

            workers.append(processed)

            with self.data_lock:
                self.event_history.append(processed.copy())

        with self.data_lock:
            self.latest_data = workers

    def get_latest_data(self):

        with self.data_lock:
            return [worker.copy() for worker in self.latest_data]

    def get_event_history(self):

        with self.data_lock:
            return [
                event.copy()
                for event in reversed(self.event_history)
            ]

    def background_task(self):

        while self.running:

            self.update_data()

            time.sleep(5)

    def start(self):

        if self.running:
            return

        self.running = True

        thread = threading.Thread(
            target=self.background_task,
            daemon=True
        )

        thread.start()


live_engine = LiveEngine()

