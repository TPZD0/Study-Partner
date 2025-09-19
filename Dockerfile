# Simple root-level Dockerfile for Cloud Run (backend)
# Builds and serves the FastAPI app under fastapi/

FROM python:3.10-slim

WORKDIR /src

# Install deps first for better layer caching
COPY fastapi/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY fastapi/ .

# Cloud Run provides PORT (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT}"]

