from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.auth.dependencies import get_current_user

from app.models.user import User
from app.models.portfolio_snapshot import PortfolioSnapshot

from app.services.portfolio import calculate_portfolio
from app.services.portfolio_snapshot import (
    create_snapshot_if_needed
)

from fastapi import Query, HTTPException

from app.services.portfolio_analytics import (
    calculate_portfolio_risk,
    get_snapshot_history
)

from app.services.benchmark import (
    get_nifty_history
)

router = APIRouter(
    prefix="/portfolio",
    tags=["Portfolio"]
)


@router.get("")
def get_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    portfolio = calculate_portfolio(
        db,
        current_user
    )

    # Create a historical snapshot if needed
    create_snapshot_if_needed(
        db,
        current_user
    )

    return portfolio


@router.get("/history")
def get_portfolio_history(
    days: int = Query(
        30,
        ge=1,
        le=365
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    cutoff = datetime.now(
        timezone.utc
    ) - timedelta(days=days)

    snapshots = (
        db.query(PortfolioSnapshot)
        .filter(
            PortfolioSnapshot.user_id
            == current_user.id
        )
        .filter(
            PortfolioSnapshot.created_at
            >= cutoff
        )
        .order_by(
            PortfolioSnapshot.created_at.asc()
        )
        .all()
    )

    return {
        "days": days,
        "data": [
            {
                "id": snapshot.id,
                "total_value": snapshot.total_value,
                "cash_balance": snapshot.cash_balance,
                "created_at": snapshot.created_at
            }
            for snapshot in snapshots
        ]
    }

@router.get("/risk")
def portfolio_risk(
    days: int = Query(
        30,
        ge=1,
        le=365
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return calculate_portfolio_risk(
        db,
        current_user.id,
        days
    )

@router.get("/snapshots")
def portfolio_snapshots(
    days: int = Query(
        30,
        ge=1,
        le=365
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return {
        "days": days,
        "data": get_snapshot_history(
            db,
            current_user.id,
            days
        )
    }

@router.get("/benchmark")
def portfolio_benchmark(
    period: str = "1mo",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        portfolio_snapshots = get_snapshot_history(
            db,
            current_user.id,
            365
        )

        nifty = get_nifty_history(period)

        if not portfolio_snapshots:
            return {
                "portfolio": [],
                "nifty": [],
                "message":
                    "Not enough portfolio history"
            }

        portfolio_start = (
            portfolio_snapshots[0]["total_value"]
        )

        nifty_start = nifty[0]["close"]

        portfolio_data = []

        for snapshot in portfolio_snapshots:

            normalized = (
                snapshot["total_value"]
                / portfolio_start
            ) * 100

            portfolio_data.append({
                "date":
                    snapshot["created_at"],
                "value":
                    normalized
            })

        nifty_data = []

        for item in nifty:

            normalized = (
                item["close"]
                / nifty_start
            ) * 100

            nifty_data.append({
                "date":
                    item["date"],
                "value":
                    normalized
            })

        return {
            "portfolio":
                portfolio_data,

            "nifty":
                nifty_data
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )