import yfinance as yf


def get_usd_to_inr_rate():

    ticker = yf.Ticker("INR=X")

    data = ticker.history(
        period="5d",
        interval="1d",
        auto_adjust=False
    )

    if data.empty:
        raise ValueError(
            "Could not retrieve USD to INR exchange rate"
        )

    data = data.dropna(subset=["Close"])

    latest = data.iloc[-1]

    return float(latest["Close"])