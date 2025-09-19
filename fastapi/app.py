# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles
from database import connect_db, disconnect_db
from routes.files import router as files_router
from routes.users import router as users_router
from routes.ai import router as ai_router
from routes.goals import router as goals_router
from routes.auth_google import router as google_auth_router

app = FastAPI()

frontend_origin = os.getenv("FRONTEND_URL", "http://localhost:3000")
cors_origins = [frontend_origin, "http://localhost:3000", "https://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()

app.include_router(files_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(goals_router, prefix="/api")
app.include_router(google_auth_router, prefix="/api")
