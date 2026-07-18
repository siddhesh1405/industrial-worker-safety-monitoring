from simulator.worker_profiles import WORKERS
from simulator.sensor_simulator import SensorSimulator

simulator = SensorSimulator()

reading = simulator.generate_sensor_data(WORKERS[0])

print(reading)