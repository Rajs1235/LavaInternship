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
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})

        job_id = body.get('job_id')
        action = body.get('action', 'update_status') # Default to update_status if not provided

        if not job_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'status': 'error', 'message': 'Missing required field: job_id is required.'})
            }

        # --- LOGIC TO HANDLE DIFFERENT ACTIONS ---
        if action == 'delete':
            print(f"Attempting to delete job_id: {job_id}")
            table.delete_item(
                Key={'job_id': job_id}
            )
            print(f"Successfully deleted item: {job_id}")
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'status': 'success', 'message': f"Job '{job_id}' successfully deleted."})
            }
        
        elif action == 'update_status':
            new_status = body.get('status')
            if not new_status:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'status': 'error', 'message': 'Missing required field: status is required for update action.'})
                }

            print(f"Attempting to update job_id: {job_id} to status: {new_status}")
            response = table.update_item(
                Key={'job_id': job_id},
                UpdateExpression='SET #st = :s',
                ExpressionAttributeNames={'#st': 'status'},
                ExpressionAttributeValues={':s': new_status},
                ReturnValues='UPDATED_NEW'
            )
            print(f"Successfully updated item. DynamoDB response: {response}")
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'status': 'success',
                    'message': f"Job '{job_id}' status successfully updated to '{new_status}'.",
                    'updatedAttributes': response.get('Attributes', {})
                })
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'status': 'error', 'message': f"Invalid action specified: {action}"})
            }

    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'status': 'error', 'message': 'Invalid JSON format in request body.'})
        }
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'status': 'error', 'message': f'An internal server error occurred: {str(e)}'})
        }
