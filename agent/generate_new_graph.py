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
    "You are a sophisticated Financial Analysis Agent. Based on the user's query and their personal transaction history, provide a highly personalized response that feels tailored specifically to their financial situation."
)

ANALYSIS_SCHEMA_INSTRUCTIONS = (
    """
RESPONSE FORMAT REQUIREMENTS:

Return a JSON object with exactly these keys:
{
  "chart": null or {chart object},  // Optional chart generation
  "analysis": "string"              // LLM-style detailed analysis
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
- Write directly to the user as if in a personal conversation - no meta-references or treating this as a conversation
- Do not reference the user by name or include any conversational elements
- Provide clear, simple, and concise financial insights that anyone can understand
- Use PLAIN TEXT ONLY - NO markdown, NO asterisks (*), NO special formatting characters
- NO bullet points with asterisks, NO bold/italic markers, NO formatting symbols
- Use proper paragraphs and line breaks for readability and visual separation - format ALL responses nicely with clear structure
- Include specific numbers and key trends from the data
- Give practical, actionable recommendations
- Keep analysis under 150 words - be direct and focus on the most important insights only
- Make it easy to read with natural spacing and clear organization
- Tailor all insights to the user's specific transaction history and spending patterns - reference their actual data
- Make recommendations based on their personal financial behavior, not generic advice
- For improvement questions (like credit score, savings, spending), provide step-by-step guidance with numbered steps and specific actions

Justification Requirements:
- Keep it very brief: 1-2 simple sentences explaining why this chart type was chosen
- Focus on the main reason only, no technical details

Set chart to null if no visualization adds value to the analysis.
"""
)


def _build_analysis_prompt(user_request: str, transaction_data: List[Dict[str, Any]]) -> str:
    # Include sample of actual transaction data in the prompt
    sample_data = json.dumps(transaction_data[:10], indent=2) if transaction_data else "[]"

    return (
        f"{ANALYSIS_PROMPT_PREAMBLE}\n\n"
        f"User request: {user_request}\n\n"
        f"Your transaction data sample (first 10 transactions - use this to understand their spending patterns):\n{sample_data}\n\n"
        f"Total transactions available: {len(transaction_data) if transaction_data else 0}\n\n"
        f"Analyze their specific financial behavior and provide personalized insights based on their actual transaction history.\n\n"
        f"{ANALYSIS_SCHEMA_INSTRUCTIONS}\n\n"
        "CRITICAL: Return responses in PLAIN TEXT ONLY. Absolutely NO asterisks (*), NO markdown, NO special formatting characters. Use line breaks and paragraphs for separation. Analysis should be simple and clear. Chart justifications should be very short as specified."
    )

def extract_json(text: str) -> Optional[str]:
    """Extract the first complete JSON object from text."""
    start = text.find('{')
    if start == -1:
        return None
    brace_count = 0
    for i in range(start, len(text)):
        if text[i] == '{':
            brace_count += 1
        elif text[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                return text[start:i+1]
    return None

def call_gemini_analysis(prompt: str, user_request: str) -> AgentAnalysisResponse:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY is not set")

    if genai is None:
        raise RuntimeError(
            "The 'google-generativeai' package is not installed. Please add it to requirements.txt"
        )

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content(prompt)

    if not response.text:
        raise RuntimeError("Empty response from Google Gemini")

    # Try to parse JSON
    text = response.text.strip()
    
    # First try direct parsing
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        # Try to extract JSON object from text
        json_str = extract_json(text)
        if json_str:
            try:
                data = json.loads(json_str)
            except json.JSONDecodeError:
                # Try to find JSON in code blocks
                import re
                code_blocks = re.findall(r'```(?:json)?\n?(.*?)\n?```', text, re.DOTALL)
                for block in code_blocks:
                    try:
                        data = json.loads(block.strip())
                        break
                    except json.JSONDecodeError:
                        continue
                else:
                    # Last resort: try to extract analysis with regex
                    import re
                    analysis_match = re.search(r'"analysis"\s*:\s*"([^"]*(?:\\.[^"]*)*)"', text, re.DOTALL)
                    if analysis_match:
                        analysis = analysis_match.group(1)
                        # Check for chart
                        chart_match = re.search(r'"chart"\s*:\s*(null|\{[^}]*\})', text, re.DOTALL)
                        chart = None
                        if chart_match and chart_match.group(1) != 'null':
                            # Try to parse chart, but for now set to None
                            pass
                        data = {"analysis": analysis, "chart": chart}
                    else:
                        raise RuntimeError(f"Failed to extract analysis from response: {text[:200]}")
        else:
            # Fallback: try to strip code fences
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
                    raise RuntimeError(f"Failed to parse LLM JSON after stripping fences: {text[:200]}")
                else:
                    # Last resort: try to extract analysis with regex
                    import re
                    analysis_match = re.search(r'"analysis"\s*:\s*"([^"]*(?:\\.[^"]*)*)"', text, re.DOTALL)
                    if analysis_match:
                        analysis = analysis_match.group(1)
                        # Check for chart
                        chart_match = re.search(r'"chart"\s*:\s*(null|\{[^}]*\})', text, re.DOTALL)
                        chart = None
                        if chart_match and chart_match.group(1) != 'null':
                            # Try to parse chart, but for now set to None
                            pass
                        data = {"analysis": analysis, "chart": chart}
                    else:
                        raise RuntimeError(f"Failed to extract analysis from response: {text[:200]}")    # Handle the chart field - it can be null or a chart object
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
            userQuery=user_request
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
    return call_gemini_analysis(prompt, user_request)


