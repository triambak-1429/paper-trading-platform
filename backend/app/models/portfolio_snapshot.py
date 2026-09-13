from sqlalchemy import Column, Integer, Float, DateTime
from sqlalchemy.sql import func

from app.database.connection import Base


class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    total_value = Column(
        Float,
        nullable=False
    )

    cash_balance = Column(
        Float,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True
    )