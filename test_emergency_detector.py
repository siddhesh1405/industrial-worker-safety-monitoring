from simulator.worker_profiles import WORKERS
from simulator.sensor_simulator import SensorSimulator
from simulator.scenario_generator import Scenario

from fog_node.risk_assessor import RiskAssessor
from fog_node.emergency_detector import EmergencyDetector

simulator = SensorSimulator()

for scenario in Scenario:

    reading = simulator.generate_sensor_data(
        WORKERS[0],
        scenario=scenario,
    )

    risk = RiskAssessor.assess(reading)

    emergency = EmergencyDetector.detect(
        reading,
        risk,
    )

    print("=" * 60)
    print(f"Scenario   : {reading['scenario']}")
    print(f"Risk Level : {risk}")
    print(f"Emergency  : {emergency}")