import json
import boto3
import os
import requests # You will need to include this library in your deployment package

# Initialize the SES client
ses_client = boto3.client('ses', region_name='ap-south-1')

# The API endpoint to get all candidates
CANDIDATE_API_URL = "https://k2kqvumlg6.execute-api.ap-south-1.amazonaws.com/getResume"

# The verified email address in SES
SENDER_EMAIL = "hr@your-company.com" # <-- IMPORTANT: Replace with your verified SES email

def lambda_handler(event, context):
    try:
        # Load the job details from the event body sent by the frontend
        job_details = json.loads(event.get('body', '{}'))
        
        # --- 1. Fetch all candidates ---
        response = requests.get(CANDIDATE_API_URL)
        response.raise_for_status() # Raise an exception for bad status codes
        candidates = response.json()
        
        if not candidates:
            print("No candidates found. No emails will be sent.")
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'Job posted, but no candidates to notify.'})
            }

        # --- 2. Construct and send emails ---
        email_subject = f"New Job Opening: {job_details.get('jobTitle', 'New Role')}"
        
        for candidate in candidates:
            recipient_email = candidate.get('email')
            if not recipient_email:
                continue # Skip if the candidate has no email

            # Construct the HTML body of the email
            html_body = f"""
            <html>
            <head></head>
            <body>
              <h1>New Job Opportunity: {job_details.get('jobTitle')}</h1>
              <p>Hello {candidate.get('first_name', 'Candidate')},</p>
              <p>A new job has been posted that might match your skills and experience. Please review the details below.</p>
              
              <h3>{job_details.get('jobTitle')}</h3>
              <p><b>Department:</b> {job_details.get('department')}</p>
              <p><b>Location:</b> {job_details.get('location')}</p>
              
              <h4>Job Description</h4>
              <p>{job_details.get('jobDescription')}</p>
              
              <h4>Key Responsibilities</h4>
              <ul>
                {''.join([f"<li>{r}</li>" for r in job_details.get('responsibilities', [])])}
              </ul>

              <h4>Required Skills</h4>
              <p>{', '.join(job_details.get('skills', []))}</p>

              <p>If you are interested, please apply through our careers portal:</p>
              <a href="[YOUR_AMPLIFY_APP_URL]/studentform">Apply Now</a>
              
              <p>Best regards,<br>The Hiring Team</p>
            </body>
            </html>
            """
            
            # Send the email using SES
            ses_client.send_email(
                Source=SENDER_EMAIL,
                Destination={'ToAddresses': [recipient_email]},
                Message={
                    'Subject': {'Data': email_subject},
                    'Body': {'Html': {'Data': html_body}}
                }
            )
            
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': f'Successfully sent notifications to {len(candidates)} candidates.'})
        }

    except requests.exceptions.RequestException as e:
        print(f"Error fetching candidates: {e}")
        return {'statusCode': 502, 'body': json.dumps({'message': 'Failed to fetch candidate data.'})}
    except Exception as e:
        print(f"Error: {e}")
        return {'statusCode': 500, 'body': json.dumps({'message': str(e)})}