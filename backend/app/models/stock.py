from sqlalchemy import Column, Integer, String, Float, Boolean
from app.database.connection import Base


class Stock(Base):
    __tablename__ = "stocks"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    symbol = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    current_price = Column(
        Float,
        nullable=True
    )

    asset_type = Column(
        String,
        nullable=False
    )

    exchange = Column(
        String,
        nullable=True
    )

    currency = Column(
        String,
        nullable=False,
        default="INR"
    )

    logo_url = Column(
        String,
        nullable=True
    )

    is_featured = Column(
        Boolean,
        nullable=False,
        default=False
    )