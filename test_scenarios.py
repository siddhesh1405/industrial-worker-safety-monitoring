from simulator.scenario_generator import get_random_scenario

for _ in range(10):
    print(get_random_scenario().value)