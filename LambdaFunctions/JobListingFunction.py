import json
import boto3
import os
from collections import defaultdict
from decimal import Decimal # Import the Decimal type

TABLE_NAME = os.environ.get("TABLE_NAME")
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

def lambda_handler(event, context):
    try:
        # Scan the table
        response = table.scan()
        items = response.get('Items', [])

        # Handle pagination if the table is large
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response.get('Items', []))

        # Group by department
        grouped = defaultdict(list)
        for item in items:
            department = item.get('department', 'Unknown')
            grouped[department].append(item)

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Access-Control-Allow-Headers': '*'
            },
            # --- FIX: Use the custom encoder in the json.dumps call ---
            'body': json.dumps({
                "status": "success",
                "data": grouped
            }, cls=DecimalEncoder) # Add cls=DecimalEncoder here
        }

    except Exception as e:
        print(f"Error fetching and processing job listings: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'status': 'error',
                'message': str(e)
            })
        }
