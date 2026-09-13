import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
    getMarketAnalysis
} from "../services/api";

function AIAnalysis() {

    const [searchParams] =
        useSearchParams();

    const selectedSymbol =
        searchParams.get("symbol");


    const [symbol, setSymbol] =
        useState(
            selectedSymbol || "RELIANCE.NS"
        );

    const [data, setData] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    useEffect(() => {

        if (selectedSymbol) {

            setSymbol(selectedSymbol);

        }

    }, [selectedSymbol]);


    async function analyze() {

        if (!symbol.trim()) {

            setError(
                "Please enter a stock symbol"
            );

            return;
        }


        try {

            setLoading(true);
            setError("");
            setData(null);

            const result =
                await getMarketAnalysis(
                    symbol.trim().toUpperCase()
                );

            setData(result);

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "AI analysis failed"
            );

        } finally {

            setLoading(false);

        }

    }


    return (

        <div className="page-container">

            <div className="page-header">

                <div>

                    <h1>
                        AI Market Analysis
                    </h1>

                    <p>
                        Analyze market trends using
                        technical indicators and AI.
                    </p>

                </div>

            </div>


            <div className="analysis-search">

                <input
                    value={symbol}
                    onChange={(e) =>
                        setSymbol(e.target.value)
                    }
                    placeholder="RELIANCE.NS"
                />

                <button
                    className="primary-button"
                    onClick={analyze}
                    disabled={loading}
                >
                    {loading
                        ? "Analyzing..."
                        : "Analyze"
                    }
                </button>

            </div>


            {error && (

                <div className="error-box">

                    <strong>
                        Analysis failed
                    </strong>

                    <p>
                        {error}
                    </p>

                </div>

            )}


            {data && (

                <div className="analysis-container">

                    <div className="analysis-header">

                        <h2>
                            {data.symbol}
                        </h2>

                        <span>
                            AI-powered analysis
                        </span>

                    </div>


                    <h3>
                        Technical Indicators
                    </h3>


                    <div className="indicator-grid">

                        <div className="indicator-card">

                            <span>
                                Current Price
                            </span>

                            <strong>
                                ₹
                                {data.indicators.current_price?.toFixed(2)}
                            </strong>

                        </div>


                        <div className="indicator-card">

                            <span>
                                20-Day SMA
                            </span>

                            <strong>
                                ₹
                                {data.indicators.sma_20
                                    ? data.indicators.sma_20.toFixed(2)
                                    : "N/A"
                                }
                            </strong>

                        </div>


                        <div className="indicator-card">

                            <span>
                                50-Day SMA
                            </span>

                            <strong>
                                ₹
                                {data.indicators.sma_50
                                    ? data.indicators.sma_50.toFixed(2)
                                    : "N/A"
                                }
                            </strong>

                        </div>


                        <div className="indicator-card">

                            <span>
                                Daily Return
                            </span>

                            <strong
                                className={
                                    data.indicators.daily_return >= 0
                                        ? "positive"
                                        : "negative"
                                }
                            >
                                {data.indicators.daily_return >= 0
                                    ? "+"
                                    : ""
                                }

                                {data.indicators.daily_return.toFixed(2)}
                                %
                            </strong>

                        </div>


                        <div className="indicator-card">

                            <span>
                                Volatility
                            </span>

                            <strong>
                                {data.indicators.volatility.toFixed(2)}
                                %
                            </strong>

                        </div>

                    </div>


                    <div className="ai-result">

                        <h3>
                            Gemini AI Analysis
                        </h3>

                        <div className="analysis-text">

                            {data.analysis}

                        </div>

                    </div>


                    <div className="disclaimer">

                        AI-generated analysis is for
                        educational purposes only and
                        is not financial advice.

                    </div>

                </div>

            )}

        </div>

    );

}

export default AIAnalysis;