import json
import boto3
import os
from boto3.dynamodb.types import TypeDeserializer

deserializer = TypeDeserializer()
dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    resume_table = os.environ.get("DDB1_NAME")
    job_table = os.environ.get("DDB2_NAME")

    # Fetch all resume items
    response = dynamodb.scan(TableName=resume_table)
    results = []

    for item in response.get('Items', []):
        resume_data = {k: deserializer.deserialize(v) for k, v in item.items()}
        entities = resume_data.get('entities', [])

        # Classify entities
        grouped = {
            "PERSON": [],
            "LOCATION": [],
            "ORGANIZATION": [],
            "DATE": []
        }

        for ent in entities:
            entity = ent if isinstance(ent, dict) else {}
            text = entity.get("Text")
            typ = entity.get("Type")
            if text and typ and typ in grouped:
                if text not in grouped[typ]:
                    grouped[typ].append(text)

        # Lookup department from jobpostingmetadata using jobId
        job_id = resume_data.get("jobId")
        department = None

        if job_id:
            try:
                job_id_cleaned = str(job_id).strip()
                print(f"Fetching job metadata for jobId: '{job_id_cleaned}'")

                job_response = dynamodb.get_item(
                    TableName=job_table,
                    Key={'job_id': {'S': job_id_cleaned}}
                )

                job_item = job_response.get('Item')
                print("Raw job_item from DynamoDB:", job_item)

                if job_item:
                    job_data = {k: deserializer.deserialize(v) for k, v in job_item.items()}
                    department = job_data.get('department')
            except Exception as e:
                print(f"Failed to get job metadata for jobId {job_id}: {str(e)}")

        results.append({
            "resume_id": resume_data.get("resume_id"),
            "email": resume_data.get("email"),
            "first_name": resume_data.get("first_name"),
            "last_name": resume_data.get("last_name"),
            "gender": resume_data.get("gender"),
            "marks12": resume_data.get("marks12"),
            "pass12": resume_data.get("pass12"),
            "phone": resume_data.get("phone"),
            "grad_marks": resume_data.get("grad_marks"),
            "grad_year": resume_data.get("grad_year"),
            "skills": resume_data.get("skills"),
            "linkedin": resume_data.get("linkedin"),
            "status": resume_data.get("status"),
            "work_pref": resume_data.get("work_pref"),
            "resume_url": resume_data.get("resume_url"),
            "address": resume_data.get("address"),
            "jobId": job_id,
            "department": department,
            "entities": grouped,
        })
    print("jobId in resume_data:", resume_data.get("jobId"), "type:", type(resume_data.get("jobId")))


    return {
        "statusCode": 200,
        "body": json.dumps(results),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }
