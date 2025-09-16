# Google Cloud Run Deployment Guide

This guide will help you deploy your Study Partner application to Google Cloud Run using Google Cloud Build and GitHub integration.

## Prerequisites

1. **Google Cloud Project**: Create a Google Cloud project with billing enabled
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Google Cloud CLI**: Install and configure the `gcloud` CLI tool
4. **Required APIs**: Enable the following APIs in your Google Cloud project:
   - Cloud Run API
   - Cloud Build API
   - Container Registry API
   - Cloud SQL Admin API (if using Cloud SQL)

## Setup Instructions

### 1. Database Setup

#### Option A: Cloud SQL (Recommended for Production)
```bash
# Create a Cloud SQL PostgreSQL instance
gcloud sql instances create study-partner-db \
  --database-version=POSTGRES_13 \
  --tier=db-f1-micro \
  --region=us-central1

# Create the database
gcloud sql databases create advcompro --instance=study-partner-db

# Create a user
gcloud sql users create your-username \
  --instance=study-partner-db \
  --password=your-secure-password

# Get the connection details
gcloud sql instances describe study-partner-db
```

#### Option B: External PostgreSQL Database
Use any PostgreSQL database service (AWS RDS, DigitalOcean, etc.) and note the connection details.

### 2. Environment Variables Setup

Create the following substitution variables in your Cloud Build trigger:

- `_POSTGRES_HOST`: Your PostgreSQL host (Cloud SQL private IP or external host)
- `_POSTGRES_USER`: Your PostgreSQL username
- `_POSTGRES_PASSWORD`: Your PostgreSQL password
- `_POSTGRES_DB`: `advcompro`
- `_OPENAI_API_KEY`: Your OpenAI API key
- `_BACKEND_URL`: Will be set after first backend deployment

### 3. Cloud Build Setup

1. **Connect GitHub Repository**:
   ```bash
   # Navigate to Cloud Build in Google Cloud Console
   # Go to Triggers > Connect Repository
   # Select GitHub and authorize access
   # Choose your repository
   ```

2. **Create Build Trigger**:
   ```bash
   gcloud builds triggers create github \
     --repo-name=Study-Partner \
     --repo-owner=YOUR_GITHUB_USERNAME \
     --branch-pattern="^main$" \
     --build-config=cloudbuild.yaml \
     --substitutions=_POSTGRES_HOST="YOUR_DB_HOST",_POSTGRES_USER="YOUR_DB_USER",_POSTGRES_PASSWORD="YOUR_DB_PASSWORD",_POSTGRES_DB="advcompro",_OPENAI_API_KEY="YOUR_OPENAI_KEY",_BACKEND_URL="https://study-partner-backend-HASH-uc.a.run.app"
   ```

### 4. Initial Deployment

1. **Push to GitHub**: Push your code to the main branch
2. **Monitor Build**: Check Cloud Build logs in the Google Cloud Console
3. **Get Service URLs**: After successful deployment, get the URLs:
   ```bash
   gcloud run services list --platform=managed --region=us-central1
   ```

4. **Update Frontend Configuration**: Update the `_BACKEND_URL` substitution variable with the actual backend URL and redeploy.

### 5. Database Initialization

Run the database initialization scripts on your Cloud SQL instance:

```bash
# Connect to your Cloud SQL instance
gcloud sql connect study-partner-db --user=your-username

# Run your SQL schema files
\i database_schema.sql
```

## Configuration Files

### Environment Variables

The application uses the following environment variables:

**Backend (FastAPI)**:
- `POSTGRES_HOST`: Database host
- `POSTGRES_USER`: Database username
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_DB`: Database name
- `OPENAI_API_KEY`: OpenAI API key
- `PORT`: Port to run on (automatically set by Cloud Run)

**Frontend (Next.js)**:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `PORT`: Port to run on (automatically set by Cloud Run)

### Cloud Build Configuration

The `cloudbuild.yaml` file handles:
1. Building Docker images for both services
2. Pushing images to Google Container Registry
3. Deploying to Cloud Run with proper environment variables
4. Setting up networking and scaling configuration

## Deployment Process

1. **Code Changes**: Make changes to your code
2. **Git Push**: Push changes to the main branch
3. **Automatic Build**: Cloud Build automatically triggers
4. **Deployment**: Services are automatically deployed to Cloud Run
5. **Verification**: Check the deployed services

## Monitoring and Logs

- **Cloud Run Logs**: View in Google Cloud Console > Cloud Run > [Service] > Logs
- **Build Logs**: View in Google Cloud Console > Cloud Build > History
- **Error Monitoring**: Set up Cloud Error Reporting for production

## Cost Optimization

1. **Set CPU allocation**: Services are configured with 1 CPU and 1Gi memory
2. **Auto-scaling**: Maximum 10 instances per service
3. **Pay-per-use**: Cloud Run charges only when serving requests
4. **Database**: Use appropriate Cloud SQL tier for your needs

## Security Considerations

1. **Environment Variables**: Store sensitive data in Cloud Build substitutions
2. **IAM**: Use least-privilege access for service accounts
3. **HTTPS**: Cloud Run provides HTTPS by default
4. **CORS**: Configure CORS appropriately for your domain

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Cloud Build logs for detailed error messages
2. **Database Connection**: Ensure Cloud SQL instance is accessible
3. **Environment Variables**: Verify all required variables are set
4. **Port Configuration**: Ensure services use the PORT environment variable

### Useful Commands

```bash
# View service details
gcloud run services describe SERVICE_NAME --region=us-central1

# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=SERVICE_NAME" --limit=50

# Update service environment variables
gcloud run services update SERVICE_NAME --set-env-vars KEY=VALUE --region=us-central1
```

## Local Development

For local development, use Docker Compose:

```bash
# Start all services locally
docker-compose up

# The application will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Database: localhost:5432
```

## Support

If you encounter issues:
1. Check the Cloud Build and Cloud Run logs
2. Verify all environment variables are correctly set
3. Ensure your database is accessible and properly configured
4. Review the Google Cloud documentation for Cloud Run and Cloud Build
