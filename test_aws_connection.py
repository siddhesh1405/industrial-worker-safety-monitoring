from aws.aws_client import AWSClient

try:
    dynamodb = AWSClient.dynamodb_resource()

    tables = list(dynamodb.tables.all())

    print("Connected to AWS successfully!")
    print()

    print("Available DynamoDB Tables:")

    for table in tables:
        print(f"- {table.name}")

except Exception as error:
    print("Connection failed.")
    print(error)