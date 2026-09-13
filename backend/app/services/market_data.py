import yfinance as yf


def get_quote(symbol: str):
    ticker = yf.Ticker(symbol)

    data = ticker.history(
        period="5d",
        interval="1d",
        auto_adjust=False
    )

    if data.empty:
        raise ValueError(f"No data found for {symbol}")

    data = data.dropna(subset=["Close"])

    latest = data.iloc[-1]

    price = float(latest["Close"])

    if len(data) > 1:
        previous = data.iloc[-2]
        previous_close = float(previous["Close"])
    else:
        previous_close = price

    change = price - previous_close
    change_percent = (change / previous_close) * 100

    return {
        "symbol": symbol,
        "price": price,
        "previous_close": previous_close,
        "change": change,
        "change_percent": change_percent
    }


def get_history(
    symbol: str,
    period: str = "1mo",
    interval: str = "1d"
):
    ticker = yf.Ticker(symbol)

    data = ticker.history(
        period=period,
        interval=interval,
        auto_adjust=False
    )

    if data.empty:
        raise ValueError(f"No historical data found for {symbol}")

    data = data.reset_index()

    result = []

    for _, row in data.iterrows():

        date_value = row["Date"]

        result.append({
            "date": date_value.isoformat(),
            "open": float(row["Open"]),
            "high": float(row["High"]),
            "low": float(row["Low"]),
            "close": float(row["Close"]),
            "volume": int(row["Volume"])
        })

    return result