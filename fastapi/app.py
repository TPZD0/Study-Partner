# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from database import connect_db, disconnect_db
from routes.files import router as files_router
from routes.users import router as users_router
from routes.ai import router as ai_router
from routes.goals import router as goals_router
from routes.auth_google import router as google_auth_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Study Partner API",
    description="Backend API for Study Partner application",
    version="1.0.0"
)

# CORS Configuration
frontend_origin = os.getenv("FRONTEND_URL", "http://localhost:3000")
cors_origins = [
    frontend_origin,
    "http://localhost:3000",
    "https://localhost:3000",
    "http://localhost:8080",
    "https://localhost:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
try:
    UPLOAD_DIR.mkdir(exist_ok=True)
    logger.info(f"Upload directory ready at {UPLOAD_DIR.absolute()}")
except Exception as e:
    logger.error(f"Failed to create upload directory: {e}")
    # Continue without uploads if we can't create the directory

# Mount static files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

try:
    # Include all routers
    app.include_router(files_router, prefix="/api")
    app.include_router(users_router, prefix="/api")
    app.include_router(ai_router, prefix="/api")
    app.include_router(goals_router, prefix="/api")
    app.include_router(google_auth_router, prefix="/api")
    
    logger.info("All routers successfully imported and included")
    
except Exception as e:
    logger.error(f"Failed to import routers: {e}")
    raise

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers and monitoring"""
    try:
        # Add any additional health checks here (e.g., database connection)
        return {"status": "healthy", "environment": os.getenv("ENVIRONMENT", "development")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add startup and shutdown event handlers
@app.on_event("startup")
async def startup_event():
    """Initialize services when the application starts"""
    try:
        # Initialize database connection
        await connect_db()
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        # Don't raise here to allow the application to start even if DB is down

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup when the application shuts down"""
    try:
        await disconnect_db()
        logger.info("Database connection closed")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")
