from sqlalchemy import Column, Integer, String

from app.database.connection import Base


class Watchlist(Base):

    __tablename__ = "watchlists"

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