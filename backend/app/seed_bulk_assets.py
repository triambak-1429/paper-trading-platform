import yfinance as yf
from app.database.connection import SessionLocal
from app.models.stock import Stock

def bulk_seed_stocks():
    db = SessionLocal()
    
    # Combined master list including your existing database profile 
    # plus 25 of the top traded stocks in India (.NS suffix for NSE)
    tickers = [
        # --- Top Traded Indian Stocks (NSE) ---
        "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS", 
        "ITC.NS", "TATASTEEL.NS", "TATAMOTORS.NS", "SBIN.NS", "BHARTIARTL.NS", 
        "HINDUNILVR.NS", "LT.NS", "AXISBANK.NS", "BAJFINANCE.NS", "MARUTI.NS",
        "KOTAKBANK.NS", "SUNPHARMA.NS", "NTPC.NS", "ONGC.NS", "POWERGRID.NS",
        "COALINDIA.NS", "ADANIENT.NS", "ADANIPORTS.NS", "WIPRO.NS", "HCLTECH.NS",
        
        # --- Major Global Commodities ---
        "GC=F", "SI=F", "HG=F", "CL=F", "NG=F",
        
        # --- Major US Stocks ---
        "AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA", "BRK-B", 
        "JPM", "V", "UNH", "HD", "PG", "MA", "DIS", "PYPL", "NFLX", "ADBE", 
        "XOM", "CVX", "INTC", "CSCO", "ORCL", "CRM", "AMD", "NKE", "COST", 
        "PEP", "KO", "WMT", "BAC", "MS", "GS", "PFE", "JNJ", "MRK", "ABV", 
        "T", "VZ", "CMCSA", "MCD", "SBUX", "BA", "CAT", "GE", "F", "GM"
    ]

    print(f"Beginning seed for {len(tickers)} major assets using yfinance...")

    for i, symbol in enumerate(tickers):
        # Clean case check to handle matching securely
        symbol_upper = symbol.strip().upper()
        
        # Prevent database duplicates
        existing = db.query(Stock).filter(Stock.symbol.ilike(symbol_upper)).first()
        if existing:
            print(f"[{i+1}/{len(tickers)}] {symbol_upper} already exists locally. Skipping.")
            continue

        try:
            ticker_obj = yf.Ticker(symbol_upper)
            info = ticker_obj.info
            
            # Safely extract metadata fields falling back gracefully
            name = info.get('longName') or info.get('shortName') or symbol_upper
            asset_type = info.get('quoteType', 'EQUITY').lower()
            exchange = info.get('exchange', 'UNKNOWN')
            currency = info.get('currency', 'INR' if symbol_upper.endswith('.NS') else 'USD')
            logo_url = info.get('logo_url', '')

            stock_entity = Stock(
                symbol=symbol_upper,
                name=name,
                asset_type=asset_type,
                exchange=exchange,
                currency=currency,
                logo_url=logo_url,
                is_featured=False
            )
            
            db.add(stock_entity)
            print(f"[{i+1}/{len(tickers)}] Successfully Added: {symbol_upper} - {name}")
            
            # Commit immediately per successful network return
            db.commit()

        except Exception as err:
            db.rollback()
            print(f"Skipping {symbol_upper} due to error: {err}")
            continue

    db.close()
    print("\nBulk seeding completed successfully!")

if __name__ == "__main__":
    bulk_seed_stocks()
