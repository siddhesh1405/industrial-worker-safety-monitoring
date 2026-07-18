from simulator.worker_profiles import WORKERS
from simulator.sensor_simulator import SensorSimulator
from fog_node.validator import SensorDataValidator

simulator = SensorSimulator()

reading = simulator.generate_sensor_data(WORKERS[0])

print("Valid:", SensorDataValidator.validate(reading))