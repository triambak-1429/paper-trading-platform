from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.holding import Holding
from app.models.transaction import Transaction
from app.models.stock import Stock

from app.services.market_data import get_quote
from app.services.currency import get_usd_to_inr_rate
from app.services.portfolio_snapshot import create_portfolio_snapshot

def get_asset_currency(db: Session, symbol: str):

    asset = (
        db.query(Stock)
        .filter(Stock.symbol == symbol)
        .first()
    )

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    return asset.currency


def calculate_inr_value(
    db: Session,
    symbol: str,
    price: float,
    quantity: int
):

    currency = get_asset_currency(
        db,
        symbol
    )

    amount = price * quantity

    if currency == "USD":

        exchange_rate = get_usd_to_inr_rate()

        inr_amount = amount * exchange_rate

    else:

        exchange_rate = 1.0
        inr_amount = amount

    return {
        "currency": currency,
        "amount": amount,
        "exchange_rate": exchange_rate,
        "inr_amount": inr_amount
    }


def buy_stock(
    db: Session,
    user: User,
    symbol: str,
    quantity: int
):

    if quantity <= 0:

        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )


    quote = get_quote(symbol)

    price = quote["price"]


    conversion = calculate_inr_value(
        db,
        symbol,
        price,
        quantity
    )


    total_amount = conversion["inr_amount"]


    if user.balance < total_amount:

        raise HTTPException(
            status_code=400,
            detail="Insufficient balance"
        )


    holding = (
        db.query(Holding)
        .filter(
            Holding.user_id == user.id,
            Holding.symbol == symbol
        )
        .first()
    )


    if holding:

        old_quantity = holding.quantity

        old_average = holding.average_price

        new_quantity = (
            old_quantity + quantity
        )

        new_average = (
            (
                old_quantity * old_average
            )
            +
            (
                quantity * price
            )
        ) / new_quantity

        holding.quantity = new_quantity

        holding.average_price = new_average

    else:

        holding = Holding(
            user_id=user.id,
            symbol=symbol,
            quantity=quantity,
            average_price=price
        )

        db.add(holding)


    user.balance -= total_amount


    transaction = Transaction(
        user_id=user.id,
        symbol=symbol,
        transaction_type="BUY",
        quantity=quantity,
        price=price,
        total_amount=total_amount
    )

    db.add(transaction)

    db.commit()

    db.refresh(user)

    create_portfolio_snapshot(
        db,
        user
    )

    return {
        "message": "Stock purchased successfully",
        "symbol": symbol,
        "quantity": quantity,
        "price": price,
        "currency": conversion["currency"],
        "exchange_rate": conversion["exchange_rate"],
        "asset_amount": conversion["amount"],
        "total_amount": total_amount,
        "balance": user.balance
    }


def sell_stock(
    db: Session,
    user: User,
    symbol: str,
    quantity: int
):

    if quantity <= 0:

        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )


    holding = (
        db.query(Holding)
        .filter(
            Holding.user_id == user.id,
            Holding.symbol == symbol
        )
        .first()
    )


    if not holding:

        raise HTTPException(
            status_code=400,
            detail="You do not own this stock"
        )


    if holding.quantity < quantity:

        raise HTTPException(
            status_code=400,
            detail="Not enough shares"
        )


    quote = get_quote(symbol)

    price = quote["price"]


    conversion = calculate_inr_value(
        db,
        symbol,
        price,
        quantity
    )


    total_amount = conversion["inr_amount"]


    holding.quantity -= quantity

    user.balance += total_amount


    transaction = Transaction(
        user_id=user.id,
        symbol=symbol,
        transaction_type="SELL",
        quantity=quantity,
        price=price,
        total_amount=total_amount
    )

    db.add(transaction)


    if holding.quantity == 0:

        db.delete(holding)


    db.commit()

    db.refresh(user)

    create_portfolio_snapshot(
        db,
        user
    )

    return {
        "message": "Stock sold successfully",
        "symbol": symbol,
        "quantity": quantity,
        "price": price,
        "currency": conversion["currency"],
        "exchange_rate": conversion["exchange_rate"],
        "asset_amount": conversion["amount"],
        "total_amount": total_amount,
        "balance": user.balance
    }