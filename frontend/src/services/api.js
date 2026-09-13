const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// =========================
// MARKET
// =========================

export async function getAssets() {
    const response = await fetch(`${API_URL}/market/assets`);

    if (!response.ok) {
        throw new Error("Failed to fetch assets");
    }

    return response.json();
}


export async function getQuote(symbol) {
    const response = await fetch(
        `${API_URL}/market/quote/${encodeURIComponent(symbol)}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch quote");
    }

    return response.json();
}


export async function getHistory(
    symbol,
    period = "1mo"
) {
    const response = await fetch(
        `${API_URL}/market/history/${encodeURIComponent(symbol)}?period=${period}`
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(
            data.detail || "Failed to fetch historical data"
        );
    }

    return response.json();
}


// =========================
// AUTHENTICATION
// =========================

export async function registerUser(
    name,
    email,
    password
) {
    const response = await fetch(
        `${API_URL}/auth/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Registration failed"
        );
    }

    return data;
}


export async function loginUser(
    email,
    password
) {
    const response = await fetch(
        `${API_URL}/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Login failed"
        );
    }

    localStorage.setItem(
        "access_token",
        data.access_token
    );

    return data;
}


export function logoutUser() {
    localStorage.removeItem("access_token");
}


// =========================
// PORTFOLIO
// =========================

export async function getPortfolio() {
    const token =
        localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/portfolio`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to load portfolio"
        );
    }

    return data;
}


// =========================
// TRANSACTIONS
// =========================

export async function getTransactions() {
    const token =
        localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/transactions`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to load transactions"
        );
    }

    return data;
}


// =========================
// WATCHLIST
// =========================

export async function getWatchlist() {
    const token =
        localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/watchlist`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to fetch watchlist"
        );
    }

    return data;
}


export async function addToWatchlist(symbol) {
    const token =
        localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/watchlist/${encodeURIComponent(symbol)}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to add to watchlist"
        );
    }

    return data;
}


export async function removeFromWatchlist(symbol) {
    const token =
        localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/watchlist/${encodeURIComponent(symbol)}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to remove from watchlist"
        );
    }

    return data;
}


// =========================
// AI ANALYSIS
// =========================

export async function getMarketAnalysis(symbol) {
    const response = await fetch(
        `${API_URL}/analysis/${encodeURIComponent(symbol)}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to get AI analysis"
        );
    }

    return data;
}


// =========================
// TRADING
// =========================

export async function buyStock(
    symbol,
    quantity
) {
    const token =
        localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/trading/buy`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                symbol,
                quantity
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Purchase failed"
        );
    }

    return data;
}


export async function sellStock(
    symbol,
    quantity
) {
    const token =
        localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/trading/sell`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                symbol,
                quantity
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Sale failed"
        );
    }

    return data;
}

export async function getCurrentUser() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/users/me`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to get user");
    }

    return data;
}

export async function searchAssets(query, type = "") {

    const params = new URLSearchParams();

    params.append("q", query);

    if (type) {
        params.append("asset_type", type);
    }

    const response = await fetch(
        `${API_URL}/market/search?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Search failed"
        );
    }

    return data;
}

export async function getAsset(symbol) {
    const response = await fetch(
        `${API_URL}/market/search?q=${encodeURIComponent(symbol)}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to find asset");
    }

    const asset = data.find(
        item => item.symbol === symbol
    );

    if (!asset) {
        throw new Error("Asset not found");
    }

    return asset;
}
export async function getPortfolioHistory(days = 30) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/portfolio/history?days=${days}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to load portfolio history"
        );
    }

    return data;
}  
export async function getTransactionAnalytics() {

    const token =
        localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/transactions/analytics`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail ||
            "Failed to load transaction analytics"
        );
    }

    return data;
}
export async function getPortfolioRisk(
    days = 30
) {

    const token =
        localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/portfolio/risk?days=${days}`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail ||
            "Failed to load risk analytics"
        );
    }

    return data;
}
export async function getPortfolioSnapshots(
    days = 30
) {

    const token =
        localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/portfolio/snapshots?days=${days}`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail ||
            "Failed to load portfolio history"
        );
    }

    return data;
}
export async function getPortfolioBenchmark(
    period = "1mo"
) {

    const token =
        localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/portfolio/benchmark?period=${period}`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail ||
            "Failed to load ben chmark"
        );
    }

    return data;
}