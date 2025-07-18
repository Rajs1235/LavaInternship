# Resume Portal

## Overview

Resume Portal is a comprehensive web application designed to streamline the entire hiring pipeline, from job posting to final candidate review. The system leverages a powerful suite of AWS services to automate resume submission, analysis, storage, and collaborative decision-making, providing a seamless experience for candidates, HR professionals, and departmental reviewers.

## Team

- [Deepanshu Sharma](https://www.linkedin.com/in/deepanshu-sharma-2078532ab/)
- [Raj Srivastava](https://www.linkedin.com/in/raj-srivastava-a680482b4/) ([GitHub](https://github.com/Rajs1235))
- [Mayank Pant](https://www.linkedin.com/in/mayank04pant/) ([GitHub](https://github.com/obiwan04kanobi))


## Features

### Candidate Features
- **Job Listings**: Candidates can view all active job openings with detailed descriptions and requirements.
- **Resume Submission**: A user-friendly form allows candidates to apply for specific roles and upload their resumes (PDF/DOC/DOCX).
- **Input Validation**: The form validates all fields, including email, phone number, and resume file size/type, to ensure data quality.
- **Instant Feedback**: Candidates receive an email confirmation upon successful submission.

### HR Features
- **Secure HR Portal**: HR professionals log in through a secure portal managed by AWS Cognito.
- **Centralized Dashboard**: A main dashboard provides a high-level overview of application statistics, with charts filtered for the last 30 days of activity.
- **Job Posting**: A dedicated form for HR to create and publish new job listings with detailed requirements, responsibilities, and salary information.
- **Job Management**: An interface to view all created jobs, see submission counts, and toggle their status between 'Active' and 'Inactive'. Inactive jobs are automatically hidden from the public candidate view.
- **Comprehensive Candidate Database**: Access to a searchable and filterable database of the **entire talent pool**, including all-time data for both 'Rejected' and 'Advanced' candidates.
- **Collaborative Departmental Review**:
    - HR can send a candidate's profile to a department head (HOD) or other stakeholders for review.
    - This is done via a secure, **authenticated link sent by email**, which has a **10-day time-to-live (TTL)**.
    - The automated email supports adding **CC recipients** to keep other team members informed.
    - The reviewer can approve or reject the candidate directly from the link, updating the status in real-time.

### AWS Integration
- **AWS S3**: Securely stores all uploaded resume files.
- **AWS Cognito**: Provides robust authentication and authorization for the secure HR Portal.
- **API Gateway**: Exposes a suite of HTTP APIs for all frontend-backend communication.
- **AWS Lambda**: Executes all backend logic, including:
  - Resume uploading and metadata generation.
  - Data retrieval for all dashboard and listing pages.
  - Job posting and status updates.
  - **Secure token generation** and validation for the review workflow.
- **AWS Amplify**: Manages frontend hosting, CI/CD, and integrates AWS services.
- **AWS DynamoDB**:
    - A primary table stores all candidate information, resume metadata, and analysis results.
    - A `JobPostingMetaData` table stores details for all created jobs.
    - A `ReviewTokens` table securely stores tokens for the review workflow with a 10-day TTL.
- **AWS Secrets Manager**: Securely stores sensitive credentials like the JWT signing secret.

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
      - **JobPosting Lambda**: Creates and stores new job listings.
      - **JobListing/CandidateData Lambdas**: Fetch and process data from DynamoDB for various API responses.
      - **CreateReviewLink Lambda**: Generates a secure JWT, stores it in DynamoDB, and emails it to a reviewer (with CC) using `smtplib`.
      - **ValidateReviewToken Lambda**: Verifies the JWT, checks its status in DynamoDB, and serves the candidate data for the review page.

3. **AWS Services**:
    - **S3 Bucket**: Securely stores uploaded resumes.
    - **DynamoDB**: Stores candidate information, job postings, and review tokens.
    - **Cognito**: Manages authentication and authorization for HR Portal access.
    - **Secrets Manager**: Stores the JWT secret key.

4. **Integration & Hosting**:
    - **AWS Amplify**: Provides frontend hosting, manages CI/CD pipelines, and integrates with backend AWS services for a unified development and deployment experience.

## AWS Backend Architecture

![aws backend architecture](/screenshots/ai-resume-screener.png)

## React Frontend

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
4. Receive a confirmation email upon successful submission.

### HR Workflow
1. Navigate to the homepage and select "HR".
2. Log in using AWS Cognito.
3. Access the dashboard to view analytics and new candidates.
4. Use the "Post Job" form to create new openings.
5. Use the "Manage Jobs" page to toggle the visibility of job listings.
6. Use the "Candidate Database" to search the entire talent pool.
7. When viewing a candidate, send a review link to a department head for collaborative feedback.

## Contributing
Contributions are not being accepted for this project at this time.

## Contact

For questions or support, please connect with any of us:

- [Deepanshu Sharma](https://www.linkedin.com/in/deepanshu-sharma-2078532ab/)
- [Raj Srivastava](https://www.linkedin.com/in/raj-srivastava-a680482b4/) ([GitHub](https://github.com/Rajs1235))
- [Mayank Pant](https://www.linkedin.com/in/mayank04pant/) ([GitHub](https://github.com/obiwan04kanobi))

