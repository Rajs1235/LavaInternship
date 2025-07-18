import json
import boto3
import os
from boto3.dynamodb.types import TypeDeserializer

deserializer = TypeDeserializer()
dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):  
    resume_table = os.environ.get("DDB1_NAME")  # Resume metadata table
    job_table = os.environ.get("DDB2_NAME")     # Job posting metadata table

    # Fetch all resumes
    response = dynamodb.scan(TableName=resume_table)
    results = []

    for item in response.get('Items', []):
        resume_data = {k: deserializer.deserialize(v) for k, v in item.items()}
        entities = resume_data.get('entities', [])
        resume_skills = resume_data.get("skills", [])

        # Normalize resume skills (to lowercase for matching)
        resume_skills_set = set([s.lower() for s in resume_skills if isinstance(s, str)])

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

        # Job data fetch
        job_id = resume_data.get("jobId")
        department = None
        job_skills = []

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
                    job_skills = job_data.get('skills', [])
            except Exception as e:
                print(f"Failed to get job metadata for jobId {job_id}: {str(e)}")

        # Normalize job skills
        job_skills_set = set([s.lower() for s in job_skills if isinstance(s, str)])

        # Skill match logic
        matched_skills = list(resume_skills_set & job_skills_set)
        match_percentage = (len(matched_skills) / len(job_skills_set)) * 100 if job_skills_set else 0

        # Append result
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
            "skills": list(resume_skills_set),
            "matched_skills": matched_skills,
            "match_percentage": round(match_percentage, 2),
            "linkedin": resume_data.get("linkedin"),
            "status": resume_data.get("status"),
            "work_pref": resume_data.get("work_pref"),
            "resume_url": resume_data.get("resume_url"),
            "address": resume_data.get("address"),
            "datetime": resume_data.get("datetime"),
            "jobId": job_id,
            "experience": resume_data.get("experience"),
            "department": department,
            "entities": grouped,
        })

    return {
        "statusCode": 200,
        "body": json.dumps(results),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }