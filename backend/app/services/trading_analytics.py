from sqlalchemy.orm import Session

from app.models.transaction import Transaction


def calculate_transaction_analytics(
    db: Session,
    user_id: int
):

    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .all()
    )

    total_trades = len(transactions)

    buy_trades = 0
    sell_trades = 0

    total_buy_value = 0.0
    total_sell_value = 0.0

    total_buy_quantity = 0
    total_sell_quantity = 0

    symbol_counts = {}

    largest_trade = None

    for transaction in transactions:

        amount = transaction.total_amount
        symbol = transaction.symbol
        quantity = transaction.quantity

        if transaction.transaction_type == "BUY":

            buy_trades += 1
            total_buy_value += amount
            total_buy_quantity += quantity

        elif transaction.transaction_type == "SELL":

            sell_trades += 1
            total_sell_value += amount
            total_sell_quantity += quantity

        symbol_counts[symbol] = (
            symbol_counts.get(symbol, 0)
            + quantity
        )

        if (
            largest_trade is None
            or amount > largest_trade["total_amount"]
        ):
            largest_trade = {
                "symbol": symbol,
                "transaction_type":
                    transaction.transaction_type,
                "quantity": quantity,
                "total_amount": amount
            }

    most_traded_symbol = None

    if symbol_counts:

        most_traded_symbol = max(
            symbol_counts,
            key=symbol_counts.get
        )

    return {
        "total_trades": total_trades,

        "buy_trades": buy_trades,

        "sell_trades": sell_trades,

        "total_buy_value":
            total_buy_value,

        "total_sell_value":
            total_sell_value,

        "total_buy_quantity":
            total_buy_quantity,

        "total_sell_quantity":
            total_sell_quantity,

        "most_traded_symbol":
            most_traded_symbol,

        "largest_trade":
            largest_trade
    }