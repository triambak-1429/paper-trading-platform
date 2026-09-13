from fastapi import APIRouter, HTTPException

from app.services.market_data import get_history
from app.services.indicators import calculate_indicators
from app.services.ai_analysis import generate_market_analysis


router = APIRouter(
    prefix="/analysis",
    tags=["AI Analysis"]
)


@router.get("/{symbol}")
def analyze_stock(symbol: str):

    try:

        history = get_history(
            symbol,
            period="6mo",
            interval="1d"
        )

        indicators = calculate_indicators(history)

        recent_prices = [
            item["close"]
            for item in history[-30:]
        ]

        analysis = generate_market_analysis(
            symbol,
            indicators,
            recent_prices
        )

        return {
            "symbol": symbol,
            "indicators": indicators,
            "analysis": analysis
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )