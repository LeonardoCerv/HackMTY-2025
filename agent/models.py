from pydantic import BaseModel
from typing import Optional, Dict, Any

# Graph models
class GraphBase(BaseModel):
    type: str
    title: str
    data: Dict[str, Any]  # Chart data (labels, values, etc.)
    extra: Optional[Dict[str, Any]] = None
    justification: Optional[str] = None

class GraphCreate(GraphBase):
    pass

class Graph(GraphBase):
    id: str

# Agent response models
class AgentAnalysisResponse(BaseModel):
    chart: Optional[Graph] = None  # Optional chart generation
    analysis: str  # LLM-style text analysis
    userQuery: str  # The user's original query