from simulator.worker_profiles import WORKERS
from simulator.sensor_simulator import SensorSimulator

from fog_node.fog_processor import FogProcessor

simulator = SensorSimulator()
fog_processor = FogProcessor()

for worker in WORKERS:

    reading = simulator.generate_sensor_data(worker)

    processed = fog_processor.process(reading)

    print("=" * 70)

    print(f"Worker      : {processed['workerId']}")
    print(f"Department  : {processed['department']}")
    print(f"Scenario    : {processed['scenario']}")
    print(f"Risk Level  : {processed['riskLevel']}")
    print(f"Emergency   : {processed['emergency']}")
    print(f"Temperature : {processed['temperature']} °C")
    print(f"Gas         : {processed['gas']} ppm")
    print(f"Heart Rate  : {processed['heartRate']} BPM")