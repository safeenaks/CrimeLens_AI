from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import check_database_connection
from app.routers import (
    cases,
    analytics,
    risk,
    hotspots,
    predictions,
    linkage,
    investigator,
)
from app.config import FRONTEND_URL

app = FastAPI(
    title="CrimeLens AI API",
    description=(
        "Backend API for the CrimeLens AI crime intelligence "
        "and investigative assistance platform."
    ),
    version="1.0.0"
)


# CORS Configuration
# Allows the React frontend to communicate with the FastAPI backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Routers
app.include_router(cases.router)
app.include_router(analytics.router)
app.include_router(risk.router)
app.include_router(hotspots.router)
app.include_router(predictions.router)
app.include_router(linkage.router)
app.include_router(investigator.router)

@app.get("/")
def root():
    return {
        "message": "CrimeLens AI Backend is running"
    }


@app.get("/health")
def health_check():
    database_connected = check_database_connection()

    return {
        "status": "healthy" if database_connected else "degraded",
        "service": "CrimeLens AI API",
        "database": "connected" if database_connected else "disconnected"
    }