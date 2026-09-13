import os

from dotenv import load_dotenv
from google import genai


load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(
    api_key=GEMINI_API_KEY
)


def generate_market_analysis(
    symbol,
    indicators,
    recent_prices
):

    prompt = f"""
You are an AI market analysis assistant.

Analyze the following stock market data.

Stock:
{symbol}

Current Price:
{indicators.get("current_price")}

20-Day SMA:
{indicators.get("sma_20")}

50-Day SMA:
{indicators.get("sma_50")}

Daily Return:
{indicators.get("daily_return")}%

Volatility:
{indicators.get("volatility")}%

Recent closing prices:
{recent_prices}

Provide:

1. Overall trend
2. Short-term momentum
3. Risk level
4. Important observations
5. A concise explanation for a beginner

Do not claim that the stock will definitely rise or fall.
Do not provide guaranteed future prices.

State that this is educational analysis and
not financial advice.
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text