"""
Project-wide constants.

These values define sensor thresholds and risk levels
used throughout the application.
"""

# Temperature (°C)
TEMPERATURE_NORMAL_MAX = 35
TEMPERATURE_WARNING_MAX = 50

# Gas (ppm)
GAS_NORMAL_MAX = 30
GAS_WARNING_MAX = 80

# Humidity (%)
HUMIDITY_NORMAL_MAX = 60
HUMIDITY_WARNING_MAX = 80

# Heart Rate (BPM)
HEART_RATE_NORMAL_MAX = 100
HEART_RATE_WARNING_MAX = 120

# Motion Status
MOTION_NORMAL = "Normal"
MOTION_FALL = "Fall"

# Risk Levels
RISK_LOW = "Low"
RISK_MEDIUM = "Medium"
RISK_HIGH = "High"
RISK_CRITICAL = "Critical"