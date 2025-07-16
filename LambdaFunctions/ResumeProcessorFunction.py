import boto3
import json
import urllib.parse
import uuid
import os
from boto3.dynamodb.conditions import Attr

# AWS clients
s3 = boto3.client('s3')
textract = boto3.client('textract')
comprehend = boto3.client('comprehend')
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

TABLE_NAME = os.environ.get("TABLE_NAME")
HR_TOPIC_ARN = os.environ.get("HR_TOPIC_ARN")

table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    # 1. Extract S3 bucket and key
    try:
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'])
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps(f"Error parsing S3 event: {str(e)}")
        }

    if not key.lower().endswith(".pdf"):
        return {
            'statusCode': 400,
            'body': json.dumps("Unsupported file format (only PDF supported).")
        }

    # 2. Extract text using OCR
    try:
        response = textract.detect_document_text(
            Document={'S3Object': {'Bucket': bucket, 'Name': key}}
        )
    except textract.exceptions.UnsupportedDocumentException:
        return {
            'statusCode': 400,
            'body': json.dumps("Unsupported document format for Textract.")
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Textract error: {str(e)}")
        }

    extracted_text = ' '.join(
        [item["Text"] for item in response["Blocks"] if item["BlockType"] == "LINE"]
    ).strip()

    if not extracted_text:
        return {
            'statusCode': 400,
            'body': json.dumps("No readable text found in document.")
        }

    # 3. Detect language and extract entities
    try:
        lang_response = comprehend.detect_dominant_language(Text=extracted_text)
        dominant_lang = lang_response['Languages'][0]['LanguageCode'] if lang_response['Languages'] else 'en'

        entities = comprehend.detect_entities(Text=extracted_text, LanguageCode=dominant_lang).get('Entities', [])
        key_phrases = comprehend.detect_key_phrases(Text=extracted_text, LanguageCode=dominant_lang).get('KeyPhrases', [])

        extracted_entities = [{"Text": ent["Text"], "Type": ent["Type"]}
                              for ent in entities if ent["Type"] in ["PERSON", "ORGANIZATION", "DATE", "LOCATION"]]
        extracted_skills = [phrase["Text"] for phrase in key_phrases if len(phrase["Text"].split()) <= 3]
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Comprehend error: {str(e)}")
        }

    # 4. Lookup candidate by matching filename
    try:
        scan_response = table.scan(
            FilterExpression=Attr("filename").eq(key)
        )
        candidate = scan_response['Items'][0] if scan_response['Items'] else None

        if not candidate:
            return {
                'statusCode': 404,
                'body': json.dumps("Candidate record not found for this resume.")
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"DynamoDB lookup error: {str(e)}")
        }

    # 5. Update DynamoDB item
    try:
        table.update_item(
            Key={"resume_id": candidate["resume_id"]},
            UpdateExpression="SET extracted_text=:t, entities=:e, skills=:s, #s=:status",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={
                ":t": extracted_text,
                ":e": extracted_entities,
                ":s": extracted_skills,
                ":status": "Under Review"
            }
        )
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error updating DynamoDB item: {str(e)}")
        }

    # 6. Notify HR via SNS
    try:
        if HR_TOPIC_ARN:
            candidate_name = f"{candidate.get('first_name', '')} {candidate.get('last_name', '')}".strip()
            candidate_email = candidate.get('email', 'N/A')
            education_orgs = [ent['Text'] for ent in extracted_entities if ent['Type'] == 'ORGANIZATION']

            message = (
                f"📄 *New Resume Processed*\n"
                f"👤 Candidate: {candidate_name}\n"
                f"📧 Email: {candidate_email}\n"
                f"📎 Resume Key: {key}\n\n"
                f"🧠 Extracted Skills:\n- " + "\n- ".join(extracted_skills or ["None Found"]) + "\n\n"
                f"🎓 Educational Details:\n- " + ("\n- ".join(education_orgs) if education_orgs else "Not Found")
            )

            sns.publish(
                TopicArn=HR_TOPIC_ARN,
                Subject="New Resume Processed",
                Message=message
            )
    except Exception as e:
        print(f"Failed to send SNS notification: {str(e)}")

    return {
        'statusCode': 200,
        'body': json.dumps("Resume processed and HR notified.")
    }
