from simulator.worker_profiles import WORKERS
from simulator.sensor_simulator import SensorSimulator
from simulator.scenario_generator import Scenario
from fog_node.risk_assessor import RiskAssessor

simulator = SensorSimulator()

for scenario in Scenario:
    reading = simulator.generate_sensor_data(
        WORKERS[0],
        scenario=scenario,
    )

    risk = RiskAssessor.assess(reading)

    print("-" * 50)
    print(f"Scenario : {reading['scenario']}")
    print(f"Risk     : {risk}")
    print(f"Temp     : {reading['temperature']} °C")
    print(f"Gas      : {reading['gas']} ppm")
    print(f"Heart    : {reading['heartRate']} BPM")
    print(f"Motion   : {reading['motion']}")