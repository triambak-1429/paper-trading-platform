import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    useNavigate
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Transactions from "./pages/Transactions";
import Watchlist from "./pages/Watchlist";
import AIAnalysis from "./pages/AIAnalysis";
import StockDetails from "./pages/StockDetails";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Analytics from "./pages/Analytics";

import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider, useAuth } from "./context/AuthContext";

import "./App.css";


function Navbar() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    if (!user) {
        return (
            <nav className="navbar">

                <div className="navbar-brand">
                    PaperTrade
                </div>

                <div className="navbar-links">

                    <Link to="/login">
                        Login
                    </Link>

                    <Link to="/register">
                        Register
                    </Link>

                </div>

            </nav>
        );
    }

    return (
        <nav className="navbar">

            <div className="navbar-brand">
                PaperTrade
            </div>

            <div className="navbar-links">

                <Link to="/">
                    Dashboard
                </Link>

                <Link to="/portfolio">
                    Portfolio
                </Link>

                <Link to="/transactions">
                    Transactions
                </Link>

                <Link to="/watchlist">
                    Watchlist
                </Link>

                <Link to="/analytics">
                    Analytics
                </Link>
                
                <Link to="/AIAnalysis">
                    AI Analysis
                </Link>

            </div>

            <div className="navbar-user">

                <span className="navbar-name">
                    Hi, {user.name}
                </span>

                <span className="navbar-balance">
                    ₹{user.balance.toLocaleString("en-IN", {
                        minimumFractionDigits: 2
                    })}
                </span>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}


function App() {

    return (
        <BrowserRouter>

            <AuthProvider>

                <Navbar />

                <Routes>

                    {/* Public routes */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />


                    {/* Protected routes */}

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/portfolio"
                        element={
                            <ProtectedRoute>
                                <Portfolio />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/analytics"
                        element={
                            <ProtectedRoute>
                                <Analytics />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/transactions"
                        element={
                            <ProtectedRoute>
                                <Transactions />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/watchlist"
                        element={
                            <ProtectedRoute>
                                <Watchlist />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/AIAnalysis"
                        element={
                            <ProtectedRoute>
                                <AIAnalysis />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/stock/:symbol"
                        element={
                            <ProtectedRoute>
                                <StockDetails />
                            </ProtectedRoute>
                        }
                    />

                </Routes>

            </AuthProvider>

        </BrowserRouter>
    );
}

export default App;