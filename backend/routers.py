from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File
from typing import List, Dict, Any
from models import (
    BaseResponse, HealthResponse, EchoResponse, AgentAnalysisResponse
)
from datetime import datetime
import logging
import base64
import os
from generate_new_graph import generate_financial_analysis
import requests

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

@api_router.post("/generate-analysis", response_model=AgentAnalysisResponse)
async def generate_financial_analysis_endpoint(request: Dict[str, Any]) -> AgentAnalysisResponse:
    """
    Generate a comprehensive financial analysis response that may include:
    - Optional chart generation with data
    - Detailed LLM-style analysis
    - Justification for choices made

    Body example:
    { "request": "analyze my spending patterns and show me where I can save money" }
    """
    user_request = request.get("request", "").strip()
    if not user_request:
        raise HTTPException(status_code=400, detail="Missing 'request' in body")

    # Fetch transaction data for analysis
    transaction_data = request.get("transactions", [])  # Use provided data if available
    
    # If no transaction data provided, fetch from backend
    if not transaction_data:
        try:
            # Fetch REAL transaction data from backend
            backend_response = requests.get("http://127.0.0.1:8000/api/transactions", timeout=10)
            backend_response.raise_for_status()
            backend_data = backend_response.json()
            transaction_data = backend_data.get("transactions", [])
        except Exception as e:
            print(f"Warning: Could not fetch real transaction data: {e}")
            transaction_data = []  # Fallback to empty if backend unavailable

    # Call Google Gemini to obtain comprehensive analysis
    try:
        analysis_response: AgentAnalysisResponse = await generate_financial_analysis(user_request, transaction_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM analysis failed: {e}")

    return analysis_response