import json
import uuid
import boto3
import os
from datetime import datetime

TABLE_NAME = os.environ.get("TABLE_NAME")
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    try:
        print("Incoming event:", json.dumps(event))

        body = event.get('body')
        if body is None:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing request body'})
            }

        data = json.loads(body) if isinstance(body, str) else body

        department = data.get('department', 'GENERIC').upper().replace(" ", "")
        unique_suffix = str(uuid.uuid4())[:8]  # Short UUID
        job_id = f"{department}-{unique_suffix}"

        item = {
            'job_id': job_id,
            'jobTitle': data.get('jobTitle'),
            'department': data.get('department'),
            'location': data.get('location'),
            'workType': data.get('workType'),
            'workMode': data.get('workMode'),
            'experienceLevel': data.get('experienceLevel'),
            'minExperience': data.get('minExperience'),
            'maxExperience': data.get('maxExperience'),
            'minSalary': data.get('minSalary'),
            'maxSalary': data.get('maxSalary'),
            'currency': data.get('currency'),
            'jobDescription': data.get('jobDescription'),
            'responsibilities': data.get('responsibilities', []),
            'requirements': data.get('requirements', []),
            'qualifications': data.get('qualifications', []),
            'skills': data.get('skills', []),
            'benefits': data.get('benefits', []),
            'applicationDeadline': data.get('applicationDeadline'),
            'positionsAvailable': data.get('positionsAvailable', 1),
            'reportingTo': data.get('reportingTo'),
            'contactEmail': data.get('contactEmail'),
            'isUrgent': data.get('isUrgent', False),
            'allowRemote': data.get('allowRemote', False),
            'travelRequired': data.get('travelRequired', False),
            'backgroundCheckRequired': data.get('backgroundCheckRequired', False),
            'postedDate': data.get('postedDate', datetime.utcnow().isoformat()),
            'status': data.get('status', 'Active')
        }

        table.put_item(Item=item)

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'message': 'Job posted successfully', 'job_id': job_id})
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'error': str(e)})
        }
