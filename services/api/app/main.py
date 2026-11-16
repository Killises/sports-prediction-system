
from fastapi import FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.api.v1.endpoints import (
    sports,
    competitions,
    seasons,
    participants,
    matches,
    match_statistics,
)

from app.db.session import engine

app = FastAPI(title="Sports Prediction System API")

app.include_router(
    sports.router,
    prefix="/api/v1",
)
app.include_router(
    competitions.router,
    prefix="/api/v1",
)
app.include_router(
    seasons.router,
    prefix="/api/v1",
)
app.include_router(
    participants.router,
    prefix="/api/v1",
)
app.include_router(
    matches.router,
    prefix="/api/v1",
)
app.include_router(
    match_statistics.router,
    prefix="/api/v1",
)


@app.get("/")
def root():
    return {
        "message": "Welcome to Sports Prediction System API"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "application": "sports-prediction-system"
    }


@app.get("/health/db")
def database_health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed"
        )
