import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

// Custom hook for easier usage
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // Safely parse user from localStorage
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("user");
            return saved && saved !== "undefined" ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(() => {
        const savedToken = localStorage.getItem("access_token");
        return savedToken && savedToken !== "undefined" ? savedToken : null;
    });

    const [loading, setLoading] = useState(false); // can use if you want a loading state

    // Login function
    const login = (access_token, userData) => {
        if (!access_token || !userData) return;

        setToken(access_token);
        setUser(userData);

        localStorage.setItem("access_token", access_token);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    // Logout function
    const logout = () => {
        setToken(null);
        setUser(null);

        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        navigate("/login"); // redirect to login after logout
    };

    // Getter for token
    const getToken = () => token;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, getToken, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
