import pandas as pd


def calculate_indicators(data):

    df = pd.DataFrame(data)

    if df.empty:
        return {}

    df["close"] = pd.to_numeric(df["close"])

    # Moving averages
    df["sma_20"] = df["close"].rolling(20).mean()
    df["sma_50"] = df["close"].rolling(50).mean()

    # Daily returns
    df["daily_return"] = df["close"].pct_change() * 100

    # Volatility
    volatility = df["daily_return"].std()

    latest = df.iloc[-1]

    current_price = float(latest["close"])

    sma_20 = (
        float(latest["sma_20"])
        if pd.notna(latest["sma_20"])
        else None
    )

    sma_50 = (
        float(latest["sma_50"])
        if pd.notna(latest["sma_50"])
        else None
    )

    daily_return = (
        float(latest["daily_return"])
        if pd.notna(latest["daily_return"])
        else 0
    )

    return {
        "current_price": current_price,
        "sma_20": sma_20,
        "sma_50": sma_50,
        "volatility": float(volatility),
        "daily_return": daily_return
    }