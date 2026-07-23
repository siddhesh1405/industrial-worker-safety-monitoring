from decimal import Decimal
from botocore.exceptions import BotoCoreError, ClientError

from aws.aws_client import AWSClient
from config.aws_config import DYNAMODB_TABLE


def convert_floats_to_decimal(obj):
    """Recursively convert Python float values to Decimal for DynamoDB."""
    if isinstance(obj, float):
        return Decimal(str(obj))
    if isinstance(obj, dict):
        return {key: convert_floats_to_decimal(value) for key, value in obj.items()}
    if isinstance(obj, list):
        return [convert_floats_to_decimal(item) for item in obj]
    if isinstance(obj, tuple):
        return tuple(convert_floats_to_decimal(item) for item in obj)
    return obj


class DynamoDBService:
    """Service for persisting processed worker safety events to DynamoDB."""

    def __init__(self):
        self.table = AWSClient.dynamodb_resource().Table(DYNAMODB_TABLE)

    def save_event(self, event: dict) -> bool:
        """Save a processed event to DynamoDB.

        Returns True if the write succeeds, otherwise False.
        """
        try:
            item = convert_floats_to_decimal(event.copy())

            # Match the DynamoDB sort key name.
            item["timestamp"] = item.pop("processedAt")

            import json

            item = json.loads(
                json.dumps(item),
                parse_float=Decimal,
            )

            self.table.put_item(Item=item)
            print(
                f"[DynamoDB] Saved event for {item['workerId']} at {item['timestamp']}"
            )
            return True

        except (ClientError, BotoCoreError) as error:
            print(f"[DynamoDB] Failed to save event: {error}")
            return False
        except Exception as error:
            print(f"[DynamoDB] Unexpected error: {error}")
            print(item)
            return False