from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.auth.dependencies import get_current_user

from app.models.user import User
from app.schemas.trading import TradeRequest

from app.services.trading import buy_stock,sell_stock


router = APIRouter(
    prefix="/trading",
    tags=["Trading"]
)


@router.post("/buy")
def buy(
    trade: TradeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return buy_stock(
        db=db,
        user=current_user,
        symbol=trade.symbol,
        quantity=trade.quantity
    )

@router.post("/sell")
def sell(
    trade: TradeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return sell_stock(
        db=db,
        user=current_user,
        symbol=trade.symbol,
        quantity=trade.quantity
    )