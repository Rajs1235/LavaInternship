import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME')
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):

    headers = {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Origin': '*',  
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
    }

    try:
        # 1. Parse the request body
        # The body from API Gateway comes as a JSON string.
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})

        # 2. Extract 'job_id' and 'status' from the body
        job_id = body.get('job_id')
        new_status = body.get('status')

        # 3. Validate input
        if not job_id or not new_status:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'status': 'error',
                    'message': 'Missing required fields: job_id and status are required.'
                })
            }

        # 4. Perform the update operation on the DynamoDB table
        print(f"Attempting to update job_id: {job_id} to status: {new_status}")
        
        response = table.update_item(
            Key={
                'job_id': job_id
            },
            UpdateExpression='SET #st = :s',  # Use placeholders to avoid reserved keyword conflicts
            ExpressionAttributeNames={
                '#st': 'status'  # Map the placeholder '#st' to the actual attribute name 'status'
            },
            ExpressionAttributeValues={
                ':s': new_status  # Map the placeholder ':s' to the new status value
            },
            ReturnValues='UPDATED_NEW'  # Return the attributes of the item as they appeared after the update
        )

        print(f"Successfully updated item. DynamoDB response: {response}")

        # 5. Return a success response
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'status': 'success',
                'message': f"Job '{job_id}' status successfully updated to '{new_status}'.",
                'updatedAttributes': response.get('Attributes', {})
            })
        }

    except json.JSONDecodeError:
        print("Error: Invalid JSON in request body.")
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'status': 'error', 'message': 'Invalid JSON format in request body.'})
        }
    except Exception as e:
        # Catch any other exceptions, including potential Boto3 errors
        print(f"An error occurred: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'status': 'error',
                'message': f'An internal server error occurred: {str(e)}'
            })
        }