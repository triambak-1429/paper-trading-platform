import statistics


def calculate_risk_metrics(snapshots):

    if not snapshots:
        return {
            "volatility": 0,
            "max_drawdown": 0,
            "observations": 0
        }

    values = [
        float(snapshot.total_value)
        for snapshot in snapshots
    ]

    returns = []

    for i in range(1, len(values)):

        previous = values[i - 1]
        current = values[i]

        if previous != 0:

            percentage_return = (
                (current - previous)
                / previous
            ) * 100

            returns.append(percentage_return)

    if len(returns) > 1:

        volatility = statistics.stdev(
            returns
        )

    else:

        volatility = 0

    peak = values[0]
    max_drawdown = 0

    for value in values:

        if value > peak:
            peak = value

        if peak != 0:

            drawdown = (
                (value - peak)
                / peak
            ) * 100

            if drawdown < max_drawdown:
                max_drawdown = drawdown

    return {
        "volatility": round(volatility, 4),
        "max_drawdown": round(
            max_drawdown,
            4
        ),
        "observations": len(values)
    }