from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any
from api_models import HealthResponse, EchoResponse
from datetime import datetime

# Create router instances
api_router = APIRouter(prefix="/api", tags=["API"])

# API Routes
@api_router.post("/echo", response_model=EchoResponse)
async def echo_data(data: Dict[str, Any]):
    return EchoResponse(
        received_data=data,
        message="Data received successfully"
    )

@api_router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        message="API is running",
        timestamp=datetime.now()
    )

@api_router.get("/transactions")
async def get_transactions(account_id: str = Query(..., description="Account ID to fetch transactions for")):
    """
    Get transactions for an account with dummy historical data.
    """
    try:
        import random
        from datetime import datetime, timedelta

        dummy_transactions = []
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

        # Generate 200 historical transactions over the last 6 months
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
            dummy_transactions.append(transaction)

        # Sort by date (most recent first)
        dummy_transactions.sort(key=lambda x: x.get("date", ""), reverse=True)

        return {
            "account_id": account_id,
            "transactions": dummy_transactions,
            "total_count": len(dummy_transactions)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch transactions: {str(e)}")
