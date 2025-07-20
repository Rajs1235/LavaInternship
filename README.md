# Resume Portal

## Overview

Resume Portal is a comprehensive web application designed to streamline the entire hiring pipeline, from job posting to final candidate review. The system leverages a powerful suite of AWS services to automate resume submission, analysis, storage, and collaborative decision-making, while also keeping past candidates engaged with new opportunities.

## Team

- [Deepanshu Sharma](https://www.linkedin.com/in/deepanshu-sharma-2078532ab/)
- [Raj Srivastava](https://www.linkedin.com/in/raj-srivastava-a680482b4/) ([GitHub](https://github.com/Rajs1235))
- [Mayank Pant](https://www.linkedin.com/in/mayank04pant/) ([GitHub](https://github.com/obiwan04kanobi))


## Features

### Candidate Features
- **Job Listings**: Candidates can view all active job openings with detailed descriptions and requirements.
- **Resume Submission**: A user-friendly form allows candidates to apply for specific roles and upload their resumes (PDF/DOC/DOCX).
- **Instant Feedback**: Candidates receive an email confirmation upon successful submission.
- **Automated Job Recommendations**: Candidates who have applied in the last year receive a consolidated email at 9:30 AM daily with new job postings relevant to their previously applied departments.

### HR Features
- **Secure HR Portal**: HR professionals log in through a secure portal managed by AWS Cognito.
- **Centralized Dashboard**: A main dashboard provides a high-level overview of application statistics, with charts filtered for the last 30 days of activity.
- **Job Posting**: A dedicated form for HR to create and publish new job listings with detailed requirements, responsibilities, and salary information.
- **Job Management**: An interface to view all created jobs, see submission counts, and toggle their status between 'Active' and 'Inactive', or **permanently delete** them.
- **Comprehensive Candidate Database**: Access to a searchable and filterable database of the **entire talent pool**, including all-time data for both 'Rejected' and 'Advanced' candidates.
- **Collaborative Departmental Review**:
    - HR can send a candidate's profile to a department head (HOD) or other stakeholders for review.
    - This is done via a secure, **authenticated link sent by email**, which has a **10-day time-to-live (TTL)**.
    - The reviewer can approve or reject the candidate directly from the link, updating the status in real-time.

### AWS Integration
- **AWS S3**: Securely stores all uploaded resume files.
- **AWS Cognito**: Provides robust authentication and authorization for the secure HR Portal.
- **Amazon EventBridge**: Triggers a daily Lambda function on a schedule (e.g., 9:30 AM) to send job recommendation emails.
- **API Gateway**: Exposes a suite of HTTP APIs for all frontend-backend communication.
- **AWS Lambda**: Executes all backend logic, including:
  - Resume uploading and metadata generation.
  - Data retrieval for all dashboard and listing pages.
  - Job posting, status updates, and deletion.
  - Secure token generation and validation for the review workflow.
  - Daily aggregation and emailing of new job recommendations.
- **AWS Amplify**: Manages frontend hosting, CI/CD, and integrates AWS services.
- **AWS DynamoDB**:
    - A primary table stores all candidate information and resume metadata.
    - A `JobPostingMetaData` table stores details for all created jobs.
    - A `ReviewTokens` table securely stores tokens for the review workflow with a 10-day TTL.
- **AWS Secrets Manager**: Securely stores sensitive credentials like the JWT signing secret.

## Architecture

The system is deployed in the **ap-south-1 (Mumbai)** region and consists of the following components:

1. **Frontend**:
    - Built with React and TailwindCSS.
    - Hosted and managed by AWS Amplify for CI/CD.
    - Communicates with backend APIs via API Gateway for all user actions.

2. **Backend**:
    - **API Gateway**: Serves as the entry point for all frontend requests, routing them to appropriate Lambda functions.
    - **Amazon EventBridge**: A scheduled rule triggers the daily job recommendation Lambda at 9:30 AM.
    - **AWS Lambda Functions**:
      - **ResumeUpload Lambda**: Handles resume upload logic.
      - **JobPosting Lambda**: Creates, updates, and deletes job listings.
      - **Data Retrieval Lambdas**: Fetch and process data from DynamoDB for all frontend pages.
      - **CreateReviewLink Lambda**: Generates a secure JWT and emails it to a reviewer.
      - **ValidateReviewToken Lambda**: Verifies the JWT and serves the candidate data.
      - **DailyJobRecommendation Lambda**: Scans for new jobs and recent candidates to send consolidated recommendation emails.

3. **AWS Services**:
    - **S3 Bucket**: Securely stores uploaded resumes.
    - **DynamoDB**: Stores candidate information, job postings, and review tokens.
    - **Cognito**: Manages authentication and authorization for the HR Portal.
    - **Secrets Manager**: Stores the JWT secret key.

## AWS Backend Architecture

![aws backend architecture](/screenshots/ai-resume-screener.png)

## React Frontend + API's Integration

![React Frontend](/screenshots/frontend-diagram.png)

## Screenshots

![home](/screenshots/home.png)
-----
![hr-signup-login](/screenshots/Cognito-Signup-login.png)
----- 
![dashboard-home](/screenshots/dashboard-home.png)
----- 
![dashboard-candidate-view](/screenshots/candidate-dashboard-view.png)
----- 
![job-posting-form](/screenshots/post-job.png)
----- 
![job listing](/screenshots/job-listings.png)
----- 
![job listing detail](/screenshots/job-listings-detail.png)
----- 
![resume form](/screenshots/resume-upload-form.png)
----- 
![manage-jobs](/screenshots/manage-jobs.png)
-----
![candidate-database](/screenshots/candidate-database.png)
-----

## Installation

### Prerequisites
- Node.js and npm installed.
- AWS account with necessary permissions.
- Amplify CLI installed.

### Steps
1. Clone the repository:
   ```bash
   git clone [https://github.com/obiwan04kanobi/LavaInternship.git](https://github.com/obiwan04kanobi/LavaInternship.git)
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

1. Navigate to the Job Listings page.
2. Browse active jobs and click "Apply Now" on a desired role.
3. Fill out the resume submission form and upload the resume.
4. Receive a confirmation email and subsequent daily emails for new, relevant job postings.

### HR Workflow
1. Navigate to the homepage and select "HR".
2. Log in using AWS Cognito.
3. Access the dashboard to view analytics and new candidates.
4. Use the "Post Job" form to create new openings.
5. Use the "Manage Jobs" page to toggle the visibility of or delete job listings.
6. Use the "Candidate Database" to search the entire talent pool.
7. When viewing a candidate, send a review link to a department head for collaborative feedback.

## Contributing
Contributions are not being accepted for this project at this time.

## Contact

For questions or support, please connect with any of us:

- [Deepanshu Sharma](https://www.linkedin.com/in/deepanshu-sharma-2078532ab/)
- [Raj Srivastava](https://www.linkedin.com/in/raj-srivastava-a680482b4/) ([GitHub](https://github.com/Rajs1235))
- [Mayank Pant](https://www.linkedin.com/in/mayank04pant/) ([GitHub](https://github.com/obiwan04kanobi))

