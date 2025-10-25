from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File
from typing import List, Dict, Any
from models import (
    BaseResponse, HealthResponse, EchoResponse
)
from datetime import datetime
import logging
import base64
import os

logger = logging.getLogger(__name__)

# Create router instances (SIN importar api_router de api.py para evitar conflictos)
api_router = APIRouter(prefix="/api", tags=["API"])

# API Routes
@api_router.get("/hello")
async def hello_world():
    return {"message": "Hello from FastAPI!"}

@api_router.post("/echo", response_model=EchoResponse)
async def echo_data(data: dict):
    return EchoResponse(
        received_data=data,
        message="Data received successfully"
    )

@api_router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        message="API is running",
        timestamp=datetime.now(),
        database_connected=False
    )