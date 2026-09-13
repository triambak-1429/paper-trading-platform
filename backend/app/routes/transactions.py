from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.transaction import Transaction

from app.services.trading_analytics import (
    calculate_transaction_analytics
)

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


@router.get("")
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id
        )
        .order_by(
            Transaction.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": transaction.id,
            "symbol": transaction.symbol,
            "transaction_type":
                transaction.transaction_type,
            "quantity": transaction.quantity,
            "price": transaction.price,
            "total_amount":
                transaction.total_amount,
            "created_at":
                transaction.created_at
        }
        for transaction in transactions
    ]


@router.get("/analytics")
def transaction_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return calculate_transaction_analytics(
        db,
        current_user.id
    )


@router.get("/{transaction_id}")
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    return {
        "id": transaction.id,
        "symbol": transaction.symbol,
        "transaction_type":
            transaction.transaction_type,
        "quantity": transaction.quantity,
        "price": transaction.price,
        "total_amount":
            transaction.total_amount,
        "created_at":
            transaction.created_at
    }