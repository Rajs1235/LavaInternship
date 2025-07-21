import json
import boto3
import os
import uuid
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME')
table = dynamodb.Table(TABLE_NAME)

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return int(o) if o % 1 == 0 else float(o)
        return super(DecimalEncoder, self).default(o)

def lambda_handler(event, context):
    headers = {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Origin': '*',  
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
    }

    try:
        body = json.loads(event.get('body', '{}'))
        job_id = body.get('job_id')
        action = body.get('action', 'update_status')

        if not job_id:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'message': 'job_id is required.'})}

        # --- ACTION: DELETE ---
        if action == 'delete':
            table.delete_item(Key={'job_id': job_id})
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'message': f"Job '{job_id}' deleted."})}
        
        # --- ACTION: UPDATE STATUS ---
        elif action == 'update_status':
            new_status = body.get('status')
            if not new_status:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'message': 'status is required.'})}
            
            response = table.update_item(
                Key={'job_id': job_id},
                UpdateExpression='SET #st = :s',
                ExpressionAttributeNames={'#st': 'status'},
                ExpressionAttributeValues={':s': new_status},
                ReturnValues='ALL_NEW'
            )
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'message': 'Status updated.', 'updatedJob': response.get('Attributes', {})}, cls=DecimalEncoder)}

        # --- ACTION: UPDATE JOB DETAILS ---
        elif action == 'update_job_details':
            # Get the original job to check if department changed
            original_job_response = table.get_item(Key={'job_id': job_id})
            original_job = original_job_response.get('Item')

            if not original_job:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'message': 'Job not found.'})}

            new_department = body.get('department')
            
            # SCENARIO 1: Department has changed, so we need to create a new item and delete the old one.
            if new_department and original_job.get('department') != new_department:
                print(f"Department changed for {job_id}. Creating new job item.")
                
                # Create the new job item by merging old and new data
                new_item = {**original_job, **body}
                
                # Generate a new job_id
                unique_suffix = str(uuid.uuid4())[:8]
                new_item['job_id'] = f"{new_department.upper().replace(' ', '')}-{unique_suffix}"
                
                # Save the new item
                table.put_item(Item=new_item)
                
                # Delete the old item
                table.delete_item(Key={'job_id': job_id})
                
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'message': 'Job updated with new ID.', 'updatedJob': new_item}, cls=DecimalEncoder)}

            # SCENARIO 2: Department is the same, just update the existing item.
            else:
                print(f"Updating details for job_id: {job_id}")
                update_expression_parts = []
                expression_values = {}
                expression_names = {}
                
                editable_fields = [
                    'jobTitle', 'location', 'department', 'workType', 'workMode', 'experienceLevel', 
                    'minExperience', 'maxExperience', 'minSalary', 'maxSalary', 'currency', 
                    'jobDescription', 'responsibilities', 'requirements', 'qualifications', 
                    'skills', 'benefits', 'applicationDeadline', 'positionsAvailable', 
                    'reportingTo', 'contactEmail', 'isUrgent', 'travelRequired', 'backgroundCheckRequired'
                ]

                for field in editable_fields:
                    if field in body:
                        name_placeholder = f"#{field}"
                        value_placeholder = f":{field}"
                        update_expression_parts.append(f"{name_placeholder} = {value_placeholder}")
                        expression_names[name_placeholder] = field
                        expression_values[value_placeholder] = body[field]
                
                if not expression_values:
                     return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'message': 'No fields to update.'})}

                update_expression = "SET " + ", ".join(update_expression_parts)
                response = table.update_item(
                    Key={'job_id': job_id},
                    UpdateExpression=update_expression,
                    ExpressionAttributeNames=expression_names,
                    ExpressionAttributeValues=expression_values,
                    ReturnValues="ALL_NEW"
                )
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'message': 'Details updated.', 'updatedJob': response.get('Attributes', {})}, cls=DecimalEncoder)}

        else:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'message': f"Invalid action: {action}"})}

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'message': f'An internal server error occurred: {str(e)}'})}
