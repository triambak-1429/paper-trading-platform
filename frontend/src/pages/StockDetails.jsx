import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import {
    getAsset,
    getHistory,
    getQuote,
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    buyStock,
    sellStock
} from "../services/api";

import { useAuth } from "../context/AuthContext";


function StockDetails() {

    const { symbol } = useParams();

    const navigate = useNavigate();

    const { user, refreshUser } = useAuth();

    const decodedSymbol =
        decodeURIComponent(symbol);


    const [asset, setAsset] =
        useState(null);

    const [quote, setQuote] =
        useState(null);

    const [history, setHistory] =
        useState([]);

    const [period, setPeriod] =
        useState("1mo");

    const [quantity, setQuantity] =
        useState("");

    const [watchlisted, setWatchlisted] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [trading, setTrading] =
        useState(false);


    async function loadData() {

        try {

            setLoading(true);
            setError("");

            const assetData =
                await getAsset(decodedSymbol);

            const quoteData =
                await getQuote(decodedSymbol);

            const historyData =
                await getHistory(
                    decodedSymbol,
                    period
                );

            setAsset(assetData);

            setQuote(quoteData);

            setHistory(
                historyData.data
            );


            try {

                const watchlistData =
                    await getWatchlist();

                setWatchlisted(
                    watchlistData.some(
                        item =>
                            item.symbol === decodedSymbol
                    )
                );

            } catch (error) {

                console.error(
                    "Could not load watchlist",
                    error
                );

            }

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "Could not load asset data"
            );

        } finally {

            setLoading(false);

        }

    }


    useEffect(() => {

        loadData();

    }, [decodedSymbol, period]);

    useEffect(() => {
        const interval =
            setInterval(async () => {

                try {

                    const quoteData =
                        await getQuote(
                            decodedSymbol
                        );

                    setQuote(quoteData);

                } catch (error) {

                    console.error(
                        "Quote refresh failed",
                        error
                    );

                }

            }, 60000);


        return () =>
            clearInterval(interval);

    }, [decodedSymbol]);
    
    async function handleWatchlist() {

        try {

            if (watchlisted) {

                await removeFromWatchlist(
                    decodedSymbol
                );

                setWatchlisted(false);

            } else {

                await addToWatchlist(
                    decodedSymbol
                );

                setWatchlisted(true);

            }

        } catch (error) {

            alert(error.message);

        }

    }


    async function handleBuy() {

        const amount =
            Number(quantity);

        if (amount <= 0) {

            alert(
                "Enter a quantity greater than zero"
            );

            return;

        }

        try {

            setTrading(true);

            await buyStock(
                decodedSymbol,
                amount
            );

            await refreshUser();

            setQuantity("");

            alert(
                `Bought ${amount} units of ${decodedSymbol}`
            );

        } catch (error) {

            alert(error.message);

        } finally {

            setTrading(false);

        }

    }


    async function handleSell() {

        const amount =
            Number(quantity);

        if (amount <= 0) {

            alert(
                "Enter a quantity greater than zero"
            );

            return;

        }

        try {

            setTrading(true);

            await sellStock(
                decodedSymbol,
                amount
            );

            await refreshUser();

            setQuantity("");

            alert(
                `Sold ${amount} units of ${decodedSymbol}`
            );

        } catch (error) {

            alert(error.message);

        } finally {

            setTrading(false);

        }

    }


    if (loading) {

        return (

            <div className="page-container">

                <div className="loading">
                    Loading asset data...
                </div>

            </div>

        );

    }


    if (error) {

        return (

            <div className="page-container">

                <div className="error-box">

                    <h2>
                        Could not load asset
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        className="primary-button"
                        onClick={loadData}
                    >
                        Retry
                    </button>

                </div>

            </div>

        );

    }


    const chartData =
        history.map((item) => ({

            date:
                new Date(
                    item.date
                ).toLocaleDateString(),

            close:
                item.close

        }));


    const currency =
        asset?.currency === "USD"
            ? "$"
            : "₹";


    return (

        <div className="page-container">


            {/* HEADER */}

            <div className="stock-details-header">

                <div className="stock-title-section">

                    {asset?.logo_url ? (

                        <img
                            src={asset.logo_url}
                            alt={asset.name}
                            className="asset-logo-large"
                        />

                    ) : (

                        <div className="asset-logo-placeholder">
                            {asset?.name?.charAt(0)}
                        </div>

                    )}


                    <div>

                        <h1>
                            {asset?.name}
                        </h1>

                        <p className="symbol">
                            {decodedSymbol}
                        </p>

                        <div className="asset-meta">

                            <span>
                                {asset?.type}
                            </span>

                            <span>
                                {asset?.exchange}
                            </span>

                            <span>
                                {asset?.currency}
                            </span>

                        </div>

                    </div>

                </div>


                <div className="stock-price-section">

                    {quote && (

                        <>

                            <div className="stock-price">

                                {currency}
                                {quote.price.toFixed(2)}

                            </div>


                            <div
                                className={
                                    quote.change >= 0
                                        ? "positive"
                                        : "negative"
                                }
                            >

                                {quote.change >= 0
                                    ? "+"
                                    : ""
                                }

                                {quote.change.toFixed(2)}

                                {" "}

                                (

                                {quote.change_percent.toFixed(2)}

                                %)

                            </div>

                        </>

                    )}

                </div>

            </div>


            {/* ACTIONS */}

            <div className="stock-actions">

                <button
                    onClick={handleWatchlist}
                    className="secondary-button"
                >

                    {watchlisted
                        ? "★ Remove Watchlist"
                        : "☆ Add Watchlist"
                    }

                </button>


                <button
                    onClick={() =>
                        navigate(
                            `/analysis?symbol=${encodeURIComponent(
                                decodedSymbol
                            )}`
                        )
                    }
                    className="secondary-button"
                >
                    🤖 AI Analysis
                </button>
                
                <button
                    className="secondary-button"
                    onClick={loadData}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* BALANCE */}

            <div className="balance-card">

                <div>

                    <span>
                        Available Balance
                    </span>

                    <strong>

                        ₹
                        {user?.balance?.toLocaleString(
                            "en-IN",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }
                        )}

                    </strong>

                </div>

                <span>
                    Paper Trading Account
                </span>

            </div>


            {/* CHART CONTROLS */}

            <div className="chart-controls">

                {[
                    ["1mo", "1 Month"],
                    ["3mo", "3 Months"],
                    ["6mo", "6 Months"],
                    ["1y", "1 Year"]
                ].map(([value, label]) => (

                    <button
                        key={value}
                        className={
                            period === value
                                ? "active-period"
                                : ""
                        }
                        onClick={() =>
                            setPeriod(value)
                        }
                    >
                        {label}
                    </button>

                ))}

            </div>


            {/* CHART */}

            <div className="chart-card">

                <h2>
                    Price History
                </h2>

                <ResponsiveContainer
                    width="100%"
                    height={450}
                >

                    <LineChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 20
                        }}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="date"
                        />

                        <YAxis
                            domain={[
                                "auto",
                                "auto"
                            ]}
                        />

                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="close"
                            strokeWidth={2}
                            dot={false}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>


            {/* TRADING */}

            <div className="trade-card">

                <h2>
                    Paper Trade
                </h2>

                <p>
                    Simulate buying or selling this asset
                    using your virtual balance.
                </p>


                <div className="trade-price">

                    Current Price:

                    <strong>
                        {" "}
                        {currency}
                        {quote?.price.toFixed(2)}
                    </strong>

                </div>


                <div className="trade-controls">

                    <input
                        type="number"
                        min="1"
                        placeholder="Quantity"
                        value={quantity}
                        onChange={(e) =>
                            setQuantity(
                                e.target.value
                            )
                        }
                    />


                    <button
                        className="buy-button"
                        onClick={handleBuy}
                        disabled={trading}
                    >
                        {trading
                            ? "Processing..."
                            : "Buy"
                        }
                    </button>


                    <button
                        className="sell-button"
                        onClick={handleSell}
                        disabled={trading}
                    >
                        {trading
                            ? "Processing..."
                            : "Sell"
                        }
                    </button>

                </div>

            </div>


        </div>

    );

}


export default StockDetails;