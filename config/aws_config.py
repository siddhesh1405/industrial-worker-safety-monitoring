"""
AWS configuration.

This module stores DynamoDB table names and
other AWS-related configuration.
"""

from config.settings import Settings


class AWSConfig:
    """AWS resource configuration."""

    REGION = Settings.AWS_REGION

    WORKERS_TABLE = "Workers"
    SENSOR_TABLE = "SensorReadings"
    ALERTS_TABLE = "Alerts"

    SNS_TOPIC_NAME = "WorkerSafetyAlerts"
    SQS_QUEUE_NAME = "WorkerSafetyQueue"