from simulator.sensor_profiles import get_sensor_profile
from simulator.scenario_generator import Scenario

profile = get_sensor_profile(Scenario.GAS_LEAK)

print(profile)