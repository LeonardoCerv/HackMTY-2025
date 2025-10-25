from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from models import AgentAnalysisResponse
from generate_new_graph import generate_financial_analysis

# Create router instances
agent_router = APIRouter(prefix="/api", tags=["Agent"])

@agent_router.post("/generate-analysis", response_model=AgentAnalysisResponse)
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
    account_id = request.get("account_id", "user123")  # Allow account_id in request
    transaction_data = []
    try:
        # Generate dummy transaction data (same logic as /transactions endpoint)
        import random
        from datetime import datetime, timedelta

        categories = ["Food & Dining", "Transportation", "Shopping", "Entertainment", "Bills & Utilities", "Healthcare", "Travel"]
        merchants = {
            "Food & Dining": ["Starbucks", "McDonald's", "Chipotle", "Whole Foods", "Trader Joe's"],
            "Transportation": ["Uber", "Lyft", "Shell", "Chevron", "Metro"],
            "Shopping": ["Amazon", "Target", "Walmart", "Best Buy", "Nike"],
            "Entertainment": ["Netflix", "Spotify", "AMC", "Steam", "Disney+"],
            "Bills & Utilities": ["PG&E", "Comcast", "AT&T", "Water Company", "Internet Provider"],
            "Healthcare": ["CVS", "Walgreens", "Doctor's Office", "Pharmacy", "Hospital"],
            "Travel": ["Airbnb", "Hotel", "Delta", "United", "Expedia"]
        }

        base_date = datetime.now() - timedelta(days=180)
        for i in range(200):
            days_ago = random.randint(0, 180)
            transaction_date = base_date + timedelta(days=days_ago)

            category = random.choice(categories)
            merchant = random.choice(merchants[category])

            amount_ranges = {
                "Food & Dining": (5, 85),
                "Transportation": (2, 120),
                "Shopping": (10, 500),
                "Entertainment": (5, 25),
                "Bills & Utilities": (20, 200),
                "Healthcare": (10, 300),
                "Travel": (50, 1000)
            }

            min_amount, max_amount = amount_ranges[category]
            amount = round(random.uniform(min_amount, max_amount), 2)

            transaction = {
                "id": f"hist_{i}",
                "account_id": account_id,
                "amount": -amount,
                "merchant": merchant,
                "category": category,
                "date": transaction_date.isoformat(),
                "description": f"{merchant} - {category}",
                "type": "debit"
            }
            transaction_data.append(transaction)

        # Sort by date (most recent first)
        transaction_data.sort(key=lambda x: x.get("date", ""), reverse=True)

    except Exception as e:
        print(f"Warning: Could not generate transaction data: {e}")
        transaction_data = []

    # Call Google Gemini to obtain comprehensive analysis
    try:
        analysis_response: AgentAnalysisResponse = await generate_financial_analysis(user_request, transaction_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM analysis failed: {e}")

    return analysis_response