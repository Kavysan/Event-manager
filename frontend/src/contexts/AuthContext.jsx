import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [token, setToken] = useState(() => {
        return localStorage.getItem("access_token") || null;
    });

    const login = (access_token, userData) => {
        setToken(access_token);
        setUser(userData);
        if (userData) { // use the new userData
            localStorage.setItem("user", JSON.stringify(userData));
        }
        localStorage.setItem("access_token", access_token);
    };


    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
    };

    const getToken = () => token;

    return (
    <AuthContext.Provider value={{ user, token, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};
