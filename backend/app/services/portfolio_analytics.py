from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.portfolio_snapshot import (
    PortfolioSnapshot
)

from app.services.risk import (
    calculate_risk_metrics
)


def calculate_portfolio_risk(
    db: Session,
    user_id: int,
    days: int = 30
):

    cutoff = (
        datetime.now(timezone.utc)
        - timedelta(days=days)
    )

    snapshots = (
        db.query(PortfolioSnapshot)
        .filter(
            PortfolioSnapshot.user_id == user_id
        )
        .filter(
            PortfolioSnapshot.created_at >= cutoff
        )
        .order_by(
            PortfolioSnapshot.created_at.asc()
        )
        .all()
    )

    return calculate_risk_metrics(
        snapshots
    )


def get_snapshot_history(
    db: Session,
    user_id: int,
    days: int = 30
):

    cutoff = (
        datetime.now(timezone.utc)
        - timedelta(days=days)
    )

    snapshots = (
        db.query(PortfolioSnapshot)
        .filter(
            PortfolioSnapshot.user_id == user_id
        )
        .filter(
            PortfolioSnapshot.created_at >= cutoff
        )
        .order_by(
            PortfolioSnapshot.created_at.asc()
        )
        .all()
    )

    return [
        {
            "id": snapshot.id,
            "total_value":
                snapshot.total_value,
            "cash_balance":
                snapshot.cash_balance,
            "created_at":
                snapshot.created_at
        }
        for snapshot in snapshots
    ]