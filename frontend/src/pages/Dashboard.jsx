import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
    getAssets,
    getQuote,
    addToWatchlist,
    getWatchlist,
    buyStock,
    sellStock,
    searchAssets
} from "../services/api";

import MarketStatus
    from "../components/MarketStatus";

function Dashboard() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const [assets, setAssets] = useState([]);
    const [quotes, setQuotes] = useState({});
    const [watchlist, setWatchlist] = useState([]);
    const [quantities, setQuantities] = useState({});

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(
            async () => {
                try {
                    setSearchLoading(true);
                    const results =
                        await searchAssets(
                            searchQuery
                        );
                    setSearchResults(results);
                } catch (error) {
                    console.error(error);
                } finally {
                    setSearchLoading(false);
                }
            },
            350
        );
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        loadDashboard();
    }, []);


    async function loadDashboard() {

        try {

            setLoading(true);
            setError("");

            const assetData = await getAssets();

            setAssets(assetData);

            const quoteResults = {};

            await Promise.all(
                assetData.map(async (asset) => {

                    try {

                        const quote =
                            await getQuote(asset.symbol);

                        quoteResults[asset.symbol] =
                            quote;

                    } catch (error) {

                        console.error(
                            `Failed to get ${asset.symbol}`,
                            error
                        );

                    }

                })
            );

            setQuotes(quoteResults);
            setLastUpdated(new Date());
            try {

                const watchlistData =
                    await getWatchlist();

                setWatchlist(watchlistData);

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
                "Could not load market data"
            );

        } finally {

            setLoading(false);

        }
    }
    async function refreshQuotes() {

        try {

            const quoteResults = {};

            await Promise.all(
                assets.map(async (asset) => {

                    try {

                        const quote =
                            await getQuote(
                                asset.symbol
                            );

                        quoteResults[
                            asset.symbol
                        ] = quote;

                    } catch (error) {

                        console.error(
                            `Failed to refresh ${asset.symbol}`,
                            error
                        );

                    }

                })
            );

            setQuotes(quoteResults);
            setLastUpdated(new Date());

        } catch (error) {

            console.error(
                "Failed to refresh quotes",
                error
            );

        }
    }
    useEffect(() => {

        if (assets.length === 0) {
            return;
        }

        const interval =
            setInterval(() => {

                refreshQuotes();

            }, 60000);

        return () =>
            clearInterval(interval);

    }, [assets]);

    function isInWatchlist(symbol) {

        return watchlist.some(
            item => item.symbol === symbol
        );

    }


    async function handleWatchlist(symbol) {

        try {

            await addToWatchlist(symbol);

            const data =
                await getWatchlist();

            setWatchlist(data);

        } catch (error) {

            alert(error.message);

        }

    }


    function updateQuantity(symbol, value) {

        setQuantities({
            ...quantities,
            [symbol]: value
        });

    }


    async function handleBuy(symbol) {

        const quantity =
            Number(quantities[symbol] || 0);

        if (quantity <= 0) {

            alert(
                "Enter a quantity greater than zero"
            );

            return;
        }

        try {

            const result =
                await buyStock(
                    symbol,
                    quantity
                );
            await refreshUser();
            alert(
                `Bought ${quantity} units of ${symbol}`
            );

            console.log(result);

        } catch (error) {

            alert(error.message);

        }

    }


    async function handleSell(symbol) {

        const quantity =
            Number(quantities[symbol] || 0);

        if (quantity <= 0) {

            alert(
                "Enter a quantity greater than zero"
            );

            return;
        }

        try {

            const result =
                await sellStock(
                    symbol,
                    quantity
                );
            await refreshUser();
            alert(
                `Sold ${quantity} units of ${symbol}`
            );

            console.log(result);

        } catch (error) {

            alert(error.message);

        }

    }


    if (loading) {

        return (
            <div className="page-container">

                <div className="loading">
                    Loading market data...
                </div>

            </div>
        );

    }


    if (error) {

        return (
            <div className="page-container">

                <div className="error-box">

                    <h2>
                        Something went wrong
                    </h2>

                    <p>{error}</p>

                    <button
                        onClick={loadDashboard}
                        className="primary-button"
                    >
                        Retry
                    </button>

                </div>

            </div>
        );

    }


    return (

        <div className="page-container">

            <div className="page-header">
                <div className="search-section">
                    <input
                        type="text"
                        className="market-search"
                        placeholder="Search stocks, metals, commodities..."
                        value={searchQuery}
                        onChange={(e) =>
                            setSearchQuery(e.target.value)
                        }
                    />
                    {searchLoading && (
                        <div className="search-loading">
                            Searching...
                        </div>
                    )}

                    {searchResults.length > 0 && (
                        <div className="search-results">

                            {searchResults.map((asset) => (
                                <div
                                    className="search-result"
                                    key={asset.symbol}
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSearchResults([]);

                                        navigate(
                                            `/stock/${encodeURIComponent(
                                                asset.symbol
                                            )}`
                                        );
                                    }}
                                >
                                    <div className="search-result-info">

                                        <strong>
                                            {asset.name}
                                        </strong>

                                        <span>
                                            {asset.symbol}
                                        </span>

                                    </div>

                                    <div className="search-result-type">

                                        {asset.type}

                                        {asset.exchange
                                            ? ` · ${asset.exchange}`
                                            : ""
                                        }

                                    </div>

                                </div>
                            ))}

                        </div>
                    )}

                </div>
                <div>

                    <h1>
                        Market Dashboard
                    </h1>

                    <p>
                        Explore stocks and metals,
                        trade with virtual money,
                        and analyze assets using AI.
                    </p>
                    
                    <MarketStatus />

                    {lastUpdated && (
                        <small className="market-updated">
                            Last updated:{" "}
                            {lastUpdated.toLocaleTimeString()}
                        </small>
                    )}
                </div>

            </div>


            <div className="asset-grid">

                {assets.map((asset) => {

                    const quote =
                        quotes[asset.symbol];

                    const watched =
                        isInWatchlist(
                            asset.symbol
                        );

                    const isMetal =
                        asset.type === "metal";

                    return (

                        <div
                            className="asset-card"
                            key={asset.symbol}
                        >

                            <div className="asset-header">

                                <div>

                                    <h2>
                                        {asset.name}
                                    </h2>

                                    <span className="symbol">
                                        {asset.symbol}
                                    </span>

                                </div>

                                <span className="asset-type">
                                    {asset.type}
                                </span>

                            </div>


                            {quote ? (

                                <>

                                    <div className="price">

                                        {isMetal
                                            ? "$"
                                            : "₹"
                                        }

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

                            ) : (

                                <p>
                                    Price unavailable
                                </p>

                            )}


                            <div className="trade-section">

                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Quantity"
                                    value={
                                        quantities[
                                            asset.symbol
                                        ] || ""
                                    }
                                    onChange={(e) =>
                                        updateQuantity(
                                            asset.symbol,
                                            e.target.value
                                        )
                                    }
                                />


                                <button
                                    className="buy-button"
                                    onClick={() =>
                                        handleBuy(
                                            asset.symbol
                                        )
                                    }
                                >
                                    Buy
                                </button>


                                <button
                                    className="sell-button"
                                    onClick={() =>
                                        handleSell(
                                            asset.symbol
                                        )
                                    }
                                >
                                    Sell
                                </button>

                            </div>


                            <div className="asset-actions">

                                <button
                                    onClick={() =>
                                        handleWatchlist(
                                            asset.symbol
                                        )
                                    }
                                    disabled={watched}
                                >
                                    {watched
                                        ? "✓ Watchlisted"
                                        : "+ Watchlist"
                                    }
                                </button>


                                <button
                                    onClick={() =>
                                        navigate(
                                            `/analysis?symbol=${encodeURIComponent(
                                                asset.symbol
                                            )}`
                                        )
                                    }
                                >
                                    AI Analysis
                                </button>


                                <button
                                    onClick={() =>
                                        navigate(
                                            `/stock/${encodeURIComponent(
                                                asset.symbol
                                            )}`
                                        )
                                    }
                                >
                                    View Chart
                                </button>

                            </div>

                        </div>

                    );

                })}

            </div>

        </div>

    );

}

export default Dashboard;