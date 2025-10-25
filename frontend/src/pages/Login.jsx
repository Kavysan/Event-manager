import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import "../css/auth.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const response = await api.post("/auth/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const { access_token, user } = response.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("user", JSON.stringify(user)); 
        login(access_token, user);
        setSuccess("✅ Login successful! Redirecting...")
        setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("❌ Incorrect email or password.");
      } else if (err.response?.status === 404) {
        setError("❌ Login endpoint not found. Check backend route (/auth/login).");
      } else {
        setError("⚠️ Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>

      {/* ✅ Messages */}
      {error && <p style={{ color: "black" }}>{error}</p>}
      {success && <p style={{ color: "blue" }}>{success}</p>}

      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      <p className="auth-switch">
        Don’t have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </div>
  );
}

export default Login;
