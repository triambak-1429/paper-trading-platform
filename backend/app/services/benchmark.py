import yfinance as yf


def get_nifty_history(
    period="1mo"
):

    ticker = yf.Ticker("^NSEI")

    data = ticker.history(
        period=period,
        interval="1d",
        auto_adjust=False
    )

    if data.empty:

        raise ValueError(
            "Unable to retrieve NIFTY 50 data"
        )

    data = data.dropna(
        subset=["Close"]
    )

    result = []

    for index, row in data.iterrows():

        result.append({
            "date": index.isoformat(),
            "close": float(row["Close"])
        })

    return result