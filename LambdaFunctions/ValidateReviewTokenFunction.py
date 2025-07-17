import json
import boto3
import os
import jwt  # From the PyJWT library
from decimal import Decimal

# --- Configuration from Environment Variables ---
JWT_SECRET_ARN = os.environ.get('JWT_SECRET_ARN')
TOKEN_TABLE_NAME = os.environ.get('TOKEN_TABLE_NAME')
CANDIDATE_TABLE_NAME = os.environ.get('CANDIDATE_TABLE_NAME')

# --- Initialize AWS Clients ---
dynamodb = boto3.resource('dynamodb')
secrets_manager_client = boto3.client('secretsmanager')

class DecimalEncoder(json.JSONEncoder):
    """
    Helper class to convert a DynamoDB item's Decimal types to JSON-compatible floats or ints.
    """
    def default(self, o):
        if isinstance(o, Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

def get_jwt_secret():
    """
    Fetches the JWT secret from AWS Secrets Manager and caches it globally
    for the lifetime of the Lambda execution context to improve performance.
    """
    if 'jwt_secret' not in globals():
        print("Fetching JWT secret from Secrets Manager...")
        secret_value = secrets_manager_client.get_secret_value(SecretId=JWT_SECRET_ARN)
        globals()['jwt_secret'] = secret_value['SecretString']
    return globals()['jwt_secret']

def lambda_handler(event, context):
    """
    This function validates a secure JWT and fetches the corresponding 
    candidate's data from DynamoDB. It allows the token to be used multiple times
    until it expires.
    """
    headers = {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Origin': '*',  # For production, restrict this to your frontend domain
        'Access-Control-Allow-Methods': 'OPTIONS,GET'
    }

    try:
        # 1. Extract the token from the API Gateway query string parameters
        token = event.get('queryStringParameters', {}).get('token')

        if not token:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Token is missing from the request.'})
            }

        jwt_secret = get_jwt_secret()
        
        # 2. Decode the JWT. This step automatically validates the signature and expiration (10-day limit).
        try:
            payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
            resume_id = payload.get('resume_id')
        except jwt.ExpiredSignatureError:
            return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'This review link has expired.'})}
        except jwt.InvalidTokenError:
            return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'This review link is invalid or has been tampered with.'})}

        # 3. Check if the token exists in our database. This acts as a revocation check.
        token_table = dynamodb.Table(TOKEN_TABLE_NAME)
        response = token_table.get_item(Key={'token': token})
        
        token_item = response.get('Item')
        if not token_item:
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'This review link is invalid or has been revoked.'})}
            
        # --- The one-time-use logic has been removed from here ---
        # We no longer check for 'pending' status or update it to 'used'.

        # 4. Fetch the full candidate data from the main candidate table
        print(f"Fetching data for candidate with resume_id: {resume_id}")
        candidate_table = dynamodb.Table(CANDIDATE_TABLE_NAME)
        candidate_response = candidate_table.get_item(Key={'resume_id': resume_id})
        
        candidate_data = candidate_response.get('Item')
        if not candidate_data:
             return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Could not find the specified candidate data.'})}

        # 5. Return the candidate data successfully
        print("Successfully fetched candidate data. Returning to client.")
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(candidate_data, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"An unhandled error occurred: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'An internal server error occurred. Please check the logs.'})
        }
