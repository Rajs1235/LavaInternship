import json
import boto3
import os
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from decimal import Decimal
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# --- Configuration from Environment Variables ---
JOB_POSTING_TABLE = os.environ.get('JOB_POSTING_TABLE')
RESUME_TABLE = os.environ.get('RESUME_TABLE')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL')
SMTP_HOST = os.environ.get('SMTP_HOST')
SMTP_PORT = int(os.environ.get('SMTP_PORT'))
SMTP_USER = os.environ.get('SMTP_USER')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD')
JOB_LISTINGS_URL = os.environ.get('JOB_LISTINGS_URL')

# --- Initialize AWS Clients ---
dynamodb = boto3.resource('dynamodb')

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return int(o) if o % 1 == 0 else float(o)
        return super(DecimalEncoder, self).default(o)

def parse_candidate_datetime(date_str):
    if not date_str:
        return None
    try:
        date_part = date_str.split(',')[0].strip()
        return datetime.strptime(date_part, '%d/%m/%Y')
    except (ValueError, IndexError) as e:
        print(f"Warning: Could not parse date string: '{date_str}'. Error: {e}")
        return None

# --- NEW HELPER FUNCTION TO FORMAT SALARY ---
def format_salary(min_s, max_s, currency):
    if not min_s or not max_s:
        return "Not Disclosed"

    def format_number(num):
        try:
            num = int(num)
            if num >= 10000000:
                return f'{(num / 10000000):.1f} Cr'
            if num >= 100000:
                return f'{(num / 100000):.1f} L'
            if num >= 1000:
                return f'{(num / 1000):.1f} K'
            return str(num)
        except (ValueError, TypeError):
            return ""

    symbols = {'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£'}
    symbol = symbols.get(currency, '')
    
    formatted_min = format_number(min_s)
    formatted_max = format_number(max_s)

    return f'{symbol}{formatted_min} - {symbol}{formatted_max}'

def send_recommendation_email(to_address, candidate_name, jobs):
    """Constructs and sends the daily job recommendation email with enhanced details."""
    msg = MIMEMultipart('alternative')
    msg['Subject'] = "New Job Opportunities You Might Be Interested In"
    msg['From'] = SENDER_EMAIL
    msg['To'] = to_address

    # --- UPDATED EMAIL HTML GENERATION ---
    job_list_html = ""
    for job in jobs:
        salary_str = format_salary(job.get('minSalary'), job.get('maxSalary'), job.get('currency'))
        positions_str = f"{job.get('positionsAvailable', '1')} position(s)"

        job_list_html += f"""
        <div style="border-bottom: 1px solid #eeeeee; padding-bottom: 15px; margin-bottom: 15px;">
            <h3 style="margin: 0; font-size: 18px; color: #333;">{job.get('jobTitle', 'N/A')}</h3>
            <p style="margin: 5px 0; color: #555;">
                {job.get('department', 'N/A')} | {job.get('location', 'N/A')}
            </p>
            <div style="margin-top: 10px; font-size: 14px; color: #666;">
                <span style="margin-right: 15px; white-space: nowrap;">💼 {job.get('workType', '')} • {job.get('workMode', '')}</span>
                <span style="margin-right: 15px; white-space: nowrap; font-weight: bold; color: #2E8B57;">{salary_str}</span>
                <span style="white-space: nowrap;">👥 {positions_str}</span>
            </div>
        </div>
        """

    html_body = f"""
    <html><body style="font-family: sans-serif; color: #333;">
        <h2>Hi {candidate_name},</h2>
        <p>Based on your previous applications, we found some new job openings that might be a great fit for you:</p>
        <div style="border: 1px solid #dddddd; border-radius: 8px; padding: 15px; margin: 20px 0;">{job_list_html}</div>
        <p>To view more details and apply, please visit our careers page:</p>
        <p style="margin: 25px 0;"><a href="{JOB_LISTINGS_URL}" style="background-color: #264143; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View All Jobs</a></p>
        <p>Best regards,<br>The HR Team</p>
    </body></html>
    """
    
    msg.attach(MIMEText(html_body, 'html'))
    
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SENDER_EMAIL, [to_address], msg.as_string())
        print(f"Successfully sent email to {to_address}")
    except Exception as e:
        print(f"Failed to send email to {to_address}. Error: {e}")

def lambda_handler(event, context):
    print("Starting daily job recommendation process...")
    job_table = dynamodb.Table(JOB_POSTING_TABLE)
    yesterday_utc = datetime.now(timezone.utc) - timedelta(days=1)
    
    try:
        response = job_table.scan()
        all_jobs = response.get('Items', [])
        new_jobs = [job for job in all_jobs if job.get('postedDate') and datetime.fromisoformat(job['postedDate'].replace('Z', '+00:00')) > yesterday_utc]
        if not new_jobs:
            print("No new jobs posted in the last 24 hours. Exiting.")
            return {'statusCode': 200, 'body': json.dumps('No new jobs.')}
        print(f"Found {len(new_jobs)} new jobs.")
        jobs_by_department = defaultdict(list)
        for job in new_jobs:
            if job.get('department'):
                jobs_by_department[job['department']].append(job)
    except Exception as e:
        print(f"Error fetching new jobs: {e}")
        return {'statusCode': 500, 'body': json.dumps(f"Error fetching jobs: {e}")}

    resume_table = dynamodb.Table(RESUME_TABLE)
    candidate_interests = defaultdict(lambda: {'departments': set(), 'name': '', 'last_applied': None})
    
    try:
        response = resume_table.scan(ProjectionExpression="email, jobId, first_name, #dt", ExpressionAttributeNames={"#dt": "datetime"})
        candidates = response.get('Items', [])
        for candidate in candidates:
            email = candidate.get('email')
            job_id = candidate.get('jobId')
            application_date = parse_candidate_datetime(candidate.get('datetime'))
            department = None
            if job_id and '-' in job_id:
                department = job_id.split('-')[0].capitalize()
            if email and department and application_date:
                candidate_interests[email]['departments'].add(department)
                if not candidate_interests[email]['name']:
                     candidate_interests[email]['name'] = candidate.get('first_name', 'there')
                if not candidate_interests[email]['last_applied'] or application_date > candidate_interests[email]['last_applied']:
                    candidate_interests[email]['last_applied'] = application_date
    except Exception as e:
        print(f"Error fetching candidates: {e}")
        return {'statusCode': 500, 'body': json.dumps(f"Error fetching candidates: {e}")}

    one_year_ago_date = (datetime.now() - timedelta(days=365)).date()
    active_candidates = {}
    for email, info in candidate_interests.items():
        if info['last_applied'] and info['last_applied'].date() >= one_year_ago_date:
            active_candidates[email] = info
    
    print(f"Found {len(active_candidates)} active candidates (applied in the last year).")

    emails_to_send = defaultdict(list)
    for email, info in active_candidates.items():
        for department in info['departments']:
            if department.lower() in (d.lower() for d in jobs_by_department.keys()):
                actual_dept_key = next((d for d in jobs_by_department if d.lower() == department.lower()), None)
                if actual_dept_key:
                    for job in jobs_by_department[actual_dept_key]:
                        if job not in emails_to_send[email]:
                            emails_to_send[email].append(job)

    if not emails_to_send:
        print("No active candidates matched with new jobs. Exiting.")
        return {'statusCode': 200, 'body': json.dumps('No matches found.')}

    print(f"Preparing to send {len(emails_to_send)} recommendation emails...")
    for email, jobs in emails_to_send.items():
        candidate_name = active_candidates[email]['name']
        send_recommendation_email(email, candidate_name, jobs)

    print("Daily job recommendation process finished.")
    return {
        'statusCode': 200,
        'body': json.dumps(f'Successfully processed and sent {len(emails_to_send)} emails.')
    }
