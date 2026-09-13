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


@router.get("/search")
def search_assets(
    q: str = Query(..., min_length=1),
    asset_type: Optional[str] = None,
    db: Session = Depends(get_db)
):

    search_term = q.strip()

    query = db.query(Stock)

    query = query.filter(
        or_(
            Stock.symbol.ilike(
                f"%{search_term}%"
            ),
            Stock.name.ilike(
                f"%{search_term}%"
            )
        )
    )

    if asset_type:
        query = query.filter(
            Stock.asset_type == asset_type
        )

    assets = (
        query
        .order_by(Stock.name)
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