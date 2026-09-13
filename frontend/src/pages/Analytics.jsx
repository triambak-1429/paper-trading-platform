import { useEffect, useState } from "react";

import {
    getPortfolio,
    getTransactionAnalytics,
    getPortfolioRisk,
    getPortfolioSnapshots,
    getPortfolioBenchmark
} from "../services/api";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";


function formatMoney(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(value || 0);
}


function formatPercent(value) {

    return `${Number(value || 0).toFixed(2)}%`;
}


function Analytics() {

    const [portfolio, setPortfolio] =
        useState(null);

    const [transactions, setTransactions] =
        useState(null);

    const [risk, setRisk] =
        useState(null);

    const [snapshots, setSnapshots] =
        useState([]);

    const [benchmark, setBenchmark] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        async function loadAnalytics() {

            try {

                setLoading(true);

                const [
                    portfolioData,
                    transactionData,
                    riskData,
                    snapshotData,
                    benchmarkData
                ] = await Promise.all([
                    getPortfolio(),
                    getTransactionAnalytics(),
                    getPortfolioRisk(30),
                    getPortfolioSnapshots(30),
                    getPortfolioBenchmark("1mo")
                ]);

                setPortfolio(
                    portfolioData
                );

                setTransactions(
                    transactionData
                );

                setRisk(
                    riskData
                );

                setSnapshots(
                    snapshotData.data || []
                );

                setBenchmark(
                    benchmarkData
                );

            } catch (err) {

                setError(
                    err.message ||
                    "Failed to load analytics"
                );

            } finally {

                setLoading(false);
            }
        }

        loadAnalytics();

    }, []);


    if (loading) {

        return (
            <div className="page-container">
                <div className="loading">
                    Loading analytics...
                </div>
            </div>
        );
    }


    if (error) {

        return (
            <div className="page-container">
                <div className="error-message">
                    {error}
                </div>
            </div>
        );
    }


    const holdings =
        portfolio?.holdings || [];


    const allocation =
        portfolio?.allocation || [];


    const chartData =
        snapshots.map(item => ({
            date:
                new Date(
                    item.created_at
                ).toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short"
                    }
                ),

            value:
                Number(
                    item.total_value
                )
        }));


    const benchmarkData = [];

    const portfolioBenchmark =
        benchmark?.portfolio || [];

    const niftyBenchmark =
        benchmark?.nifty || [];


    const maxLength = Math.max(
        portfolioBenchmark.length,
        niftyBenchmark.length
    );


    for (
        let i = 0;
        i < maxLength;
        i++
    ) {

        benchmarkData.push({
            date:
                portfolioBenchmark[i]
                    ? new Date(
                        portfolioBenchmark[i]
                            .date
                    ).toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short"
                        }
                    )
                    : "",

            portfolio:
                portfolioBenchmark[i]
                    ?.value ?? null,

            nifty:
                niftyBenchmark[i]
                    ?.value ?? null
        });
    }


    const sortedHoldings =
        [...holdings].sort(
            (a, b) =>
                b.profit_loss_percent -
                a.profit_loss_percent
        );


    const bestHolding =
        sortedHoldings[0];

    const worstHolding =
        sortedHoldings[
            sortedHoldings.length - 1
        ];


    return (
        <div className="page-container">

            <div className="analytics-header">

                <div>
                    <h1>
                        Portfolio Analytics
                    </h1>

                    <p>
                        Analyze your portfolio
                        performance, risk and
                        trading activity.
                    </p>
                </div>

            </div>


            {/* SUMMARY */}

            <div className="analytics-grid">

                <div className="analytics-card">

                    <span>
                        Portfolio Value
                    </span>

                    <strong>
                        {formatMoney(
                            portfolio
                                ?.total_portfolio_value
                        )}
                    </strong>

                </div>


                <div className="analytics-card">

                    <span>
                        Total P&L
                    </span>

                    <strong>
                        {formatMoney(
                            portfolio
                                ?.total_profit_loss
                        )}
                    </strong>

                    <small>
                        {formatPercent(
                            portfolio
                                ?.total_profit_loss_percent
                        )}
                    </small>

                </div>


                <div className="analytics-card">

                    <span>
                        Realized P&L
                    </span>

                    <strong>
                        {formatMoney(
                            portfolio
                                ?.realized_pnl
                        )}
                    </strong>

                </div>


                <div className="analytics-card">

                    <span>
                        Unrealized P&L
                    </span>

                    <strong>
                        {formatMoney(
                            portfolio
                                ?.unrealized_pnl
                        )}
                    </strong>

                </div>

            </div>


            {/* PERFORMANCE */}

            <div className="analytics-section">

                <h2>
                    Portfolio Performance
                </h2>

                <div className="chart-card">

                    {chartData.length > 1 ? (

                        <ResponsiveContainer
                            width="100%"
                            height={350}
                        >

                            <LineChart
                                data={chartData}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="date"
                                />

                                <YAxis />

                                <Tooltip
                                    formatter={
                                        value =>
                                            formatMoney(
                                                value
                                            )
                                    }
                                />

                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    strokeWidth={3}
                                    dot={false}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    ) : (

                        <div className="empty-state">

                            Not enough portfolio
                            history to display
                            the performance chart.

                        </div>

                    )}

                </div>

            </div>


            {/* ALLOCATION */}

            <div className="analytics-two-column">

                <div className="analytics-section">

                    <h2>
                        Portfolio Allocation
                    </h2>

                    <div className="chart-card">

                        {allocation.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={350}
                            >

                                <PieChart>

                                    <Pie
                                        data={
                                            allocation
                                        }
                                        dataKey="value"
                                        nameKey="symbol"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={120}
                                        label
                                    >

                                        {allocation.map(
                                            (
                                                entry,
                                                index
                                            ) => (

                                                <Cell
                                                    key={index}
                                                    fill={
                                                        [
                                                            "#4F46E5",
                                                            "#06B6D4",
                                                            "#10B981",
                                                            "#F59E0B",
                                                            "#EF4444",
                                                            "#8B5CF6",
                                                            "#EC4899",
                                                            "#14B8A6"
                                                        ][
                                                            index %
                                                            8
                                                        ]
                                                    }
                                                />

                                            )
                                        )}

                                    </Pie>

                                    <Tooltip />

                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        ) : (

                            <div className="empty-state">
                                No holdings available.
                            </div>

                        )}

                    </div>

                </div>


                {/* BEST / WORST */}

                <div className="analytics-section">

                    <h2>
                        Asset Performance
                    </h2>

                    <div className="performer-card">

                        {bestHolding ? (

                            <div className="performer">

                                <span>
                                    Best Performer
                                </span>

                                <strong>
                                    {
                                        bestHolding.symbol
                                    }
                                </strong>

                                <p>
                                    {formatPercent(
                                        bestHolding
                                            .profit_loss_percent
                                    )}
                                </p>

                            </div>

                        ) : null}


                        {worstHolding ? (

                            <div className="performer">

                                <span>
                                    Worst Performer
                                </span>

                                <strong>
                                    {
                                        worstHolding.symbol
                                    }
                                </strong>

                                <p>
                                    {formatPercent(
                                        worstHolding
                                            .profit_loss_percent
                                    )}
                                </p>

                            </div>

                        ) : null}

                    </div>

                </div>

            </div>


            {/* TRADING ANALYTICS */}

            <div className="analytics-section">

                <h2>
                    Trading Statistics
                </h2>

                <div className="analytics-grid">

                    <div className="analytics-card">

                        <span>
                            Total Trades
                        </span>

                        <strong>
                            {
                                transactions
                                    ?.total_trades || 0
                            }
                        </strong>

                    </div>


                    <div className="analytics-card">

                        <span>
                            Buy Trades
                        </span>

                        <strong>
                            {
                                transactions
                                    ?.buy_trades || 0
                            }
                        </strong>

                    </div>


                    <div className="analytics-card">

                        <span>
                            Sell Trades
                        </span>

                        <strong>
                            {
                                transactions
                                    ?.sell_trades || 0
                            }
                        </strong>

                    </div>


                    <div className="analytics-card">

                        <span>
                            Most Traded
                        </span>

                        <strong>
                            {
                                transactions
                                    ?.most_traded_symbol
                                    || "N/A"
                            }
                        </strong>

                    </div>

                </div>

            </div>


            {/* RISK */}

            <div className="analytics-section">

                <h2>
                    Risk Analysis
                </h2>

                <div className="analytics-grid">

                    <div className="analytics-card">

                        <span>
                            Snapshot Volatility
                        </span>

                        <strong>
                            {formatPercent(
                                risk?.volatility
                            )}
                        </strong>

                    </div>


                    <div className="analytics-card">

                        <span>
                            Maximum Drawdown
                        </span>

                        <strong>
                            {formatPercent(
                                risk?.max_drawdown
                            )}
                        </strong>

                    </div>


                    <div className="analytics-card">

                        <span>
                            Observations
                        </span>

                        <strong>
                            {
                                risk?.observations
                                || 0
                            }
                        </strong>

                    </div>

                </div>

            </div>


            {/* BENCHMARK */}

            <div className="analytics-section">

                <h2>
                    Portfolio vs NIFTY 50
                </h2>

                <div className="chart-card">

                    {benchmarkData.length > 1 ? (

                        <ResponsiveContainer
                            width="100%"
                            height={350}
                        >

                            <LineChart
                                data={
                                    benchmarkData
                                }
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="date"
                                />

                                <YAxis />

                                <Tooltip />

                                <Legend />

                                <Line
                                    type="monotone"
                                    dataKey="portfolio"
                                    name="Your Portfolio"
                                    strokeWidth={3}
                                    dot={false}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="nifty"
                                    name="NIFTY 50"
                                    strokeWidth={3}
                                    dot={false}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    ) : (

                        <div className="empty-state">

                            Not enough data for
                            benchmark comparison.

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}


export default Analytics;