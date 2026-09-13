import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getWatchlist,
    removeFromWatchlist
} from "../services/api";

function Watchlist() {

    const navigate = useNavigate();

    const [items, setItems] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    async function loadWatchlist() {

        try {

            setLoading(true);
            setError("");

            const data =
                await getWatchlist();

            setItems(data);

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "Could not load watchlist"
            );

        } finally {

            setLoading(false);

        }

    }


    useEffect(() => {

        loadWatchlist();

    }, []);


    async function remove(symbol) {

        try {

            await removeFromWatchlist(symbol);

            setItems(
                items.filter(
                    item => item.symbol !== symbol
                )
            );

        } catch (error) {

            alert(error.message);

        }

    }


    if (loading) {

        return (
            <div className="page-container">

                <div className="loading">
                    Loading watchlist...
                </div>

            </div>
        );

    }


    return (

        <div className="page-container">

            <div className="page-header">

                <div>

                    <h1>
                        My Watchlist
                    </h1>

                    <p>
                        Keep track of assets
                        you're interested in.
                    </p>

                </div>

            </div>


            {error && (

                <div className="error-box">

                    <p>
                        {error}
                    </p>

                    <button
                        className="primary-button"
                        onClick={loadWatchlist}
                    >
                        Retry
                    </button>

                </div>

            )}


            {!error &&
                items.length === 0 && (

                    <div className="empty-state">

                        <h3>
                            Your watchlist is empty
                        </h3>

                        <p>
                            Add stocks from the
                            Market Dashboard.
                        </p>

                    </div>

                )}


            <div className="asset-grid">

                {items.map((item) => (

                    <div
                        className="asset-card"
                        key={item.symbol}
                    >

                        <h2>
                            {item.symbol}
                        </h2>

                        <div className="price">

                            ₹
                            {item.price.toFixed(2)}

                        </div>


                        <div
                            className={
                                item.change >= 0
                                    ? "positive"
                                    : "negative"
                            }
                        >

                            {item.change >= 0
                                ? "+"
                                : ""
                            }

                            {item.change.toFixed(2)}

                            {" "}

                            (
                            {item.change_percent.toFixed(2)}
                            %)

                        </div>


                        <div className="asset-actions">

                            <button
                                onClick={() =>
                                    navigate(
                                        `/stock/${encodeURIComponent(
                                            item.symbol
                                        )}`
                                    )
                                }
                            >
                                View Chart
                            </button>


                            <button
                                onClick={() =>
                                    navigate(
                                        `/analysis?symbol=${encodeURIComponent(
                                            item.symbol
                                        )}`
                                    )
                                }
                            >
                                AI Analysis
                            </button>


                            <button
                                className="danger-button"
                                onClick={() =>
                                    remove(item.symbol)
                                }
                            >
                                Remove
                            </button>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default Watchlist;