from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.connection import get_db
from app.models.stock import Stock

from app.services.market_data import (
    get_quote,
    get_history
)


router = APIRouter(
    prefix="/market",
    tags=["Market Data"]
)


@router.get("/assets")
def get_featured_assets(
    db: Session = Depends(get_db)
):

    assets = (
        db.query(Stock)
        .filter(Stock.is_featured == True)
        .limit(20)
        .all()
    )

    return [
        {
            "symbol": asset.symbol,
            "name": asset.name,
            "type": asset.asset_type,
            "exchange": asset.exchange,
            "currency": asset.currency,
            "logo_url": asset.logo_url
        }
        for asset in assets
    ]

import yfinance as yf
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import APIRouter, HTTPException, Depends, Query
from app.database.connection import get_db
from app.models.stock import Stock

# ... keep the rest of your router setup intact ...

@router.get("/search")
def search_assets(
    q: str = Query(..., min_length=1),
    asset_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    search_term = q.strip().upper() # Tickers are uppercase

    # 1. Search locally in your Supabase DB first
    query = db.query(Stock).filter(
        or_(
            Stock.symbol.ilike(f"%{search_term}%"),
            Stock.name.ilike(f"%{search_term}%")
        )
    )
    if asset_type:
        query = query.filter(Stock.asset_type == asset_type)
        
    assets = query.order_by(Stock.name).limit(20).all()

    # 2. Hybrid Safe-Guard: If no local results, fetch from Yahoo Finance dynamically
    if not assets and len(search_term) <= 5: 
        try:
            # Query Yahoo Finance's native search endpoint via yfinance
            yf_search = yf.Search(search_term, max_results=5).quotes
            
            for result in yf_search:
                symbol = result.get("symbol")
                if not symbol:
                    continue
                
                # Check if it was secretly added already to avoid duplicates
                existing = db.query(Stock).filter(Stock.symbol == symbol).first()
                if existing:
                    if existing not in assets:
                        assets.append(existing)
                    continue
                
                # Create a new asset row dynamically from Yahoo's search result metadata
                new_stock = Stock(
                    symbol=symbol,
                    name=result.get("shortname") or result.get("longname") or symbol,
                    asset_type=result.get("quoteType", "EQUITY").lower(),
                    exchange=result.get("exchange", "UNKNOWN"),
                    currency="USD", # Fallback default
                    logo_url="", # Can be populated when user requests /quote/
                    is_featured=False
                )
                db.add(new_stock)
                db.commit()
                db.refresh(new_stock)
                assets.append(new_stock)
                
        except Exception as e:
            # Log the error safely so it doesn't break the local fallback response
            print(f"yfinance dynamic search fallback failed: {e}")

    # 3. Format and return your structured array
    return [
        {
            "symbol": asset.symbol,
            "name": asset.name,
            "type": asset.asset_type,
            "exchange": asset.exchange,
            "currency": asset.currency,
            "logo_url": asset.logo_url
        }
        for asset in assets
    ]


@router.get("/quote/{symbol}")
def quote(symbol: str):

    try:
        return get_quote(symbol)

    except Exception as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


@router.get("/history/{symbol}")
def history(
    symbol: str,
    period: str = "1mo",
    interval: str = "1d"
):

    try:

        return {
            "symbol": symbol,
            "data": get_history(
                symbol,
                period,
                interval
            )
        }

    except Exception as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )