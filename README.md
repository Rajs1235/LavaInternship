# Resume Portal

## Overview

Resume Portal is a web-based application designed to streamline the resume submission and review process for candidates and HR professionals. The system leverages AWS services to automate resume analysis, storage, and notifications, providing a seamless experience for both candidates and HR users.

## Team

- [Deepanshu Sharma](https://www.linkedin.com/in/deepanshu-sharma-2078532ab/)
- [Raj Srivastava](https://www.linkedin.com/in/raj-srivastava-a680482b4/) ([GitHub](https://github.com/Rajs1235))
- [Mayank Pant](https://www.linkedin.com/in/mayank04pant/) ([GitHub](https://github.com/obiwan04kanobi))


## Features

### Candidate Features
- **Resume Submission**: Candidates can upload their resumes in PDF format via a user-friendly form.
- **Validation**: The form validates fields such as name, email, contact number, LinkedIn profile URL, and resume file size/type.
- **Instant Feedback**: Candidates receive confirmation emails upon successful resume upload.

### HR Features
- **Dashboard**: HR professionals can view, manage, and process candidate applications.
- **Resume Analysis**: Resumes are analyzed using AWS Textract and Comprehend to extract metadata and insights.
- **Notifications**: HR users receive email notifications when new resumes are uploaded.

### AWS Integration
- **AWS S3**: Stores uploaded resumes securely.
- **AWS SNS**: Sends notifications to HR users.
- **AWS Textract**: Extracts text and metadata from resumes.
- **AWS Comprehend**: Analyzes extracted text for insights.
- **AWS Cognito**: Provides HR Portal authentication and authorization for secure access.
- **API Gateway**: Exposes HTTP APIs for frontend-backend communication.
- **AWS Lambda**: Executes backend logic for resume uploading, extraction from DynamoDB for APIs, processing, and notifications.
- **AWS Amplify**: Manages frontend hosting, CI/CD, and integrates AWS services.
- **AWS DynamoDB**: Stores candidate information, resume metadata, and analysis results for efficient querying and management.

## Architecture

The system is deployed in the **ap-south-1 (Mumbai)** region and consists of the following components:

1. **Frontend**:
    - Built with React and TailwindCSS.
    - Hosted and managed by AWS Amplify for CI/CD and seamless integration with AWS services.
    - Provides interfaces for candidates and HR users.
    - Communicates with backend APIs via API Gateway for resume submission, authentication (using AWS Cognito), and application management.

2. **Backend**:
    - **API Gateway**: Serves as the entry point for all frontend requests, routing them to appropriate Lambda functions.
    - **AWS Lambda Functions**:
      - **ResumeUpload Lambda**: Handles resume upload logic, validates and saves form details, and uploads the resume to S3.
      - **ResumeProcess Lambda**: Processes resumes using AWS Textract and Comprehend, saves analyzed data to DynamoDB, and triggers notifications via SNS.
      - Additional Lambdas may handle data extraction from DynamoDB for API responses and other backend processes.

3. **AWS Services**:
    - **S3 Bucket**: Securely stores uploaded resumes.
    - **DynamoDB**: Stores candidate information, resume metadata, and analysis results for efficient querying and management.
    - **SNS Topic**: Sends notifications to HR users when new resumes are uploaded or processed.
    - **Textract**: Extracts text and metadata from resumes.
    - **Comprehend**: Analyzes extracted text for insights and relevant information.
    - **Cognito**: Manages authentication and authorization for HR Portal access.

4. **Integration & Hosting**:
    - **AWS Amplify**: Provides frontend hosting, manages CI/CD pipelines, and integrates with backend AWS services for a unified development and deployment experience.

This architecture ensures secure, scalable, and efficient handling of resume submissions, processing, and notifications for both candidates and HR professionals.

## AWS Backend Architecture

![aws backend architecture](/screenshots/ai-resume-screener.png)

## Screenshots

![aws backend architecture](/screenshots/home.png)
-----
![aws backend architecture](/screenshots/Cognito-Signup-login.png)
----- 
![aws backend architecture](/screenshots/dashboard-home.png)
----- 
![aws backend architecture](/screenshots/candidate-dashboard-view.png)
----- 
![aws backend architecture](/screenshots/resume-upload-form.png)
----- 


## Installation

### Prerequisites
- Node.js and npm installed.
- AWS account with necessary permissions.
- Amplify CLI installed.

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/obiwan04kanobi/LavaInternship.git
   cd LavaInternship
    ```

2. Install dependencies:
   ```bash
    npm install
    ```

3. Configure AWS Amplify:
   ```bash
    amplify init
    amplify push
    ```

4. Start the development server:
   ```bash
    npm run dev
    ```

## Deployment

The project is deployed using AWS Amplify Hosting. To deploy:

1. Run the build command:
   ```bash
    npm run build
    ```

2. Push changes to Amplify Hosting:
   ```bash
    amplify publish
    ```

## Usage
### Candidate Workflow

1. Navigate to the homepage.
2. Toggle the switch to "Candidate" mode.
3. Fill out the resume submission form and upload the resume.
4. Receive a confirmation email upon successful submission.

### HR Workflow
1. Navigate to the homepage.
2. Toggle the switch to "HR" mode.
3. Log in using AWS Cognito.
4. Access the dashboard to view and manage 
applications.

## Contributing
Contributions are not being accepted for this project at this time.

## Contact

For questions or support, please connect with any of us:

- [Deepanshu Sharma](https://www.linkedin.com/in/deepanshu-sharma-2078532ab/)
- [Raj Srivastava](https://www.linkedin.com/in/raj-srivastava-a680482b4/) ([GitHub](https://github.com/Rajs1235))
- [Mayank Pant](https://www.linkedin.com/in/mayank04pant/) ([GitHub](https://github.com/obiwan04kanobi))

------------------