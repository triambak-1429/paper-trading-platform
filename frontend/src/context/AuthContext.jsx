import { createContext, useContext, useEffect, useState } from "react";
import {
    loginUser,
    registerUser,
    getCurrentUser,
    logoutUser
} from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loadUser() {
        const token = localStorage.getItem("access_token");

        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const data = await getCurrentUser();
            setUser(data);
        } catch (error) {
            localStorage.removeItem("access_token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUser();
    }, []);

    async function login(email, password) {
        await loginUser(email, password);
        await loadUser();
    }

    async function register(name, email, password) {
        await registerUser(name, email, password);
    }

    function logout() {
        logoutUser();
        setUser(null);
    }

    async function refreshUser() {
        await loadUser();
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                refreshUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}