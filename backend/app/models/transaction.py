from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func

from app.database.connection import Base


class Transaction(Base):

    __tablename__ = "transactions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    symbol = Column(
        String,
        nullable=False
    )

    transaction_type = Column(
        String,
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    price = Column(
        Float,
        nullable=False
    )

    total_amount = Column(
        Float,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )