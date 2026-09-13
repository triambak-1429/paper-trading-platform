from pydantic import BaseModel


class TradeRequest(BaseModel):

    symbol: str
    quantity: int


class TradeResponse(BaseModel):

    message: str
    symbol: str
    quantity: int
    price: float
    total_amount: float
    balance: float