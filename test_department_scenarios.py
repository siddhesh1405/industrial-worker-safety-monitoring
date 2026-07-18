from simulator.worker_profiles import WORKERS
from simulator.sensor_simulator import SensorSimulator

simulator = SensorSimulator()

for worker in WORKERS:
    print("=" * 70)

    reading = simulator.generate_sensor_data(worker)

    print(f"Worker     : {reading['workerId']}")
    print(f"Department : {reading['department']}")
    print(f"Scenario   : {reading['scenario']}")
    print(f"Temperature: {reading['temperature']} °C")
    print(f"Gas        : {reading['gas']} ppm")
    print(f"Heart Rate : {reading['heartRate']} BPM")
    print(f"Motion     : {reading['motion']}")