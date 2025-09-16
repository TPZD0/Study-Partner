# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /src

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose the port FastAPI will run on (Cloud Run uses PORT env var)
EXPOSE $PORT

# Command to run the FastAPI application with Uvicorn
# Use PORT environment variable for Cloud Run compatibility
CMD exec uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}

