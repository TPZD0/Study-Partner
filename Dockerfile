# Simple root-level Dockerfile for Cloud Run (backend)
# Builds and serves the FastAPI app under fastapi/

FROM python:3.10-slim

# Avoid writing .pyc and ensure logs are flushed
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

# Install deps first for better layer caching
COPY fastapi/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source into a subfolder
COPY fastapi ./fastapi

# Run from the backend folder
WORKDIR /app/fastapi

EXPOSE 8080

CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
