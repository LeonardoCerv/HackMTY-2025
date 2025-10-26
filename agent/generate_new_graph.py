import os
import json
from typing import Any, Dict, List, Optional

from pydantic import ValidationError
from models import GraphBase, AgentAnalysisResponse

try:
    import google.generativeai as genai
except ImportError:  # pragma: no cover
    genai = None  # We will validate at runtime


ANALYSIS_PROMPT_PREAMBLE = (
    "You are a sophisticated Financial Analysis Agent. Based on the user's query, provide a comprehensive response that may include a chart, detailed analysis, and justification."
)

ANALYSIS_SCHEMA_INSTRUCTIONS = (
    """
RESPONSE FORMAT REQUIREMENTS:

Return a JSON object with exactly these keys:
{
  "chart": null or {chart object},  // Optional chart generation
  "analysis": "string",             // LLM-style detailed analysis
  "justification": "string"         // Why this chart/data was chosen
}

Chart object format (when included):
{
  "type": "line|bar|pie|area|scatter",
  "title": "Human readable chart title",
  "data": [
    // For pie charts: [{"name": "Category A", "value": 100}, {"name": "Category B", "value": 200}]
    // For line/bar/area charts: [{"month": "Jan", "amount": 100}, {"month": "Feb", "amount": 200}]
    // For scatter charts: [{"x": 10, "y": 20}, {"x": 15, "y": 25}]
  ],
  "xAxisKey": "month",  // Key for x-axis (line/bar/area charts)
  "yAxisKey": "amount", // Key for y-axis (line/bar/area charts)
  "justification": "Why this chart type was chosen"
}

Supported Chart Types:
- "pie": For categorical data showing proportions
- "bar": For comparing values across categories
- "line": For showing trends over time or continuous data
- "area": For showing cumulative data or filled line charts
- "scatter": For showing relationships between two variables

Analysis Requirements:
- Provide detailed, actionable financial insights
- Include specific numbers and trends from the data
- Give practical recommendations
- Keep analysis under 400 words

Justification Requirements:
- Explain why you chose this specific chart type
- Include reasoning based on data patterns
- Explain business value of the chosen visualization

Set chart to null if no visualization adds value to the analysis.
"""
)


def _build_analysis_prompt(user_request: str, transaction_data: List[Dict[str, Any]]) -> str:
    # Include sample of actual transaction data in the prompt
    sample_data = json.dumps(transaction_data[:10], indent=2) if transaction_data else "[]"

    return (
        f"{ANALYSIS_PROMPT_PREAMBLE}\n\n"
        f"User request: {user_request}\n\n"
        f"Transaction data sample (first 10 transactions):\n{sample_data}\n\n"
        f"Total transactions available: {len(transaction_data) if transaction_data else 0}\n\n"
        f"{ANALYSIS_SCHEMA_INSTRUCTIONS}\n\n"
        "Return ONLY the JSON object with chart, analysis, and justification keys."
    )

def call_gemini_analysis(prompt: str) -> AgentAnalysisResponse:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY is not set")

    if genai is None:
        raise RuntimeError(
            "The 'google-generativeai' package is not installed. Please add it to requirements.txt"
        )

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    response = model.generate_content(prompt)

    if not response.text:
        raise RuntimeError("Empty response from Google Gemini")

    # Try to parse JSON
    text = response.text.strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        # Sometimes models wrap in code-fences; try to strip them
        if text.startswith("```"):
            stripped = text
            # Remove optional language tag
            if stripped.startswith("```json"):
                stripped = stripped[len("```json"):]
            else:
                stripped = stripped[len("```"):]
            if stripped.endswith("```"):
                stripped = stripped[:-3]
            text_stripped = stripped.strip()
            try:
                data = json.loads(text_stripped)
            except Exception:
                raise RuntimeError(f"Failed to parse LLM JSON: {e}: {text[:200]}")
        else:
            raise RuntimeError(f"Failed to parse LLM JSON: {e}: {text[:200]}")

    # Handle the chart field - it can be null or a chart object
    try:
        if data.get("chart") and isinstance(data["chart"], dict):
            # Create a Graph object from the chart data
            from models import Graph
            import uuid
            chart_data = data["chart"]
            chart = Graph(
                id=str(uuid.uuid4()),
                type=chart_data["type"],
                title=chart_data["title"],
                data={
                    "data": chart_data["data"],
                    "xAxisKey": chart_data.get("xAxisKey"),
                    "yAxisKey": chart_data.get("yAxisKey")
                },
                extra={},
                justification=chart_data.get("justification", "")
            )
        else:
            chart = None

        analysis_response = AgentAnalysisResponse(
            chart=chart,
            analysis=data["analysis"],
            justification=data["justification"]
        )
    except ValidationError as e:
        raise RuntimeError(f"LLM returned invalid response schema: {e}")

    return analysis_response


async def generate_financial_analysis(
    user_request: str,
    transaction_data: List[Dict[str, Any]] = None,
) -> AgentAnalysisResponse:
    """
    Generate a comprehensive financial analysis response that may include:
    - Optional chart generation with data
    - Detailed LLM-style analysis
    - Justification for choices made
    """
    if transaction_data is None:
        transaction_data = []

    prompt = _build_analysis_prompt(user_request, transaction_data)
    return call_gemini_analysis(prompt)


