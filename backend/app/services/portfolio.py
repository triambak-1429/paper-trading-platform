from sqlalchemy.orm import Session

from app.models.user import User
from app.models.holding import Holding
from app.models.stock import Stock
from app.models.transaction import Transaction

from app.services.market_data import get_quote
from app.services.currency import get_usd_to_inr_rate


def get_conversion_rate(currency: str):
    if currency == "USD":
        return get_usd_to_inr_rate()

    return 1.0


def calculate_realized_pnl(db: Session, user: User):

    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == user.id)
        .order_by(Transaction.created_at.asc())
        .all()
    )

    positions = {}
    realized_pnl = 0.0

    for transaction in transactions:

        symbol = transaction.symbol
        quantity = transaction.quantity
        amount = transaction.total_amount

        if symbol not in positions:
            positions[symbol] = {
                "quantity": 0,
                "cost_basis": 0.0
            }

        position = positions[symbol]

        if transaction.transaction_type == "BUY":

            position["quantity"] += quantity
            position["cost_basis"] += amount

        elif transaction.transaction_type == "SELL":

            if position["quantity"] <= 0:
                continue

            average_cost = (
                position["cost_basis"]
                / position["quantity"]
            )

            cost_of_sold = average_cost * quantity

            realized_pnl += amount - cost_of_sold

            position["quantity"] -= quantity
            position["cost_basis"] -= cost_of_sold

    return realized_pnl


def calculate_portfolio(db: Session, user: User):

    holdings = (
        db.query(Holding)
        .filter(Holding.user_id == user.id)
        .all()
    )

    total_invested = 0.0
    total_current_value = 0.0

    holding_details = []

    for holding in holdings:

        stock = (
            db.query(Stock)
            .filter(Stock.symbol == holding.symbol)
            .first()
        )

        if not stock:
            continue

        quote = get_quote(holding.symbol)

        current_price = quote["price"]

        quantity = holding.quantity
        average_price = holding.average_price

        currency = stock.currency or "INR"

        conversion_rate = get_conversion_rate(currency)

        invested_value = (
            average_price
            * quantity
            * conversion_rate
        )

        current_value = (
            current_price
            * quantity
            * conversion_rate
        )

        profit_loss = (
            current_value - invested_value
        )

        if invested_value != 0:
            profit_loss_percent = (
                profit_loss
                / invested_value
            ) * 100
        else:
            profit_loss_percent = 0

        total_invested += invested_value
        total_current_value += current_value

        holding_details.append({
            "symbol": holding.symbol,
            "name": stock.name,
            "quantity": quantity,
            "average_price": average_price,
            "current_price": current_price,
            "currency": currency,
            "invested_value": invested_value,
            "current_value": current_value,
            "profit_loss": profit_loss,
            "profit_loss_percent": profit_loss_percent
        })

    unrealized_pnl = (
        total_current_value - total_invested
    )

    realized_pnl = calculate_realized_pnl(
        db,
        user
    )

    total_profit_loss = (
        realized_pnl + unrealized_pnl
    )

    if total_invested != 0:
        total_profit_loss_percent = (
            total_profit_loss
            / total_invested
        ) * 100
    else:
        total_profit_loss_percent = 0

    total_portfolio_value = (
        user.balance + total_current_value
    )

    best_performer = (
        max(
            holding_details,
            key=lambda x: x["profit_loss_percent"]
        )
        if holding_details
        else None
    )

    worst_performer = (
        min(
            holding_details,
            key=lambda x: x["profit_loss_percent"]
        )
        if holding_details
        else None
    )

    allocation = []

    for holding in holding_details:

        if total_current_value > 0:
            percentage = (
                holding["current_value"]
                / total_current_value
            ) * 100
        else:
            percentage = 0

        allocation.append({
            "symbol": holding["symbol"],
            "name": holding["name"],
            "value": holding["current_value"],
            "percentage": percentage
        })

    return {
        "cash_balance": user.balance,

        "total_invested": total_invested,

        "total_current_value": total_current_value,

        "total_portfolio_value": total_portfolio_value,

        "unrealized_pnl": unrealized_pnl,

        "realized_pnl": realized_pnl,

        "total_profit_loss": total_profit_loss,

        "total_profit_loss_percent":
            total_profit_loss_percent,

        "number_of_holdings":
            len(holding_details),

        "best_performer":
            best_performer,

        "worst_performer":
            worst_performer,

        "holdings":
            holding_details,

        "allocation":
            allocation
    }