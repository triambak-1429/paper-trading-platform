from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.portfolio_snapshot import PortfolioSnapshot

from app.services.portfolio import calculate_portfolio


def create_portfolio_snapshot(
    db: Session,
    user: User
):

    portfolio = calculate_portfolio(
        db,
        user
    )

    snapshot = PortfolioSnapshot(
        user_id=user.id,
        total_value=portfolio["total_portfolio_value"],
        cash_balance=portfolio["cash_balance"]
    )

    db.add(snapshot)

    db.commit()

    db.refresh(snapshot)

    return snapshot


def create_snapshot_if_needed(
    db: Session,
    user: User
):

    latest = (
        db.query(PortfolioSnapshot)
        .filter(
            PortfolioSnapshot.user_id == user.id
        )
        .order_by(
            PortfolioSnapshot.created_at.desc()
        )
        .first()
    )

    if latest:

        latest_time = latest.created_at

        if latest_time.tzinfo is None:
            latest_time = latest_time.replace(
                tzinfo=timezone.utc
            )

        now = datetime.now(timezone.utc)

        # Don't create a new snapshot
        # more than once per hour.
        if now - latest_time < timedelta(hours=1):
            return latest

    return create_portfolio_snapshot(
        db,
        user
    )