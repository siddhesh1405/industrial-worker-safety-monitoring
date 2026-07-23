"""AWS client manager.

Provides reusable boto3 clients and resources for AWS services used in the project.
"""

import boto3

from config.aws_config import AWS_REGION


class AWSClient:
    """Creates reusable AWS clients."""

    @staticmethod
    def dynamodb_resource():
        return boto3.resource(
            "dynamodb",
            region_name=AWS_REGION,
        )

    @staticmethod
    def sns_client():
        return boto3.client(
            "sns",
            region_name=AWS_REGION,
        )

    @staticmethod
    def sqs_client():
        return boto3.client(
            "sqs",
            region_name=AWS_REGION,
        )