import json
import boto3
import smtplib
import os
from email.message import EmailMessage

# Load table correctly
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get("DDB_NAME")
table = dynamodb.Table(table_name)

def send_email(to_email, subject, body):
    sender_email = os.environ.get("SENDER_EMAIL")
    sender_password = os.environ.get("APP_PASS")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email
    msg.set_content(body)

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
    except Exception as e:
        print("Error sending email:", e)

def lambda_handler(event, context):
    try:
        print("EVENT RECEIVED:", json.dumps(event))  # Debug log

        body = json.loads(event.get("body", "{}"))

        resume_id = body.get('resume_id')
        new_status = body.get('status')
        email = body.get('email')
        first_name = body.get('first_name')

        if not (resume_id and new_status and email and first_name):
            return {
                'statusCode': 400,
                'body': json.dumps("Missing required fields")
            }

        # Update DynamoDB
        table.update_item(
            Key={'resume_id': resume_id},
            UpdateExpression='SET #s = :val',
            ExpressionAttributeNames={'#s': 'status'},
            ExpressionAttributeValues={':val': new_status}
        )

        # Send email
        subject = f"Application Status: {new_status}"
        message_body = f"Hi {first_name},\n\nYour application has been {new_status.lower()}.\n\nRegards,\nHR Team"
        send_email(email, subject, message_body)

        return {
            'statusCode': 200,
            'body': json.dumps('Status updated and email sent successfully')
        }

    except Exception as e:
        print("Exception:", str(e))  # Add debug log
        return {
            'statusCode': 500,
            'body': json.dumps(f"Internal server error: {str(e)}")
        }
