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
        // 1. Capture the token object returned by your FastAPI backend
        const data = await loginUser(email, password);
        
        // 2. Save it to localStorage so subsequent requests can read it
        localStorage.setItem("access_token", data.access_token);
        
        // 3. Load the user information now that the token is present
        await loadUser();
    }

    async function register(name, email, password) {
        const data = await registerUser(name, email, password);
        
        // Optional: If your register route also returns a token, you can log them in instantly:
        // if (data.access_token) {
        //     localStorage.setItem("access_token", data.access_token);
        //     await loadUser();
        // }
    }

    function logout() {
        localStorage.removeItem("access_token"); // Clean storage token
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