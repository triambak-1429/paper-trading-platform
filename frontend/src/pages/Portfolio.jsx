import { useEffect, useState } from "react";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

import {
    getPortfolio,
    getPortfolioHistory
} from "../services/api";


function Portfolio() {

    const [portfolio, setPortfolio] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadPortfolio() {

        try {

            setLoading(true);
            setError("");

            const portfolioData =
                await getPortfolio();

            const historyData =
                await getPortfolioHistory(30);

            setPortfolio(portfolioData);

            setHistory(
                historyData.data.map(item => ({
                    date: new Date(
                        item.created_at
                    ).toLocaleDateString(),

                    value: item.total_value
                }))
            );

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "Could not load portfolio"
            );

        } finally {

            setLoading(false);
        }
    }


    useEffect(() => {
        loadPortfolio();
    }, []);


    if (loading) {

        return (
            <div className="page-container">

                <div className="loading">
                    Loading portfolio...
                </div>

            </div>
        );
    }


    if (error) {

        return (
            <div className="page-container">

                <div className="error-box">

                    <h2>
                        Could not load portfolio
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        className="primary-button"
                        onClick={loadPortfolio}
                    >
                        Retry
                    </button>

                </div>

            </div>
        );
    }


    const formatINR = (value) =>
        `₹${Number(value || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;


    const profitClass =
        portfolio.total_profit_loss >= 0
            ? "positive"
            : "negative";


    return (

        <div className="page-container">

            <div className="page-header">

                <div>

                    <h1>
                        Portfolio
                    </h1>

                    <p>
                        Track your investments,
                        performance and allocation.
                    </p>

                </div>

                <button
                    className="secondary-button"
                    onClick={loadPortfolio}
                >
                    Refresh
                </button>

            </div>


            {/* SUMMARY CARDS */}

            <div className="portfolio-summary-grid">

                <div className="summary-card">

                    <span>
                        Total Portfolio Value
                    </span>

                    <strong>
                        {formatINR(
                            portfolio.total_portfolio_value
                        )}
                    </strong>

                </div>


                <div className="summary-card">

                    <span>
                        Available Cash
                    </span>

                    <strong>
                        {formatINR(
                            portfolio.cash_balance
                        )}
                    </strong>

                </div>


                <div className="summary-card">

                    <span>
                        Invested Amount
                    </span>

                    <strong>
                        {formatINR(
                            portfolio.total_invested
                        )}
                    </strong>

                </div>


                <div className="summary-card">

                    <span>
                        Current Holdings Value
                    </span>

                    <strong>
                        {formatINR(
                            portfolio.total_current_value
                        )}
                    </strong>

                </div>


                <div className="summary-card">

                    <span>
                        Total Profit / Loss
                    </span>

                    <strong className={profitClass}>

                        {portfolio.total_profit_loss >= 0
                            ? "+"
                            : ""}

                        {formatINR(
                            portfolio.total_profit_loss
                        )}

                    </strong>

                    <small className={profitClass}>

                        {portfolio.total_profit_loss_percent >= 0
                            ? "+"
                            : ""}

                        {Number(
                            portfolio.total_profit_loss_percent
                        ).toFixed(2)}
                        %

                    </small>

                </div>


                <div className="summary-card">

                    <span>
                        Holdings
                    </span>

                    <strong>
                        {portfolio.number_of_holdings}
                    </strong>

                </div>

            </div>


            {/* BEST / WORST */}

            <div className="performance-grid">

                <div className="performance-card">

                    <h3>
                        Best Performer
                    </h3>

                    {portfolio.best_performer ? (

                        <>

                            <strong>
                                {
                                    portfolio
                                        .best_performer
                                        .name
                                }
                            </strong>

                            <span className="positive">

                                +
                                {Number(
                                    portfolio
                                        .best_performer
                                        .profit_loss_percent
                                ).toFixed(2)}
                                %

                            </span>

                        </>

                    ) : (

                        <p>
                            No holdings yet.
                        </p>

                    )}

                </div>


                <div className="performance-card">

                    <h3>
                        Worst Performer
                    </h3>

                    {portfolio.worst_performer ? (

                        <>

                            <strong>
                                {
                                    portfolio
                                        .worst_performer
                                        .name
                                }
                            </strong>

                            <span
                                className={
                                    portfolio
                                        .worst_performer
                                        .profit_loss_percent
                                        >= 0
                                        ? "positive"
                                        : "negative"
                                }
                            >

                                {portfolio
                                    .worst_performer
                                    .profit_loss_percent >= 0
                                    ? "+"
                                    : ""}

                                {Number(
                                    portfolio
                                        .worst_performer
                                        .profit_loss_percent
                                ).toFixed(2)}
                                %

                            </span>

                        </>

                    ) : (

                        <p>
                            No holdings yet.
                        </p>

                    )}

                </div>

            </div>


            {/* PERFORMANCE CHART */}

            <div className="chart-card">

                <h2>
                    Portfolio Performance
                </h2>

                {history.length > 0 ? (

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <LineChart
                            data={history}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="date"
                            />

                            <YAxis />

                            <Tooltip />

                            <Line
                                type="monotone"
                                dataKey="value"
                                strokeWidth={2}
                                dot={false}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                ) : (

                    <div className="empty-state">

                        <p>
                            No portfolio history yet.
                        </p>

                        <p>
                            Make a paper trade to
                            start tracking performance.
                        </p>

                    </div>

                )}

            </div>


            {/* ALLOCATION */}

            <div className="portfolio-two-column">

                <div className="chart-card">

                    <h2>
                        Portfolio Allocation
                    </h2>

                    {portfolio.allocation.length > 0 ? (

                        <ResponsiveContainer
                            width="100%"
                            height={350}
                        >

                            <PieChart>

                                <Pie
                                    data={
                                        portfolio.allocation
                                    }
                                    dataKey="value"
                                    nameKey="symbol"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    label
                                >

                                    {portfolio.allocation.map(
                                        (item, index) => (

                                            <Cell
                                                key={
                                                    item.symbol
                                                }
                                                fill={`hsl(${
                                                    index * 60
                                                }, 65%, 55%)`}
                                            />

                                        )
                                    )}

                                </Pie>

                                <Tooltip />

                            </PieChart>

                        </ResponsiveContainer>

                    ) : (

                        <div className="empty-state">

                            No holdings to display.

                        </div>

                    )}

                </div>


                {/* HOLDINGS TABLE */}

                <div className="chart-card">

                    <h2>
                        Your Holdings
                    </h2>

                    {portfolio.holdings.length === 0 ? (

                        <div className="empty-state">

                            You don't own
                            any assets yet.

                        </div>

                    ) : (

                        <div className="holdings-list">

                            {portfolio.holdings.map(
                                holding => (

                                    <div
                                        className="holding-row"
                                        key={
                                            holding.symbol
                                        }
                                    >

                                        <div>

                                            <strong>
                                                {
                                                    holding.name
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    holding.symbol
                                                }
                                            </span>

                                        </div>

                                        <div>

                                            <strong>
                                                {
                                                    holding.quantity
                                                }
                                            </strong>

                                            <span>
                                                units
                                            </span>

                                        </div>

                                        <div
                                            className={
                                                holding.profit_loss
                                                >= 0
                                                    ? "positive"
                                                    : "negative"
                                            }
                                        >

                                            {holding.profit_loss
                                                >= 0
                                                ? "+"
                                                : ""}

                                            {formatINR(
                                                holding.profit_loss
                                            )}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}


export default Portfolio;