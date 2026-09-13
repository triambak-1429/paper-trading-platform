from sqlalchemy import Column, Integer, String, Float

from app.database.connection import Base


class Holding(Base):

    __tablename__ = "holdings"

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

    quantity = Column(
        Integer,
        nullable=False,
        default=0
    )

    average_price = Column(
        Float,
        nullable=False,
        default=0
    )