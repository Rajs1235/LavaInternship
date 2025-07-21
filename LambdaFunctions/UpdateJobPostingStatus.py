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
        body = json.loads(event.get('body', '{}'))
        job_id = body.get('job_id')
        action = body.get('action', 'update_status')

        if not job_id:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'message': 'job_id is required.'})}

        # --- ACTION: DELETE ---
        if action == 'delete':
            print(f"Attempting to delete job_id: {job_id}")
            table.delete_item(Key={'job_id': job_id})
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'message': f"Job '{job_id}' deleted."})}
        
        # --- ACTION: UPDATE STATUS ---
        elif action == 'update_status':
            new_status = body.get('status')
            if not new_status:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'message': 'status is required for update.'})}
            
            print(f"Attempting to update status for job_id: {job_id}")
            response = table.update_item(
                Key={'job_id': job_id},
                UpdateExpression='SET #st = :s',
                ExpressionAttributeNames={'#st': 'status'},
                ExpressionAttributeValues={':s': new_status},
                ReturnValues='UPDATED_NEW'
            )
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'message': f"Status updated for '{job_id}'.", 'updated': response.get('Attributes', {})})}

        # --- ACTION: UPDATE JOB DETAILS (CORRECTED) ---
        elif action == 'update_job_details':
            print(f"Attempting to update details for job_id: {job_id}")
            
            update_expression_parts = []
            expression_values = {}
            expression_names = {}
            
            # Expanded list of all fields that can be updated from the modal
            editable_fields = [
                'jobTitle', 'department', 'location', 'workType', 'workMode', 
                'experienceLevel', 'minExperience', 'maxExperience', 'minSalary', 
                'maxSalary', 'currency', 'jobDescription', 'responsibilities', 
                'requirements', 'qualifications', 'skills', 'benefits', 
                'applicationDeadline', 'positionsAvailable', 'reportingTo', 
                'contactEmail', 'isUrgent', 'travelRequired', 'backgroundCheckRequired'
            ]

            for field in editable_fields:
                if field in body:
                    # Use placeholders for both names and values to avoid reserved word conflicts
                    name_placeholder = f"#{field}"
                    value_placeholder = f":{field}"
                    
                    update_expression_parts.append(f"{name_placeholder} = {value_placeholder}")
                    expression_names[name_placeholder] = field
                    expression_values[value_placeholder] = body[field]
            
            if not expression_values:
                 return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'message': 'No fields provided to update.'})}

            update_expression = "SET " + ", ".join(update_expression_parts)

            response = table.update_item(
                Key={'job_id': job_id},
                UpdateExpression=update_expression,
                ExpressionAttributeNames=expression_names,
                ExpressionAttributeValues=expression_values,
                ReturnValues="UPDATED_NEW"
            )
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'message': f"Details updated for '{job_id}'.", 'updated': response.get('Attributes', {})})}

        else:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'message': f"Invalid action: {action}"})}

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'message': f'An internal server error occurred: {str(e)}'})}
