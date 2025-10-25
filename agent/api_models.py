from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime

# Base response model
class BaseResponse(BaseModel):
    success: bool
    message: str

# API Response models
class HealthResponse(BaseModel):
    status: str
    message: str
    timestamp: datetime

class EchoResponse(BaseModel):
    received_data: Dict[str, Any]
    message: str