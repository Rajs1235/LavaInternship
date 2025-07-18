import json
import boto3
import os
import jwt
import time
from datetime import datetime, timedelta, timezone
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# --- Configuration from Environment Variables ---
SENDER_EMAIL = os.environ.get('SENDER_EMAIL')
SMTP_HOST = os.environ.get('SMTP_HOST')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USER = os.environ.get('SMTP_USER')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD')

JWT_SECRET_ARN = os.environ.get('JWT_SECRET_ARN')
TOKEN_TABLE_NAME = os.environ.get('TOKEN_TABLE_NAME')
FRONTEND_REVIEW_URL = os.environ.get('FRONTEND_REVIEW_URL')

# --- Initialize AWS Clients ---
dynamodb_client = boto3.client('dynamodb')
secrets_manager_client = boto3.client('secretsmanager')

def get_jwt_secret():
    """
    Fetches the JWT secret from AWS Secrets Manager and caches it globally.
    """
    if 'jwt_secret' not in globals():
        print("Fetching JWT secret from Secrets Manager...")
        secret_value = secrets_manager_client.get_secret_value(SecretId=JWT_SECRET_ARN)
        globals()['jwt_secret'] = secret_value['SecretString']
    return globals()['jwt_secret']

def lambda_handler(event, context):
    headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
    }

    try:
        body = json.loads(event['body'])
        resume_id = body.get('resume_id')
        reviewer_email = body.get('reviewer_email')
        cc_emails = body.get('cc_emails', [])  # Expect a list of CC emails
        candidate_name = body.get('candidate_name')
        department = body.get('department')

        if not all([resume_id, reviewer_email, candidate_name, department]):
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'message': 'Missing required fields.'})}

        # 1. Generate a secure, time-limited JWT
        jwt_secret = get_jwt_secret()
        expiration_time = datetime.now(timezone.utc) + timedelta(days=10)
        
        payload = {
            'resume_id': resume_id,
            'reviewer_email': reviewer_email,
            'exp': int(expiration_time.timestamp())
        }
        
        token = jwt.encode(payload, jwt_secret, algorithm='HS256')

        # 2. Store the token for one-time use validation
        ttl_timestamp = int(expiration_time.timestamp())
        dynamodb_client.put_item(
            TableName=TOKEN_TABLE_NAME,
            Item={
                'token': {'S': token},
                'resume_id': {'S': resume_id},
                'status': {'S': 'pending'},
                'ttl': {'N': str(ttl_timestamp)}
            }
        )
        
        # 3. Construct the secure review link
        review_link = f"{FRONTEND_REVIEW_URL}?token={token}"

        # 4. Send the email using smtplib
        print(f"Preparing to send email to {reviewer_email} and CC {cc_emails}...")
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"Review Requested for Candidate: {candidate_name}"
        msg['From'] = SENDER_EMAIL
        msg['To'] = reviewer_email
        if cc_emails:
            msg['Cc'] = ", ".join(cc_emails) # Add CC header if emails are present

        html_body = f"""
        <html>
        <head></head>
        <body style="font-family: sans-serif;">
            <h2>Candidate Review Request</h2>
            <p>Hello,</p>
            <p>You have been asked to review the profile for <strong>{candidate_name}</strong> for a position in the {department} department.</p>
            <p>Please use the secure link below to access the candidate's details. This link is valid for 10 days and can only be used once.</p>
            <p style="margin: 25px 0;">
                <a href="{review_link}" style="background-color: #264143; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Candidate Profile</a>
            </p>
            <p>If you did not expect this, please disregard this email.</p>
            <p>Thank you,<br>HR Department</p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        
        # Combine all recipients for the sendmail function
        all_recipients = [reviewer_email] + cc_emails
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SENDER_EMAIL, all_recipients, msg.as_string())
        
        print(f"Email successfully sent to {all_recipients}.")

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': f'Review link sent successfully to {", ".join(all_recipients)}.'})
        }

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': 'An internal server error occurred.'})
        }