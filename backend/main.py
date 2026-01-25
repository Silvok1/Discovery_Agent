"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .api.routes import router

app = FastAPI(
    title="Continuous Discovery Interview Platform",
    description="AI-powered interview agents for product discovery",
    version="0.1.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/")
def root():
    """Root endpoint with API info."""
    return {
        "message": "Continuous Discovery Interview Platform",
        "docs": "/docs",
        "agents": ["explorer", "inquisitor", "validator"],
        "endpoints": {
            "create_user": "POST /api/users",
            "create_instance": "POST /api/instances?user_email=...",
            "add_participant": "POST /api/instances/{id}/participants",
            "start_interview": "POST /api/interview/{token}/start",
            "chat": "POST /api/sessions/{id}/chat",
        }
    }
