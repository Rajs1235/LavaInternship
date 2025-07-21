import json
import boto3
import smtplib
import os
from email.message import EmailMessage

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get("DDB_NAME")
table = dynamodb.Table(table_name)

# --- Configuration ---
APTITUDE_QUIZ_LINK = "https://forms.office.com/r/ZR3zEC9Hqt"

def send_email(to_email, subject, plain_body, html_body):
    """Sends a professional HTML email with a plain text fallback."""
    sender_email = os.environ.get("SENDER_EMAIL")
    sender_password = os.environ.get("APP_PASS")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email
    msg.set_content(plain_body)
    msg.add_alternative(html_body, subtype='html')

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        print(f"Email sent successfully to {to_email}")
    except Exception as e:
        print(f"Error sending email to {to_email}: {e}")
        
def lambda_handler(event, context):
    try:
        print("EVENT RECEIVED:", json.dumps(event))
        body = json.loads(event.get("body", "{}"))

        resume_id = body.get('resume_id')
        new_status = body.get('status')
        
        if not all([resume_id, new_status]):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps("Missing required fields: resume_id and status are required.")
            }

        # 1. Fetch the full candidate record to get all necessary details
        response = table.get_item(Key={'resume_id': resume_id})
        candidate = response.get('Item')

        if not candidate:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(f"Candidate with resume_id {resume_id} not found.")
            }
        
        email = candidate.get('email')
        first_name = candidate.get('first_name')
        experience = candidate.get('experience')

        if not all([email, first_name]):
             return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps("Candidate record is missing email or first_name.")
            }

        # 2. Update the candidate's status in DynamoDB
        table.update_item(
            Key={'resume_id': resume_id},
            UpdateExpression='SET #s = :val',
            ExpressionAttributeNames={'#s': 'status'},
            ExpressionAttributeValues={':val': new_status}
        )
        print(f"Successfully updated status for {resume_id} to {new_status}")

        # 3. Determine which email to send based on the new status and experience
        subject = ""
        plain_text_body = ""
        html_body = ""

        email_template_wrapper = """
        <html><body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                {content}
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.9em; color: #777;">Best regards,<br><strong>The HR Team</strong></p>
            </div>
        </body></html>
        """

        if new_status == "Advanced by HOD":
            # --- NEW CONDITIONAL LOGIC ---
            if experience == "0-1 Year":
                subject = "Next Step in Your Application: Aptitude Quiz"
                plain_text_body = f"Hi {first_name},\n\nCongratulations! You have been advanced to the next stage. The next step is to complete a short aptitude quiz. Please use this link: {APTITUDE_QUIZ_LINK}\n\nWe wish you the best of luck!\n\nRegards,\nHR Team"
                html_content = f"""
                    <h2 style="color: #264143;">Congratulations, {first_name}!</h2>
                    <p>Your profile has been reviewed and you have been advanced to the next stage of our hiring process.</p>
                    <p>The next step is to complete a short aptitude quiz. Please click the button below to access it:</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="{APTITUDE_QUIZ_LINK}" style="background-color: #0078d4; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Aptitude Quiz</a>
                    </p>
                    <p>Please complete the quiz at your earliest convenience. We wish you the best of luck!</p>
                """
                html_body = email_template_wrapper.format(content=html_content)
            else: # For experienced candidates
                subject = "An Update on Your Application"
                plain_text_body = f"Hi {first_name},\n\nCongratulations! Your profile has been reviewed and advanced. Our recruitment team will be in touch with you shortly regarding the next steps in the process.\n\nBest regards,\nHR Team"
                html_content = f"""
                    <h2 style="color: #264143;">Congratulations, {first_name}!</h2>
                    <p>We are pleased to inform you that after a successful review, your application has been advanced to the next stage.</p>
                    <p><strong>What's Next?</strong></p>
                    <p>Our recruitment team will be in contact with you soon to discuss the next steps in the hiring process.</p>
                    <p>Thank you for your continued interest.</p>
                """
                html_body = email_template_wrapper.format(content=html_content)

        elif new_status == "Advanced for Interview":
            subject = "Update: You've Been Selected for an Interview!"
            plain_text_body = f"Hi {first_name},\n\nGreat news! We would like to invite you for an interview. Our recruitment team will be in touch with you shortly via a separate email to coordinate the date and time.\n\nCongratulations, and we look forward to speaking with you soon.\n\nBest regards,\nHR Team"
            html_content = f"""
                <h2 style="color: #264143;">Great News, {first_name}!</h2>
                <p>After carefully reviewing your application, we are delighted to inform you that you have been selected to move forward to the interview stage.</p>
                <p><strong>What's Next?</strong></p>
                <p>Our recruitment team will be in contact with you very soon in a separate email to schedule your interview and provide all the necessary details.</p>
                <p>Congratulations on reaching this important milestone. We look forward to speaking with you!</p>
            """
            html_body = email_template_wrapper.format(content=html_content)
        
        elif new_status == "Rejected":
            subject = "An Update on Your Application"
            plain_text_body = f"Hi {first_name},\n\nThank you for your interest and for taking the time to apply. After careful consideration, we have decided not to move forward with your application at this time. We encourage you to apply for other roles in the future and wish you the best of luck in your job search.\n\nRegards,\nHR Team"
            html_content = f"""
                <h2 style="color: #264143;">An Update on Your Application</h2>
                <p>Hi {first_name},</p>
                <p>Thank you for your interest and for taking the time to apply with us. We received a large number of qualified applications, and after careful consideration, we have decided not to move forward with your candidacy for this role at this time.</p>
                <p>This decision is not a reflection on your skills or qualifications. We encourage you to keep an eye on our careers page for future openings that may be a better fit.</p>
                <p>We wish you the very best of luck in your job search.</p>
            """
            html_body = email_template_wrapper.format(content=html_content)

        else: # Generic catch-all for other statuses
            subject = f"Update on Your Application Status: {new_status}"
            plain_text_body = f"Hi {first_name},\n\nThis is an update regarding your application. Your status has been changed to: {new_status}.\n\nRegards,\nHR Team"
            html_content = f"""
                <h2 style="color: #264143;">Application Status Update</h2>
                <p>Hi {first_name},</p>
                <p>This is a notification to let you know that the status of your application has been updated to: <strong>{new_status}</strong>.</p>
            """
            html_body = email_template_wrapper.format(content=html_content)
        
        # 4. Send the appropriate email
        send_email(email, subject, plain_text_body, html_body)

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps('Status updated and email sent successfully')
        }

    except Exception as e:
        print("Exception:", str(e))
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(f"Internal server error: {str(e)}")
        }
