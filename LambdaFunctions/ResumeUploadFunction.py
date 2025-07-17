import json
import boto3
import os
import datetime # Make sure datetime is imported
import uuid
import smtplib
from email.message import EmailMessage

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

BUCKET_NAME = os.environ.get("BUCKET_NAME")
TABLE_NAME = os.environ.get("DDB_TABLE")

SMTP_EMAIL = os.environ.get("SMTP_EMAIL")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))

def send_email(to_address, subject, body):
    msg = EmailMessage()
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_address
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)

def lambda_handler(event, context):
    try:
        body = json.loads(event["body"])
    except Exception:
        return {"statusCode": 400, "body": json.dumps({"error": "Invalid JSON in request body"})}

    # Required fields
    required_fields = ["name", "email", "contact", "pass12", "gradYear", "gradMarks", "gender", "workPref", "address", "resume"]
    missing_fields = [field for field in required_fields if not body.get(field)]

    if missing_fields:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": f"Missing required fields: {', '.join(missing_fields)}"})
        }

    # Optional fields
    marks12 = body.get("marks12") or None
    linkedin = body.get("linkedIn") or None

    # Job Details
    job_id = body.get("jobId") or "Unknown"
    job_title = body.get("jobTitle") or "Untitled Job"

    # Extract form fields
    name = body["name"]
    email = body["email"]
    phone = body["contact"]
    pass12 = body["pass12"]
    grad_year = body["gradYear"]
    grad_marks = body["gradMarks"]
    gender = body["gender"]
    work_pref = body["workPref"]
    address = body["address"]
    resume_filename = body["resume"]
    
    # FIX 1: Use .get() for safety and rename the variable to avoid shadowing
    submission_timestamp = body.get("submittedAt") 

    first_name, *rest = name.strip().split()
    last_name = " ".join(rest) if rest else ""

    # FIX 2: Use the imported datetime module, not the variable
    s3_key = f"uploads/{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{resume_filename}"
    resume_id = str(uuid.uuid4())

    # Generate presigned PUT URL
    try:
        presigned_upload_url = s3.generate_presigned_url(
            'put_object',
            Params={"Bucket": BUCKET_NAME, "Key": s3_key},
            ExpiresIn=300
        )
    except Exception:
        return {"statusCode": 500, "body": json.dumps({"error": "Failed to generate upload URL"})}

    # Generate presigned GET URL
    try:
        presigned_download_url = s3.generate_presigned_url(
            'get_object',
            Params={"Bucket": BUCKET_NAME, "Key": s3_key},
            ExpiresIn=7 * 24 * 3600
        )
    except Exception:
        return {"statusCode": 500, "body": json.dumps({"error": "Failed to generate download URL"})}

    # Store metadata
    table = dynamodb.Table(TABLE_NAME)
    try:
        item_to_store = {
            "resume_id": resume_id,
            "filename": s3_key,
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone": phone,
            "pass12": pass12,
            "grad_year": grad_year,
            "marks12": marks12,
            "grad_marks": grad_marks,
            "gender": gender,
            "work_pref": work_pref,
            "linkedin": linkedin,
            "status": "Uploaded",
            "address": address,
            "resume_url": presigned_download_url,
            "jobId": job_id,            
            "jobTitle": job_title,
            # FIX 3: Store the renamed variable
            "datetime": submission_timestamp 
        }
        # Remove keys with None values so they aren't stored in DynamoDB
        item_to_store = {k: v for k, v in item_to_store.items() if v is not None}
        
        table.put_item(Item=item_to_store)
        
    except Exception as e:
        print(f"Error storing metadata: {e}")
        return {"statusCode": 500, "body": json.dumps({"error": "Failed to store metadata"})}

    # Send confirmation email
    try:
        send_email(
            to_address=email,
            subject="Resume Upload Confirmation",
            body=f"Hi {first_name},\n\nYour resume has been uploaded successfully.\n\nRegards,\nHR Team"
        )
    except Exception as e:
        print("Email error:", e)

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({
            "upload_url": presigned_upload_url,
            "s3_key": s3_key,
            "resume_url": presigned_download_url
        })
    }
