import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine, Base


from app.models.user import User
from app.models.stock import Stock
from app.models.holding import Holding
from app.models.transaction import Transaction
from app.models.watchlist import Watchlist
from app.models.portfolio_snapshot import PortfolioSnapshot

from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.market import router as market_router
from app.routes.trading import router as trading_router
from app.routes.portfolio import router as portfolio_router
from app.routes.transactions import router as transactions_router
from app.routes.watchlist import router as watchlist_router
from app.routes.analysis import router as analysis_router

FRONTEND_URLS = [
    url.strip()
    for url in os.getenv(
        "FRONTEND_URLS",
        "http://localhost:5173"
    ).split(",")
    if url.strip()
]

app = FastAPI(
    title="Paper Trading Platform API"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(market_router)
app.include_router(trading_router)
app.include_router(portfolio_router)
app.include_router(transactions_router)
app.include_router(watchlist_router)
app.include_router(analysis_router)

@app.get("/")
def home():
    return {
        "message": "Paper Trading API is running"
    }