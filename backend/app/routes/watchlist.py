from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.auth.dependencies import get_current_user

from app.models.user import User
from app.models.watchlist import Watchlist

from app.services.market_data import get_quote


router = APIRouter(
    prefix="/watchlist",
    tags=["Watchlist"]
)


@router.get("")
def get_watchlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    items = (
        db.query(Watchlist)
        .filter(
            Watchlist.user_id == current_user.id
        )
        .all()
    )

    result = []

    for item in items:

        quote = get_quote(item.symbol)

        result.append({
            "symbol": item.symbol,
            "price": quote["price"],
            "change": quote["change"],
            "change_percent": quote["change_percent"]
        })

    return result


@router.post("/{symbol}")
def add_to_watchlist(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing = (
        db.query(Watchlist)
        .filter(
            Watchlist.user_id == current_user.id,
            Watchlist.symbol == symbol
        )
        .first()
    )

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Stock already in watchlist"
        )

    # Verify that market data exists
    try:
        get_quote(symbol)
    except Exception:
        raise HTTPException(
            status_code=404,
            detail="Invalid stock symbol"
        )

    item = Watchlist(
        user_id=current_user.id,
        symbol=symbol
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return {
        "message": "Added to watchlist",
        "symbol": symbol
    }


@router.delete("/{symbol}")
def remove_from_watchlist(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    item = (
        db.query(Watchlist)
        .filter(
            Watchlist.user_id == current_user.id,
            Watchlist.symbol == symbol
        )
        .first()
    )

    if not item:

        raise HTTPException(
            status_code=404,
            detail="Stock not in watchlist"
        )

    db.delete(item)
    db.commit()

    return {
        "message": "Removed from watchlist"
    }